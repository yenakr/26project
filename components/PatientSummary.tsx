"use client";

import React from 'react';

export default function PatientSummary() {
  return (
    <div className="card" style={{ borderLeft: '4px solid var(--red-primary)', backgroundColor: '#f8fafc' }}>
      <div className="flex justify-between items-center mb-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          <i className="ri-pass-valid-line text-blue-dark"></i> 구급대 인계 요약 및 중증도 평가 결과
        </h2>
        <span className="badge danger" style={{ fontSize: '1rem', padding: '0.4rem 1rem' }}>Pre-KTAS 1등급 (초응급)</span>
      </div>
      
      <div className="grid-3 mb-4">
        <div>
          <p className="text-sm text-gray font-bold mb-1">Situation & Background</p>
          <p className="font-bold text-lg text-blue-dark mb-2">67세 / 남성 / 흉통 (Alert)</p>
          <p className="text-sm">기저질환: 고혈압, 당뇨<br/>알레르기: 없음</p>
        </div>
        <div>
          <p className="text-sm text-gray font-bold mb-1">Assessment (활력징후)</p>
          <p className="text-sm"><span className="text-gray inline-block w-12">BP:</span> <strong className="text-red-primary">90/60 mmHg</strong></p>
          <p className="text-sm"><span className="text-gray inline-block w-12">HR:</span> <strong>118회/분</strong></p>
          <p className="text-sm"><span className="text-gray inline-block w-12">SpO₂:</span> <strong className="text-red-primary">92%</strong></p>
          <p className="text-sm mt-1">NRS: 8점</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid var(--red-primary)' }}>
          <p className="text-sm text-gray font-bold mb-1">AI 도출 이송 조건</p>
          <p className="mb-1"><span className="text-gray">의심 질환:</span> <strong className="text-red-dark">STEMI (심근경색)</strong></p>
          <p className="mb-1"><span className="text-gray">필수 자원:</span> PCI 가능 병원, ICU</p>
          <p><span className="text-gray">권장 시간:</span> 발생 후 골든타임 내</p>
        </div>
      </div>
      
      <div className="text-center mt-2">
        <p className="text-sm text-gray"><i className="ri-information-line"></i> 위 정보를 바탕으로 주변 병원의 수용 현황을 탐색했습니다.</p>
      </div>
    </div>
  );
}
