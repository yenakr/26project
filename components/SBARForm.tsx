"use client";

import React, { useState } from 'react';

export default function SBARForm() {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="card">
      <h2 className="section-title">
        <i className="ri-file-list-3-line text-blue-primary"></i> 병원 전 인계 표준화 (SBAR)
      </h2>
      <p className="text-gray mb-4 text-sm">구급차 내에서 병원 의료진에게 전달할 핵심 정보를 표준화된 양식으로 입력합니다.</p>

      {!showPreview ? (
        <div className="sbar-inputs grid-2">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">S: Situation (상황)</label>
            <div className="grid-2">
              <input type="text" className="form-input" placeholder="주호소 (예: 흉통)" defaultValue="흉통" />
              <select className="form-select" defaultValue="Alert">
                <option value="Alert">Alert (명료)</option>
                <option value="Verbal">Verbal (언어지시 반응)</option>
                <option value="Pain">Pain (통증 반응)</option>
                <option value="Unresponsive">Unresponsive (무반응)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">B: Background (배경)</label>
            <textarea className="form-input" rows={3} placeholder="나이, 기저질환, 투약력, 알레르기" defaultValue="67세 남성\n기저질환: 고혈압, 당뇨\n알레르기 없음"></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">A: Assessment (평가)</label>
            <textarea className="form-input" rows={3} placeholder="활력징후, GCS, 통증점수 등" defaultValue="BP: 90/60, HR: 118, SpO2: 92%\nNRS: 8점\nPre-KTAS: 1단계"></textarea>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">R: Recommendation (요청)</label>
            <input type="text" className="form-input" placeholder="필요한 처치 및 수용 자원" defaultValue="PCI 가능 병원, 심장내과 전문의 대기 요망" />
          </div>

          <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={() => setShowPreview(true)}>
              <i className="ri-file-text-line" style={{ marginRight: '0.5rem' }}></i> 병원 인계 요약 생성
            </button>
          </div>
        </div>
      ) : (
        <div className="sbar-preview" style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <div className="flex justify-between items-center mb-4 border-b" style={{ paddingBottom: '1rem', borderColor: '#e2e8f0' }}>
            <h3 className="font-bold text-blue-dark"><i className="ri-send-plane-fill"></i> 구급대 SBAR 전송 카드</h3>
            <span className="badge primary">119 전송 완료</span>
          </div>
          
          <div className="grid-2">
            <div>
              <p className="text-sm text-gray font-bold">Situation (상황)</p>
              <p className="mb-3">67세 남성, 흉통 호소. 의식 상태: Alert</p>

              <p className="text-sm text-gray font-bold">Background (배경)</p>
              <p className="mb-3">기저질환: 고혈압, 당뇨<br/>알레르기 없음</p>
            </div>
            <div>
              <p className="text-sm text-gray font-bold">Assessment (평가)</p>
              <p className="mb-3 text-red-dark font-bold">BP: 90/60, HR: 118, SpO2: 92%<br/>NRS: 8점, Pre-KTAS: 1단계 (STEMI 의심)</p>

              <p className="text-sm text-gray font-bold">Recommendation (요청)</p>
              <p className="mb-3 font-bold">PCI 가능 병원, 심장내과 전문의 대기 요망. 예상 도착 시간 15분 이내.</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button className="btn" style={{ backgroundColor: '#e2e8f0', color: '#475569' }} onClick={() => setShowPreview(false)}>
              다시 수정하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
