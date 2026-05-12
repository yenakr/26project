"use client";

import React, { useState, useEffect } from 'react';
import SBARForm from '@/components/SBARForm';
import PatientSummary from '@/components/PatientSummary';
import HospitalDashboard from '@/components/HospitalDashboard';
import DiseaseTabs from '@/components/DiseaseTabs';
import { useSession, signOut } from "next-auth/react";
import Link from 'next/link';

// Imports for EMS Logic
import { TriageData, TriageResult, calculateSeverity } from '@/utils/triage';
import { RecommendedHospital, rankHospitals, mockHospitals } from '@/utils/hospitals';

export default function Home() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('new');
  
  // V3 States
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  
  const [assessmentData, setAssessmentData] = useState<TriageData | null>(null);
  const [extendedData, setExtendedData] = useState<any>(null); // holds scene, sample, customComplaint
  const [timelineLog, setTimelineLog] = useState<{time: string, msg: string}[]>([]);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [rankedHospitals, setRankedHospitals] = useState<RecommendedHospital[]>([]);

  // Live update handler from Form
  const handleLiveUpdate = (data: TriageData, extData: any, timeline: {time: string, msg: string}[]) => {
    setAssessmentData(data);
    setExtendedData(extData);
    setTimelineLog(timeline);
    
    // Live Triage & Hospital Ranking
    const triage = calculateSeverity(data);
    setTriageResult(triage);
    
    if (triage.level < 4 || data.complaints["심정지/무반응"]?.length > 0) {
      setRankedHospitals(rankHospitals(data, triage, mockHospitals));
    } else {
      setRankedHospitals([]);
    }
  };

  const handleAssessComplete = async () => {
    setIsCompleted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (session && extendedData) {
      try {
        await fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...extendedData, userId: session.user?.email })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const resetFlow = () => {
    if (confirm("정말 초기화하시겠습니까? 현재까지 입력된 데이터가 모두 삭제됩니다.")) {
      setAssessmentData(null);
      setExtendedData(null);
      setTimelineLog([]);
      setTriageResult(null);
      setRankedHospitals([]);
      setIsCompleted(false);
      setIsTimelineExpanded(false);
    }
  };

  return (
    <div className="container">
      <header className="header" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="flex justify-between items-center w-full">
          <div className="logo-area">
            <div className="logo-icon">
              <i className="ri-heart-pulse-fill"></i>
            </div>
            <div className="title">
              <h1 style={{ marginBottom: 0 }}>CODE BLUE</h1>
              <p>병원 전 응급환자 전문 의사결정 지원 시스템</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-2">
                <div className="text-sm hidden sm:block">
                  <span className="font-bold" style={{ color: 'var(--blue-dark)' }}>{session.user?.name || '구급대원'}</span>
                </div>
                <button onClick={() => signOut()} className="btn" style={{ minHeight: '36px', padding: '0 12px', fontSize: '13px', background: '#e2e8f0', color: '#475569' }}>로그아웃</button>
              </div>
            ) : (
              <Link href="/login" className="btn btn-primary" style={{ minHeight: '36px', padding: '0 12px', fontSize: '13px' }}>로그인</Link>
            )}
          </div>
        </div>
      </header>

      {/* TABS */}
      <div className="flex gap-2 mb-6" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button className={`step-item ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}>
          <i className="ri-add-line"></i> 새 환자 평가
        </button>
        <button className={`step-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <i className="ri-history-line"></i> 내 인계 기록
        </button>
      </div>

      {activeTab === 'new' && (
        <div className="dashboard-grid">
          {/* Left Column: Input Form (Hidden on Mobile when Completed) */}
          <div className="left-col" style={{ display: isCompleted ? 'none' : 'block' }}>
            <SBARForm 
              key={assessmentData === null ? 'reset' : 'active'} 
              onLiveUpdate={handleLiveUpdate}
              onComplete={handleAssessComplete}
            />
          </div>

          {/* Right Column: Live Dashboards */}
          <div className="right-col flex-col gap-4" style={{ width: isCompleted ? '100%' : 'auto', gridColumn: isCompleted ? '1 / -1' : 'auto' }}>
            
            {/* SBAR Output only visible when Completed */}
            {isCompleted && extendedData && (
              <PatientSummary data={assessmentData} extData={extendedData} triage={triageResult!} />
            )}

            {/* Live Triage Card */}
            {triageResult && (
              <div className="card" style={{ 
                borderLeft: `8px solid ${triageResult.level === 1 ? 'var(--red-primary)' : triageResult.level === 2 ? 'var(--amber-primary)' : triageResult.level === 3 ? 'var(--yellow-primary)' : 'var(--green-primary)'}`,
                padding: '1.25rem', marginBottom: '1rem' 
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <i className="ri-alarm-warning-fill" style={{ fontSize: '1.5rem', color: triageResult.level <= 2 ? 'var(--red-primary)' : 'var(--amber-primary)' }}></i>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>중증도 분류 결과</h3>
                </div>
                <div className="mb-2">
                  <span className="badge-tag" style={{ 
                    background: triageResult.level === 1 ? 'var(--red-bg)' : triageResult.level === 2 ? 'var(--amber-bg)' : 'var(--yellow-bg)', 
                    color: triageResult.level === 1 ? 'var(--red-dark)' : triageResult.level === 2 ? '#b45309' : '#854d0e',
                    fontSize: '1rem', padding: '0.4rem 0.8rem' 
                  }}>
                    {triageResult.label}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray mt-3 mb-1">분류 근거</p>
                <p className="text-sm" style={{ color: '#333' }}>{triageResult.reasons.join(" + ") || "입력된 위협 요소 없음"}</p>
                <p className="text-sm font-bold text-gray mt-3 mb-1">권고 사항</p>
                <p className="text-sm" style={{ color: 'var(--blue-dark)' }}>{triageResult.recommendation}</p>
              </div>
            )}

            {/* Live Hospital Dashboard */}
            {rankedHospitals.length > 0 && triageResult && (
              <HospitalDashboard hospitals={rankedHospitals} />
            )}

            {/* Live Timeline Log */}
            {timelineLog.length > 0 && (
              <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: isTimelineExpanded ? '500px' : '300px', marginBottom: '1rem', transition: 'height 0.3s' }}>
                <div style={{ padding: '1rem', background: '#f8fafc', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="font-bold" style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="ri-time-line text-blue-primary"></i> 현장 기록 로그
                  </h3>
                  <button className="badge-btn" style={{ minHeight: '32px', padding: '0 12px', fontSize: '0.8rem' }} onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}>
                    {isTimelineExpanded ? '접기' : '전체보기'}
                  </button>
                </div>
                <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, backgroundColor: '#fff' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {timelineLog.map((log, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="badge-tag" style={{ background: '#e2e8f0', color: '#475569', fontSize: '0.7rem' }}>{log.time}</span>
                        <span className="text-sm" style={{ color: '#333' }}>{log.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isCompleted && (
              <div className="text-center mt-4">
                <button className="btn" style={{ background: '#f1f5f9', color: '#475569', width: '100%' }} onClick={resetFlow}>
                  <i className="ri-refresh-line"></i> 처음부터 다시 평가하기
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card text-center" style={{ padding: '4rem 2rem' }}>
          <i className="ri-database-2-line" style={{ fontSize: '3rem', color: '#cbd5e1' }}></i>
          <h2 className="mt-4 font-bold text-gray">과거 기록 조회</h2>
          <p className="text-sm text-gray mt-2">이 기능은 실제 서버 배포 후 활성화됩니다.</p>
        </div>
      )}
    </div>
  );
}
