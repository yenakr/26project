import React, { useState } from 'react';
import { Upload, FileText, X, Check, Loader2 } from 'lucide-react';
import { Member, ParseResult } from '../types/attendance';
import { parseKakaoTalkLog } from '../utils/parser';

interface FileUploaderModalProps {
  currentMembers: Member[];
  onApply: (updatedMembers: Member[]) => void;
  onClose: () => void;
}

export function FileUploaderModal({ currentMembers, onApply, onClose }: FileUploaderModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      let text = e.target?.result as string;
      if (!text) {
        setIsLoading(false);
        alert('파일 내용을 읽을 수 없습니다.');
        return;
      }

      let result = parseKakaoTalkLog(text, currentMembers);

      // Mobile EUC-KR / CP949 encoding fallback
      if ((result.members.length === 0 || text.includes('\uFFFD')) && typeof TextDecoder !== 'undefined') {
        const fallbackReader = new FileReader();
        fallbackReader.onload = (fe) => {
          const buffer = fe.target?.result as ArrayBuffer;
          if (buffer) {
            try {
              const eucDecoder = new TextDecoder('euc-kr');
              const eucText = eucDecoder.decode(buffer);
              const eucResult = parseKakaoTalkLog(eucText, currentMembers);
              if (eucResult.members.length > 0) {
                result = eucResult;
              }
            } catch {}
          }
          setIsLoading(false);
          setParseResult(result);
        };
        fallbackReader.onerror = () => {
          setIsLoading(false);
          setParseResult(result);
        };
        fallbackReader.readAsArrayBuffer(file);
        return;
      }

      setIsLoading(false);
      setParseResult(result);
    };

    reader.onerror = () => {
      setIsLoading(false);
      alert('파일을 읽는 도중 오류가 발생했습니다.');
    };

    reader.readAsText(file, 'utf-8');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200/80 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-base font-bold text-slate-900 mb-1">카카오톡 대화록 불러오기</h2>
        <p className="text-xs text-slate-500 mb-4">
          대화 내보내기 텍스트 파일(.txt)을 선택하시면 출석수가 자동 집계됩니다.
        </p>

        {!parseResult ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition flex flex-col items-center justify-center gap-3 ${
              dragActive ? 'border-slate-900 bg-slate-50' : 'border-slate-300 hover:border-slate-900'
            }`}
          >
            <div className="w-12 h-12 bg-slate-100 text-slate-900 rounded-full flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-700" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {isLoading ? '대화록 분석 중...' : '.txt 파일 선택 또는 드래그'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">카카오톡 내보내기 텍스트 파일</p>
            </div>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = '';
              }}
              className="hidden"
              id="txt-modal-input"
            />
            <label
              htmlFor="txt-modal-input"
              className="mt-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer transition touch-manipulation"
            >
              파일 선택
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-700" />
                <div>
                  <div className="font-bold text-xs text-slate-900">{fileName}</div>
                  <div className="text-[11px] text-slate-500">
                    분석 완료: 총 {parseResult.members.length}명 추출됨
                  </div>
                </div>
              </div>
              <button
                onClick={() => setParseResult(null)}
                className="text-xs text-slate-500 hover:underline"
              >
                다시 선택
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                취소
              </button>
              <button
                onClick={() => {
                  onApply(parseResult.members);
                  onClose();
                }}
                className="px-5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                출석부에 적용
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
