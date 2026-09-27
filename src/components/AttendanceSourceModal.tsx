import React from 'react';
import { X, MessageSquare, Trash2, Calendar, User, Info } from 'lucide-react';
import { AttendanceSource } from '../types/attendance';

interface AttendanceSourceModalProps {
  memberName: string;
  monthKey: string;
  day: string;
  sources: AttendanceSource[];
  isEditMode: boolean;
  onDeleteAttendanceDay: (memberName: string, monthKey: string, day: string) => void;
  onClose: () => void;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200/80 relative max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-slate-900 text-white rounded-xl">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              출석 집계 원문 확인 ({memberName} · {monthNum}월 {day}일)
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              <strong>{memberName}</strong>의 {monthNum}월 {day}일 출석은 아래 메시지를 기준으로 집계되었습니다.
            </p>
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
                      ? '자동 집계 (확실한 출석)'
                      : src.decisionType === 'review'
                      ? '검토 후 승인'
                      : '수동 입력'}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  작성자: <span className="text-slate-900 font-extrabold">{src.sender}</span>
                </div>

                {/* Original Message Text */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-sans leading-relaxed whitespace-pre-wrap">
                  {src.message}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 text-center text-xs text-slate-500 space-y-2">
              <Info className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="font-medium text-slate-700">카카오톡 원문 정보가 없거나 수동으로 추가된 출석입니다.</p>
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
            <span>이 날짜 출석 삭제</span>
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
