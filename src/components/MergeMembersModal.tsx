import React, { useState } from 'react';
import { X, GitMerge, ArrowRight, Check, AlertTriangle } from 'lucide-react';
import { Member } from '../types/attendance';
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

  const handleExecuteMerge = () => {
    if (!canMerge || !sourceMember || !targetMember) return;

    if (confirm(`'${sourceMember.name}' ➔ '${targetMember.name}'(으)로 합치시겠습니까?`)) {
      onMergeMembers(sourceId, targetId);
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200/80 relative max-h-[85vh] flex flex-col cursor-default"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-slate-900 text-white rounded-xl">
            <GitMerge className="w-5 h-5" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900">이름 합치기</h2>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto space-y-4 my-2 pr-1">
          {/* Step 1: Select Source Member */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              삭제할 이름
            </label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-slate-900 outline-none bg-white font-semibold"
            >
              <option value="">-- 선택 --</option>
              {sortedMembers.map((m) => (
                <option key={m.id} value={m.id} disabled={m.id === targetId}>
                  {m.name} ({calculateTotalForMonths(m.attendances)}회)
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center text-slate-400">
            <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-0" />
          </div>

          {/* Step 2: Select Target Member */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              유지할 이름
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-slate-900 outline-none bg-white font-semibold"
            >
              <option value="">-- 선택 --</option>
              {sortedMembers.map((m) => (
                <option key={m.id} value={m.id} disabled={m.id === sourceId}>
                  {m.name} ({calculateTotalForMonths(m.attendances)}회)
                </option>
              ))}
            </select>
          </div>

          {/* Validation Warning */}
          {sourceId && targetId && sourceId === targetId && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>서로 다른 이름을 선택해 주세요.</span>
            </div>
          )}

          {/* Merge Preview */}
          {canMerge && sourceMember && targetMember && (
            <div className="p-3.5 bg-slate-100/70 border border-slate-200 rounded-2xl animate-in fade-in duration-150 text-xs text-slate-800 font-medium">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                <Check className="w-4 h-4 text-slate-700" />
                <span>합치기 확인:</span>
              </div>
              <span>
                <strong>'{sourceMember.name}'</strong> 회원의 출석 기록이 <strong>'{targetMember.name}'</strong> 회원으로 통합됩니다.
              </span>
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
            <span>합치기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
