"use client";

import React, { useEffect, useState } from 'react';

interface Record {
  id: string;
  createdAt: string;
  situation: string;
  background: string;
  bp: string;
  hr: string;
  spo2: string;
  nrs: string;
  recommendation: string;
  preKtas: string;
}

export default function RecordsHistory() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/records')
      .then(res => res.json())
      .then(data => {
        setRecords(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center text-gray mt-4">데이터를 불러오는 중입니다...</p>;
  if (records.length === 0) return <p className="text-center text-gray mt-4">아직 등록된 환자 이송 기록이 없습니다.</p>;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="section-title"><i className="ri-history-line text-blue-primary"></i> 나의 인계 기록 조회</h2>
      {records.map(record => (
        <div key={record.id} className="card p-4 hover-card" style={{ borderLeft: '4px solid var(--blue-primary)', cursor: 'pointer' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-lg text-blue-dark">{new Date(record.createdAt).toLocaleString()}</span>
            {record.preKtas && <span className="badge danger">{record.preKtas}</span>}
          </div>
          <div className="grid-2 text-sm">
            <div>
              <p><strong>주호소:</strong> {record.situation || '미입력'}</p>
              <p><strong>요청사항:</strong> {record.recommendation || '미입력'}</p>
            </div>
            <div>
              <p><strong>활력징후:</strong> BP {record.bp || '-'}, HR {record.hr || '-'}, SpO2 {record.spo2 || '-'}%, NRS {record.nrs || '-'}</p>
            </div>
          </div>
        </div>
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        .hover-card:hover {
          border-color: var(--blue-dark) !important;
          box-shadow: 0 4px 6px -1px rgba(14, 74, 132, 0.15);
        }
      `}} />
    </div>
  );
}
