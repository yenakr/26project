import React, { useEffect, useRef } from 'react';
import { X, MessageSquare, Trash2, Calendar, User, Info } from 'lucide-react';
import { AttendanceSource, ContextLine } from '../types/attendance';
import { HighlightedMessage } from './HighlightedMessage';

interface AttendanceSourceModalProps {
  memberName: string;
  monthKey: string;
  day: string;
  sources: AttendanceSource[];
  isEditMode: boolean;
  onDeleteAttendanceDay: (memberName: string, monthKey: string, day: string) => void;
  onClose: () => void;
}

function ContextRow({ line }: { line: ContextLine }) {
  return (
    <div className="text-[11px] leading-relaxed text-slate-400 whitespace-pre-wrap">
      {line.sender && <span className="font-semibold text-slate-500">{line.sender} </span>}
      {line.time && <span className="mr-1">{line.time}</span>}
      <span>{line.message}</span>
    </div>
  );
}

export function AttendanceSourceModal({
  memberName,
  monthKey,
  day,
  sources,
  isEditMode,
  onDeleteAttendanceDay,
  onClose
}: AttendanceSourceModalProps) {
  const parts = monthKey.split('.');
  const monthNum = parts.length === 2 ? parseInt(parts[1], 10) : monthKey;

  // Start scrolled to the actual attendance message so the messages before it sit just above
  const firstMessageRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    firstMessageRef.current?.scrollIntoView({ block: 'center' });
  }, []);

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

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 bg-slate-900 text-white rounded-xl">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              {memberName} ({monthNum}월 {day}일)
            </h2>
          </div>
        </div>

        {/* Message Sources List */}
        <div className="flex-1 overflow-y-auto space-y-3.5 my-3 pr-1">
          {sources.length > 0 ? (
            sources.map((src, idx) => (
              <div key={src.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                {/* Meta details */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {src.timestamp}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                    {src.decisionType === 'auto'
                      ? '자동'
                      : src.decisionType === 'review'
                      ? '검토'
                      : '수동'}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  작성자: <span className="text-slate-900 font-extrabold">{src.sender}</span>
                </div>

                {/* Messages before */}
                {src.context && src.context.before.length > 0 && (
                  <div className="space-y-1">
                    {src.context.before.map((line, i) => (
                      <ContextRow key={`b-${i}`} line={line} />
                    ))}
                  </div>
                )}

                {/* Original Message Text */}
                <div
                  ref={idx === 0 ? firstMessageRef : undefined}
                  className="bg-white p-3.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-sans leading-relaxed whitespace-pre-wrap"
                >
                  <HighlightedMessage text={src.message} />
                </div>

                {/* Messages after */}
                {src.context && src.context.after.length > 0 && (
                  <div className="space-y-1">
                    {src.context.after.map((line, i) => (
                      <ContextRow key={`a-${i}`} line={line} />
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 text-center text-xs text-slate-500 space-y-2">
              <Info className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="font-medium text-slate-700">수동으로 추가된 출석 기록입니다.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm(`${memberName} 회원의 ${monthNum}월 ${day}일 출석을 삭제하시겠습니까?`)) {
                onDeleteAttendanceDay(memberName, monthKey, day);
                onClose();
              }
            }}
            className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>삭제</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
