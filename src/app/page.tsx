'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FileText, Download, UserPlus, RefreshCw } from 'lucide-react';
import { Member, ParseResult } from '../types/attendance';
import { parseKakaoTalkLog, parseRosterText } from '../utils/parser';
import { StatsOverview } from '../components/StatsOverview';
import { AttendanceTable } from '../components/AttendanceTable';
import { FileUploaderModal } from '../components/FileUploaderModal';
import { RosterImportModal } from '../components/RosterImportModal';
import { MemberModal } from '../components/MemberModal';

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Modals
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isRosterImportOpen, setIsRosterImportOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null | 'new'>(null);

  // Load stored state
  useEffect(() => {
    const saved = localStorage.getItem('crew_attendance_minimal_v2');
    if (saved) {
      try {
        setMembers(JSON.parse(saved));
      } catch {
        setMembers([]);
      }
    }
  }, []);

  // Save state
  const saveState = (newMembers: Member[]) => {
    setMembers(newMembers);
    localStorage.setItem('crew_attendance_minimal_v2', JSON.stringify(newMembers));
  };

  const handleFileUpload = (file: File) => {
    const isTxt = file.name.endsWith('.txt') || file.type.startsWith('text/') || file.type === '';
    if (!isTxt) {
      alert('텍스트 (.txt) 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const result: ParseResult = parseKakaoTalkLog(text, members);
        saveState(result.members);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleRosterImport = (rosterText: string) => {
    const updated = parseRosterText(rosterText, members);
    saveState(updated);
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
            [month]: newDays,
          },
        };
      }
      return m;
    });
    saveState(next);
  };

  const handleClearAll = () => {
    if (confirm('현재 출석부 데이터를 초기화하시겠습니까?')) {
      setMembers([]);
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
          /* Initial Clean Drop Zone - Only txt upload */
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
                <Upload className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  카카오톡 대화록 파일 선택
                </h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  카톡 대화 내용 텍스트 파일(.txt)을 선택하거나 드래그하여 올려주세요.
                </p>
              </div>

              <div className="flex items-center justify-center">
                <input
                  type="file"
                  accept=".txt,text/plain,text/*,*/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                  id="main-file-input"
                />
                <label
                  htmlFor="main-file-input"
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-sm rounded-xl shadow-xs cursor-pointer transition flex items-center gap-2 touch-manipulation"
                >
                  <Upload className="w-4 h-4" />
                  카톡 txt 불러오기
                </label>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Stats */}
            <StatsOverview members={members} />

            {/* Attendance Table */}
            <AttendanceTable
              members={members}
              onEditMember={(m) => setEditingMember(m)}
              onAddMember={() => setEditingMember('new')}
              onDeleteMember={handleDeleteMember}
              onOpenUploader={() => setIsUploaderOpen(true)}
              onOpenRosterImport={() => setIsRosterImportOpen(true)}
              onUpdateDays={handleUpdateDays}
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

      {editingMember && (
        <MemberModal
          initialMember={editingMember === 'new' ? null : editingMember}
          onSave={handleAddOrUpdateMember}
          onClose={() => setEditingMember(null)}
        />
      )}
    </div>
  );
}
