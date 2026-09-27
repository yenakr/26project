import * as XLSX from 'xlsx';
import { Member } from '../types/attendance';
import { calculateTotalForMonths } from './helpers';

export function exportToExcel(members: Member[], months: string[] = ['26.9', '26.10', '26.11', '26.12']) {
  const data = members.map((m) => {
    const row: Record<string, string | number> = {
      '이름': m.name,
    };

    months.forEach((month) => {
      row[month] = m.attendances[month] || '';
    });

    const total = calculateTotalForMonths(m.attendances, months);
    const target = m.targetCount || 4;
    row['합계'] = total;
    row['달성 상태'] = total >= target ? `완료 (${total}/${target})` : `미달 (${total}/${target})`;

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  const colWidths = [
    { wch: 12 }, // 이름
    { wch: 30 }, // 26.9
    { wch: 20 }, // 26.10
    { wch: 20 }, // 26.11
    { wch: 20 }, // 26.12
    { wch: 8 },  // 합계
    { wch: 15 }, // 달성 상태
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '출석 카운트');

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  XLSX.writeFile(workbook, `이런저런_출석카운트_${dateStr}.xlsx`);
}
