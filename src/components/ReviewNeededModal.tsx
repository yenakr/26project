import React, { useState } from 'react';
import { X, HelpCircle, Check, Trash2, CheckSquare, Square } from 'lucide-react';
import { ReviewItem, Member, AttendanceSource } from '../types/attendance';

interface ReviewNeededModalProps {
  reviewItems: ReviewItem[];
  members: Member[];
  onApplyReviewItem: (item: ReviewItem, selectedNames: string[]) => void;
  onDiscardReviewItem: (itemId: string) => void;
  onClose: () => void;
}

export function ReviewNeededModal({
  reviewItems,
  members,
  onApplyReviewItem,
  onDiscardReviewItem,
  onClose
}: ReviewNeededModalProps) {
  // Local state to track candidate check states per item
  const [candidateStates, setCandidateStates] = useState<Record<string, Record<string, boolean>>>(() => {
    const initial: Record<string, Record<string, boolean>> = {};
    reviewItems.forEach((item) => {
      initial[item.id] = {};
      item.candidates.forEach((cand) => {
        initial[item.id][cand.name] = cand.isSelected;
      });
    });
    return initial;
  });

  const toggleCandidate = (itemId: string, name: string) => {
    setCandidateStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [name]: !prev[itemId]?.[name]
      }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-slate-200/80 relative max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200/60">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              출석 검토 필요 메시지 ({reviewItems.length}건)
            </h2>
            <p className="text-xs text-slate-500">
              단순 질문·호출·신청 메시지입니다. 실제로 참석한 크루원을 선택한 뒤 [출석 반영]을 눌러주세요.
            </p>
          </div>
        </div>

        {/* Queue Items */}
        <div className="flex-1 overflow-y-auto space-y-4 my-3 pr-1">
          {reviewItems.map((item) => {
            const itemStates = candidateStates[item.id] || {};
            const selectedNames = Object.keys(itemStates).filter((name) => itemStates[name]);

            return (
              <div
                key={item.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3"
              >
                {/* Meta header: Timestamp & Sender */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono text-[11px] bg-slate-200/70 text-slate-700 px-2.5 py-0.5 rounded-md font-semibold">
                    {item.timestampStr}
                  </span>
                  <span className="font-semibold text-slate-700">작성자: {item.sender}</span>
                </div>

                {/* Original Message Box */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-sans leading-relaxed whitespace-pre-wrap">
                  {item.fullMessage}
                </div>

                {/* Tagged Candidate Checkboxes */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500">
                    태그된 크루원 선택 (체크된 회원만 출석 인정):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.candidates.map((cand) => {
                      const isChecked = !!itemStates[cand.name];
                      return (
                        <button
                          key={cand.name}
                          type="button"
                          onClick={() => toggleCandidate(item.id, cand.name)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                            isChecked
                              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>{cand.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                  <button
                    onClick={() => onDiscardReviewItem(item.id)}
                    className="px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>제외 (비출석)</span>
                  </button>
                  <button
                    onClick={() => onApplyReviewItem(item, selectedNames)}
                    disabled={selectedNames.length === 0}
                    className={`px-4 py-1.5 text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-2xs ${
                      selectedNames.length > 0
                        ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>출석 반영 ({selectedNames.length}명)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
