"use client";

import React, { useState } from 'react';

type Availability = '가능' | '제한' | '불가' | '대기' | '즉시 가능' | '일정 시간 후 가능' | '고장';

interface Hospital {
  id: number;
  name: string;
  distance: string;
  eta: string;
  er: Availability;
  icu: Availability;
  or: Availability;
  ctmri: Availability;
  specialists: string[];
  transfer: string;
  isRecommended: boolean;
}

const hospitals: Hospital[] = [
  {
    id: 1,
    name: "한양대병원",
    distance: "3.2km",
    eta: "9분",
    er: "가능",
    icu: "가능",
    or: "일정 시간 후 가능",
    ctmri: "가능",
    specialists: ["심장", "뇌졸중", "소아"],
    transfer: "자체 최종치료 가능",
    isRecommended: true
  },
  {
    id: 2,
    name: "성동중앙병원",
    distance: "4.1km",
    eta: "12분",
    er: "제한",
    icu: "대기",
    or: "불가",
    ctmri: "가능",
    specialists: ["내과"],
    transfer: "초기 안정화 후 전원 필요",
    isRecommended: false
  },
  {
    id: 3,
    name: "서울권역응급의료센터",
    distance: "6.8km",
    eta: "18분",
    er: "가능",
    icu: "가능",
    or: "즉시 가능",
    ctmri: "가능",
    specialists: ["심장", "뇌졸중", "외상", "산부인과", "소아"],
    transfer: "자체 최종치료 가능",
    isRecommended: true
  }
];

export default function HospitalDashboard() {
  const getBadgeClass = (status: Availability) => {
    if (status.includes('가능')) return 'badge success';
    if (status === '제한' || status === '대기') return 'badge warning';
    return 'badge danger';
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          <i className="ri-hospital-line text-blue-dark"></i> 주변 병원 수용 현황
        </h2>
        <span className="text-sm text-gray">현 위치 반경 10km 이내</span>
      </div>
      
      <div className="hospital-list flex flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {hospitals.map(h => (
          <div key={h.id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', transition: 'border-color 0.2s', cursor: 'pointer' }} className="hover-card">
            <div className="flex justify-between items-center mb-2 border-b" style={{ paddingBottom: '0.5rem' }}>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{h.name}</h3>
                {h.isRecommended && <span className="badge primary"><i className="ri-star-fill text-blue-primary"></i> 적합 병원</span>}
              </div>
              <div className="text-right">
                <p className="font-bold text-red-dark">{h.eta}</p>
                <p className="text-xs text-gray">{h.distance}</p>
              </div>
            </div>
            
            <div className="grid-2 mt-2" style={{ fontSize: '0.875rem' }}>
              <div>
                <p className="mb-1"><span className="text-gray" style={{ display: 'inline-block', width: '70px' }}>응급실:</span> <span className={getBadgeClass(h.er)}>{h.er}</span></p>
                <p className="mb-1"><span className="text-gray" style={{ display: 'inline-block', width: '70px' }}>ICU:</span> <span className={getBadgeClass(h.icu)}>{h.icu}</span></p>
                <p className="mb-1"><span className="text-gray" style={{ display: 'inline-block', width: '70px' }}>수술실:</span> <span className={getBadgeClass(h.or)}>{h.or}</span></p>
              </div>
              <div>
                <p className="mb-1"><span className="text-gray" style={{ display: 'inline-block', width: '70px' }}>CT/MRI:</span> <span className={getBadgeClass(h.ctmri)}>{h.ctmri}</span></p>
                <p className="mb-1">
                  <span className="text-gray" style={{ display: 'inline-block', width: '70px' }}>전문의:</span> 
                  <span className="font-bold">{h.specialists.join(', ')}</span>
                </p>
                <p className="mb-1 mt-2 text-xs">
                  <i className="ri-information-line text-blue-primary"></i> {h.transfer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hover-card:hover {
          border-color: var(--blue-primary) !important;
          box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.1);
        }
      `}} />
    </div>
  );
}
