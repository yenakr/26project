'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FileText, Download, Sparkles, RefreshCw, ShieldCheck, Plus, Info } from 'lucide-react';
import { Member, ParseResult } from '../types/attendance';
import { parseKakaoTalkLog } from '../utils/parser';
import { StatsOverview } from '../components/StatsOverview';
import { AttendanceTable } from '../components/AttendanceTable';
import { FileUploaderModal } from '../components/FileUploaderModal';
import { MemberModal } from '../components/MemberModal';

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [parseSummary, setParseSummary] = useState<{ eventCount: number } | null>(null);

  // Modals
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null | 'new'>(null);
  const [dragActive, setDragActive] = useState(false);

  // Load stored members from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('crew_attendance_members_dynamic');
    const savedFileName = localStorage.getItem('crew_attendance_filename');
    if (saved) {
      try {
        setMembers(JSON.parse(saved));
        if (savedFileName) setUploadedFileName(savedFileName);
      } catch {
        setMembers([]);
      }
    }
  }, []);

  // Save to localStorage
  const saveMembersState = (newMembers: Member[], filename?: string) => {
    setMembers(newMembers);
    localStorage.setItem('crew_attendance_members_dynamic', JSON.stringify(newMembers));
    if (filename) {
      setUploadedFileName(filename);
      localStorage.setItem('crew_attendance_filename', filename);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.txt')) {
      alert('카카오톡 대화록 (.txt) 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const result: ParseResult = parseKakaoTalkLog(text, []);
        saveMembersState(result.members, file.name);
        setParseSummary({ eventCount: result.detectedEvents.length });
      }
    };
    reader.readAsText(file, 'utf-8');
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
    saveMembersState(next);
  };

  const handleDeleteMember = (id: string) => {
    const next = members.filter((m) => m.id !== id);
    saveMembersState(next);
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
    saveMembersState(next);
  };

  const handleClearAll = () => {
    if (confirm('현재 생성된 출석부 데이터를 초기화하시겠습니까?')) {
      setMembers([]);
      setUploadedFileName('');
      localStorage.removeItem('crew_attendance_members_dynamic');
      localStorage.removeItem('crew_attendance_filename');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/20">
              🏃‍♂️
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
                이런저런 러닝크루 <span className="text-blue-600 font-extrabold">자동 출석 변환기</span>
              </h1>
              <p className="text-[11px] text-slate-400">
                카카오톡 대화록 (.txt) 파일 업로드 즉시 자동 출석부 생성 (서버 저장 X, 100% 브라우저 연산)
              </p>
            </div>
          </div>

          {members.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsUploaderOpen(true)}
                className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-xl border border-blue-200 flex items-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                새 카톡 txt 업로드
              </button>

              <button
                onClick={handleClearAll}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
              >
                초기화
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">
        {/* Upload Drop Zone when no data is loaded */}
        {members.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`max-w-2xl w-full border-2 border-dashed rounded-3xl p-12 text-center transition-all bg-white shadow-xl flex flex-col items-center gap-5 ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                  : 'border-slate-300 hover:border-blue-400'
              }`}
            >
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-inner">
                <Upload className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  카카오톡 대화록 (.txt) 드래그 & 드롭
                </h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  카카오톡 대화방에서 <strong className="text-slate-800">대화 내용 내보내기 텍스트 파일</strong>을 드래그해 놓으시면, 인원별 출석 수와 학기별 조건 충족 여부가 즉시 자동 계산됩니다.
                </p>
              </div>

              <input
                type="file"
                accept=".txt"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="main-file-input"
              />
              <label
                htmlFor="main-file-input"
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 cursor-pointer transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                대화록 (.txt) 파일 선택하여 출석부 생성하기
              </label>

              <div className="pt-4 border-t border-slate-100 w-full flex items-center justify-center gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  서버 저장 없음 (100% 브라우저 연산)
                </span>
                <span className="flex items-center gap-1.5">
                  🔒 깃허브 코드에 대화록/개인정보 미포함
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Top Banner showing loaded filename */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="font-bold text-sm text-blue-950 flex items-center gap-2">
                    <span>분석된 대화록: {uploadedFileName || '업로드된 파일'}</span>
                    <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                      {members.length}명 추출 완료
                    </span>
                  </div>
                  <div className="text-xs text-blue-700 mt-0.5">
                    카카오톡 대화 내용 기반 출석부가 자동 생성되었습니다. 필요 시 셀을 직접 클릭하여 참석 일수를 수정하실 수 있습니다.
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Stats */}
            <StatsOverview members={members} />

            {/* Main Table */}
            <AttendanceTable
              members={members}
              onEditMember={(m) => setEditingMember(m)}
              onAddMember={() => setEditingMember('new')}
              onDeleteMember={handleDeleteMember}
              onOpenUploader={() => setIsUploaderOpen(true)}
              onResetData={handleClearAll}
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
            saveMembersState(updated);
            setIsUploaderOpen(false);
          }}
          onClose={() => setIsUploaderOpen(false)}
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
