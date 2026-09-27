import React, { useState } from 'react';
import { X, GitMerge, ArrowRight, Check, AlertTriangle } from 'lucide-react';
import { Member, AttendanceSource } from '../types/attendance';
import { calculateTotalForMonths } from '../utils/helpers';

interface MergeMembersModalProps {
  members: Member[];
  onMergeMembers: (sourceMemberId: string, targetMemberId: string) => void;
  onClose: () => void;
}

export function MergeMembersModal({
  members,
  onMergeMembers,
  onClose
}: MergeMembersModalProps) {
  const [sourceId, setSourceId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');

  const sortedMembers = [...members].sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  const sourceMember = members.find((m) => m.id === sourceId);
  const targetMember = members.find((m) => m.id === targetId);

  const canMerge = sourceId && targetId && sourceId !== targetId;

  // Preview combined attendance count
  const sourceTotal = sourceMember ? calculateTotalForMonths(sourceMember.attendances) : 0;
  const targetTotal = targetMember ? calculateTotalForMonths(targetMember.attendances) : 0;

  const handleExecuteMerge = () => {
    if (!canMerge || !sourceMember || !targetMember) return;

    if (
      confirm(
        `'${sourceMember.name}' 회원의 모든 출석 기록을 '${targetMember.name}' 회원의 기록으로 합치고, '${sourceMember.name}' 프로필은 삭제합니다.\n\n정말 통합하시겠습니까?`
      )
    ) {
      onMergeMembers(sourceId, targetId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 border border-slate-200/80 relative max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-slate-900 text-white rounded-xl">
            <GitMerge className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">회원 데이터 통합 (이름 합치기)</h2>
            <p className="text-xs text-slate-500">
              이름이 다르게 등록되었거나 중복 생성된 인원의 출석 기록을 하나로 합칩니다.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto space-y-4 my-3 pr-1">
          {/* Step 1: Select Source Member (To be deleted) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              1. 삭제 및 합칠 기존 이름 (원본)
            </label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-slate-900 outline-none bg-white font-semibold"
            >
              <option value="">-- 합쳐서 삭제할 회원을 선택하세요 (예: 규태) --</option>
              {sortedMembers.map((m) => (
                <option key={m.id} value={m.id} disabled={m.id === targetId}>
                  {m.name} (총 {calculateTotalForMonths(m.attendances)}회 출석)
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center text-slate-400">
            <ArrowRight className="w-5 h-5 rotate-90 sm:rotate-0" />
          </div>

          {/* Step 2: Select Target Member (To keep) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              2. 최종으로 유지할 이름 (대상)
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-slate-900 outline-none bg-white font-semibold"
            >
              <option value="">-- 최종 유지할 회원을 선택하세요 (예: 강규태) --</option>
              {sortedMembers.map((m) => (
                <option key={m.id} value={m.id} disabled={m.id === sourceId}>
                  {m.name} (총 {calculateTotalForMonths(m.attendances)}회 출석)
                </option>
              ))}
            </select>
          </div>

          {/* Validation Warning if same member selected */}
          {sourceId && targetId && sourceId === targetId && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>동일한 회원을 통합 대상으로 선택할 수 없습니다.</span>
            </div>
          )}

          {/* Merge Preview */}
          {canMerge && sourceMember && targetMember && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2 animate-in fade-in duration-150">
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>통합 미리보기:</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                <strong>'{sourceMember.name}'</strong> (총 {sourceTotal}회)의 모든 월별 출석 일자와 원문 정보가{' '}
                <strong>'{targetMember.name}'</strong> (기존 {targetTotal}회)에 병합되며, 중복 일자는 자동 정렬·정리됩니다.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
          >
            취소
          </button>
          <button
            onClick={handleExecuteMerge}
            disabled={!canMerge}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition shadow-2xs flex items-center gap-1.5 ${
              canMerge
                ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <GitMerge className="w-4 h-4" />
            <span>회원 통합 실행</span>
          </button>
        </div>
      </div>
    </div>
  );
}
