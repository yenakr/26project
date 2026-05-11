"use client";

import React, { useState } from 'react';
import PatientSummary from '@/components/PatientSummary';
import SBARForm from '@/components/SBARForm';
import HospitalDashboard from '@/components/HospitalDashboard';
import DiseaseTabs from '@/components/DiseaseTabs';

export default function Home() {
  const [isAssessed, setIsAssessed] = useState(false);

  return (
    <main className="container">
      <header className="header flex justify-between items-center">
        <div className="logo-area flex items-center gap-2">
          <div className="logo-icon">
            <i className="ri-hospital-fill"></i>
          </div>
          <div className="title">
            <h1>CODE BLUE</h1>
            <p>중증응급환자 이송 지원 프로토타입</p>
          </div>
        </div>
        <div className="text-right">
          <span className="badge neutral">119 구급대 전용</span>
          <p className="text-xs text-gray mt-1">현장 적용형 정책 제안 모델</p>
        </div>
      </header>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {!isAssessed ? (
          // 초기 화면: SBAR 폼만 노출
          <section style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <SBARForm onAssess={() => setIsAssessed(true)} />
          </section>
        ) : (
          // 평가 완료 화면: 전체 정보 노출
          <div className="fade-in">
            {/* Section 1: Assessment Result (Patient Summary) */}
            <section className="mb-6">
              <PatientSummary />
            </section>

            {/* Layout for Hospitals and Diseases */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
              <section>
                <HospitalDashboard />
              </section>
              <section>
                <DiseaseTabs />
              </section>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button 
                className="btn" 
                style={{ backgroundColor: '#e2e8f0', color: '#475569' }} 
                onClick={() => setIsAssessed(false)}
              >
                <i className="ri-refresh-line"></i> 초기화 및 새 환자 입력
              </button>
            </div>
          </div>
        )}

      </div>
      
      <footer style={{ marginTop: '3rem', textAlign: 'center', padding: '2rem 0', borderTop: '1px solid var(--border-color)' }}>
        <p className="font-bold text-lg mb-2 text-blue-dark">정책 제안 메시지</p>
        <p className="text-gray" style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
          "이송 지연 문제는 단순히 병상 수 부족만의 문제가 아니라, 병원 전 정보 전달의 불일치, 수용 가능 정보의 비표준화, 고위험 환자군별 사전 이송체계 부족이 함께 작용하는 문제이다. 따라서 <strong>병원 전 인계 표준화, 수용 정보 표준화, 고위험·저빈도 질환 이송 리스트 구축</strong>이 함께 필요하다."
        </p>
      </footer>
      
      <style dangerouslySetInnerHTML={{__html: `
        .fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </main>
  );
}
