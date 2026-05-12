"use client";

import React from 'react';
import { useSession } from "next-auth/react";
import { TriageResult } from '../utils/triage';

interface PatientSummaryProps {
  data?: any;
  timeline?: { time: string; msg: string }[];
  triage?: TriageResult;
}

export default function PatientSummary({ data, timeline = [], triage }: PatientSummaryProps) {
  const { data: session } = useSession();
  const d = data || {};
  const v = d.vitals || {};

  // Build SBAR text
  const situationText = `환자는 ${Object.entries(d.complaints || {})
    .filter(([_, arr]) => (arr as string[]).length > 0)
    .map(([cat, arr]) => `${cat}(${(arr as string[]).join(", ")})`)
    .join(" 및 ")}를 호소함. ${d.customComplaint ? `기타 증상: ${d.customComplaint}` : ""}`;

  const backgroundText = `과거력: ${d.sample?.P || "없음"}\n복용약: ${d.sample?.M || "없음"}\n알레르기: ${d.sample?.A || "없음"}\n마지막 정상 상태/식사: ${d.sample?.L || "미상"}\n사고경위: ${d.sample?.E || "미상"}`;

  const assessmentText = `활력징후: BP ${v.sbp || "?"}/${v.dbp || "?"}, HR ${v.hr || "?"}, RR ${v.rr || "?"}, SpO₂ ${v.spo2 || "?"}%\n의식: ${d.primary?.consciousness || "미상"}\n중증도 분류: ${triage?.label || "미평가"}\n분류 근거: ${triage?.reasons?.join(" + ") || "없음"}`;

  const recText = triage?.recommendation || "응급실 진료 필요. 이송 전 병원 수용 가능 여부 확인 필요.";

  const getLevelColor = (level: number) => {
    switch(level) {
      case 1: return "var(--red-primary)";
      case 2: return "#f97316"; // orange
      case 3: return "#eab308"; // yellow
      default: return "#22c55e"; // green
    }
  };

  return (
    <div className="card" style={{ borderLeft: `8px solid ${triage ? getLevelColor(triage.level) : 'var(--blue-primary)'}`, backgroundColor: '#f8fafc' }}>
      <div className="flex justify-between items-center mb-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          <i className="ri-pass-valid-line text-blue-dark"></i> 구급대 인계 요약 (SBAR)
        </h2>
        {triage && (
          <span className="badge" style={{ fontSize: '1rem', padding: '0.4rem 1rem', background: getLevelColor(triage.level), color: 'white' }}>
            {triage.label}
          </span>
        )}
      </div>

      <div className="grid-2 mb-6" style={{ gap: '2rem' }}>
        {/* SBAR Output */}
        <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h3 className="text-sm font-bold text-blue-dark mb-2"><i className="ri-file-text-line"></i> 병원 연락용 SBAR</h3>
          <div style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#333', whiteSpace: 'pre-wrap' }}>
            <p className="font-bold text-gray mt-2">[S] Situation</p>
            <p>{situationText}</p>
            
            <p className="font-bold text-gray mt-2">[B] Background</p>
            <p>{backgroundText}</p>
            
            <p className="font-bold text-gray mt-2">[A] Assessment</p>
            <p>{assessmentText}</p>
            
            <p className="font-bold text-gray mt-2">[R] Recommendation</p>
            <p>{recText}</p>
          </div>
        </div>

        {/* Timeline Log */}
        <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', color: '#10b981', fontFamily: 'monospace', fontSize: '0.8rem', height: '100%', maxHeight: '400px', overflowY: 'auto' }}>
          <h3 className="text-sm font-bold text-white mb-2"><i className="ri-time-line"></i> 시간별 상태 변화 로그</h3>
          {timeline.length === 0 ? (
            <p className="text-gray">기록된 로그가 없습니다.</p>
          ) : (
            timeline.map((log, i) => (
              <div key={i} style={{ marginBottom: '0.2rem' }}>
                <span className="text-gray">[{log.time}]</span> {log.msg}
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="text-center mt-2">
        <p className="text-sm text-gray">
          <i className="ri-information-line"></i> 위 정보를 바탕으로 주변 병원의 수용 현황을 탐색했습니다. 
          {session ? " (DB 저장 완료)" : " (비로그인: DB 저장 안 됨)"}
        </p>
      </div>
    </div>
  );
}
