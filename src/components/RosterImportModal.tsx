import React, { useState } from 'react';
import { X, UserPlus, FileText } from 'lucide-react';

interface RosterImportModalProps {
  onImportNames: (text: string) => void;
  onClose: () => void;
}

export function RosterImportModal({ onImportNames, onClose }: RosterImportModalProps) {
  const [textInput, setTextInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) {
      alert('크루원 명단 텍스트를 입력해 주세요.');
      return;
    }
    onImportNames(textInput);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setTextInput(text);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200/80 relative animate-in fade-in zoom-in duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-slate-100 text-slate-900 rounded-lg">
            <UserPlus className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-900">전체 크루원 명단 불러오기</h2>
        </div>

        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          카톡 출석 태그에 참여하지 않은 미참석 회원도 출석부에 표기할 수 있습니다. 이름 목록을 텍스트로 붙여넣거나 텍스트 파일(.txt)을 업로드해 주세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">명단 텍스트 입력</label>
              <label className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer font-medium flex items-center gap-1 touch-manipulation">
                <FileText className="w-3.5 h-3.5" />
                <span>.txt 파일 선택</span>
                <input type="file" accept=".txt,text/plain,text/*,*/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <textarea
              rows={7}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="예시:&#10;김예나&#10;유지훈&#10;이용권&#10;최은서&#10;(줄바꿈, 쉼표 구분 지원)"
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition font-mono leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              명단 추가하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
