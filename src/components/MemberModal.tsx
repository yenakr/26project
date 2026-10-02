import React, { useState } from 'react';
import { X, UserCheck, GitMerge } from 'lucide-react';
import { Member, MemberRoleType } from '../types/attendance';
import { getEffectiveMemberType } from '../utils/helpers';

interface MemberModalProps {
  initialMember?: Member | null;
  allMembers?: Member[];
  onSave: (member: Member) => void;
  onMergeMembers?: (sourceId: string, targetId: string) => void;
  onClose: () => void;
}

export function MemberModal({
  initialMember,
  allMembers,
  onSave,
  onMergeMembers,
  onClose
}: MemberModalProps) {
  const initialType = initialMember ? getEffectiveMemberType(initialMember) : '미지정';
  const [name, setName] = useState(initialMember?.name || '');
  const [memberType, setMemberType] = useState<MemberRoleType>(initialType);
  const [targetCount, setTargetCount] = useState(
    initialMember?.targetCount || (initialType === 'OB회원' ? 2 : 4)
  );
  const [mergeTargetId, setMergeTargetId] = useState<string>('');

  const handleMemberTypeChange = (type: MemberRoleType) => {
    setMemberType(type);
    if (type === 'OB회원') {
      setTargetCount(2);
    } else {
      setTargetCount(4);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('이름을 입력해 주세요.');
      return;
    }

    const updatedMember: Member = {
      id: initialMember?.id || String(Date.now()),
      name: name.trim(),
      memberType,
      targetCount,
      attendances: initialMember ? { ...initialMember.attendances } : {},
      sources: initialMember ? { ...initialMember.sources } : {},
      joinDate: initialMember?.joinDate,
      leaveDate: initialMember?.leaveDate,
    };

    onSave(updatedMember);
    onClose();
  };

  const handleExecuteMerge = () => {
    if (!initialMember || !mergeTargetId || !onMergeMembers || !allMembers) return;
    const targetMember = allMembers.find((m) => m.id === mergeTargetId);
    if (!targetMember) return;

    const confirmMessage = `‘${initialMember.name}’의 출석 기록을 ‘${targetMember.name}’에게 병합할까요?\n\n병합 후 ‘${initialMember.name}’ 회원은 삭제됩니다.`;

    if (confirm(confirmMessage)) {
      onMergeMembers(initialMember.id, mergeTargetId);
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
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200/80 relative cursor-default"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-slate-100 text-slate-900 rounded-lg">
            <UserCheck className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            {initialMember ? '회원 정보 수정' : '크루원 추가'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Member Type Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">회원 구분</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleMemberTypeChange('미지정')}
                className={`py-2 px-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  memberType === '미지정' || !memberType
                    ? 'bg-slate-100 text-slate-800 border-slate-400 ring-2 ring-slate-400/20 font-extrabold'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
                <span>미지정</span>
              </button>
              <button
                type="button"
                onClick={() => handleMemberTypeChange('신입회원')}
                className={`py-2 px-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  memberType === '신입회원'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-400 ring-2 ring-emerald-400/20 font-extrabold'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span>신입회원</span>
              </button>
              <button
                type="button"
                onClick={() => handleMemberTypeChange('정회원')}
                className={`py-2 px-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  memberType === '정회원'
                    ? 'bg-blue-100 text-blue-800 border-blue-400 ring-2 ring-blue-400/20 font-extrabold'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span>정회원</span>
              </button>
              <button
                type="button"
                onClick={() => handleMemberTypeChange('OB회원')}
                className={`py-2 px-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  memberType === 'OB회원'
                    ? 'bg-pink-100 text-pink-800 border-pink-400 ring-2 ring-pink-400/20 font-extrabold'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0" />
                <span>OB회원</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 김예나"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">목표 참석 횟수</label>
              <input
                type="number"
                min={1}
                max={50}
                value={targetCount}
                onChange={(e) => setTargetCount(parseInt(e.target.value, 10) || 4)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition"
              />
            </div>
          </div>

          {/* Member Merge Feature */}
          {initialMember && allMembers && onMergeMembers && allMembers.length > 1 && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
              <label className="block font-bold text-slate-700 flex items-center gap-1">
                <GitMerge className="w-3.5 h-3.5 text-slate-600" />
                <span>회원 기록 병합</span>
              </label>
              <div className="text-[11px] text-slate-500 leading-snug space-y-0.5">
                <p>‘{initialMember.name}’의 출석 기록을 선택한 회원에게 합칩니다.</p>
                <p className="text-slate-500">병합 후 ‘{initialMember.name}’ 회원은 삭제됩니다.</p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <select
                  value={mergeTargetId}
                  onChange={(e) => setMergeTargetId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs outline-none bg-white font-semibold text-slate-800"
                >
                  <option value="">병합할 회원 선택 ▾</option>
                  {allMembers
                    .filter((m) => m.id !== initialMember.id)
                    .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  disabled={!mergeTargetId}
                  onClick={handleExecuteMerge}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition ${
                    mergeTargetId
                      ? 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shadow-2xs'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  기록 병합
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
