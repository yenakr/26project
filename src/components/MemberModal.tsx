import React, { useState } from 'react';
import { X, UserCheck } from 'lucide-react';
import { Member, MemberTier } from '../types/attendance';

interface MemberModalProps {
  initialMember?: Member | null;
  onSave: (member: Member) => void;
  onClose: () => void;
}

export function MemberModal({ initialMember, onSave, onClose }: MemberModalProps) {
  const [name, setName] = useState(initialMember?.name || '');
  const [tier, setTier] = useState<MemberTier>(initialMember?.tier || '신입');
  const [semesterCount, setSemesterCount] = useState(initialMember?.semesterCount || '');
  const [sep26, setSep26] = useState(initialMember?.attendances['26.9'] || '');
  const [oct26, setOct26] = useState(initialMember?.attendances['26.10'] || '');
  const [nov26, setNov26] = useState(initialMember?.attendances['26.11'] || '');
  const [dec26, setDec26] = useState(initialMember?.attendances['26.12'] || '');
  const [inactiveStatus, setInactiveStatus] = useState(initialMember?.inactiveStatus || '');
  const [note, setNote] = useState(initialMember?.note || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('이름을 입력해 주세요.');
      return;
    }

    const updatedMember: Member = {
      id: initialMember?.id || String(Date.now()),
      name: name.trim(),
      tier,
      semesterCount,
      attendances: {
        '26.9': sep26.trim(),
        '26.10': oct26.trim(),
        '26.11': nov26.trim(),
        '26.12': dec26.trim(),
      },
      inactiveStatus: inactiveStatus.trim() || undefined,
      note: note.trim() || undefined,
    };

    onSave(updatedMember);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {initialMember ? '회원 정보 수정' : '신규 회원 추가'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">이름 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 김예나"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">회원 등급</label>
              <select
                value={tier}
                onChange={(e) => {
                  const newTier = e.target.value as MemberTier;
                  setTier(newTier);
                  if (newTier === '신입') setSemesterCount('');
                  else if (newTier === '정회원_1') setSemesterCount('1');
                  else if (newTier === '정회원_2') setSemesterCount('2');
                  else if (newTier === 'OB') setSemesterCount('3+');
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
              >
                <option value="신입">신입회원 (유지: 4회)</option>
                <option value="정회원_1">정회원 (1학기, 유지: 4회)</option>
                <option value="정회원_2">정회원 (2학기, 유지: 4회)</option>
                <option value="OB">OB 회원 (3학기 이상, 유지: 2회)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">학기 수 (엑셀 표기)</label>
              <input
                type="text"
                value={semesterCount}
                onChange={(e) => setSemesterCount(e.target.value)}
                placeholder="예: 빈칸, 1, 2, 3, 3+"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">비활동 여부</label>
              <input
                type="text"
                value={inactiveStatus}
                onChange={(e) => setInactiveStatus(e.target.value)}
                placeholder="예: 군 휴학, 비활동"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>
          </div>

          {/* Month Attendances */}
          <div className="bg-gray-50 p-3 rounded-xl border space-y-2">
            <label className="block text-xs font-bold text-gray-700">
              월별 참석 일자 (쉼표로 구분, 예: 4, 8, 12(대러리), 15)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-xs text-gray-500 font-semibold">26.9 (9월)</span>
                <input
                  type="text"
                  value={sep26}
                  onChange={(e) => setSep26(e.target.value)}
                  placeholder="예: 4, 8, 15"
                  className="w-full px-2.5 py-1.5 border rounded-md text-xs"
                />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold">26.10 (10월)</span>
                <input
                  type="text"
                  value={oct26}
                  onChange={(e) => setOct26(e.target.value)}
                  placeholder="예: 5, 12"
                  className="w-full px-2.5 py-1.5 border rounded-md text-xs"
                />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold">26.11 (11월)</span>
                <input
                  type="text"
                  value={nov26}
                  onChange={(e) => setNov26(e.target.value)}
                  placeholder="예: 3, 10"
                  className="w-full px-2.5 py-1.5 border rounded-md text-xs"
                />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold">26.12 (12월)</span>
                <input
                  type="text"
                  value={dec26}
                  onChange={(e) => setDec26(e.target.value)}
                  placeholder="예: 1, 8"
                  className="w-full px-2.5 py-1.5 border rounded-md text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">보증금 유보 / 비고 메모</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="예: 페널티 지급, 보증금 이체 완료"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
