"use client";

import React, { useState, useEffect } from 'react';
import { TriageData } from '../utils/triage';

interface SBARFormProps {
  onLiveUpdate: (data: TriageData, extData: any, timeline: {time: string, msg: string}[]) => void;
  onComplete: () => void;
}

const CHIEF_COMPLAINT_OPTIONS: Record<string, string[]> = {
  "심정지/무반응": ["반응 없음", "정상 호흡 없음/gasping", "맥박 없음", "CPR 진행 중", "AED 적용", "AED shock 시행", "목격자 있음", "ROSC 있음", "저혈당 의심", "외상 후 의식소실"],
  "흉통/흉부불편감": ["발생 시각 입력", "지속시간 20분 이상", "압박감/쥐어짜는 통증", "어깨/팔/턱/등 방사통", "식은땀", "오심/구토", "호흡곤란 동반", "실신/어지러움", "혈압저하/쇼크 소견", "12유도 ECG 시행", "ST elevation 의심"],
  "신경학적 이상": ["마지막 정상 시각(LKW) 확인", "안면마비", "편마비/근력저하", "구음장애/실어증", "시야장애", "어지럼/보행장애", "의식저하", "심한 두통", "경련 동반", "항응고제 복용"],
  "호흡곤란": ["SpO₂ 저하", "청색증", "보조근 사용", "문장 말하기 어려움", "쌕쌕거림(Wheezing)", "협착음(Stridor)", "기좌호흡", "흉통 동반", "발열/기침 동반", "알레르기 노출 의심", "천식/COPD 과거력", "산소 투여 중"],
  "외상": ["교통사고", "추락", "압궤", "관통상", "폭행", "대량출혈", "의식저하", "경추/척추 손상 의심", "흉부/복부 손상 의심", "골반 손상 의심", "개방성 골절", "사지 변형", "임신 가능성"],
  "복통/출혈": ["심한 복통", "복부팽만", "복막자극 의심", "토혈", "혈변/흑색변", "반복 구토", "실신/어지러움", "혈압저하", "간질환/위궤양 과거력"],
  "알레르기/중독": ["두드러기/가려움", "안면/기도 부종", "호흡곤란", "혈압저하", "원인물질 노출", "약물 과다복용 의심", "음주/약물 사용", "의식저하", "구토", "자해 가능성"],
  "소아/영아 응급": ["고열", "경련", "호흡곤란", "지속적인 보챔", "수유 거부", "의식저하", "이물질 삼킴 의심", "외상 의심"]
};

