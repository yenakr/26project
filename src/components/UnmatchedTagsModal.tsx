import React from 'react';
import { X, AlertTriangle, Check } from 'lucide-react';
import { UnmatchedTag, Member } from '../types/attendance';

interface UnmatchedTagsModalProps {
  unmatchedTags: UnmatchedTag[];
  members: Member[];
  onResolveTag: (extractedName: string, correctName: string) => void;
  onClose: () => void;
}

export function UnmatchedTagsModal({
  unmatchedTags,
  members,
  onResolveTag,
  onClose
}: UnmatchedTagsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200/80 relative max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">확인이 필요한 이름 검증 ({unmatchedTags.length}건)</h2>
        </div>

        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          규칙 점수제 검증에서 문맥 점수가 애매하거나(0~1점) 공백 태그로 감지된 항목입니다. 올바른 크루원 이름으로 수정하시거나 명단을 불러오시면 자동 반영됩니다.
        </p>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {unmatchedTags.map((tag) => (
            <div key={tag.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                  태그명: &apos;{tag.extractedName}&apos; (점수: {tag.score}점)
                </span>
                <span className="text-[11px] text-slate-400">{tag.date}</span>
              </div>

              <div className="text-[11px] text-slate-600 font-mono bg-white p-2 rounded border border-slate-200/60 truncate">
                원문: {tag.lineText}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="올바른 회원명 입력 (예: 이태윤)"
                  id={`tag-input-${tag.id}`}
                  className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-900"
                />
                <button
                  onClick={() => {
                    const inputEl = document.getElementById(`tag-input-${tag.id}`) as HTMLInputElement;
                    const val = inputEl?.value.trim();
                    if (val) {
                      onResolveTag(tag.extractedName, val);
                    } else {
                      alert('올바른 이름을 입력해 주세요.');
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-2xs transition shrink-0 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  <span>수정</span>
                </button>
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
