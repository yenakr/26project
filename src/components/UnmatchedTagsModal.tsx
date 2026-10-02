import React from 'react';
import { X, AlertCircle, Check, Trash2 } from 'lucide-react';
import { UnmatchedTag, Member } from '../types/attendance';
import { HighlightedMessage } from './HighlightedMessage';

interface UnmatchedTagsModalProps {
  unmatchedTags: UnmatchedTag[];
  members: Member[];
  onConfirmAttendance: (tag: UnmatchedTag, targetName: string) => void;
  onDiscardTag: (tagId: string) => void;
  onClose: () => void;
}

export function UnmatchedTagsModal({
  unmatchedTags,
  members,
  onConfirmAttendance,
  onDiscardTag,
  onClose
}: UnmatchedTagsModalProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 border border-slate-200/80 relative max-h-[85vh] flex flex-col cursor-default"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-slate-100 text-slate-900 rounded-lg">
            <AlertCircle className="w-5 h-5 text-slate-700" />
          </div>
          <h2 className="text-base font-bold text-slate-900">단일 태그 출석 확인 ({unmatchedTags.length}건)</h2>
        </div>

        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          1명만 태그되어 출석 인증인지 단순 질문/호출인지 판별이 필요한 메시지입니다. 대화 원문을 확인하신 후 출석 여부를 결정해 주세요.
        </p>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {unmatchedTags.map((tag) => (
            <div key={tag.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-2.5">
              {/* Header: Date & Extracted Name */}
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  태그된 회원: <strong className="text-blue-600 font-extrabold">{tag.extractedName}</strong>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{tag.date}</span>
              </div>

              {/* Full Original Message Line Text */}
              <div className="text-xs text-slate-800 font-sans bg-white p-3 rounded-xl border border-slate-200/80 whitespace-pre-wrap leading-relaxed">
                <HighlightedMessage text={tag.lineText} />
              </div>

              {/* Action Buttons: Confirm vs Discard */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">이름 수정:</span>
                  <input
                    type="text"
                    defaultValue={tag.extractedName}
                    id={`tag-name-input-${tag.id}`}
                    className="w-full max-w-[140px] px-2.5 py-1 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-900"
                  />
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onDiscardTag(tag.id)}
                    className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 font-semibold rounded-lg shadow-2xs transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>제외</span>
                  </button>
                  <button
                    onClick={() => {
                      const inputEl = document.getElementById(`tag-name-input-${tag.id}`) as HTMLInputElement;
                      const finalName = inputEl?.value.trim() || tag.extractedName;
                      onConfirmAttendance(tag, finalName);
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-2xs transition flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>출석 인정</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
