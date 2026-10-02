import React, { useState } from 'react';
import { X, UserCheck } from 'lucide-react';
import { Member, MemberRoleType } from '../types/attendance';

interface MemberModalProps {
  initialMember?: Member | null;
  onSave: (member: Member) => void;
  onClose: () => void;
}

export function MemberModal({ initialMember, onSave, onClose }: MemberModalProps) {
  const [name, setName] = useState(initialMember?.name || '');
  const [memberType, setMemberType] = useState<MemberRoleType>(
    initialMember?.memberType || '정회원'
  );
  const [targetCount, setTargetCount] = useState(
    initialMember?.targetCount || (initialMember?.memberType === 'OB회원' ? 2 : 4)
  );
  const [sep26, setSep26] = useState(initialMember?.attendances['26.9'] || '');
  const [oct26, setOct26] = useState(initialMember?.attendances['26.10'] || '');
  const [nov26, setNov26] = useState(initialMember?.attendances['26.11'] || '');
  const [dec26, setDec26] = useState(initialMember?.attendances['26.12'] || '');

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
      attendances: {
        '26.9': sep26.trim(),
        '26.10': oct26.trim(),
        '26.11': nov26.trim(),
        '26.12': dec26.trim(),
      },
    };

    onSave(updatedMember);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200/80 relative">
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
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleMemberTypeChange('신입회원')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  memberType === '신입회원'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-400 ring-2 ring-emerald-400/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>신입회원</span>
              </button>
              <button
                type="button"
                onClick={() => handleMemberTypeChange('정회원')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  memberType === '정회원'
                    ? 'bg-blue-100 text-blue-800 border-blue-400 ring-2 ring-blue-400/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>정회원</span>
              </button>
              <button
                type="button"
                onClick={() => handleMemberTypeChange('OB회원')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  memberType === 'OB회원'
                    ? 'bg-pink-100 text-pink-800 border-pink-400 ring-2 ring-pink-400/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-pink-500" />
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

          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/60 space-y-2">
            <label className="block font-semibold text-slate-700">
              월별 참석 일자 (쉼표 구분)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-slate-500">26.9 (9월)</span>
                <input
                  type="text"
                  value={sep26}
                  onChange={(e) => setSep26(e.target.value)}
                  placeholder="예: 4, 8, 15"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500">26.10 (10월)</span>
                <input
                  type="text"
                  value={oct26}
                  onChange={(e) => setOct26(e.target.value)}
                  placeholder="예: 5, 12"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500">26.11 (11월)</span>
                <input
                  type="text"
                  value={nov26}
                  onChange={(e) => setNov26(e.target.value)}
                  placeholder="예: 3, 10"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500">26.12 (12월)</span>
                <input
                  type="text"
                  value={dec26}
                  onChange={(e) => setDec26(e.target.value)}
                  placeholder="예: 1, 8"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

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
