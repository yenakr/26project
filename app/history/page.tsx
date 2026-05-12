"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchRecords();
    }
  }, [status]);

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/records');
      const data = await res.json().catch(() => ({ records: [] }));
      
      if (!res.ok) {
        throw new Error(data?.error || "기록을 불러오지 못했습니다.");
      }
      
      const safeRecords = Array.isArray(data) ? data : (Array.isArray(data.records) ? data.records : []);
      setRecords(safeRecords);
    } catch (error) {
      console.error("FETCH_ERROR", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="container text-center p-20">
      <i className="ri-loader-4-line ri-spin text-4xl text-blue-primary"></i>
      <p className="mt-4 text-gray">기록을 불러오는 중입니다...</p>
    </div>
  );

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => router.push('/')} className="btn" style={{ padding: '0.5rem', background: '#f1f5f9' }}>
          <i className="ri-arrow-left-line"></i>
        </button>
        <h1 className="section-title mb-0">기록 보관함</h1>
      </div>

      {records.length === 0 ? (
        <div className="card text-center p-12 text-gray">
          저장된 기록이 없습니다.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {records.map((record) => (
            <div key={record.id} className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-tag" style={{ background: 'var(--blue-light)', color: 'var(--blue-dark)' }}>
                      {new Date(record.createdAt).toLocaleString('ko-KR')}
                    </span>
                    <span className="text-sm font-bold">{record.patientAge || '환자 정보 없음'}</span>
                  </div>
                  <p className="text-sm text-gray">{record.situation || '상황 정보 없음'}</p>
                </div>
                <i className="ri-arrow-right-s-line text-gray"></i>
              </div>
              
              {record.logs && (
                <div className="mt-3 pt-3 border-top text-xs text-gray">
                  <i className="ri-history-line mr-1"></i> 총 {Array.isArray(record.logs) ? record.logs.length : 0}개의 행동 이력이 포함됨
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
