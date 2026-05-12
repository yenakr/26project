"use client";

import React from 'react';
import { RecommendedHospital } from '../utils/hospitals';

interface HospitalDashboardProps {
  hospitals: RecommendedHospital[];
}

export default function HospitalDashboard({ hospitals }: HospitalDashboardProps) {
  if (!hospitals) return null;

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1rem' }}>
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          <i className="ri-hospital-line text-blue-primary"></i> 맞춤형 이송 병원 후보
        </h2>
        <p className="text-sm text-gray mt-2">
          <i className="ri-information-line"></i> 현재 병원 목록은 프로토타입용 기본 데이터입니다. 실제 운영 시 공공데이터 API 연동을 통해 지역별 실시간 정보가 제공됩니다.
        </p>
      </div>

      {hospitals.length === 0 ? (
        <div style={{ padding: '2rem 1.5rem', textAlign: 'center', background: '#fffbeb' }}>
          <i className="ri-error-warning-fill" style={{ fontSize: '2.5rem', color: '#b45309' }}></i>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#92400e', marginTop: '0.5rem', marginBottom: '0.5rem' }}>지역 내 응급의료 자원 제한</h3>
          <p style={{ color: '#b45309', fontSize: '0.9rem', lineHeight: '1.5' }}>
            현재 선택된 위치 주변에 적합한 응급의료기관 후보가 제한적입니다.<br />
            가장 가까운 기관뿐 아니라 의료지도 및 전문 진료 가능 여부를 함께 확인해야 합니다.
          </p>
        </div>
      ) : (
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
                  후보 {idx + 1}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--blue-dark)' }}>{hospital.name}</h3>
                <span className="badge-tag" style={{ border: '1px solid var(--border-color)', background: '#fff', color: '#64748b' }}>{hospital.type}</span>
              </div>
            </div>

            <div className="mb-3">
              <span className="text-sm text-gray mr-2"><i className="ri-map-pin-line"></i> {hospital.sido} {hospital.sigungu}</span>
              <span className="text-sm text-gray"><i className="ri-car-line"></i> 거리/예상: <strong style={{ color: 'var(--blue-dark)' }}>{hospital.distanceKm}km / 약 {hospital.etaMinutes}분</strong></span>
            </div>

            <div className="mb-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--green-primary)' }}>추천 근거</p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#166534' }}>
                  {hospital.recommendationReason.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                <p className="text-sm font-bold mb-1" style={{ color: '#b45309' }}>전화 확인 필수 항목</p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#92400e' }}>
                  {hospital.confirmItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid-2 mb-3" style={{ gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '8px' }}>
                <p className="text-gray mb-1" style={{ fontSize: '0.8rem' }}><i className="ri-hotel-bed-line"></i> 실시간 병상 정보</p>
                <p style={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.85rem' }}>추후 연동 예정</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '8px' }}>
                <p className="text-gray mb-1" style={{ fontSize: '0.8rem' }}><i className="ri-shield-check-line"></i> 수용 가능 여부</p>
                <p style={{ fontWeight: 'bold', color: '#b45309', fontSize: '0.85rem' }}>병원 확인 필요</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
              {hospital.tags.map((tag, i) => (
                <span key={i} className="badge-tag" style={{ background: '#e2e8f0', color: '#475569' }}>{tag}</span>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button className="btn btn-primary" style={{ flex: 1, minHeight: '40px', padding: '0.5rem', fontSize: '0.9rem' }}>
                <i className="ri-phone-fill mr-1"></i> 연락 ({hospital.phone})
              </button>
              <button className="btn" style={{ flex: 1, minHeight: '40px', padding: '0.5rem', fontSize: '0.9rem', background: '#e2e8f0', color: '#475569' }}>
                <i className="ri-map-2-line mr-1"></i> 길찾기
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
