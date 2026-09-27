import { Member, MemberTier } from '../types/attendance';

export function parseDaysCount(daysStr: string | undefined): number {
  if (!daysStr || !daysStr.trim()) return 0;
  return daysStr
    .split(',')
    .map(s => s.trim())
    .filter(Boolean).length;
}

export function calculateSemesterTotal(attendances: Record<string, string>): number {
  return Object.values(attendances).reduce((sum, daysStr) => sum + parseDaysCount(daysStr), 0);
}

export function getRequiredCount(tier: MemberTier): number {
  if (tier === 'OB') return 2;
  return 4; // 신입, 정회원_1, 정회원_2: 4회
}

export function getStatusBadgeInfo(member: Member) {
  if (member.inactiveStatus) {
    return {
      label: member.inactiveStatus,
      colorClass: 'bg-gray-100 text-gray-600 border-gray-300',
      type: '비활동'
    };
  }

  const total = calculateSemesterTotal(member.attendances);
  const required = getRequiredCount(member.tier);

  if (total >= required) {
    return {
      label: `충족 (${total}/${required})`,
      colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
      type: '충족'
    };
  } else if (total > 0) {
    return {
      label: `진행중 (${total}/${required})`,
      colorClass: 'bg-amber-100 text-amber-800 border-amber-300',
      type: '진행중'
    };
  } else {
    return {
      label: `미달 (${total}/${required})`,
      colorClass: 'bg-rose-100 text-rose-800 border-rose-300',
      type: '미달'
    };
  }
}

export function getTierColorClass(tier: MemberTier): string {
  switch (tier) {
    case '신입':
      return 'bg-[#d9f2d9]/60 hover:bg-[#d9f2d9]'; // 엑셀 연초록
    case '정회원_1':
    case '정회원_2':
      return 'bg-[#dbeafe]/60 hover:bg-[#dbeafe]'; // 엑셀 연파랑
    case 'OB':
      return 'bg-[#fce7f3]/60 hover:bg-[#fce7f3]'; // 엑셀 연분홍
    default:
      return 'bg-white hover:bg-gray-50';
  }
}

export function getTierBadge(tier: MemberTier, semesterCount: string) {
  switch (tier) {
    case '신입':
      return { label: '신입회원', bg: 'bg-emerald-600 text-white' };
    case '정회원_1':
      return { label: `정회원 (1학기)`, bg: 'bg-blue-600 text-white' };
    case '정회원_2':
      return { label: `정회원 (2학기)`, bg: 'bg-blue-700 text-white' };
    case 'OB':
      return { label: `OB (${semesterCount || '3+'}학기)`, bg: 'bg-rose-600 text-white' };
  }
}
