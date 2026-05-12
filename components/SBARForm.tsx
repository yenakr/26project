"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { TriageData } from '../utils/triage';

interface SBARFormProps {
  onAssess?: (data: TriageData, timeline: {time: string, msg: string}[]) => void;
}

const CHIEF_COMPLAINT_OPTIONS: Record<string, string[]> = {
  "심정지/무반응": ["반응 없음", "정상 호흡 없음/gasping", "맥박 없음", "CPR 진행 중", "AED 적용", "AED shock 시행 횟수 입력", "목격자 있음", "발생 시각 명확함", "발견 시각만 확인됨", "ROSC 있음", "저혈당 의심", "외상 후 의식소실"],
  "흉통/흉부불편감": ["발생 시각 입력", "지속시간 20분 이상", "압박감/쥐어짜는 통증", "어깨/팔/턱/등 방사통", "식은땀", "오심/구토", "호흡곤란 동반", "실신/어지러움", "혈압저하/쇼크 소견", "12유도 ECG 시행", "ST elevation 의심", "NTG 복용/투여 후 호전 없음"],
  "신경학적 이상": ["마지막 정상 확인 시각, LKW 입력", "안면마비", "한쪽 팔/다리 힘 빠짐", "말 어눌함/실어증", "시야장애", "어지럼/보행장애", "의식저하", "심한 두통", "경련 동반", "항응고제 복용", "혈당 측정 완료"],
  "호흡곤란": ["SpO₂ 저하", "청색증", "보조근 사용", "한 문장 말하기 어려움", "쌕쌕거림/wheezing", "협착음/stridor", "똑바로 눕지 못함/기좌호흡", "흉통 동반", "발열/기침 동반", "알레르기 노출 의심", "천식/COPD/심부전 과거력", "산소 투여 중"],
  "외상": ["사고기전: 교통사고", "사고기전: 추락", "사고기전: 압궤", "사고기전: 관통상", "사고기전: 폭행", "대량출혈", "의식저하", "경추/척추 손상 의심", "흉부 손상 의심", "복부 통증/팽만", "골반 손상 의심", "개방성 골절", "사지 변형", "항응고제 복용", "임신 가능성"],
  "복통/출혈": ["심한 복통", "복부팽만", "복막자극 의심", "토혈", "혈변/흑색변", "반복 구토", "실신/어지러움", "혈압저하", "임신 가능성", "항응고제 복용", "간질환/위궤양 과거력"],
  "알레르기/중독": ["두드러기/가려움", "입술/혀/목 부종", "호흡곤란", "혈압저하", "원인 음식/약물/벌쏘임", "약물 과다복용 의심", "음주/약물 사용", "의식저하", "구토", "자해 가능성"],
  "소아/영아 응급": ["고열", "경련", "호흡곤란", "지속적인 울음/보챔", "수유 거부", "의식저하", "이물질 삼킴 의심", "외상 의심"]
};

