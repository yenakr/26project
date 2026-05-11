"use client";

import React, { useState } from 'react';
import PatientSummary from '@/components/PatientSummary';
import SBARForm from '@/components/SBARForm';
import HospitalDashboard from '@/components/HospitalDashboard';
import DiseaseTabs from '@/components/DiseaseTabs';
import RecordsHistory from '@/components/RecordsHistory';
import { useSession, signOut } from "next-auth/react";
import Link from 'next/link';

export default function Home() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('new'); // 'new', 'records', 'guidelines'
  const [assessmentData, setAssessmentData] = useState(null);

  const handleAssess = (data: any) => {
    setAssessmentData(data);
  };

  return (
    <main className="container">
      <header className="header flex justify-between items-center flex-wrap gap-4">
        <div className="logo-area flex items-center gap-2">
          <div className="logo-icon" style={{ backgroundColor: 'var(--blue-primary)' }}>
            <i className="ri-hospital-fill"></i>
          </div>
          <div className="title">
            <h1 style={{ color: 'var(--blue-primary)' }}>CODE BLUE</h1>
            <p>중증응급환자 이송 지원 시스템</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {session ? (
            <div className="text-right text-sm">
              <p className="font-bold">{session.user?.name} 구급대원</p>
              <button onClick={() => signOut()} className="text-red-primary text-xs underline">로그아웃</button>
            </div>
          ) : (
            <Link href="/login" className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
              로그인
            </Link>
          )}
          <div className="text-right">
            <span className="badge primary">119 구급대 전용</span>
          </div>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <div className="flex mb-6" style={{ borderBottom: '2px solid var(--border-color)', overflowX: 'auto' }}>
        <button 
          className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => { setActiveTab('new'); setAssessmentData(null); }}
        >
          <i className="ri-user-add-line"></i> 새 환자 평가
        </button>
        <button 
          className={`tab-btn ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          <i className="ri-history-line"></i> 내 인계 기록
        </button>
        <button 
          className={`tab-btn ${activeTab === 'guidelines' ? 'active' : ''}`}
          onClick={() => setActiveTab('guidelines')}
        >
          <i className="ri-book-read-line"></i> 질환별 이송 지침
        </button>
      </div>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {activeTab === 'new' && (
          !assessmentData ? (
            // 초기 화면: SBAR 폼만 노출
            <section className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              <SBARForm onAssess={handleAssess} />
            </section>
          ) : (
            // 평가 완료 화면: 전체 정보 노출
            <div className="fade-in">
              <section className="mb-6">
                <PatientSummary data={assessmentData} />
              </section>

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
                  onClick={() => setAssessmentData(null)}
                >
                  <i className="ri-refresh-line"></i> 초기화 및 새 환자 입력
                </button>
              </div>
            </div>
          )
        )}

        {activeTab === 'records' && (
          <section className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <RecordsHistory />
          </section>
        )}

        {activeTab === 'guidelines' && (
          <section className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <DiseaseTabs />
          </section>
        )}

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .tab-btn {
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 1rem;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .tab-btn:hover {
          color: var(--blue-primary);
        }
        .tab-btn.active {
          color: var(--blue-primary);
          border-bottom-color: var(--blue-primary);
        }
      `}} />
    </main>
  );
}
