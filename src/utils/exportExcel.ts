import ExcelJS from 'exceljs';
import { Member } from '../types/attendance';
import { calculateTotalForMonths } from './helpers';

export async function exportToExcel(
  members: Member[],
  months: string[] = ['26.9', '26.10', '26.11', '26.12'],
  semesterName: string = '2026년 2학기'
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = '이런저런 러닝크루';
  workbook.lastModifiedBy = '이런저런 출석 카운팅';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('출석 현황', {
    pageSetup: {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 }
    }
  });

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  const formatMonthHeader = (mKey: string) => {
    const parts = mKey.split('.');
    if (parts.length === 2) {
      const year = `20${parts[0]}`;
      const month = parts[1].padStart(2, '0');
      return `${year}.${month}`;
    }
    return mKey;
  };

  const headerMonthLabels = months.map(formatMonthHeader);
  const totalCols = 2 + months.length + 2; // #, 이름, months..., 합계, 달성 상태

  // 1. Title Block (Row 1-3)
  const titleRow = worksheet.getRow(1);
  titleRow.height = 32;
  worksheet.mergeCells(1, 1, 1, totalCols);
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `이런저런 출석 현황 — ${semesterName}`;
  titleCell.font = { name: '맑은 고딕', size: 16, bold: true, color: { argb: 'FF0F172A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

  const subTitleRow = worksheet.getRow(2);
  subTitleRow.height = 18;
  worksheet.mergeCells(2, 1, 2, totalCols);
  const subTitleCell = worksheet.getCell('A2');
  subTitleCell.value = `다운로드 기준일: ${dateStr}`;
  subTitleCell.font = { name: '맑은 고딕', size: 9, color: { argb: 'FF64748B' } };
  subTitleCell.alignment = { vertical: 'middle', horizontal: 'left' };

  worksheet.getRow(3).height = 10; // Blank spacing row

  // 2. Table Header Row (Row 4)
  const headers = ['#', '이름', ...headerMonthLabels, '합계', '달성 상태'];
  const headerRow = worksheet.getRow(4);
  headerRow.height = 26;

  headers.forEach((h, colIdx) => {
    const cell = headerRow.getCell(colIdx + 1);
    cell.value = h;
    cell.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' }
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: colIdx === 1 ? 'left' : 'center',
      wrapText: true
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'medium', color: { argb: 'FFCBD5E1' } }
    };
  });

  // 3. Data Rows (Row 5+)
  members.forEach((member, idx) => {
    const rowNum = 5 + idx;
    const row = worksheet.getRow(rowNum);
    row.height = 24;

    const totalCount = calculateTotalForMonths(member.attendances, months);
    const targetCount = member.targetCount || 4;
    const isCompleted = totalCount >= targetCount;

    const isEven = idx % 2 === 1;
    const rowBgColor = isEven ? 'FFF8FAFC' : 'FFFFFFFF';

    // Cell 1: Index (#)
    const cellIndex = row.getCell(1);
    cellIndex.value = idx + 1;
    cellIndex.font = { name: '맑은 고딕', size: 9, color: { argb: 'FF94A3B8' } };
    cellIndex.alignment = { vertical: 'middle', horizontal: 'center' };

    // Cell 2: Name
    const cellName = row.getCell(2);
    cellName.value = member.name;
    cellName.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    cellName.alignment = { vertical: 'middle', horizontal: 'left' };

    // Month Cells
    months.forEach((mKey, mIdx) => {
      const cellMonth = row.getCell(3 + mIdx);
      const daysValue = member.attendances[mKey] || '';
      cellMonth.value = daysValue;
      cellMonth.font = { name: '맑은 고딕', size: 10, color: { argb: 'FF334155' } };
      cellMonth.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    });

    // Cell: Total Count
    const cellTotal = row.getCell(3 + months.length);
    cellTotal.value = totalCount;
    cellTotal.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    cellTotal.alignment = { vertical: 'middle', horizontal: 'center' };
    cellTotal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

    // Cell: Status
    const cellStatus = row.getCell(4 + months.length);
    if (isCompleted) {
      cellStatus.value = `달성 · ${totalCount}회`;
      cellStatus.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF065F46' } };
      cellStatus.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
    } else {
      cellStatus.value = `미달 · ${totalCount}/${targetCount}회`;
      cellStatus.font = { name: '맑은 고딕', size: 10, color: { argb: 'FF64748B' } };
      cellStatus.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    }
    cellStatus.alignment = { vertical: 'middle', horizontal: 'center' };

    // Apply Zebra striping and thin borders to row
    for (let c = 1; c <= totalCols; c++) {
      const cell = row.getCell(c);
      if (c !== 3 + months.length && c !== 4 + months.length) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBgColor } };
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    }
  });

  // 4. Column Widths
  worksheet.getColumn(1).width = 6;  // #
  worksheet.getColumn(2).width = 16; // 이름
  months.forEach((_, mIdx) => {
    worksheet.getColumn(3 + mIdx).width = 28; // 월별 참석일
  });
  worksheet.getColumn(3 + months.length).width = 10; // 합계
  worksheet.getColumn(4 + months.length).width = 18; // 달성 상태

  // 5. Freeze Panes (틀 고정: 상단 4행 및 좌측 2열 # / 이름 고정)
  worksheet.views = [
    { state: 'frozen', xSplit: 2, ySplit: 4 }
  ];

  // 6. Excel AutoFilter starting from header row
  const lastRowIndex = 4 + members.length;
  worksheet.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: lastRowIndex > 4 ? lastRowIndex : 4, column: totalCols }
  };

  // Generate and download buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `이런저런_출석현황_${semesterName.replace(/\s+/g, '_')}_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
