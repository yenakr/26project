import React from 'react';
import { Member, DEFAULT_SEMESTERS } from '../types/attendance';
import { calculateTotalForMonths } from '../utils/helpers';

interface StatsOverviewProps {
  members: Member[];
  selectedSemesterId?: string;
  selectedMonth?: string;
}

export function StatsOverview({
  members,
  selectedSemesterId = '2026-2',
  selectedMonth = '전체'
}: StatsOverviewProps) {
  const currentSemesterObj = DEFAULT_SEMESTERS.find((s) => s.id === selectedSemesterId) || DEFAULT_SEMESTERS[0];
  const semesterMonthKeys = currentSemesterObj.months;

  const activeMonths = selectedMonth === '전체' ? semesterMonthKeys : [selectedMonth];

  // Filter active members in current semester (based on joinDate & leaveDate)
  const semesterMembers = members.filter((m) => {
    if (m.joinDate && m.joinDate > currentSemesterObj.endDate) {
      return false;
    }
    if (m.leaveDate && m.leaveDate < currentSemesterObj.startDate) {
      return false;
    }
    return true;
  });

  const totalMembers = semesterMembers.length;

  const completedMembers = semesterMembers.filter((m) => {
    const total = calculateTotalForMonths(m.attendances, activeMonths);
    return total >= (m.targetCount || 4);
  }).length;

  const totalAttendancesSum = semesterMembers.reduce(
    (sum, m) => sum + calculateTotalForMonths(m.attendances, activeMonths),
    0
  );

  const avgAttendance = totalMembers > 0 ? (totalAttendancesSum / totalMembers).toFixed(1) : '0';

  const periodLabel = selectedMonth === '전체' ? currentSemesterObj.name : `${currentSemesterObj.name} (${selectedMonth})`;

  return (
    <div className="space-y-1.5 mb-5">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
        📊 {periodLabel} 출석 현황 요약
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">전체 인원</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {totalMembers}<span className="text-sm font-normal text-slate-400 ml-0.5">명</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">목표 달성 (4회 이상)</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {completedMembers}
            <span className="text-sm font-normal text-slate-400 ml-0.5">
              명 ({totalMembers > 0 ? Math.round((completedMembers / totalMembers) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">인당 평균 참석</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {avgAttendance}<span className="text-sm font-normal text-slate-400 ml-0.5">회</span>
          </div>
        </div>
      </div>
    </div>
  );
}
