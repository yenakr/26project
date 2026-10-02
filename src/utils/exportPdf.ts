import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Member } from '../types/attendance';
import { calculateTotalForMonths } from './helpers';

export async function exportToPdf(
  members: Member[],
  activeMonths: string[],
  semesterName: string
): Promise<void> {
  if (members.length === 0) {
    alert('PDF로 내보낼 회원 데이터가 없습니다.');
    return;
  }

  // Create temporary container for high-res PDF rendering
  const container = document.createElement('div');
  container.id = 'pdf-export-render-container';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '1000px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  container.style.padding = '36px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  // Calculate statistics for KPI summary header
  const totalMembers = members.length;
  const targetMetMembers = members.filter((m) => {
    const total = calculateTotalForMonths(m.attendances, activeMonths);
    return total >= (m.targetCount || 4);
  }).length;

  const targetMetPercentage = totalMembers > 0 ? Math.round((targetMetMembers / totalMembers) * 100) : 0;
  
  const sumTotalAttendances = members.reduce(
    (sum, m) => sum + calculateTotalForMonths(m.attendances, activeMonths),
    0
  );
  const avgAttendance = totalMembers > 0 ? (sumTotalAttendances / totalMembers).toFixed(1) : '0';

  const formatMonthLabel = (mKey: string) => {
    const parts = mKey.split('.');
    return parts.length === 2 ? `${parseInt(parts[1], 10)}월` : mKey;
  };

  const currentDateStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Build HTML Content
  container.innerHTML = `
    <div style="margin-bottom: 24px; border-b: 2px solid #e2e8f0; padding-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; letter-spacing: -0.5px;">
            이런저런 출석 카운팅 현황
          </h1>
          <p style="font-size: 13px; color: #64748b; margin: 0; font-weight: 500;">
            학기 기준: ${semesterName} | 생성일시: ${currentDateStr}
          </p>
        </div>
        <div style="text-align: right; font-size: 12px; color: #475569; font-weight: 600;">
          총 회원 ${totalMembers}명
        </div>
      </div>
    </div>

    <!-- Summary KPI Cards -->
    <div style="display: flex; gap: 12px; margin-bottom: 24px;">
      <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px;">
        <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 4px;">전체 인원</div>
        <div style="font-size: 20px; font-weight: 800; color: #0f172a;">${totalMembers}명</div>
      </div>
      <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px;">
        <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 4px;">목표 달성 (4회 이상)</div>
        <div style="font-size: 20px; font-weight: 800; color: #0f172a;">
          ${targetMetMembers}명 <span style="font-size: 13px; color: #475569; font-weight: 600;">(${targetMetPercentage}%)</span>
        </div>
      </div>
      <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px;">
        <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 4px;">인당 평균 참석</div>
        <div style="font-size: 20px; font-weight: 800; color: #0f172a;">${avgAttendance}회</div>
      </div>
    </div>

    <!-- Attendance Table -->
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #e2e8f0;">
      <thead>
        <tr style="background-color: #f1f5f9; color: #334155; font-weight: 700;">
          <th style="padding: 10px 8px; border: 1px solid #cbd5e1; text-align: center; width: 36px;">#</th>
          <th style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: left; width: 110px;">이름</th>
          ${activeMonths
            .map(
              (m) =>
                `<th style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: left;">${formatMonthLabel(
                  m
                )} 출석일</th>`
            )
            .join('')}
          <th style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: center; width: 110px;">합계</th>
        </tr>
      </thead>
      <tbody>
        ${members
          .map((m, idx) => {
            const total = calculateTotalForMonths(m.attendances, activeMonths);
            const typeName = m.memberType || '미지정';
            const target = m.targetCount || (typeName === 'OB회원' ? 2 : 4);
            const isCompleted = total >= target;

            const dotColor = typeName === '신입회원' ? '#10b981' : typeName === '정회원' ? '#3b82f6' : typeName === 'OB회원' ? '#ec4899' : '#cbd5e1';

            const monthTdHtml = activeMonths
              .map((mKey) => {
                const daysStr = m.attendances[mKey] || '';
                const tokens = daysStr
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);

                if (tokens.length === 0) {
                  return `<td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #cbd5e1;">-</td>`;
                }

                const pills = tokens
                  .map(
                    (d) =>
                      `<span style="display: inline-block; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 6px; font-family: monospace; font-size: 11px; font-weight: 700; color: #1e293b; margin: 1px;">${d}</span>`
                  )
                  .join(' ');

                return `<td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${pills}</td>`;
              })
              .join('');

            const statusStyle = isCompleted
              ? 'background: #0f172a; color: #ffffff; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; display: inline-block;'
              : 'background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; display: inline-block;';

            const statusText = isCompleted ? `${total}회` : `${total}/${target}회`;

            return `
              <tr style="background-color: ${idx % 2 === 1 ? '#f8fafc' : '#ffffff'};">
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 11px;">${
                  idx + 1
                }</td>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 800; color: #0f172a;">
                  <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${dotColor}; margin-right: 6px; vertical-align: middle;"></span>
                  <span style="vertical-align: middle;">${m.name}</span>
                </td>
                ${monthTdHtml}
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: center;">
                  <span style="${statusStyle}">${statusText}</span>
                </td>
              </tr>
            `;
          })
          .join('')}
      </tbody>
    </table>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // High resolution capture
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 297mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 210mm

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First Page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Multi-page handling if content length exceeds 1 page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const cleanSemName = semesterName.replace(/\s+/g, '_');
    pdf.save(`이런저런_출석현황_${cleanSemName}.pdf`);
  } catch (err) {
    console.error('PDF export error:', err);
    alert('PDF 저장 중 오류가 발생했습니다.');
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
