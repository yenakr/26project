'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, HelpCircle, FileSpreadsheet, Lock, Download, Upload, RefreshCw } from 'lucide-react';
import { Member } from '../types/attendance';
import { INITIAL_MEMBERS } from '../utils/initialData';
import { StatsOverview } from '../components/StatsOverview';
import { AttendanceTable } from '../components/AttendanceTable';
import { PinAuthModal } from '../components/PinAuthModal';
import { FileUploaderModal } from '../components/FileUploaderModal';
import { MemberModal } from '../components/MemberModal';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modals
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null | 'new'>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Check PIN auth on mount
  useEffect(() => {
    const authSession = sessionStorage.getItem('crew_auth_pin');
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }

    // Load stored members from localStorage or fallback to INITIAL_MEMBERS
    const saved = localStorage.getItem('crew_attendance_members_2026');
    if (saved) {
      try {
        setMembers(JSON.parse(saved));
      } catch {
        setMembers(INITIAL_MEMBERS);
      }
    } else {
      setMembers(INITIAL_MEMBERS);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('crew_attendance_members_2026', JSON.stringify(members));
    }
  }, [members, isLoaded]);

  const handleAddOrUpdateMember = (updatedMember: Member) => {
    setMembers((prev) => {
      const idx = prev.findIndex((m) => m.id === updatedMember.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedMember;
        return copy;
      } else {
        return [updatedMember, ...prev];
      }
    });
  };

  const handleDeleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpdateDays = (memberId: string, month: string, newDays: string) => {
    setMembers((prev) =>
      prev.map((m) => {
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
      })
    );
  };

  const handleApplyParsedMembers = (parsedMembers: Member[]) => {
    setMembers(parsedMembers);
    alert(`성공적으로 카카오톡 대화록 분석 결과가 출석부에 적용되었습니다!`);
  };

  const handleResetData = () => {
    if (confirm('기본 명단 데이터(초기 엑셀 명단)로 복원하시겠습니까?')) {
      setMembers(INITIAL_MEMBERS);
      localStorage.removeItem('crew_attendance_members_2026');
    }
  };

  // JSON Export & Import
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(members, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `이런저런_출석백업_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (Array.isArray(imported)) {
            setMembers(imported);
            alert('JSON 백업 데이터 복원이 완료되었습니다!');
          }
        } catch {
          alert('유효하지 않은 JSON 파일입니다.');
        }
      };
      reader.readAsText(file);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* PIN Auth Overlay */}
      {!isAuthenticated && (
        <PinAuthModal onSuccess={() => setIsAuthenticated(true)} />
      )}

      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/20">
              🏃‍♂️
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                이런저런 러닝크루 <span className="text-blue-600 font-extrabold">출석체크</span>
              </h1>
              <p className="text-[11px] text-slate-400">
                2026-2학기 카톡 대화록 자동 분석 & 회원유지 관리
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuideModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>보안 & 호스팅 안내</span>
            </button>

            <button
              onClick={handleExportJSON}
              title="JSON 백업 파일 저장"
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1 transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>백업</span>
            </button>

            <label
              title="JSON 백업 불러오기"
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1 cursor-pointer transition"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>복원</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            <button
              onClick={() => {
                sessionStorage.removeItem('crew_auth_pin');
                setIsAuthenticated(false);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1 transition"
            >
              <Lock className="w-3.5 h-3.5" />
              잠금
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* KPI Stats Overview */}
        <StatsOverview members={members} />

        {/* Attendance Table */}
        <AttendanceTable
          members={members}
          onEditMember={(m) => setEditingMember(m)}
          onAddMember={() => setEditingMember('new')}
          onDeleteMember={handleDeleteMember}
          onOpenUploader={() => setIsUploaderOpen(true)}
          onResetData={handleResetData}
          onUpdateDays={handleUpdateDays}
        />
      </main>

      {/* Modals */}
      {isUploaderOpen && (
        <FileUploaderModal
          currentMembers={members}
          onApply={handleApplyParsedMembers}
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

      {/* Security & Deployment Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-100 text-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              깃허브(GitHub) & Vercel 개인정보 안전 배포 가이드
            </h2>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                <strong className="text-emerald-900 block mb-1">1. 대화록 및 개인정보 미포함 보장</strong>
                카카오톡 대화록(`.txt`)이나 크루원 데이터는 깃허브 코드 저장소에 절대 commit되지 않습니다. 파일 업로드 시 **사용자 브라우저 메모리 상에서만 파싱**됩니다.
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
                <strong className="text-blue-900 block mb-1">2. GitHub Private 저장소 + Vercel 호스팅 방법</strong>
                1) GitHub에서 새로운 Repository 생성 시 <strong>Private(비공개)</strong>으로 생성합니다.<br />
                2) Vercel.com에 접속하여 생성한 Private Repo를 Import하고 Deploy 버튼을 누르면 1분 만에 배포가 완료됩니다.<br />
                3) Private 저장소이므로 외부인은 깃허브 코드 자체를 절대 볼 수 없습니다.
              </div>

              <div className="bg-slate-100 p-3 rounded-xl">
                <strong className="text-slate-800 block mb-1">3. PIN 코드 접속 제한</strong>
                사이트 첫 접속 시 비밀번호 <code className="bg-white px-1.5 py-0.5 rounded font-bold text-blue-600">0214</code>를 입력해야만 출석부에 접근할 수 있어 무단 열람이 차단됩니다.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
