import React from 'react';
import { Member } from '../types/attendance';
import { calculateTotalForMonths } from '../utils/helpers';

interface StatsOverviewProps {
  members: Member[];
}

export function StatsOverview({ members }: StatsOverviewProps) {
  const totalMembers = members.length;
  const completedMembers = members.filter((m) => {
    const total = calculateTotalForMonths(m.attendances);
    return total >= (m.targetCount || 4);
  }).length;

  const totalAttendancesSum = members.reduce(
    (sum, m) => sum + calculateTotalForMonths(m.attendances),
    0
  );
  const avgAttendance = totalMembers > 0 ? (totalAttendancesSum / totalMembers).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">전체 인원</div>
        <div className="text-2xl font-bold text-slate-900 mt-1">{totalMembers}<span className="text-sm font-normal text-slate-400 ml-0.5">명</span></div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">목표 달성 (4회 이상)</div>
        <div className="text-2xl font-bold text-slate-900 mt-1">
          {completedMembers}
          <span className="text-sm font-normal text-slate-400 ml-0.5">명 ({totalMembers > 0 ? Math.round((completedMembers / totalMembers) * 100) : 0}%)</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">인당 평균 참석</div>
        <div className="text-2xl font-bold text-slate-900 mt-1">{avgAttendance}<span className="text-sm font-normal text-slate-400 ml-0.5">회</span></div>
      </div>
    </div>
  );
}
