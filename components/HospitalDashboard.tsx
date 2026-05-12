"use client";

import React from 'react';
import { RecommendedHospital } from '../utils/hospitals';

interface HospitalDashboardProps {
  hospitals: RecommendedHospital[];
}

export default function HospitalDashboard({ hospitals }: HospitalDashboardProps) {
  if (!hospitals || hospitals.length === 0) return null;

  return (
    <div className="card">
      <h2 className="section-title">
        <i className="ri-hospital-line text-blue-primary"></i> 맞춤형 병원 추천 및 수용 현황
      </h2>
      <p className="text-sm text-gray mb-4">환자의 중증도와 질환에 맞는 수용 가능 병원을 거리가 가까운 순으로 추천합니다.</p>

      <div className="flex" style={{ flexDirection: 'column', gap: '1rem' }}>
        {hospitals.map((hospital, idx) => (
          <div key={hospital.id} style={{ 
            border: idx === 0 ? '2px solid var(--blue-primary)' : '1px solid var(--border-color)', 
            borderRadius: '8px', padding: '1rem', background: idx === 0 ? '#f0f9ff' : '#fff' 
          }}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span style={{ 
                  background: idx === 0 ? 'var(--blue-primary)' : '#64748b', 
                  color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' 
                }}>
                  {idx + 1}순위
                </span>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--blue-dark)' }}>{hospital.name}</h3>
                <span className="badge neutral">{hospital.type}</span>
              </div>
            </div>

            <div className="mb-2">
              <span className="badge" style={{ background: '#dcfce7', color: '#166534', marginRight: '0.5rem', border: '1px solid #bbf7d0' }}>
                <i className="ri-thumb-up-line"></i> 추천 근거: {hospital.recommendationReason}
              </span>
            </div>

            <div className="grid-2 mb-3" style={{ gap: '0.5rem', fontSize: '0.875rem' }}>
              <div>
                <p className="text-gray mb-1"><i className="ri-map-pin-line"></i> 거리/ETA: <strong className="text-primary">{hospital.distanceKm}km / 약 {hospital.etaMinutes}분</strong></p>
                <p className="text-gray"><i className="ri-phone-line"></i> 연락처: {hospital.phone}</p>
              </div>
              <div>
                <p className="text-gray mb-1"><i className="ri-hotel-bed-line"></i> 잔여 응급병상: <strong style={{ color: hospital.beds.emergency > 0 ? '#10b981' : '#ef4444' }}>{hospital.beds.emergency}</strong>석</p>
                <p className="text-gray text-xs">최근 업데이트: {hospital.lastUpdated}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
              {hospital.capabilities.cardiac && <span className="badge" style={{ background: '#fef08a', color: '#854d0e' }}>심혈관</span>}
              {hospital.capabilities.stroke && <span className="badge" style={{ background: '#e9d5ff', color: '#6b21a8' }}>뇌졸중</span>}
              {hospital.capabilities.trauma && <span className="badge" style={{ background: '#fecaca', color: '#991b1b' }}>중증외상</span>}
              {hospital.capabilities.icu && <span className="badge" style={{ background: '#e0f2fe', color: '#075985' }}>ICU</span>}
              {hospital.capabilities.surgery && <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>응급수술</span>}
            </div>

            <div className="mt-3 flex gap-2">
              <button className="btn btn-primary" style={{ flex: 1, padding: '0.5rem' }}>
                <i className="ri-phone-fill"></i> SBAR 기반 수용 확인 전화
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray mt-4 text-center">
        “병상 정보는 실시간 데이터 기반으로 표시되지만 실제 현장 상황과 다를 수 있으므로, 이송 전 병원 확인이 필수입니다.”
      </p>
    </div>
  );
}
