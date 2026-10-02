'use client';

import React, { useState, useEffect } from 'react';
import { Upload, HelpCircle, Loader2 } from 'lucide-react';
import { Member, ParseResult, UnmatchedTag, ReviewItem, AttendanceSource } from '../types/attendance';
import { parseKakaoTalkLog, parseRosterText, decodeFileBuffer, isNonMemberName, isMojibakeName, cleanMemberName } from '../utils/parser';
import { StatsOverview } from '../components/StatsOverview';
import { AttendanceTable } from '../components/AttendanceTable';
import { FileUploaderModal } from '../components/FileUploaderModal';
import { RosterImportModal } from '../components/RosterImportModal';
import { MemberModal } from '../components/MemberModal';
import { ReviewNeededModal } from '../components/ReviewNeededModal';
import { AttendanceSourceModal } from '../components/AttendanceSourceModal';
import { MergeMembersModal } from '../components/MergeMembersModal';

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [unmatchedTags, setUnmatchedTags] = useState<UnmatchedTag[]>([]);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Semester & Month state for dynamic KPI stats
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('2026-2');
  const [selectedMonth, setSelectedMonth] = useState<string>('전체');

  // Modals
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isRosterImportOpen, setIsRosterImportOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null | 'new'>(null);
  const [selectedDateSource, setSelectedDateSource] = useState<{
    member: Member;
    monthKey: string;
    day: string;
  } | null>(null);

  const filterValidMembers = (mList: Member[]) => {
    const map = new Map<string, Member>();
    mList.forEach((m) => {
      if (!m.name || isNonMemberName(m.name) || isMojibakeName(m.name)) return;
      const cleanName = cleanMemberName(m.name).normalize('NFC');
      if (!cleanName) return;

      if (!map.has(cleanName)) {
        map.set(cleanName, { ...m, name: cleanName });
      } else {
        const existing = map.get(cleanName)!;
        const mergedAttendances = { ...existing.attendances };
        Object.entries(m.attendances).forEach(([mKey, daysStr]) => {
          const targetDays = (mergedAttendances[mKey] || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          const sourceDays = daysStr
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          const combinedDays = Array.from(new Set([...targetDays, ...sourceDays])).sort(
            (a, b) => parseInt(a, 10) - parseInt(b, 10)
          );
          mergedAttendances[mKey] = combinedDays.join(', ');
        });

        const mergedSources = existing.sources ? { ...existing.sources } : {};
        if (m.sources) {
          Object.entries(m.sources).forEach(([dKey, srcList]) => {
            if (!mergedSources[dKey]) mergedSources[dKey] = [];
            srcList.forEach((src) => {
              if (!mergedSources[dKey].some((s) => s.message === src.message)) {
                mergedSources[dKey].push(src);
              }
            });
          });
        }

        map.set(cleanName, {
          ...existing,
          attendances: mergedAttendances,
          sources: mergedSources
        });
      }
    });

    return Array.from(map.values());
  };

  // Load stored state
  useEffect(() => {
    const saved = localStorage.getItem('crew_attendance_minimal_v2');
    if (saved) {
      try {
        const parsed: Member[] = JSON.parse(saved);
        setMembers(filterValidMembers(parsed));
      } catch {
        setMembers([]);
      }
    }
  }, []);

  // Save state
  const saveState = (newMembers: Member[]) => {
    const valid = filterValidMembers(newMembers);
    setMembers(valid);
    localStorage.setItem('crew_attendance_minimal_v2', JSON.stringify(valid));
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;
    setIsProcessingFile(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) {
        setIsProcessingFile(false);
        alert('파일을 읽을 수 없습니다.');
        return;
      }

      const text = decodeFileBuffer(buffer);
      const result: ParseResult = parseKakaoTalkLog(text, members);

      setIsProcessingFile(false);
      if (result.members.length === 0) {
        alert('대화록에서 출석 태그(@이름)나 날짜를 찾지 못했습니다. 올바른 카카오톡 대화 텍스트 파일(.txt)인지 확인해 주세요.');
        return;
      }

      saveState(result.members);
      setUnmatchedTags(result.unmatchedTags || []);
      setReviewItems(result.reviewItems || []);
    };

    reader.onerror = () => {
      setIsProcessingFile(false);
      alert('파일을 읽는 도중 오류가 발생했습니다.');
    };

    reader.readAsArrayBuffer(file);
  };

  const handleRosterImport = (rosterText: string) => {
    const updated = parseRosterText(rosterText, members);
    saveState(updated);
  };

  // Merge Members Handler
  const handleMergeMembers = (sourceId: string, targetId: string) => {
    const sourceMember = members.find((m) => m.id === sourceId);
    const targetMember = members.find((m) => m.id === targetId);

    if (!sourceMember || !targetMember) return;

    // Combine attendances
    const mergedAttendances: Record<string, string> = { ...targetMember.attendances };
    Object.entries(sourceMember.attendances).forEach(([monthKey, sourceDaysStr]) => {
      const targetDaysStr = mergedAttendances[monthKey] || '';
      const combinedDays = Array.from(
        new Set([
          ...targetDaysStr.split(',').map((s) => s.trim()).filter(Boolean),
          ...sourceDaysStr.split(',').map((s) => s.trim()).filter(Boolean)
        ])
      ).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

      mergedAttendances[monthKey] = combinedDays.join(', ');
    });

    // Combine sources metadata
    const mergedSources: Record<string, AttendanceSource[]> = targetMember.sources ? { ...targetMember.sources } : {};
    if (sourceMember.sources) {
      Object.entries(sourceMember.sources).forEach(([dayKey, sourceList]) => {
        if (!mergedSources[dayKey]) mergedSources[dayKey] = [];
        sourceList.forEach((src) => {
          if (!mergedSources[dayKey].some((existing) => existing.message === src.message)) {
            mergedSources[dayKey].push(src);
          }
        });
      });
    }

    const updatedTarget: Member = {
      ...targetMember,
      attendances: mergedAttendances,
      sources: mergedSources,
      joinDate: targetMember.joinDate || sourceMember.joinDate,
      leaveDate: targetMember.leaveDate || sourceMember.leaveDate
    };

    const nextMembers = members
      .filter((m) => m.id !== sourceId)
      .map((m) => (m.id === targetId ? updatedTarget : m));

    saveState(nextMembers);
  };

  // Apply Review Item
  const handleApplyReviewItem = (item: ReviewItem, selectedNames: string[]) => {
    let updatedMembers = [...members];

    const sourceObj: AttendanceSource = {
      id: String(Date.now() + Math.random()),
      timestamp: item.formattedDate,
      sender: item.sender,
      message: item.fullMessage,
      decisionType: 'review'
    };

    const dayKey = `${item.monthKey}.${item.day}`;

    selectedNames.forEach((targetName) => {
      const idx = updatedMembers.findIndex((m) => m.name === targetName);
      if (idx >= 0) {
        const member = updatedMembers[idx];
        const existingDays = (member.attendances[item.monthKey] || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        if (!existingDays.includes(item.day)) {
          existingDays.push(item.day);
          existingDays.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
        }

        const nextSources = member.sources ? { ...member.sources } : {};
        if (!nextSources[dayKey]) nextSources[dayKey] = [];
        if (!nextSources[dayKey].some((s) => s.message === item.fullMessage)) {
          nextSources[dayKey].push(sourceObj);
        }

        updatedMembers[idx] = {
          ...member,
          attendances: { ...member.attendances, [item.monthKey]: existingDays.join(', ') },
          sources: nextSources
        };
      } else {
        const newMember: Member = {
          id: String(Date.now() + Math.random()),
          name: targetName,
          attendances: { [item.monthKey]: item.day },
          sources: { [dayKey]: [sourceObj] }
        };
        updatedMembers.push(newMember);
      }
    });

    saveState(updatedMembers);
    const nextQueue = reviewItems.filter((r) => r.id !== item.id);
    setReviewItems(nextQueue);
    if (nextQueue.length === 0) setIsReviewModalOpen(false);
  };

  const handleDiscardReviewItem = (itemId: string) => {
    const nextQueue = reviewItems.filter((r) => r.id !== itemId);
    setReviewItems(nextQueue);
    if (nextQueue.length === 0) setIsReviewModalOpen(false);
  };

  const handleDiscardAllReviewItems = () => {
    setReviewItems([]);
    setIsReviewModalOpen(false);
  };

  const handleSelectDatePill = (member: Member, monthKey: string, day: string) => {
    setSelectedDateSource({ member, monthKey, day });
  };

  const handleDeleteAttendanceDay = (memberName: string, monthKey: string, day: string) => {
    const updatedMembers = members.map((m) => {
      if (m.name === memberName) {
        const existingDays = (m.attendances[monthKey] || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const filteredDays = existingDays.filter((d) => d !== day);

        const dayKey = `${monthKey}.${day}`;
        const nextSources = m.sources ? { ...m.sources } : {};
        delete nextSources[dayKey];

        return {
          ...m,
          attendances: {
            ...m.attendances,
            [monthKey]: filteredDays.join(', ')
          },
          sources: nextSources
        };
      }
      return m;
    });

    saveState(updatedMembers);
    setSelectedDateSource(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAddOrUpdateMember = (updatedMember: Member) => {
    const idx = members.findIndex((m) => m.id === updatedMember.id);
    let next: Member[];
    if (idx >= 0) {
      next = [...members];
      next[idx] = updatedMember;
    } else {
      next = [updatedMember, ...members];
    }
    saveState(next);
  };

  const handleDeleteMember = (id: string) => {
    const next = members.filter((m) => m.id !== id);
    saveState(next);
  };

  const handleUpdateDays = (memberId: string, month: string, newDays: string) => {
    const next = members.map((m) => {
      if (m.id === memberId) {
        return {
          ...m,
          attendances: {
            ...m.attendances,
            [month]: newDays
          }
        };
      }
      return m;
    });
    saveState(next);
  };

  const handleClearAll = () => {
    if (confirm('현재 출석부 데이터를 초기화하시겠습니까?')) {
      setMembers([]);
      setUnmatchedTags([]);
      setReviewItems([]);
      localStorage.removeItem('crew_attendance_minimal_v2');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Minimal Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
            이런저런 출석 카운팅
          </h1>

          {members.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-slate-400 hover:text-rose-600 transition font-medium"
            >
              초기화
            </button>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col">
        {members.length === 0 ? (
          /* Initial Clean Drop Zone */
          <div className="flex-1 flex flex-col items-center justify-center py-16">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`max-w-xl w-full border-2 border-dashed rounded-3xl p-12 text-center transition-all bg-white shadow-xs flex flex-col items-center gap-6 ${
                dragActive
                  ? 'border-slate-900 bg-slate-50/50 scale-[1.01]'
                  : 'border-slate-300 hover:border-slate-800'
              }`}
            >
              <div className="w-16 h-16 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center">
                {isProcessingFile ? (
                  <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  {isProcessingFile ? '대화록 분석 중...' : '카카오톡 대화록 파일 선택'}
                </h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  카톡 대화 내용 파일(.txt 또는 .csv)을 선택하거나 올려주세요.
                </p>
              </div>

              <div className="flex items-center justify-center">
                <input
                  type="file"
                  accept=".txt,.csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    e.target.value = '';
                  }}
                  className="hidden"
                  id="main-file-input"
                />
                <label
                  htmlFor="main-file-input"
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-sm rounded-xl shadow-xs cursor-pointer transition flex items-center gap-2 touch-manipulation"
                >
                  <Upload className="w-4 h-4" />
                  대화록 불러오기
                </label>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Review Needed Queue Banner */}
            {reviewItems.length > 0 && (
              <div className="bg-slate-900 text-white rounded-2xl p-3.5 mb-5 flex items-center justify-between shadow-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>검토 필요 메시지 {reviewItems.length}건</span>
                </div>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-3.5 py-1.5 bg-white text-slate-900 text-xs font-bold rounded-xl hover:bg-slate-100 transition shadow-2xs cursor-pointer shrink-0"
                >
                  검토
                </button>
              </div>
            )}

            {/* KPI Stats */}
            <StatsOverview
              members={members}
              selectedSemesterId={selectedSemesterId}
              selectedMonth={selectedMonth}
            />

            {/* Attendance Table */}
            <AttendanceTable
              members={members}
              selectedSemesterId={selectedSemesterId}
              onSemesterChange={setSelectedSemesterId}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              onEditMember={(m) => setEditingMember(m)}
              onAddMember={() => setEditingMember('new')}
              onDeleteMember={handleDeleteMember}
              onOpenUploader={() => setIsUploaderOpen(true)}
              onOpenRosterImport={() => setIsRosterImportOpen(true)}
              onOpenMergeModal={() => setIsMergeModalOpen(true)}
              onUpdateDays={handleUpdateDays}
              onSelectDatePill={handleSelectDatePill}
            />
          </>
        )}
      </main>

      {/* Modals */}
      {isUploaderOpen && (
        <FileUploaderModal
          currentMembers={members}
          onApply={(updated) => {
            saveState(updated);
            setIsUploaderOpen(false);
          }}
          onClose={() => setIsUploaderOpen(false)}
        />
      )}

      {isRosterImportOpen && (
        <RosterImportModal
          onImportNames={(text) => handleRosterImport(text)}
          onClose={() => setIsRosterImportOpen(false)}
        />
      )}

      {isReviewModalOpen && (
        <ReviewNeededModal
          reviewItems={reviewItems}
          members={members}
          onApplyReviewItem={handleApplyReviewItem}
          onDiscardReviewItem={handleDiscardReviewItem}
          onDiscardAllReviewItems={handleDiscardAllReviewItems}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}

      {isMergeModalOpen && (
        <MergeMembersModal
          members={members}
          onMergeMembers={handleMergeMembers}
          onClose={() => setIsMergeModalOpen(false)}
        />
      )}

      {selectedDateSource && (
        <AttendanceSourceModal
          memberName={selectedDateSource.member.name}
          monthKey={selectedDateSource.monthKey}
          day={selectedDateSource.day}
          sources={
            selectedDateSource.member.sources?.[
              `${selectedDateSource.monthKey}.${selectedDateSource.day}`
            ] || []
          }
          isEditMode={true}
          onDeleteAttendanceDay={handleDeleteAttendanceDay}
          onClose={() => setSelectedDateSource(null)}
        />
      )}

      {editingMember && (
        <MemberModal
          initialMember={editingMember === 'new' ? null : editingMember}
          allMembers={members}
          onSave={handleAddOrUpdateMember}
          onMergeMembers={handleMergeMembers}
          onClose={() => setEditingMember(null)}
        />
      )}
    </div>
  );
}
