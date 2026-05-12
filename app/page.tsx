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
  const [region, setRegion] = useState({ sido: "서울특별시", sigungu: "" });

  // Live update handler from Form
  const [dispatchTimelineAction, setDispatchTimelineAction] = useState<any>(null);

  const handleLiveUpdate = (data: TriageData, extData: any, timeline: any[], dispatchFn: any) => {
    setAssessmentData(data);
    setExtendedData(extData);
    setTimelineLog(timeline);
    setDispatchTimelineAction(() => dispatchFn);
    
    // Live Triage & Hospital Ranking
    const triage = calculateSeverity(data);
    setTriageResult(triage);
    
    if (triage.level < 4 || (data.complaints["심정지/무반응"]?.length ?? 0) > 0) {
      // Filter by Region
      const regionHospitals = mockHospitals.filter(h => h.sido === extData.region.sido);
      setRankedHospitals(rankHospitals(data, triage, regionHospitals));
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
              <p>전국 확장형 프로토타입 · 실시간 병상 미연동 · 이송 전 병원 확인 필요</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">
              <i className="ri-map-pin-2-fill text-blue-primary"></i>
              <div className="flex items-center gap-1">
                <select 
                  className="text-sm font-bold border-none bg-transparent p-0 focus:ring-0 cursor-pointer"
                  value={region.sido}
                  onChange={(e) => setRegion(p => ({ ...p, sido: e.target.value }))}
                >
                  <option value="서울특별시">서울특별시</option>
                  <option value="경기도">경기도</option>
                  <option value="인천광역시">인천광역시</option>
                  <option value="강원특별자치도">강원특별자치도</option>
                  <option value="충청북도">충청북도</option>
                </select>
                <input 
                  type="text"
                  placeholder="시·군·구"
                  className="text-sm border-none bg-transparent p-0 focus:ring-0 w-20"
                  value={region.sigungu}
                  onChange={(e) => setRegion(p => ({ ...p, sigungu: e.target.value }))}
                />
              </div>
            </div>
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
        <div className="dashboard-layout">
          {/* Left Column: Input Form (Hidden on Mobile when Completed) */}
          <div className="left-col" style={{ display: isCompleted ? 'none' : 'block' }}>
            <SBARForm 
              key={assessmentData === null ? 'reset' : 'active'} 
              region={region}
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
            {triageResult && (triageResult.level < 4 || (assessmentData?.complaints["심정지/무반응"]?.length ?? 0) > 0) && (
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
                  <div className="timeline-list">
                    {timelineLog.map((log: any) => {
                      const isCancelled = log.status === 'cancelled' || log.status === 'replaced';
                      return (
                        <div key={log.id} className={`timeline-item ${isCancelled ? 'cancelled' : ''}`}>
                          <span className="time-badge">{log.displayTime}</span>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <span className="timeline-text">
                                {log.label}: {log.value}
                              </span>
                              <div className="timeline-actions">
                                {!isCancelled && log.source === 'user' && dispatchTimelineAction && (
                                  <button className="timeline-btn" onClick={() => dispatchTimelineAction('cancel', log.id)}>취소</button>
                                )}
                                {isCancelled && log.source === 'user' && dispatchTimelineAction && (
                                  <button className="timeline-btn restore" onClick={() => dispatchTimelineAction('restore', log.id)}>복원</button>
                                )}
                              </div>
                            </div>
                            {isCancelled && log.cancelledAt && (
                              <span className="cancelled-badge mt-1">취소됨 {log.cancelledAt.substring(11, 19)}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
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

      {/* Footer Disclaimer */}
      <footer style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderTop: '1px solid var(--border-color)', borderRadius: '12px' }}>
        <p className="text-sm text-center" style={{ color: '#64748b', lineHeight: '1.5' }}>
          <i className="ri-error-warning-line"></i> 본 프로토타입의 병원 추천은 응급의료기관 기본정보와 위치 기반 후보 제시에 한정됩니다. <br className="hidden sm:block"/>
          실시간 병상 및 수용 가능 여부는 제공하지 않으며, 실제 이송 전 병원 확인이 필요합니다.
        </p>
      </footer>
    </div>
  );
}
