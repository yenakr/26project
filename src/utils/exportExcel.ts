import * as XLSX from 'xlsx';
import { Member } from '../types/attendance';
import { calculateSemesterTotal, getStatusBadgeInfo } from './helpers';

export function exportToExcel(members: Member[], months: string[] = ['26.9', '26.10', '26.11', '26.12']) {
  const data = members.map((m) => {
    const row: Record<string, string | number> = {
      '이름': m.name,
      '학기 수': m.semesterCount || (m.tier === '신입' ? '' : '1'),
    };

    months.forEach((month) => {
      row[month] = m.attendances[month] || '';
    });

    const statusInfo = getStatusBadgeInfo(m);
    row['합계'] = calculateSemesterTotal(m.attendances);
    row['유지 상태'] = statusInfo.label;
    row['비활동 여부'] = m.inactiveStatus || '';
    row['보증금 유보 / 비고'] = m.note || '';

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const colWidths = [
    { wch: 10 }, // 이름
    { wch: 10 }, // 학기 수
    { wch: 35 }, // 26.9
    { wch: 20 }, // 26.10
    { wch: 20 }, // 26.11
    { wch: 20 }, // 26.12
    { wch: 8 },  // 합계
    { wch: 15 }, // 유지 상태
    { wch: 12 }, // 비활동 여부
    { wch: 18 }, // 보증금/비고
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '2026-2학기 출석부');

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  XLSX.writeFile(workbook, `이런저런_러닝크루_출석부_${dateStr}.xlsx`);
}
