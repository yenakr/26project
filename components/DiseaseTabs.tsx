"use client";

import React, { useState } from 'react';

const diseases = [
  { id: 'stemi', name: 'STEMI (심근경색)', req: 'PCI 가능, 심장내과 전문의, ICU' },
  { id: 'stroke', name: '중증 뇌졸중', req: 'CT/MRI, 혈전용해/제거술, 신경과 전문의' },
  { id: 'trauma', name: '중증 외상', req: '외상팀, 즉시 수술, 혈액 보유, ICU' },
  { id: 'maternity', name: '고위험 산모', req: '산부인과, 신생아중환자실(NICU)' },
  { id: 'pediatric', name: '소아 중증응급', req: '소아응급, 소아중환자실(PICU)' },
];

export default function DiseaseTabs() {
  const [activeTab, setActiveTab] = useState('stemi');

  return (
    <div className="card">
      <h2 className="section-title">
        <i className="ri-heart-pulse-line text-red-primary"></i> 고위험·저빈도 질환 이송 리스트
      </h2>
      <p className="text-sm text-gray mb-4">특정 자원이 반드시 필요한 환자군을 위한 사전 권장 이송 병원</p>

      <div className="flex" style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '1rem', overflowX: 'auto' }}>
        {diseases.map(d => (
          <button 
            key={d.id}
            onClick={() => setActiveTab(d.id)}
            style={{
              padding: '0.75rem 1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === d.id ? '2px solid var(--blue-primary)' : '2px solid transparent',
              color: activeTab === d.id ? 'var(--blue-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === d.id ? 'bold' : 'normal',
              whiteSpace: 'nowrap'
            }}
          >
            {d.name}
          </button>
        ))}
      </div>

      <div className="tab-content" style={{ padding: '0.5rem 0' }}>
        <div className="mb-3 p-3" style={{ backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <p className="text-sm font-bold text-gray">필수 요건: <span className="text-blue-dark">{diseases.find(d => d.id === activeTab)?.req}</span></p>
        </div>

        {activeTab === 'stemi' && (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li className="mb-2 p-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex justify-between items-center">
                <strong>서울권역응급의료센터</strong>
                <span className="badge success">즉시 수용 가능</span>
              </div>
              <p className="text-xs text-gray mt-1">도착 15분 이내 PCI 준비 완료 가능</p>
            </li>
            <li className="mb-2 p-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex justify-between items-center">
                <strong>한양대병원</strong>
                <span className="badge warning">전문의 콜 필요</span>
              </div>
              <p className="text-xs text-gray mt-1">심장내과 당직 콜아웃 상태</p>
            </li>
          </ul>
        )}

        {activeTab !== 'stemi' && (
          <div className="p-4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <i className="ri-folder-info-line text-2xl mb-2" style={{ display: 'block' }}></i>
            <p>해당 질환에 대한 지역 네트워크 데이터가 로드되었습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
