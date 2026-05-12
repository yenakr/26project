"use client";

import React from 'react';
import { TriageResult } from '../utils/triage';

interface PatientSummaryProps {
  data: any;
  extData: any;
  triage: TriageResult;
}

export default function PatientSummary({ data, extData, triage }: PatientSummaryProps) {
  const d = data || {};
  const v = d.vitals || {};

  // Build SBAR text
  const situationText = `환자는 ${Object.entries(d.complaints || {})
    .filter(([_, arr]) => (arr as string[]).length > 0)
    .map(([cat, arr]) => `${cat}(${(arr as string[]).join(", ")})`)
    .join(" 및 ")}를 호소함. ${extData.customComplaint ? `기타 증상: ${extData.customComplaint}` : ""}`;

  const backgroundText = `과거력: ${extData.sample?.P || "없음"}\n복용약: ${extData.sample?.M || "없음"}\n알레르기: ${extData.sample?.A || "없음"}\n마지막 정상 상태/식사: ${extData.sample?.L || "미상"}\n사고경위: ${extData.sample?.E || "미상"}`;

  const assessmentText = `활력징후: BP ${v.sbp || "?"}/${v.dbp || "?"}, HR ${v.hr || "?"}, RR ${v.rr || "?"}, SpO₂ ${v.spo2 || "?"}%\n의식: ${d.primary?.consciousness || "미상"}\n중증도 분류: ${triage?.label || "미평가"}\n분류 근거: ${triage?.reasons?.join(" + ") || "없음"}`;

  const recText = triage?.recommendation || "응급실 진료 필요. 이송 전 병원 수용 가능 여부 확인 필요.";

  return (
    <div className="card" style={{ borderLeft: `8px solid var(--blue-primary)` }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          <i className="ri-pass-valid-line text-blue-dark"></i> 구급대 인계 요약 (SBAR)
        </h2>
        <button className="badge-btn" onClick={() => navigator.clipboard.writeText(`[S] Situation\n${situationText}\n\n[B] Background\n${backgroundText}\n\n[A] Assessment\n${assessmentText}\n\n[R] Recommendation\n${recText}`)}>
          <i className="ri-file-copy-line mr-1"></i> 복사
        </button>
      </div>

      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#333', whiteSpace: 'pre-wrap' }}>
          <p className="font-bold text-gray mt-2" style={{ color: 'var(--blue-dark)' }}>[S] Situation</p>
          <p>{situationText}</p>
          
          <p className="font-bold text-gray mt-4" style={{ color: 'var(--blue-dark)' }}>[B] Background</p>
          <p>{backgroundText}</p>
          
          <p className="font-bold text-gray mt-4" style={{ color: 'var(--blue-dark)' }}>[A] Assessment</p>
          <p>{assessmentText}</p>
          
          <p className="font-bold text-gray mt-4" style={{ color: 'var(--blue-dark)' }}>[R] Recommendation</p>
          <p>{recText}</p>
        </div>
      </div>
    </div>
  );
}
