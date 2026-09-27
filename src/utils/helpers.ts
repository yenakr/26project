import { Member, SortOption } from '../types/attendance';

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

    case 'completed':
      return copy.sort((a, b) => {
        const totalA = calculateTotalForMonths(a.attendances, activeMonths);
        const totalB = calculateTotalForMonths(b.attendances, activeMonths);
        const reqA = a.targetCount || 4;
        const reqB = b.targetCount || 4;
        const compA = totalA >= reqA ? 1 : 0;
        const compB = totalB >= reqB ? 1 : 0;
        if (compB !== compA) return compB - compA;
        return totalB - totalA;
      });

    case 'pending':
      return copy.sort((a, b) => {
        const totalA = calculateTotalForMonths(a.attendances, activeMonths);
        const totalB = calculateTotalForMonths(b.attendances, activeMonths);
        const reqA = a.targetCount || 4;
        const reqB = b.targetCount || 4;
        const compA = totalA >= reqA ? 1 : 0;
        const compB = totalB >= reqB ? 1 : 0;
        if (compA !== compB) return compA - compB;
        return totalA - totalB;
      });

    default:
      return copy;
  }
}