export default function SBARForm({ onLiveUpdate, onComplete }: SBARFormProps) {
  // Timeline Logger
  const [timeline, setTimeline] = useState<{time: string, msg: string}[]>([]);
  
  const logEvent = (msg: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setTimeline(prev => {
      const newLog = [...prev, { time: timeStr, msg }];
      triggerUpdate(newLog); // trigger update with new timeline
      return newLog;
    });
  };

  // Form States
  const [region, setRegion] = useState({ sido: "서울특별시", sigungu: "" });
  const [scene, setScene] = useState({ safety: "", risks: [] as string[], patients: "", support: [] as string[], access: "" });
  const [primary, setPrimary] = useState({ consciousness: "", breathing: "", circulation: "", actions: [] as string[] });
  const [complaints, setComplaints] = useState<Record<string, string[]>>(Object.keys(CHIEF_COMPLAINT_OPTIONS).reduce((acc, key) => ({ ...acc, [key]: [] }), {}));
  const [openComplaintCategory, setOpenComplaintCategory] = useState<string | null>(null);
  const [customComplaint, setCustomComplaint] = useState("");
  const [sample, setSample] = useState({ S: "", A: "", M: "", P: "", L: "", E: "" });
  const [vitals, setVitals] = useState({ sbp: "", dbp: "", hr: "", spo2: "", nrs: "", bt: "", bst: "", rr: "" });

  // History Stack for Undo
  const [history, setHistory] = useState<any[]>([]);

  const saveHistory = () => {
    setHistory(prev => [...prev, { region, scene, primary, complaints, customComplaint, sample, vitals, timeline }]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setRegion(lastState.region);
    setScene(lastState.scene);
    setPrimary(lastState.primary);
    setComplaints(lastState.complaints);
    setCustomComplaint(lastState.customComplaint);
    setSample(lastState.sample);
    setVitals(lastState.vitals);
    setTimeline(lastState.timeline);
    setHistory(prev => prev.slice(0, -1));
    
    // Trigger update with restored state
    const data: TriageData = {
      primary: lastState.primary, complaints: lastState.complaints,
      vitals: { sbp: lastState.vitals.sbp, dbp: lastState.vitals.dbp, hr: lastState.vitals.hr, spo2: lastState.vitals.spo2, nrs: lastState.vitals.nrs }
    };
    onLiveUpdate(data, { region: lastState.region, scene: lastState.scene, sample: lastState.sample, customComplaint: lastState.customComplaint }, lastState.timeline);
  };

  useEffect(() => {
    logEvent("현장 도착");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerUpdate = (currentTimeline = timeline) => {
    const data: TriageData = {
      primary, complaints,
      vitals: { sbp: vitals.sbp, dbp: vitals.dbp, hr: vitals.hr, spo2: vitals.spo2, nrs: vitals.nrs }
    };
    const extData = { region, scene, sample, customComplaint };
    onLiveUpdate(data, extData, currentTimeline);
  };

  // Updaters
  const handleChip = (setter: any, field: string, val: string, logMsg: string, isMulti: boolean = false) => {
    saveHistory();
    setter((prev: any) => {
      if (isMulti) {
        const arr = prev[field] as string[];
        const isAdding = !arr.includes(val);
        if (isAdding) logEvent(`${logMsg}: ${val} 추가`);
        return { ...prev, [field]: isAdding ? [...arr, val] : arr.filter(v => v !== val) };
      } else {
        if (prev[field] !== val) logEvent(`${logMsg}: ${val}`);
        return { ...prev, [field]: val };
      }
    });
    setTimeout(() => triggerUpdate(), 0);
  };

  const handleComplaint = (category: string, val: string) => {
    saveHistory();
    setComplaints(prev => {
      const arr = prev[category];
      const isAdding = !arr.includes(val);
      if (isAdding) logEvent(`증상 징후: ${val}`);
      return { ...prev, [category]: isAdding ? [...arr, val] : arr.filter(v => v !== val) };
    });
    setTimeout(() => triggerUpdate(), 0);
  };

  const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    saveHistory();
    setVitals(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setTimeout(() => triggerUpdate(), 0);
  };

  const handleVitalBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value) logEvent(`활력징후 측정: ${e.target.name.toUpperCase()} ${e.target.value}`);
  };

  const renderBtn = (label: string, isSelected: boolean, onClick: () => void, danger: boolean = false) => (
    <button
      className={`badge-btn ${isSelected ? 'active' : ''} ${danger && isSelected ? 'danger' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );

  return (
    <div style={{ position: 'relative' }}>
      
      {/* Step 0: Region Selection */}
      <div className="card" style={{ paddingBottom: '1rem' }}>
        <h2 className="section-title"><i className="ri-road-map-line text-blue-primary"></i> 0. 현장 지역 설정</h2>
        <div className="grid-2">
          <div>
            <label className="text-xs font-bold text-gray">시·도</label>
            <select 
              className="form-input mt-1" 
              value={region.sido}
              onChange={(e) => {saveHistory(); setRegion(p => ({...p, sido: e.target.value})); setTimeout(() => triggerUpdate(), 0); logEvent(`현장 지역 설정: ${e.target.value}`);}}
            >
              <option value="서울특별시">서울특별시</option>
              <option value="경기도">경기도</option>
              <option value="인천광역시">인천광역시</option>
              <option value="강원특별자치도">강원특별자치도</option>
              <option value="충청북도">충청북도</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray">시·군·구</label>
            <input 
              type="text" 
              className="form-input mt-1" 
              placeholder="예: 성동구, 수원시" 
              value={region.sigungu}
              onChange={(e) => {saveHistory(); setRegion(p => ({...p, sigungu: e.target.value})); setTimeout(() => triggerUpdate(), 0);}}
              onBlur={() => {if(region.sigungu) logEvent(`현장 지역 설정: ${region.sido} ${region.sigungu}`);}}
            />
          </div>
        </div>
      </div>

      {/* Step 1: Scene Size-up */}
      <div id="step-1" className="card">
        <h2 className="section-title"><i className="ri-map-pin-line text-blue-primary"></i> 1. 현장 상황 확인</h2>
        
        <div className="sub-card">
          <div className="section-header">
            <div>
              <h3>현장 안전 확인</h3>
            </div>
          </div>
          <div className="chip-grid">
            {["안전", "위험", "판단 어려움"].map(opt => renderBtn(opt, scene.safety === opt, () => handleChip(setScene, 'safety', opt, '현장 안전'), opt === '위험'))}
          </div>
        </div>

        <div className="sub-card">
          <div className="section-header">
            <div>
              <h3>위험 요인 (다중선택)</h3>
            </div>
          </div>
          <div className="chip-grid">
            {["교통사고", "화재/연기", "가스/화학물질", "폭력/자해 위험", "감염위험", "전기 위험", "추락/붕괴 위험"].map(opt => renderBtn(opt, scene.risks.includes(opt), () => handleChip(setScene, 'risks', opt, '위험요인', true), true))}
          </div>
        </div>

        <div className="grid-2">
          <div className="sub-card mb-0">
            <div className="section-header">
              <div>
                <h3>환자 수</h3>
              </div>
            </div>
            <div className="chip-grid">
              {["1명", "2-4명", "5명 이상", "다수 사상자 의심"].map(opt => renderBtn(opt, scene.patients === opt, () => handleChip(setScene, 'patients', opt, '환자 수'), opt.includes('다수')))}
            </div>
          </div>
          <div className="sub-card mb-0">
            <div className="section-header">
              <div>
                <h3>추가 지원 (다중선택)</h3>
              </div>
            </div>
            <div className="chip-grid">
              {["필요 없음", "추가 구급차", "구조대", "경찰", "의료지도", "소방지원"].map(opt => renderBtn(opt, scene.support.includes(opt), () => handleChip(setScene, 'support', opt, '추가 지원', true)))}
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Primary Survey */}
      <div id="step-2" className="card">
        <h2 className="section-title"><i className="ri-stethoscope-line text-blue-primary"></i> 2. 환자 1차 평가 (Primary Survey)</h2>
        
        <div className="sub-card">
          <div className="section-header">
            <div className="section-icon"><i className="ri-brain-line text-blue-primary" style={{ fontSize: '1.5rem' }}></i></div>
            <div>
              <h3>의식 상태 (Mental Status)</h3>
              <p>환자 반응 수준을 선택하세요.</p>
            </div>
          </div>
          <div className="chip-grid">
            {["명료", "혼돈/졸림", "통증에 반응", "무반응"].map(opt => renderBtn(opt, primary.consciousness === opt, () => handleChip(setPrimary, 'consciousness', opt, '의식 상태'), opt === '무반응'))}
          </div>
        </div>

        <div className="sub-card">
          <div className="section-header">
            <div className="section-icon"><i className="ri-lungs-line text-blue-primary" style={{ fontSize: '1.5rem' }}></i></div>
            <div>
              <h3>호흡 상태 (Breathing)</h3>
              <p>환자의 호흡 여부와 양상을 확인하세요.</p>
            </div>
          </div>
          <div className="chip-grid">
            {["정상", "호흡곤란", "비정상 호흡/gasping", "무호흡"].map(opt => renderBtn(opt, primary.breathing === opt, () => handleChip(setPrimary, 'breathing', opt, '호흡 상태'), opt.includes('무호흡') || opt.includes('비정상')))}
          </div>
        </div>

        <div className="sub-card">
          <div className="section-header">
            <div className="section-icon"><i className="ri-heart-pulse-line text-red-primary" style={{ fontSize: '1.5rem' }}></i></div>
            <div>
              <h3>순환 상태 (Circulation)</h3>
              <p>맥박 유무 및 대량출혈 여부를 확인하세요.</p>
            </div>
          </div>
          <div className="chip-grid">
            {["맥박 있음", "맥박 약함", "맥박 없음", "대량출혈 있음"].map(opt => renderBtn(opt, primary.circulation === opt, () => handleChip(setPrimary, 'circulation', opt, '순환 상태'), opt === '맥박 없음' || opt.includes('대량출혈')))}
          </div>
        </div>

        <div className="sub-card">
          <div className="section-header">
            <div className="section-icon"><i className="ri-first-aid-kit-line text-blue-primary" style={{ fontSize: '1.5rem' }}></i></div>
            <div>
              <h3>즉시 처치 상황 (다중선택)</h3>
              <p>현장에서 즉시 수행한 응급처치를 선택하세요.</p>
            </div>
          </div>
          <div className="chip-grid">
            {["CPR 진행 중", "AED 적용 중", "AED shock 시행", "산소 투여 중", "지혈 중", "기도확보 필요", "경추고정 필요", "IV/수액 필요", "혈당 측정 필요"].map(opt => renderBtn(opt, primary.actions.includes(opt), () => handleChip(setPrimary, 'actions', opt, '처치', true), opt.includes("CPR") || opt.includes("AED") || opt.includes("기도확보")))}
          </div>
        </div>
      </div>

      {/* Step 3: Chief Complaint */}
      <div id="step-3" className="card">
        <h2 className="section-title"><i className="ri-search-eye-line text-blue-primary"></i> 3. 주증상 및 세부 징후 (다중선택)</h2>
        <p className="text-sm text-gray mb-4">환자의 복합적인 상태를 반영하기 위해 여러 주증상 카테고리를 열어 선택할 수 있습니다.</p>
        
        <div className="flex flex-col gap-3">
          {Object.entries(CHIEF_COMPLAINT_OPTIONS).map(([category, options]) => {
            const isSelected = complaints[category].length > 0;
            const isOpen = openComplaintCategory === category;
            
            return (
              <div key={category} style={{ border: `1px solid ${isSelected ? 'var(--blue-primary)' : 'var(--border-color)'}`, borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
                <button 
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: isSelected ? 'var(--blue-light)' : '#f8fafc', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', color: isSelected ? 'var(--blue-dark)' : '#333' }}
                  onClick={() => {
                    setOpenComplaintCategory(isOpen ? null : category);
                    if (!isOpen && !isSelected) logEvent(`주증상 카테고리: ${category} 확인`);
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>
                    {category} 
                    {isSelected && <span className="badge-tag" style={{ background: 'var(--blue-primary)', color: 'white', marginLeft: '0.5rem' }}>{complaints[category].length}개</span>}
                  </span>
                  <i className={isOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} style={{ fontSize: '1.25rem' }}></i>
                </button>
                
                {isOpen && (
                  <div style={{ padding: '1rem', background: '#fff', borderTop: `1px solid var(--border-color)` }}>
                    <div className="chip-grid">
                      {options.map(opt => renderBtn(opt, complaints[category].includes(opt), () => handleComplaint(category, opt)))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <input 
            type="text" className="form-input mt-2" placeholder="기타 증상 (직접 입력)" 
            value={customComplaint} onChange={(e) => {saveHistory(); setCustomComplaint(e.target.value); setTimeout(() => triggerUpdate(), 0);}}
            onBlur={() => { if(customComplaint) logEvent(`기타 주증상: ${customComplaint}`) }}
          />
        </div>
      </div>

      {/* Step 4: Vitals & SAMPLE */}
      <div id="step-4" className="card">
        <h2 className="section-title"><i className="ri-heart-pulse-fill text-blue-primary"></i> 4. 활력징후 및 SAMPLE 병력</h2>
        
        <div className="sub-card">
          <div className="section-header">
            <div>
              <h3>활력징후 (Vitals)</h3>
            </div>
          </div>
          <div className="vitals-grid">
            <div><label className="text-xs font-bold text-gray">SBP</label><input type="number" name="sbp" className="form-input mt-1" placeholder="mmHg" value={vitals.sbp} onChange={handleVitalChange} onBlur={handleVitalBlur} /></div>
            <div><label className="text-xs font-bold text-gray">DBP</label><input type="number" name="dbp" className="form-input mt-1" placeholder="mmHg" value={vitals.dbp} onChange={handleVitalChange} onBlur={handleVitalBlur} /></div>
            <div><label className="text-xs font-bold text-gray">HR</label><input type="number" name="hr" className="form-input mt-1" placeholder="bpm" value={vitals.hr} onChange={handleVitalChange} onBlur={handleVitalBlur} /></div>
            <div><label className="text-xs font-bold text-gray">RR</label><input type="number" name="rr" className="form-input mt-1" placeholder="회/분" value={vitals.rr} onChange={handleVitalChange} onBlur={handleVitalBlur} /></div>
            <div><label className="text-xs font-bold text-gray">SpO₂</label><input type="number" name="spo2" className="form-input mt-1" placeholder="%" value={vitals.spo2} onChange={handleVitalChange} onBlur={handleVitalBlur} /></div>
            <div><label className="text-xs font-bold text-gray">NRS</label><input type="number" name="nrs" className="form-input mt-1" placeholder="0-10" value={vitals.nrs} onChange={handleVitalChange} onBlur={handleVitalBlur} /></div>
          </div>
          <div className="grid-2 mt-3">
            <div><label className="text-xs font-bold text-gray">체온 (BT)</label><input type="text" className="form-input mt-1" name="bt" placeholder="℃" value={vitals.bt} onChange={handleVitalChange} onBlur={handleVitalBlur} /></div>
            <div><label className="text-xs font-bold text-gray">혈당 (BST)</label><input type="text" className="form-input mt-1" name="bst" placeholder="mg/dL" value={vitals.bst} onChange={handleVitalChange} onBlur={handleVitalBlur} /></div>
          </div>
        </div>

        <div className="sub-card mb-0">
          <div className="section-header">
            <div>
              <h3>SAMPLE 병력 청취</h3>
            </div>
          </div>
          <div className="grid-2" style={{ gap: '0.75rem' }}>
            <div><label className="text-xs text-gray">S (주호소)</label><input type="text" className="form-input mt-1" style={{ minHeight: '36px', padding: '0.5rem' }} value={sample.S} onChange={(e) => {saveHistory(); setSample(p=>({...p, S: e.target.value})); setTimeout(()=>triggerUpdate(),0);}} /></div>
            <div><label className="text-xs text-gray">A (알레르기)</label><input type="text" className="form-input mt-1" style={{ minHeight: '36px', padding: '0.5rem' }} value={sample.A} onChange={(e) => {saveHistory(); setSample(p=>({...p, A: e.target.value})); setTimeout(()=>triggerUpdate(),0);}} /></div>
            <div><label className="text-xs text-gray">M (복용약)</label><input type="text" className="form-input mt-1" style={{ minHeight: '36px', padding: '0.5rem' }} value={sample.M} onChange={(e) => {saveHistory(); setSample(p=>({...p, M: e.target.value})); setTimeout(()=>triggerUpdate(),0);}} /></div>
            <div><label className="text-xs text-gray">P (과거력)</label><input type="text" className="form-input mt-1" style={{ minHeight: '36px', padding: '0.5rem' }} value={sample.P} onChange={(e) => {saveHistory(); setSample(p=>({...p, P: e.target.value})); setTimeout(()=>triggerUpdate(),0);}} /></div>
            <div><label className="text-xs text-gray">L (마지막 식사)</label><input type="text" className="form-input mt-1" style={{ minHeight: '36px', padding: '0.5rem' }} value={sample.L} onChange={(e) => {saveHistory(); setSample(p=>({...p, L: e.target.value})); setTimeout(()=>triggerUpdate(),0);}} /></div>
            <div><label className="text-xs text-gray">E (발생경위)</label><input type="text" className="form-input mt-1" style={{ minHeight: '36px', padding: '0.5rem' }} value={sample.E} onChange={(e) => {saveHistory(); setSample(p=>({...p, E: e.target.value})); setTimeout(()=>triggerUpdate(),0);}} /></div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation / Complete Button */}
      <div className="mt-6 mb-8 flex justify-between gap-4">
        <button className="btn" onClick={handleUndo} style={{ flex: 1, padding: '1.25rem', fontSize: '1.125rem', backgroundColor: '#e2e8f0', color: '#475569' }} disabled={history.length === 0}>
          <i className="ri-arrow-go-back-line mr-2"></i> 이전 기록 취소
        </button>
        <button className="btn btn-primary" onClick={onComplete} style={{ flex: 2, padding: '1.25rem', fontSize: '1.125rem', backgroundColor: 'var(--green-primary)' }}>
          <i className="ri-check-double-line mr-2"></i> 평가 완료 및 인계 요약
        </button>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="sticky-action-bar">
        <button className="btn" style={{ flex: 1, background: '#e2e8f0', color: '#475569' }} onClick={handleUndo} disabled={history.length === 0}>
          <i className="ri-arrow-go-back-line"></i> 취소
        </button>
        <button className="btn" style={{ flex: 2, background: 'var(--green-primary)', color: 'white' }} onClick={onComplete}>
          <i className="ri-check-double-line mr-1"></i> 평가 완료
        </button>
      </div>

    </div>
  );
}
