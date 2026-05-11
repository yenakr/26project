"use client";

import React from 'react';

interface SBARFormProps {
  onAssess?: () => void;
}

export default function SBARForm({ onAssess }: SBARFormProps) {
  return (
    <div className="card" style={{ borderTop: '4px solid var(--blue-primary)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
      <h2 className="section-title text-center" style={{ justifyContent: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
        <i className="ri-file-list-3-line text-blue-primary"></i> 병원 전 환자 상태 평가 (SBAR)
      </h2>
      <p className="text-gray mb-6 text-center">구급차 내에서 환자 상태를 입력하여 중증도를 분류하고 최적의 이송 병원을 탐색합니다.</p>

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
          <textarea className="form-input" rows={3} placeholder="활력징후, GCS, 통증점수 등" defaultValue="BP: 90/60\nHR: 118\nSpO2: 92%\nNRS: 8점"></textarea>
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">R: Recommendation (요청)</label>
          <input type="text" className="form-input" placeholder="필요한 자원 및 특이사항 입력" defaultValue="빠른 심장내과 개입 필요" />
        </div>

        <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '1.5rem' }}>
          <button 
            className="btn btn-primary" 
            style={{ fontSize: '1.125rem', padding: '1rem 2.5rem', borderRadius: '50px', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.3)' }}
            onClick={onAssess}
          >
            <i className="ri-heart-pulse-fill" style={{ marginRight: '0.5rem' }}></i> 환자 상태 평가 및 인계 요약 생성
          </button>
        </div>
      </div>
    </div>
  );
}
