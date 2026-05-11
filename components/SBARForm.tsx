"use client";

import React, { useState } from 'react';
import { useSession } from "next-auth/react";

interface SBARFormProps {
  onAssess?: (data: any) => void;
}

export default function SBARForm({ onAssess }: SBARFormProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    situation: "",
    background: "",
    sbp: "",
    dbp: "",
    hr: "",
    spo2: "",
    nrs: "",
    recommendation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const appendToField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field] ? `${prev[field]}, ${value}` : value
    }));
  };

  const getColorStyle = (type: string, value: string) => {
    if (!value) return {};
    const num = parseInt(value, 10);
    if (isNaN(num)) return {};

    switch (type) {
      case 'sbp':
        if (num < 90) return { color: 'var(--blue-dark)', fontWeight: 'bold' };
        if (num >= 140) return { color: 'var(--red-primary)', fontWeight: 'bold' };
        break;
      case 'dbp':
        if (num < 60) return { color: 'var(--blue-dark)', fontWeight: 'bold' };
        if (num >= 90) return { color: 'var(--red-primary)', fontWeight: 'bold' };
        break;
      case 'hr':
        if (num < 60) return { color: 'var(--blue-dark)', fontWeight: 'bold' };
        if (num > 100) return { color: 'var(--red-primary)', fontWeight: 'bold' };
        break;
      case 'spo2':
        if (num < 95) return { color: 'var(--blue-dark)', fontWeight: 'bold' };
        break;
      case 'nrs':
        if (num >= 7) return { color: 'var(--red-primary)', fontWeight: 'bold' };
        if (num >= 4) return { color: '#f59e0b', fontWeight: 'bold' }; // orange
        break;
    }
    return { color: '#333' }; // normal
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const mockPreKtas = "Pre-KTAS 1등급 (초응급)";
    
    // Convert sbp and dbp back to bp string
    let bpString = "";
    if (formData.sbp || formData.dbp) {
      bpString = `${formData.sbp || "?"}/${formData.dbp || "?"}`;
    }

    const payload = {
      situation: formData.situation,
      background: formData.background,
      bp: bpString,
      hr: formData.hr,
      spo2: formData.spo2,
      nrs: formData.nrs,
      recommendation: formData.recommendation,
      preKtas: mockPreKtas
    };

    try {
      if (session) {
        // Only save to DB if logged in
        await fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, userId: session.user?.email }) // Using email or whatever ID is provided
        });
      }
      
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
      <p className="text-gray mb-4 text-center">
        모든 항목은 선택 입력이며, 
        {session ? " 입력된 데이터는 중앙 DB에 안전하게 기록됩니다." : " (로그인 시 DB에 기록됩니다)"}
      </p>

      {/* Quick Select Buttons */}
      <div className="mb-6 grid-2" style={{ gap: '1rem' }}>
        <div>
          <p className="text-sm font-bold text-gray mb-2"><i className="ri-stethoscope-line text-blue-primary"></i> 흔한 의심 증상 (Situation)</p>
          <div className="flex flex-wrap gap-2">
            {["극심한 흉통 (심근경색 의심)", "편마비/구음장애 (뇌졸중 의심)", "의식 소실/심정지", "호흡 곤란", "다발성 외상"].map((txt, idx) => (
              <button
                key={idx}
                className="badge"
                style={{ background: '#f1f5f9', color: 'var(--blue-dark)', border: '1px solid #cbd5e1', cursor: 'pointer', padding: '0.4rem 0.8rem' }}
                onClick={() => appendToField('situation', txt)}
              >
                {txt}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-gray mb-2"><i className="ri-history-line text-blue-primary"></i> 주요 배경 정보 (Background)</p>
          <div className="flex flex-wrap gap-2">
            {["교통사고 (TA)", "추락 사고", "당뇨/고혈압", "심질환 기저력", "특이 기저질환 없음"].map((txt, idx) => (
              <button
                key={idx}
                className="badge"
                style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '0.4rem 0.8rem' }}
                onClick={() => appendToField('background', txt)}
              >
                {txt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-right mb-4">
        <button 
          className="badge" 
          style={{ background: '#fff', color: '#64748b', border: '1px dashed #cbd5e1', cursor: 'pointer', padding: '0.4rem 0.8rem' }}
          onClick={() => setFormData({ situation: "", background: "", sbp: "", dbp: "", hr: "", spo2: "", nrs: "", recommendation: "" })}
        >
          <i className="ri-eraser-line"></i> 전체 초기화
        </button>
      </div>

      <div className="sbar-inputs grid-2">
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">S: Situation (상황)</label>
          <input 
            type="text" 
            name="situation"
            className="form-input" 
            placeholder="주호소 및 의식상태 (예: 극심한 흉통, Alert)" 
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
            placeholder="사고 유형, 기저질환, 투약력 등" 
            value={formData.background}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">A: Assessment (활력징후 - 숫자 조절)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="text-xs text-gray">수축기 혈압 (SBP)</label>
              <input 
                type="number" 
                name="sbp" 
                className="form-input mt-1" 
                placeholder="mmHg" 
                value={formData.sbp} 
                onChange={handleChange}
                step="5"
                style={getColorStyle('sbp', formData.sbp)}
              />
            </div>
            <div>
              <label className="text-xs text-gray">이완기 혈압 (DBP)</label>
              <input 
                type="number" 
                name="dbp" 
                className="form-input mt-1" 
                placeholder="mmHg" 
                value={formData.dbp} 
                onChange={handleChange}
                step="5"
                style={getColorStyle('dbp', formData.dbp)}
              />
            </div>
            <div>
              <label className="text-xs text-gray">맥박 (HR)</label>
              <input 
                type="number" 
                name="hr" 
                className="form-input mt-1" 
                placeholder="회/분" 
                value={formData.hr} 
                onChange={handleChange}
                step="5"
                style={getColorStyle('hr', formData.hr)}
              />
            </div>
            <div>
              <label className="text-xs text-gray">산소포화도 (SpO2 %)</label>
              <input 
                type="number" 
                name="spo2" 
                className="form-input mt-1" 
                placeholder="%" 
                max="100"
                value={formData.spo2} 
                onChange={handleChange}
                step="1"
                style={getColorStyle('spo2', formData.spo2)}
              />
            </div>
            <div>
              <label className="text-xs text-gray">통증점수 (NRS)</label>
              <input 
                type="number" 
                name="nrs" 
                className="form-input mt-1" 
                placeholder="0-10" 
                min="0" max="10"
                value={formData.nrs} 
                onChange={handleChange}
                step="1"
                style={getColorStyle('nrs', formData.nrs)}
              />
            </div>
          </div>
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">R: Recommendation (요청)</label>
          <input 
            type="text" 
            name="recommendation"
            className="form-input" 
            placeholder="필요한 자원 및 특이사항 입력 (예: 즉각적인 수술, PCI)" 
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
              <><i className="ri-loader-4-line ri-spin" style={{ marginRight: '0.5rem' }}></i> 평가 중...</>
            ) : (
              <><i className="ri-heart-pulse-fill" style={{ marginRight: '0.5rem' }}></i> 환자 상태 평가 및 인계 요약 생성</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
