"use client";

import React, { useState } from 'react';

interface SBARFormProps {
  onAssess?: (data: any) => void;
}

export default function SBARForm({ onAssess }: SBARFormProps) {
  const [formData, setFormData] = useState({
    situation: "",
    background: "",
    bp: "",
    hr: "",
    spo2: "",
    nrs: "",
    recommendation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const mockPreKtas = "Pre-KTAS 1등급 (초응급)";
    
    const payload = {
      ...formData,
      preKtas: mockPreKtas
    };

    try {
      // API 전송 (DB 저장)
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (onAssess) {
        onAssess(payload);
      }
    } catch (err) {
      console.error(err);
      alert('데이터 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ borderTop: '4px solid var(--blue-primary)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
      <h2 className="section-title text-center" style={{ justifyContent: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
        <i className="ri-file-list-3-line text-blue-primary"></i> 병원 전 환자 상태 평가 (SBAR)
      </h2>
      <p className="text-gray mb-4 text-center">모든 항목은 선택 입력이며, 입력된 데이터는 중앙 DB에 안전하게 기록됩니다.</p>

      {/* Quick Select Buttons */}
      <div className="mb-6">
        <p className="text-sm font-bold text-gray mb-2"><i className="ri-flashlight-fill text-blue-primary"></i> 빠른 입력 템플릿 (흔한 중증응급)</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "심근경색 (STEMI)", data: { situation: "흉통, 식은땀 (Alert)", background: "고혈압", bp: "90/60", hr: "110", spo2: "94", nrs: "8", recommendation: "PCI 가능 병원, 심장내과 대기" } },
            { label: "중증 뇌졸중 의심", data: { situation: "우측 편마비, 구음장애 (Alert)", background: "당뇨", bp: "180/100", hr: "85", spo2: "97", nrs: "-", recommendation: "CT/MRI, 혈전용해/제거술 가능 병원" } },
            { label: "중증 다발성 외상", data: { situation: "교통사고, 다발성 골절 (Verbal)", background: "특이사항 없음", bp: "80/50", hr: "130", spo2: "90", nrs: "10", recommendation: "외상팀, 즉시 수술실, 혈액 보유 병원" } },
            { label: "심정지 (CPR 중)", data: { situation: "심정지 (Unresponsive)", background: "미상", bp: "-", hr: "0", spo2: "-", nrs: "-", recommendation: "응급실 소생실, 즉각적인 전문소생술" } }
          ].map((template, idx) => (
            <button
              key={idx}
              className="badge"
              style={{ background: '#f1f5f9', color: 'var(--blue-dark)', border: '1px solid #cbd5e1', cursor: 'pointer', padding: '0.4rem 0.8rem' }}
              onClick={() => setFormData(template.data)}
            >
              {template.label}
            </button>
          ))}
          <button 
            className="badge" 
            style={{ background: '#fff', color: '#64748b', border: '1px dashed #cbd5e1', cursor: 'pointer', padding: '0.4rem 0.8rem' }}
            onClick={() => setFormData({ situation: "", background: "", bp: "", hr: "", spo2: "", nrs: "", recommendation: "" })}
          >
            초기화
          </button>
        </div>
      </div>

      <div className="sbar-inputs grid-2">
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">S: Situation (상황)</label>
          <input 
            type="text" 
            name="situation"
            className="form-input" 
            placeholder="주호소 및 의식상태 (예: 흉통, Alert)" 
            value={formData.situation}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">B: Background (배경)</label>
          <textarea 
            name="background"
            className="form-input" 
            rows={2} 
            placeholder="나이, 기저질환, 투약력, 알레르기" 
            value={formData.background}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">A: Assessment (평가 - 선택입력)</label>
          <div className="grid-2">
            <div>
              <label className="text-xs text-gray">혈압 (BP)</label>
              <input type="text" name="bp" className="form-input mt-1" placeholder="예: 90/60" value={formData.bp} onChange={handleChange} />
            </div>
            <div>
              <label className="text-xs text-gray">맥박 (HR)</label>
              <input type="text" name="hr" className="form-input mt-1" placeholder="예: 118" value={formData.hr} onChange={handleChange} />
            </div>
            <div>
              <label className="text-xs text-gray">산소포화도 (SpO2 %)</label>
              <input type="text" name="spo2" className="form-input mt-1" placeholder="예: 92" value={formData.spo2} onChange={handleChange} />
            </div>
            <div>
              <label className="text-xs text-gray">통증점수 (NRS)</label>
              <input type="text" name="nrs" className="form-input mt-1" placeholder="예: 8" value={formData.nrs} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">R: Recommendation (요청)</label>
          <input 
            type="text" 
            name="recommendation"
            className="form-input" 
            placeholder="필요한 자원 및 특이사항 입력 (예: PCI 가능 병원)" 
            value={formData.recommendation}
            onChange={handleChange}
          />
        </div>

        <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '1.5rem' }}>
          <button 
            className="btn btn-primary" 
            style={{ fontSize: '1.125rem', padding: '1rem 2.5rem', borderRadius: '50px', boxShadow: '0 4px 6px -1px rgba(14, 74, 132, 0.3)' }}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><i className="ri-loader-4-line ri-spin" style={{ marginRight: '0.5rem' }}></i> 기록 저장 및 평가 중...</>
            ) : (
              <><i className="ri-heart-pulse-fill" style={{ marginRight: '0.5rem' }}></i> 환자 상태 평가 및 인계 요약 생성</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
