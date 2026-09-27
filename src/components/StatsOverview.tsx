import React from 'react';
import { Users, CheckCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Member } from '../types/attendance';
import { calculateSemesterTotal, getRequiredCount } from '../utils/helpers';

interface StatsOverviewProps {
  members: Member[];
}

export function StatsOverview({ members }: StatsOverviewProps) {
  const activeMembers = members.filter(m => !m.inactiveStatus);
  const totalCount = members.length;

  const metCount = activeMembers.filter(m => {
    const total = calculateSemesterTotal(m.attendances);
    const req = getRequiredCount(m.tier);
    return total >= req;
  }).length;

  const inProgressCount = activeMembers.filter(m => {
    const total = calculateSemesterTotal(m.attendances);
    const req = getRequiredCount(m.tier);
    return total > 0 && total < req;
  }).length;

  const newMembersCount = members.filter(m => m.tier === '신입').length;
  const obMembersCount = members.filter(m => m.tier === 'OB').length;
  const regularCount = members.filter(m => m.tier === '정회원_1' || m.tier === '정회원_2').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xs text-gray-500 font-medium">전체 크루원</div>
          <div className="text-xl font-bold text-gray-900">{totalCount}명</div>
          <div className="text-[11px] text-gray-400">
            신입 {newMembersCount} · 정회원 {regularCount} · OB {obMembersCount}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-3">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xs text-emerald-700 font-medium">조건 충족 회원</div>
          <div className="text-xl font-bold text-emerald-900">{metCount}명</div>
          <div className="text-[11px] text-emerald-600">
            활동 기준 (신입/정회원 4회, OB 2회) 달성 완료
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex items-center gap-3">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xs text-amber-700 font-medium">진행 중 (달성 직전)</div>
          <div className="text-xl font-bold text-amber-900">{inProgressCount}명</div>
          <div className="text-[11px] text-amber-600">1회 이상 참석 후 진행 중</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm flex items-center gap-3">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xs text-purple-700 font-medium">2026-2학기 출석률</div>
          <div className="text-xl font-bold text-purple-900">
            {activeMembers.length ? Math.round((metCount / activeMembers.length) * 100) : 0}%
          </div>
          <div className="text-[11px] text-purple-600">활동 크루원 {activeMembers.length}명 기준</div>
        </div>
      </div>
    </div>
  );
}
