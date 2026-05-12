"use client";

import React from 'react';
import { RecommendedHospital } from '../utils/hospitals';

interface HospitalDashboardProps {
  hospitals: RecommendedHospital[];
}

export default function HospitalDashboard({ hospitals }: HospitalDashboardProps) {
  if (!hospitals || hospitals.length === 0) return null;

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1rem' }}>
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          <i className="ri-hospital-line text-blue-primary"></i> 맞춤형 병원 추천
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {hospitals.map((hospital, idx) => (
          <div key={hospital.id} style={{ 
            padding: '1.25rem',
            borderBottom: idx < hospitals.length - 1 ? '1px solid var(--border-color)' : 'none',
            background: idx === 0 ? 'var(--blue-light)' : '#fff' 
          }}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge-tag" style={{ 
                  background: idx === 0 ? 'var(--blue-primary)' : '#94a3b8', 
                  color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px'
                }}>
                  {idx + 1}순위
                </span>
                <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--blue-dark)' }}>{hospital.name}</h3>
                <span className="badge-tag" style={{ border: '1px solid var(--border-color)', background: '#fff', color: '#64748b' }}>{hospital.type}</span>
              </div>
            </div>

            <div className="mb-3">
              <span className="badge-tag" style={{ background: 'var(--green-bg)', color: 'var(--green-primary)', border: '1px solid #a7f3d0' }}>
                <i className="ri-thumb-up-line mr-1"></i> 추천 근거: {hospital.recommendationReason}
              </span>
            </div>

            <div className="grid-2 mb-3" style={{ gap: '0.5rem', fontSize: '0.875rem' }}>
              <div>
                <p className="text-gray mb-1"><i className="ri-map-pin-line"></i> 거리/ETA: <strong style={{ color: 'var(--blue-dark)' }}>{hospital.distanceKm}km / 약 {hospital.etaMinutes}분</strong></p>
                <p className="text-gray"><i className="ri-phone-line"></i> 연락처: {hospital.phone}</p>
              </div>
              <div>
                <p className="text-gray mb-1">
                  <i className="ri-hotel-bed-line"></i> 잔여 응급병상: <strong style={{ color: hospital.beds.emergency > 0 ? 'var(--green-primary)' : 'var(--red-primary)', fontSize: '1.1rem' }}>{hospital.beds.emergency}</strong>석
                </p>
                <p className="text-gray" style={{ fontSize: '0.75rem' }}>최근 업데이트: {hospital.lastUpdated}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
              {hospital.capabilities.cardiac && <span className="badge-tag" style={{ background: 'var(--yellow-bg)', color: '#854d0e' }}>심혈관</span>}
              {hospital.capabilities.stroke && <span className="badge-tag" style={{ background: '#f3e8ff', color: '#6b21a8' }}>뇌졸중</span>}
              {hospital.capabilities.trauma && <span className="badge-tag" style={{ background: 'var(--red-bg)', color: 'var(--red-dark)' }}>중증외상</span>}
              {hospital.capabilities.icu && <span className="badge-tag" style={{ background: '#e0f2fe', color: '#0369a1' }}>ICU</span>}
              {hospital.capabilities.surgery && <span className="badge-tag" style={{ background: '#f1f5f9', color: '#475569' }}>응급수술</span>}
            </div>

            <div className="mt-4 flex gap-2">
              <button className="btn btn-primary" style={{ flex: 1, minHeight: '40px', padding: '0.5rem', fontSize: '0.9rem' }}>
                <i className="ri-phone-fill mr-1"></i> 연락
              </button>
              <button className="btn" style={{ flex: 1, minHeight: '40px', padding: '0.5rem', fontSize: '0.9rem', background: '#e2e8f0', color: '#475569' }}>
                <i className="ri-map-2-line mr-1"></i> 길찾기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
