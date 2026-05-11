"use client";

import React from 'react';

export default function PatientSummary() {
  return (
    <div className="card" style={{ borderLeft: '4px solid var(--red-primary)' }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          <i className="ri-user-heart-line text-red-primary"></i> 현재 환자 요약
        </h2>
        <span className="badge danger">Pre-KTAS 1등급 (초응급)</span>
      </div>
      
      <div className="grid-3">
        <div>
          <p className="form-label text-gray">기본 정보</p>
          <p className="font-bold text-lg">67세 / 남성</p>
          <p>주호소: 흉통 (의식: Alert)</p>
        </div>
        <div>
          <p className="form-label text-gray">활력 징후</p>
          <p><span className="text-gray">혈압:</span> <strong className="text-red-primary">90/60 mmHg</strong></p>
          <p><span className="text-gray">맥박:</span> <strong>118회/분</strong></p>
          <p><span className="text-gray">SpO₂:</span> <strong className="text-red-primary">92%</strong></p>
        </div>
        <div>
          <p className="form-label text-gray">이송 조건</p>
          <p><span className="text-gray">의심 질환:</span> <strong className="text-blue-dark">STEMI</strong></p>
          <p><span className="text-gray">필수 자원:</span> PCI 가능 병원, ICU, 심장내과 전문의</p>
          <p><span className="text-gray">도착 제한:</span> 15분 이내</p>
        </div>
      </div>
    </div>
  );
}
