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
    sbp: "120",
    dbp: "80",
    hr: "80",
    spo2: "98",
    nrs: "0",
    recommendation: "",
  });
  
  const [touchedVitals, setTouchedVitals] = useState({
    sbp: false,
    dbp: false,
    hr: false,
    spo2: false,
    nrs: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (!touchedVitals[e.target.name as keyof typeof touchedVitals]) {
      setTouchedVitals({ ...touchedVitals, [e.target.name]: true });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const appendToField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field] ? `${prev[field]}, ${value}` : value
    }));
  };

  const getColorStyle = (type: keyof typeof touchedVitals, value: string) => {
    if (!touchedVitals[type]) return { color: '#94a3b8' }; // Gray for untouched defaults
    
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
    return { color: '#333', fontWeight: 'bold' }; // normal but touched
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const mockPreKtas = "Pre-KTAS 1등급 (초응급)";
    
    // Convert sbp and dbp back to bp string. Use "-" if untouched.
    const finalSbp = touchedVitals.sbp ? formData.sbp : "";
    const finalDbp = touchedVitals.dbp ? formData.dbp : "";
    
    let bpString = "";
    if (finalSbp || finalDbp) {
      bpString = `${finalSbp || "-"}/${finalDbp || "-"}`;
    }

    const payload = {
      situation: formData.situation,
      background: formData.background,
      bp: bpString,
      hr: touchedVitals.hr ? formData.hr : "",
      spo2: touchedVitals.spo2 ? formData.spo2 : "",
      nrs: touchedVitals.nrs ? formData.nrs : "",
      recommendation: formData.recommendation,
      preKtas: mockPreKtas
    };

    try {
      if (session) {
        await fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, userId: session.user?.email })
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

  const handleReset = () => {
    setFormData({ situation: "", background: "", sbp: "120", dbp: "80", hr: "80", spo2: "98", nrs: "0", recommendation: "" });
    setTouchedVitals({ sbp: false, dbp: false, hr: false, spo2: false, nrs: false });
  };

  return (
    <div className="card" style={{ borderTop: '4px solid var(--blue-primary)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title" style={{ margin: 0, fontSize: '1.25rem' }}>
          <i className="ri-file-list-3-line text-blue-primary"></i> 환자 상태 평가 (SBAR)
        </h2>
        <button 
          className="badge" 
          style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '0.3rem 0.6rem' }}
          onClick={handleReset}
        >
          <i className="ri-eraser-line"></i> 초기화
        </button>
      </div>
      <p className="text-gray mb-6 text-sm">
        현장 상황에 맞게 항목을 선택하거나 입력하세요. 조작하지 않은 수치는 공란으로 처리됩니다.
      </p>

      <div className="sbar-inputs grid-2">
        {/* Situation */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label flex justify-between items-end">
            <span>S: Situation (상황)</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {["극심한 흉통 (심근경색 의심)", "편마비/구음장애 (뇌졸중 의심)", "의식 소실/심정지", "호흡 곤란", "다발성 외상"].map((txt, idx) => (
              <button
                key={idx}
                className="badge"
                style={{ background: '#e6f0fa', color: 'var(--blue-dark)', border: '1px solid #bfdbfe', cursor: 'pointer', fontSize: '0.8rem' }}
                onClick={() => appendToField('situation', txt)}
              >
                + {txt}
              </button>
            ))}
          </div>
          <input 
            type="text" 
            name="situation"
            className="form-input" 
            placeholder="주호소 및 의식상태 (예: 극심한 흉통, Alert)" 
            value={formData.situation}
            onChange={handleChange}
          />
        </div>

        {/* Background */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label flex justify-between items-end">
            <span>B: Background (배경)</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {["교통사고 (TA)", "추락 사고", "당뇨/고혈압", "심질환 기저력", "특이 기저질환 없음"].map((txt, idx) => (
              <button
                key={idx}
                className="badge"
                style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.8rem' }}
                onClick={() => appendToField('background', txt)}
              >
                + {txt}
              </button>
            ))}
          </div>
          <textarea 
            name="background"
            className="form-input" 
            rows={2} 
            placeholder="사고 유형, 기저질환, 투약력 등" 
            value={formData.background}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Assessment */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">A: Assessment (활력징후)</label>
          <div className="vitals-grid" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <label className="text-xs text-gray">수축기 (SBP)</label>
              <input 
                type="number" 
                name="sbp" 
                className="form-input mt-1" 
                value={formData.sbp} 
                onChange={handleVitalChange}
                step="5"
                style={getColorStyle('sbp', formData.sbp)}
              />
            </div>
            <div>
              <label className="text-xs text-gray">이완기 (DBP)</label>
              <input 
                type="number" 
                name="dbp" 
                className="form-input mt-1" 
                value={formData.dbp} 
                onChange={handleVitalChange}
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
                value={formData.hr} 
                onChange={handleVitalChange}
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
                max="100"
                value={formData.spo2} 
                onChange={handleVitalChange}
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
                min="0" max="10"
                value={formData.nrs} 
                onChange={handleVitalChange}
                step="1"
                style={getColorStyle('nrs', formData.nrs)}
              />
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">R: Recommendation (요청사항)</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {["PCI 가능 병원", "혈전용해술 가능 병원", "외상팀/수술실", "중환자실(ICU)", "응급실 소생실"].map((txt, idx) => (
              <button
                key={idx}
                className="badge"
                style={{ background: '#fff0f2', color: 'var(--red-dark)', border: '1px solid #ffe4e6', cursor: 'pointer', fontSize: '0.8rem' }}
                onClick={() => appendToField('recommendation', txt)}
              >
                + {txt}
              </button>
            ))}
          </div>
          <input 
            type="text" 
            name="recommendation"
            className="form-input" 
            placeholder="필요한 자원 및 특이사항 입력 (예: 즉각적인 수술, PCI)" 
            value={formData.recommendation}
            onChange={handleChange}
          />
        </div>

        <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '1rem' }}>
          <button 
            className="btn btn-primary" 
            style={{ fontSize: '1.125rem', padding: '1rem 2.5rem', borderRadius: '50px', width: '100%', boxShadow: '0 4px 6px -1px rgba(14, 74, 132, 0.3)' }}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><i className="ri-loader-4-line ri-spin" style={{ marginRight: '0.5rem' }}></i> 평가 중...</>
            ) : (
              <><i className="ri-heart-pulse-fill" style={{ marginRight: '0.5rem' }}></i> 환자 평가 완료 및 요약 생성</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
