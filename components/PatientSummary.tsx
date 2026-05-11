"use client";

import React from 'react';
import { useSession } from "next-auth/react";

interface PatientSummaryProps {
  data?: any;
}

export default function PatientSummary({ data }: PatientSummaryProps) {
  const { data: session } = useSession();
  // If no data provided, render nothing or placeholder.
  // We assume data is always provided when this component is mounted in the current workflow.
  const d = data || {};

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--red-primary)', backgroundColor: '#f8fafc' }}>
      <div className="flex justify-between items-center mb-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          <i className="ri-pass-valid-line text-blue-dark"></i> 구급대 인계 요약 및 중증도 평가 결과
        </h2>
        <span className="badge danger" style={{ fontSize: '1rem', padding: '0.4rem 1rem' }}>{d.preKtas || "Pre-KTAS 평가 완료"}</span>
      </div>
      
      <div className="grid-3 mb-4">
        <div>
          <p className="text-sm text-gray font-bold mb-1">Situation & Background</p>
          <p className="font-bold text-lg text-blue-dark mb-2">{d.situation || "증상 미입력"}</p>
          <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{d.background || "배경 정보 미입력"}</p>
        </div>
        <div>
          <p className="text-sm text-gray font-bold mb-1">Assessment (활력징후)</p>
          <p className="text-sm"><span className="text-gray inline-block w-12">BP:</span> <strong className="text-red-primary">{d.bp || "-"}</strong> mmHg</p>
          <p className="text-sm"><span className="text-gray inline-block w-12">HR:</span> <strong>{d.hr || "-"}</strong> 회/분</p>
          <p className="text-sm"><span className="text-gray inline-block w-12">SpO₂:</span> <strong className="text-red-primary">{d.spo2 || "-"}</strong> %</p>
          <p className="text-sm mt-1">NRS: {d.nrs || "-"} 점</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid var(--red-primary)' }}>
          <p className="text-sm text-gray font-bold mb-1">AI 도출 이송 조건</p>
          {/* Mock logic based on input or static for prototype */}
          <p className="mb-1"><span className="text-gray">요청 자원:</span> <strong>{d.recommendation || "없음"}</strong></p>
          <p className="mb-1"><span className="text-gray">의심 질환:</span> <strong className="text-red-dark">중증 응급 의심</strong></p>
          <p><span className="text-gray">권장 시간:</span> 발생 후 골든타임 내</p>
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
