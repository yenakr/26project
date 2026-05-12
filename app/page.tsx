"use client";

import React, { useState } from 'react';
import SBARForm from '@/components/SBARForm';
import PatientSummary from '@/components/PatientSummary';
import HospitalDashboard from '@/components/HospitalDashboard';
import DiseaseTabs from '@/components/DiseaseTabs';
import { useSession, signOut } from "next-auth/react";
import Link from 'next/link';

// Imports for new EMS Logic
import { TriageData, TriageResult, calculateSeverity } from '@/utils/triage';
import { RecommendedHospital, rankHospitals, mockHospitals } from '@/utils/hospitals';

export default function Home() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('new');
  
  // States for V2 Flow
  const [assessmentData, setAssessmentData] = useState<TriageData | null>(null);
  const [timelineLog, setTimelineLog] = useState<{time: string, msg: string}[]>([]);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [rankedHospitals, setRankedHospitals] = useState<RecommendedHospital[]>([]);

  const handleAssess = (data: TriageData, timeline: {time: string, msg: string}[]) => {
    // 1. Calculate Severity
    const triage = calculateSeverity(data);
    
    // 2. Rank Hospitals
    const hospitals = rankHospitals(data, triage, mockHospitals);

    // 3. Update States
    setAssessmentData(data);
    setTimelineLog(timeline);
    setTriageResult(triage);
    setRankedHospitals(hospitals);
  };

  const resetFlow = () => {
    setAssessmentData(null);
    setTimelineLog([]);
    setTriageResult(null);
    setRankedHospitals([]);
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo-area">
          <div className="logo-icon">
            <i className="ri-heart-pulse-fill"></i>
          </div>
          <div className="title">
            <h1>CODE BLUE</h1>
            <p>병원 전 응급환자 인계 및 수용 정보 프로토타입</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <div className="text-sm">
                <span className="font-bold text-blue-dark">{session.user?.name || '구급대원'}</span> 님
                <span className="text-gray ml-2">({session.user?.email})</span>
              </div>
              <button 
                onClick={() => signOut()} 
                className="btn" 
                style={{ background: '#f1f5f9', color: '#475569', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              로그인 / 등록
            </Link>
          )}
        </div>
      </header>

      <div className="flex gap-2 mb-6" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <button 
          className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
          style={{ 
            padding: '0.5rem 1.5rem', 
            background: activeTab === 'new' ? 'var(--blue-primary)' : 'transparent', 
            color: activeTab === 'new' ? 'white' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '20px',
            fontWeight: activeTab === 'new' ? 'bold' : 'normal',
            cursor: 'pointer'
          }}
          onClick={() => { setActiveTab('new'); resetFlow(); }}
        >
          <i className="ri-add-line"></i> 새 환자 평가
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          style={{ 
            padding: '0.5rem 1.5rem', 
            background: activeTab === 'history' ? 'var(--blue-primary)' : 'transparent', 
            color: activeTab === 'history' ? 'white' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '20px',
            fontWeight: activeTab === 'history' ? 'bold' : 'normal',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('history')}
        >
          <i className="ri-history-line"></i> 내 인계 기록
        </button>
        <button 
          className={`tab-btn ${activeTab === 'guidelines' ? 'active' : ''}`}
          style={{ 
            padding: '0.5rem 1.5rem', 
            background: activeTab === 'guidelines' ? 'var(--blue-primary)' : 'transparent', 
            color: activeTab === 'guidelines' ? 'white' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '20px',
            fontWeight: activeTab === 'guidelines' ? 'bold' : 'normal',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('guidelines')}
        >
          <i className="ri-book-read-line"></i> 질환별 이송 지침
        </button>
      </div>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {activeTab === 'new' && (
          !assessmentData ? (
            <section className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              <SBARForm onAssess={handleAssess} />
            </section>
          ) : (
            <div className="fade-in">
              <section className="mb-6">
                <PatientSummary data={assessmentData} timeline={timelineLog} triage={triageResult!} />
              </section>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                <section>
                  <HospitalDashboard hospitals={rankedHospitals} />
                </section>
                <section>
                  <DiseaseTabs />
                </section>
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button 
                  className="btn" 
                  style={{ backgroundColor: '#e2e8f0', color: '#475569' }} 
                  onClick={resetFlow}
                >
                  <i className="ri-arrow-go-back-line"></i> 새로운 환자 평가하기
                </button>
              </div>
            </div>
          )
        )}

        {activeTab === 'history' && (
          <section className="fade-in card">
            <h2 className="section-title"><i className="ri-history-line text-blue-primary"></i> 내 인계 기록</h2>
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray mb-2">과거 평가 기록을 조회하는 기능은 DB 연결 후 제공됩니다.</p>
              <button className="btn btn-primary btn-sm"><i className="ri-refresh-line"></i> 기록 동기화</button>
            </div>
          </section>
        )}

        {activeTab === 'guidelines' && (
          <section className="fade-in">
            <DiseaseTabs />
          </section>
        )}
      </div>
    </div>
  );
}
