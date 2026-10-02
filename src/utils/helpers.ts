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
  if (typeName === '신입회원') {
    return isCompleted
      ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
      : totalCount > 0
      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
      : 'bg-emerald-50/50 text-emerald-400 border border-emerald-200/60 font-medium';
  }

  if (typeName === '정회원') {
    return isCompleted
      ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
      : totalCount > 0
      ? 'bg-blue-50 text-blue-800 border border-blue-300 font-bold'
      : 'bg-blue-50/50 text-blue-400 border border-blue-200/60 font-medium';
  }

  if (typeName === 'OB회원') {
    return isCompleted
      ? 'bg-pink-600 text-white shadow-2xs font-extrabold'
      : totalCount > 0
      ? 'bg-pink-50 text-pink-800 border border-pink-300 font-bold'
      : 'bg-pink-50/50 text-pink-400 border border-pink-200/60 font-medium';
  }

  // 미지정 (기존 그 박스 유지)
  return isCompleted
    ? 'bg-slate-900 text-white font-extrabold'
    : totalCount > 0
    ? 'bg-slate-100 text-slate-700 border border-slate-200 font-bold'
    : 'bg-slate-50 text-slate-400 border border-slate-200/60 font-medium';
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
