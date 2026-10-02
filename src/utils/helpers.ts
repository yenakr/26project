import { Member, MemberRoleType, SemesterInfo, SortOption } from '../types/attendance';

export function getEffectiveMemberType(member: Member, activeSemester?: SemesterInfo): MemberRoleType {
  if (member.memberType && member.memberType !== '미지정') {
    return member.memberType;
  }

  if (member.joinDate && activeSemester?.startDate && activeSemester?.endDate) {
    if (member.joinDate >= activeSemester.startDate && member.joinDate <= activeSemester.endDate) {
      return '신입회원';
    }
  }

  return member.memberType || '미지정';
}

export function getStatusBadgeStyle(typeName: MemberRoleType, isCompleted: boolean, totalCount: number): string {
  // 1. 미달성 / 진행 중 시: 회원 구분과 무관하게 슬레이트 회색 톤으로 통일
  if (!isCompleted) {
    return totalCount > 0
      ? 'bg-slate-100 text-slate-700 border border-slate-200/80 font-bold'
      : 'bg-slate-50 text-slate-400 border border-slate-200/60 font-medium';
  }

  // 2. 목표 달성 완료 시: 회원 구분별 선명한 컬러 뱃지 적용
  switch (typeName) {
    case '신입회원':
      return 'bg-emerald-500 text-white font-extrabold shadow-xs';
    case '정회원':
      return 'bg-blue-600 text-white font-extrabold shadow-xs';
    case 'OB회원':
      return 'bg-pink-500 text-white font-extrabold shadow-xs';
    case '미지정':
    default:
      return 'bg-slate-900 text-white font-extrabold shadow-xs';
  }
}

export function parseDaysCount(daysStr: string | undefined): number {
  if (!daysStr || !daysStr.trim()) return 0;
  return daysStr
    .split(',')
    .map(s => s.trim())
    .filter(Boolean).length;
}

export function calculateTotalForMonths(attendances: Record<string, string>, activeMonths?: string[]): number {
  const keys = activeMonths && activeMonths.length > 0 ? activeMonths : Object.keys(attendances);
  return keys.reduce((sum, key) => sum + parseDaysCount(attendances[key]), 0);
}

export function sortMembers(members: Member[], sortOption: SortOption, activeMonths?: string[]): Member[] {
  const copy = [...members];

  switch (sortOption) {
    case 'name_asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name, 'ko'));

    case 'count_desc':
      return copy.sort((a, b) => {
        const totalA = calculateTotalForMonths(a.attendances, activeMonths);
        const totalB = calculateTotalForMonths(b.attendances, activeMonths);
        if (totalB !== totalA) return totalB - totalA;
        return a.name.localeCompare(b.name, 'ko');
      });

    case 'count_asc':
      return copy.sort((a, b) => {
        const totalA = calculateTotalForMonths(a.attendances, activeMonths);
        const totalB = calculateTotalForMonths(b.attendances, activeMonths);
        if (totalA !== totalB) return totalA - totalB;
        return a.name.localeCompare(b.name, 'ko');
      });

    default:
      return copy;
  }
}
