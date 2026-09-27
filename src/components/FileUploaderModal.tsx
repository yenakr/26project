import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';
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
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.txt')) {
      alert('카카오톡 대화록 (.txt) 파일만 업로드 가능합니다.');
      return;
    }
    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const result = parseKakaoTalkLog(text, currentMembers);
        setParseResult(result);
      }
      setIsProcessing(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-gray-100 relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">카카오톡 대화록 (.txt) 자동 파싱</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          카카오톡 대화 내보내기 텍스트 파일에서 <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600 font-bold">@이름</code> 태그 및 참석 일자를 추출하여 출석부에 자동 반영합니다.
        </p>

        {/* Drag & Drop Zone */}
        {!parseResult && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 ${
              dragActive ? 'border-blue-500 bg-blue-50/50 scale-[0.99]' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50/50'
            }`}
          >
            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                카카오톡 `.txt` 대화록 파일 드래그 & 드롭
              </p>
              <p className="text-xs text-gray-400 mt-1">또는 클릭하여 내 PC에서 파일 선택</p>
            </div>
            <input
              type="file"
              accept=".txt"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
              id="txt-upload-input"
            />
            <label
              htmlFor="txt-upload-input"
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow cursor-pointer transition"
            >
              대화록 파일 찾기
            </label>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="py-12 text-center text-gray-500 text-sm animate-pulse">
            대화록 파싱 중...
          </div>
        )}

        {/* Preview Parse Results */}
        {parseResult && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-emerald-600" />
                <div>
                  <div className="font-semibold text-sm text-emerald-900">{fileName}</div>
                  <div className="text-xs text-emerald-700">
                    분석 완료: 총 <span className="font-bold">{parseResult.detectedEvents.length}개</span>의 참석 모임 감지됨
                  </div>
                </div>
              </div>
              <button
                onClick={() => setParseResult(null)}
                className="text-xs text-emerald-700 hover:underline"
              >
                다른 파일 선택
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                감지된 최근 참석 모임 목록 ({parseResult.detectedEvents.length}건)
              </h3>
              <div className="max-h-52 overflow-y-auto space-y-2 border rounded-xl p-3 bg-gray-50/50">
                {parseResult.detectedEvents.map((evt, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border text-xs shadow-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {evt.date} ({evt.title})
                      </span>
                      <span className="text-gray-400">참석자 {evt.participants.length}명</span>
                    </div>
                    <div className="text-gray-600 flex flex-wrap gap-1 pt-1">
                      {evt.participants.map((name, pIdx) => (
                        <span key={pIdx} className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                          @{name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        {parseResult && (
          <div className="mt-4 pt-4 border-t flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              취소
            </button>
            <button
              onClick={() => {
                onApply(parseResult.members);
                onClose();
              }}
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              출석부에 분석 결과 적용하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