export default function SBARForm({ onAssess }: SBARFormProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openComplaintCategory, setOpenComplaintCategory] = useState<string | null>(null);

  // Timeline Logger
  const [timeline, setTimeline] = useState<{time: string, msg: string}[]>([]);
  const logEvent = (msg: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setTimeline(prev => [...prev, { time: timeStr, msg }]);
  };

  useEffect(() => {
    logEvent("현장 도착");
  }, []);

  // Form States
  const [scene, setScene] = useState({ safety: "", risks: [] as string[], patients: "", support: [] as string[], access: "" });
  const [primary, setPrimary] = useState({ consciousness: "", breathing: "", circulation: "", actions: [] as string[] });
  const [complaints, setComplaints] = useState<Record<string, string[]>>(
    Object.keys(CHIEF_COMPLAINT_OPTIONS).reduce((acc, key) => ({ ...acc, [key]: [] }), {})
  );
  const [customComplaint, setCustomComplaint] = useState("");
  const [sample, setSample] = useState({ S: "", A: "", M: "", P: "", L: "", E: "" });
  const [vitals, setVitals] = useState({ sbp: "120", dbp: "80", hr: "80", spo2: "98", nrs: "0", bt: "", bst: "", rr: "20" });
  const [touchedVitals, setTouchedVitals] = useState({ sbp: false, dbp: false, hr: false, spo2: false, nrs: false, rr: false });

  // State Updaters with Logging
  const setSceneField = (field: string, val: string, logPrefix: string) => {
    setScene(p => ({ ...p, [field]: val }));
    logEvent(`${logPrefix}: ${val}`);
  };

  const toggleArrayItem = (setter: any, field: string, value: string, logPrefix: string) => {
    setter((prev: any) => {
      const arr = prev[field] as string[];
      const isAdding = !arr.includes(value);
      if (isAdding) logEvent(`${logPrefix}: ${value} 추가`);
      return { ...prev, [field]: isAdding ? [...arr, value] : arr.filter(v => v !== value) };
    });
  };

  const setPrimaryField = (field: string, val: string, logPrefix: string) => {
    setPrimary(p => ({ ...p, [field]: val }));
    logEvent(`${logPrefix}: ${val}`);
  };

  const toggleComplaint = (category: string, value: string) => {
    setComplaints(prev => {
      const arr = prev[category];
      const isAdding = !arr.includes(value);
      if (isAdding) logEvent(`세부증상: ${value}`);
      return { ...prev, [category]: isAdding ? [...arr, value] : arr.filter(v => v !== value) };
    });
  };

  const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVitals({ ...vitals, [name]: value });
    if (name in touchedVitals && !touchedVitals[name as keyof typeof touchedVitals]) {
      setTouchedVitals({ ...touchedVitals, [name]: true });
    }
    // Only log vitals on blur to prevent spam, or we just log that it was touched
  };

  const handleVitalBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    logEvent(`활력징후 측정: ${e.target.name.toUpperCase()} ${e.target.value}`);
  };

  const getColorStyle = (type: keyof typeof touchedVitals, value: string) => {
    if (!touchedVitals[type]) return { color: '#94a3b8' }; 
    const num = parseInt(value, 10);
    if (isNaN(num)) return {};
    switch (type) {
      case 'sbp': if (num < 90) return { color: 'var(--red-primary)', fontWeight: 'bold' }; if (num >= 140) return { color: 'var(--status-limited)', fontWeight: 'bold' }; break;
      case 'dbp': if (num < 60) return { color: 'var(--red-primary)', fontWeight: 'bold' }; if (num >= 90) return { color: 'var(--status-limited)', fontWeight: 'bold' }; break;
      case 'hr': if (num < 50 || num >= 130) return { color: 'var(--red-primary)', fontWeight: 'bold' }; break;
      case 'spo2': if (num < 90) return { color: 'var(--red-primary)', fontWeight: 'bold' }; if (num < 95) return { color: 'var(--status-limited)', fontWeight: 'bold' }; break;
      case 'rr': if (num < 10 || num > 29) return { color: 'var(--red-primary)', fontWeight: 'bold' }; break;
      case 'nrs': if (num >= 7) return { color: 'var(--red-primary)', fontWeight: 'bold' }; if (num >= 4) return { color: 'var(--status-limited)', fontWeight: 'bold' }; break;
    }
    return { color: '#333', fontWeight: 'bold' };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    logEvent("병원 후보 조회 및 이송 전 인계 요약 생성");

    const payload: TriageData = {
      primary,
      complaints,
      vitals: {
        ...vitals,
        sbp: touchedVitals.sbp ? vitals.sbp : "",
        dbp: touchedVitals.dbp ? vitals.dbp : "",
        hr: touchedVitals.hr ? vitals.hr : "",
        spo2: touchedVitals.spo2 ? vitals.spo2 : "",
        nrs: touchedVitals.nrs ? vitals.nrs : ""
      }
    };

    // Attach scene and sample to payload if needed for the backend/summary
    const extendedPayload = {
      ...payload,
      scene,
      sample,
      customComplaint
    };

    try {
      if (session) {
        // Save to DB (mock endpoint for now)
        await fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...extendedPayload, userId: session.user?.email })
        });
      }
      if (onAssess) onAssess(extendedPayload as any, timeline);
    } catch (err) {
      console.error(err);
      alert('데이터 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderChip = (label: string, isSelected: boolean, onClick: () => void, danger: boolean = false) => (
    <button
      className="badge"
      style={{
        background: isSelected ? (danger ? 'var(--red-primary)' : 'var(--blue-dark)') : '#f8fafc',
        color: isSelected ? '#fff' : '#475569',
        border: `1px solid ${isSelected ? (danger ? 'var(--red-primary)' : 'var(--blue-dark)') : '#cbd5e1'}`,
        cursor: 'pointer',
        whiteSpace: 'nowrap'
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );

  return (
    <div className="card" style={{ borderTop: '4px solid var(--blue-primary)' }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title" style={{ margin: 0, fontSize: '1.25rem' }}>
          <i className="ri-clipboard-pulse-fill text-blue-primary"></i> 병원 전 현장평가 (Pre-KTAS)
        </h2>
      </div>

      <div style={{ background: '#333', color: '#0f0', padding: '0.5rem 1rem', borderRadius: '4px', marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.8rem', height: '60px', overflowY: 'auto' }}>
        {timeline.slice(-3).map((l, i) => <div key={i}>[{l.time}] {l.msg}</div>)}
      </div>

      {/* 1. 현장 상황 */}
      <div className="form-group mb-6">
        <h3 className="text-sm font-bold text-gray mb-3"><i className="ri-alarm-warning-line"></i> 1. 현장 상황 확인</h3>
        <div className="mb-3">
          <p className="text-xs text-gray mb-1">현장 안전 확인</p>
          <div className="flex flex-wrap gap-2">
            {["안전", "위험", "판단 어려움"].map(opt => renderChip(opt, scene.safety === opt, () => setSceneField('safety', opt, '현장 안전 확인'), opt === '위험'))}
          </div>
        </div>
        <div className="mb-3">
          <p className="text-xs text-gray mb-1">위험요인 (다중선택)</p>
          <div className="flex flex-wrap gap-2">
            {["교통사고", "화재/연기", "가스/화학물질", "폭력/자해 위험", "감염위험", "전기 위험", "추락/붕괴 위험"].map(opt => renderChip(opt, scene.risks.includes(opt), () => toggleArrayItem(setScene, 'risks', opt, '위험요인'), true))}
          </div>
        </div>
        <div className="grid-2" style={{ gap: '1rem' }}>
          <div>
            <p className="text-xs text-gray mb-1">환자 수</p>
            <div className="flex flex-wrap gap-2">
              {["1명", "2-4명", "5명 이상", "다수 사상자 의심"].map(opt => renderChip(opt, scene.patients === opt, () => setSceneField('patients', opt, '환자 수'), opt.includes('다수')))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray mb-1">추가 지원 필요 여부</p>
            <div className="flex flex-wrap gap-2">
              {["필요 없음", "추가 구급차", "구조대", "경찰", "의료지도", "소방지원"].map(opt => renderChip(opt, scene.support.includes(opt), () => toggleArrayItem(setScene, 'support', opt, '추가 지원')))}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-xs text-gray mb-1">접근 가능 여부</p>
          <div className="flex flex-wrap gap-2">
            {["바로 접근 가능", "구조 후 접근 가능", "이동/탈출 필요", "접근 불가"].map(opt => renderChip(opt, scene.access === opt, () => setSceneField('access', opt, '접근 여부')))}
          </div>
        </div>
      </div>

      {/* 2. 1차 평가 */}
      <div className="form-group mb-6" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 className="text-sm font-bold text-blue-dark mb-3"><i className="ri-stethoscope-fill"></i> 2. 환자 1차 평가 (Primary Survey)</h3>
        <div className="grid-2" style={{ gap: '1rem' }}>
          <div>
            <p className="text-xs text-gray mb-1">의식 상태</p>
            <div className="flex flex-wrap gap-2">
              {["명료", "혼돈/졸림", "통증에 반응", "무반응"].map(opt => renderChip(opt, primary.consciousness === opt, () => setPrimaryField('consciousness', opt, '의식 상태'), opt === "무반응"))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray mb-1">호흡 상태</p>
            <div className="flex flex-wrap gap-2">
              {["정상", "호흡곤란", "비정상 호흡/gasping", "무호흡"].map(opt => renderChip(opt, primary.breathing === opt, () => setPrimaryField('breathing', opt, '호흡 상태'), opt.includes("무호흡") || opt.includes("비정상")))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray mb-1">순환 상태</p>
            <div className="flex flex-wrap gap-2">
              {["맥박 있음", "맥박 약함", "맥박 없음", "대량출혈 있음"].map(opt => renderChip(opt, primary.circulation === opt, () => setPrimaryField('circulation', opt, '순환 상태'), opt === "맥박 없음" || opt.includes("대량출혈")))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray mb-1">즉시 처치 상황 (다중선택)</p>
            <div className="flex flex-wrap gap-2">
              {["CPR 진행 중", "AED 적용 중", "AED shock 시행", "산소 투여 중", "지혈 중", "기도확보 필요", "경추고정 필요", "IV/수액 필요", "혈당 측정 필요"].map(opt => renderChip(opt, primary.actions.includes(opt), () => toggleArrayItem(setPrimary, 'actions', opt, '즉시 처치'), opt.includes("CPR") || opt.includes("AED") || opt.includes("기도확보")))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. 주증상 선택 */}
      <div className="form-group mb-6">
        <h3 className="text-sm font-bold text-gray mb-3"><i className="ri-search-eye-line"></i> 3. 주증상 선택 (다중선택 가능)</h3>
        <p className="text-xs text-gray mb-2">※ 여러 주증상이 겹칠 수 있으므로 여러 개를 열어 선택할 수 있습니다.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Object.entries(CHIEF_COMPLAINT_OPTIONS).map(([category, options]) => {
            const isSelected = complaints[category].length > 0;
            const isOpen = openComplaintCategory === category;
            
            return (
              <div key={category} style={{ border: `1px solid ${isSelected ? 'var(--blue-primary)' : '#e2e8f0'}`, borderRadius: '8px', overflow: 'hidden' }}>
                <button 
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', background: isSelected ? '#e0f2fe' : '#f8fafc', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', color: isSelected ? 'var(--blue-dark)' : '#333' }}
                  onClick={() => {
                    setOpenComplaintCategory(isOpen ? null : category);
                    if (!isOpen) logEvent(`주증상 선택: ${category}`);
                  }}
                >
                  <span>{category} {isSelected && <span style={{ fontSize: '0.75rem', background: 'var(--blue-primary)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '10px', marginLeft: '0.5rem' }}>{complaints[category].length}개</span>}</span>
                  <i className={isOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}></i>
                </button>
                
                {isOpen && (
                  <div style={{ padding: '1rem', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
                    <div className="flex flex-wrap gap-2">
                      {options.map(opt => renderChip(opt, complaints[category].includes(opt), () => toggleComplaint(category, opt)))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <input 
            type="text" className="form-input mt-2" placeholder="기타/직접입력" 
            value={customComplaint} onChange={(e) => setCustomComplaint(e.target.value)}
            onBlur={() => { if(customComplaint) logEvent(`기타 주증상: ${customComplaint}`) }}
          />
        </div>
      </div>

      {/* 4. 활력징후 및 SAMPLE */}
      <div className="form-group mb-6">
        <h3 className="text-sm font-bold text-gray mb-3"><i className="ri-heart-pulse-line"></i> 4. 활력징후 및 병력(SAMPLE)</h3>
        
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
          <p className="text-xs font-bold text-blue-dark mb-2">활력징후 (Vitals)</p>
          <div className="vitals-grid">
            <div><label className="text-xs text-gray">SBP</label><input type="number" name="sbp" className="form-input mt-1" value={vitals.sbp} onChange={handleVitalChange} onBlur={handleVitalBlur} step="5" style={getColorStyle('sbp', vitals.sbp)} /></div>
            <div><label className="text-xs text-gray">DBP</label><input type="number" name="dbp" className="form-input mt-1" value={vitals.dbp} onChange={handleVitalChange} onBlur={handleVitalBlur} step="5" style={getColorStyle('dbp', vitals.dbp)} /></div>
            <div><label className="text-xs text-gray">HR</label><input type="number" name="hr" className="form-input mt-1" value={vitals.hr} onChange={handleVitalChange} onBlur={handleVitalBlur} step="5" style={getColorStyle('hr', vitals.hr)} /></div>
            <div><label className="text-xs text-gray">RR</label><input type="number" name="rr" className="form-input mt-1" value={vitals.rr} onChange={handleVitalChange} onBlur={handleVitalBlur} step="1" style={getColorStyle('rr', vitals.rr)} /></div>
            <div><label className="text-xs text-gray">SpO₂ (%)</label><input type="number" name="spo2" className="form-input mt-1" max="100" value={vitals.spo2} onChange={handleVitalChange} onBlur={handleVitalBlur} step="1" style={getColorStyle('spo2', vitals.spo2)} /></div>
            <div><label className="text-xs text-gray">NRS</label><input type="number" name="nrs" className="form-input mt-1" min="0" max="10" value={vitals.nrs} onChange={handleVitalChange} onBlur={handleVitalBlur} step="1" style={getColorStyle('nrs', vitals.nrs)} /></div>
          </div>
          <div className="grid-2 mt-3">
            <div><label className="text-xs text-gray">체온 (BT, ℃)</label><input type="text" className="form-input mt-1" name="bt" placeholder="예: 36.5" value={vitals.bt} onChange={(e) => setVitals({...vitals, bt: e.target.value})} onBlur={handleVitalBlur} /></div>
            <div><label className="text-xs text-gray">혈당 (BST, mg/dL)</label><input type="text" className="form-input mt-1" name="bst" placeholder="예: 120" value={vitals.bst} onChange={(e) => setVitals({...vitals, bst: e.target.value})} onBlur={handleVitalBlur} /></div>
          </div>
        </div>

        <div className="grid-2" style={{ gap: '0.5rem' }}>
          <div><label className="text-xs text-gray">S (증상/주호소)</label><input type="text" className="form-input mt-1" value={sample.S} onChange={(e) => setSample({...sample, S: e.target.value})} /></div>
          <div><label className="text-xs text-gray">A (알레르기)</label><input type="text" className="form-input mt-1" value={sample.A} onChange={(e) => setSample({...sample, A: e.target.value})} /></div>
          <div><label className="text-xs text-gray">M (복용약)</label><input type="text" className="form-input mt-1" value={sample.M} onChange={(e) => setSample({...sample, M: e.target.value})} /></div>
          <div><label className="text-xs text-gray">P (과거력)</label><input type="text" className="form-input mt-1" value={sample.P} onChange={(e) => setSample({...sample, P: e.target.value})} /></div>
          <div><label className="text-xs text-gray">L (마지막 식사)</label><input type="text" className="form-input mt-1" value={sample.L} onChange={(e) => setSample({...sample, L: e.target.value})} /></div>
          <div><label className="text-xs text-gray">E (발생경위)</label><input type="text" className="form-input mt-1" value={sample.E} onChange={(e) => setSample({...sample, E: e.target.value})} /></div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button 
          className="btn btn-primary" 
          style={{ fontSize: '1.125rem', padding: '1rem 2.5rem', borderRadius: '50px', width: '100%', boxShadow: '0 4px 6px -1px rgba(14, 74, 132, 0.3)' }}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <><i className="ri-loader-4-line ri-spin" style={{ marginRight: '0.5rem' }}></i> 평가 중...</>
          ) : (
            <><i className="ri-heart-pulse-fill" style={{ marginRight: '0.5rem' }}></i> 중증도 분류 및 병원 추천 생성</>
          )}
        </button>
        <p className="text-xs text-gray mt-4">
          본 서비스는 응급환자 정보 입력과 병원 전 단계 의사결정 보조를 위한 시뮬레이션/지원 도구입니다. 실제 환자 처치와 이송 결정은 119구급대원, 의료지도 의사, 수용 병원의 판단을 우선합니다.
        </p>
      </div>
    </div>
  );
}
