"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { TriageData } from '../utils/triage';
import { AuditLog, createLogId, getCurrentTimeStrings } from '../utils/auditLog';

export type DispatchTimelineAction = (action: 'cancel' | 'restore', logId: string) => void;

interface SBARFormProps {
  region: { sido: string; sigungu: string };
  onLiveUpdate: (data: TriageData, extData: any, timeline: AuditLog[], dispatchTimelineAction: DispatchTimelineAction) => void;
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

export default function SBARForm({ region, onLiveUpdate, onComplete }: SBARFormProps) {
  // Form States
  const [scene, setScene] = useState({ safety: "", risks: [] as string[], patients: "", support: [] as string[], access: "" });
  const [primary, setPrimary] = useState({ consciousness: "", breathing: "", circulation: "", actions: [] as string[] });
  const [complaints, setComplaints] = useState<Record<string, string[]>>(Object.keys(CHIEF_COMPLAINT_OPTIONS).reduce((acc, key) => ({ ...acc, [key]: [] }), {}));
  const [openComplaintCategory, setOpenComplaintCategory] = useState<string | null>(null);
  const [customComplaint, setCustomComplaint] = useState("");
  const [sample, setSample] = useState({ S: "", A: "", M: "", P: "", L: "", E: "" });
  const [vitals, setVitals] = useState({ sbp: "", dbp: "", hr: "", spo2: "", nrs: "", bt: "", bst: "", rr: "" });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  // Previous vitals tracker for onBlur
  const [prevVitals, setPrevVitals] = useState({ ...vitals });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { data: session } = useSession();

  // Trigger update to parent
  const triggerUpdate = (currentLogs = auditLogs, newStates?: any) => {
    const sRegion = newStates?.region || region;
    const sScene = newStates?.scene || scene;
    const sPrimary = newStates?.primary || primary;
    const sComplaints = newStates?.complaints || complaints;
    const sVitals = newStates?.vitals || vitals;
    const sSample = newStates?.sample || sample;
    const sCustom = newStates?.customComplaint !== undefined ? newStates.customComplaint : customComplaint;

    const data: TriageData = {
      primary: sPrimary, 
      complaints: sComplaints,
      vitals: { sbp: sVitals.sbp, dbp: sVitals.dbp, hr: sVitals.hr, spo2: sVitals.spo2, nrs: sVitals.nrs }
    };
    const extData = { region: sRegion, scene: sScene, sample: sSample, customComplaint: sCustom };
    
    onLiveUpdate(data, extData, currentLogs, handleTimelineAction);
  };

  useEffect(() => {
    // Initial sync
    triggerUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Log region changes from outside
  const [lastLoggedRegion, setLastLoggedRegion] = useState(region);
  useEffect(() => {
    if (region.sido !== lastLoggedRegion.sido || region.sigungu !== lastLoggedRegion.sigungu) {
      const { timestamp, displayTime } = getCurrentTimeStrings();
      const newLog: AuditLog = {
        id: createLogId(), timestamp, displayTime, actionType: 'update', category: 'region', 
        fieldPath: region.sido !== lastLoggedRegion.sido ? 'region.sido' : 'region.sigungu', 
        selectionMode: 'single', label: '현장 지역 설정 변경', value: `${region.sido} ${region.sigungu}`, status: 'active', source: 'user'
      };
      const newLogs = [...auditLogs, newLog];
      setAuditLogs(newLogs);
      setLastLoggedRegion(region);
      setTimeout(() => triggerUpdate(newLogs), 0);
    }
  }, [region]);

  // --- Centralized Logic: applyFieldUpdate ---
  // This updates the react state explicitly based on a given field path and value.
  const updateStateFromPath = (path: string, val: string, isMulti: boolean, isSelect: boolean) => {
    const parts = path.split('.');
    const domain = parts[0];
    const field = parts[1];

    const toggleMulti = (arr: string[]) => isSelect ? [...arr, val] : arr.filter(v => v !== val);

    let updatedStates: any = {};

    if (domain === 'scene') {
      const newObj = { ...scene, [field]: isMulti ? toggleMulti((scene as any)[field]) : (isSelect ? val : "") };
      setScene(newObj);
      updatedStates.scene = newObj;
    } else if (domain === 'primary') {
      const newObj = { ...primary, [field]: isMulti ? toggleMulti((primary as any)[field]) : (isSelect ? val : "") };
      setPrimary(newObj);
      updatedStates.primary = newObj;
    } else if (domain === 'complaints') {
      const newObj = { ...complaints, [field]: toggleMulti(complaints[field]) };
      setComplaints(newObj);
      updatedStates.complaints = newObj;
    }
    
    return updatedStates;
  };

  // --- Action Dispatcher ---
  // Handles button clicks and dispatches both state change and audit log creation
  const dispatchAction = (
    category: string, 
    fieldPath: string, 
    selectionMode: 'single' | 'multi', 
    label: string, 
    value: string
  ) => {
    const { timestamp, displayTime } = getCurrentTimeStrings();
    const id = createLogId();
    let newLogs = [...auditLogs];

    // Check current state to determine if we are adding or removing
    const parts = fieldPath.split('.');
    const domain = parts[0] as any;
    const field = parts[1];
    
    let isCurrentlySelected = false;
    let currentStateValue: any = null;

    if (domain === 'scene') currentStateValue = (scene as any)[field];
    if (domain === 'primary') currentStateValue = (primary as any)[field];
    if (domain === 'complaints') currentStateValue = complaints[field];

    if (selectionMode === 'multi') {
      isCurrentlySelected = (currentStateValue as string[]).includes(value);
    } else {
      isCurrentlySelected = currentStateValue === value;
    }

    if (selectionMode === 'single') {
      if (isCurrentlySelected) {
        // Toggle off
        const existingLog = newLogs.find(l => l.fieldPath === fieldPath && l.status === 'active' && l.value === value);
        if (existingLog) {
          existingLog.status = 'cancelled';
          existingLog.cancelledAt = timestamp;
          existingLog.cancelReason = 'user_toggle_off';
          newLogs.push({
            id, timestamp, displayTime, actionType: 'cancel', category, fieldPath, selectionMode,
            label: `입력 취소: ${label}`, value, status: 'active', relatedLogId: existingLog.id, source: 'user'
          });
        }
        const updatedStates = updateStateFromPath(fieldPath, value, false, false);
        setAuditLogs(newLogs);
        setTimeout(() => triggerUpdate(newLogs, updatedStates), 0);
      } else {
        // Find existing active to replace
        const existingLog = newLogs.find(l => l.fieldPath === fieldPath && l.status === 'active');
        if (existingLog) {
          existingLog.status = 'replaced';
          existingLog.cancelledAt = timestamp;
          existingLog.cancelReason = 'replaced_by_new_selection';
          // Record the new log
          newLogs.push({
            id, timestamp, displayTime, actionType: 'select', category, fieldPath, selectionMode,
            label: `${label} 변경`, value, status: 'active', relatedLogId: existingLog.id, source: 'user'
          });
        } else {
          newLogs.push({
            id, timestamp, displayTime, actionType: 'select', category, fieldPath, selectionMode,
            label: `${label} 선택`, value, status: 'active', source: 'user'
          });
        }
        const updatedStates = updateStateFromPath(fieldPath, value, false, true);
        setAuditLogs(newLogs);
        setTimeout(() => triggerUpdate(newLogs, updatedStates), 0);
      }
    } else if (selectionMode === 'multi') {
      if (isCurrentlySelected) {
        // Cancel
        const existingLog = newLogs.find(l => l.fieldPath === fieldPath && l.value === value && l.status === 'active');
        if (existingLog) {
          existingLog.status = 'cancelled';
          existingLog.cancelledAt = timestamp;
          existingLog.cancelReason = 'user_toggle_off';
          newLogs.push({
            id, timestamp, displayTime, actionType: 'cancel', category, fieldPath, selectionMode,
            label: `입력 취소: ${label}`, value, status: 'active', relatedLogId: existingLog.id, source: 'user'
          });
        }
        const updatedStates = updateStateFromPath(fieldPath, value, true, false);
        setAuditLogs(newLogs);
        setTimeout(() => triggerUpdate(newLogs, updatedStates), 0);
      } else {
        // Select
        newLogs.push({
          id, timestamp, displayTime, actionType: 'select', category, fieldPath, selectionMode,
          label: `${label} 선택`, value, status: 'active', source: 'user'
        });
        const updatedStates = updateStateFromPath(fieldPath, value, true, true);
        setAuditLogs(newLogs);
        setTimeout(() => triggerUpdate(newLogs, updatedStates), 0);
      }
    }
  };

  // --- External Timeline Action (Cancel / Restore) ---
  const handleTimelineAction: DispatchTimelineAction = (action, logId) => {
    let newLogs = [...auditLogs];
    const targetLog = newLogs.find(l => l.id === logId);
    if (!targetLog) return;

    const { timestamp, displayTime } = getCurrentTimeStrings();
    const newId = createLogId();

    if (action === 'cancel' && targetLog.status === 'active') {
      // Apply UI cancellation
      targetLog.status = 'cancelled';
      targetLog.cancelledAt = timestamp;
      targetLog.cancelReason = 'timeline_action';
      
      newLogs.push({
        id: newId, timestamp, displayTime, actionType: 'cancel', category: targetLog.category,
        fieldPath: targetLog.fieldPath, selectionMode: targetLog.selectionMode,
        label: `입력 취소: ${targetLog.label}`, value: targetLog.value, status: 'active',
        relatedLogId: targetLog.id, source: 'user'
      });
      const updatedStates = updateStateFromPath(targetLog.fieldPath, targetLog.value, targetLog.selectionMode === 'multi', false);
      setAuditLogs(newLogs);
      setTimeout(() => triggerUpdate(newLogs, updatedStates), 0);
    } 
    else if (action === 'restore' && targetLog.status === 'cancelled') {
      // If it's a single select, we must replace the currently active one
      let updatedStates: any = {};
      if (targetLog.selectionMode === 'single') {
        const activeSingle = newLogs.find(l => l.fieldPath === targetLog.fieldPath && l.status === 'active');
        if (activeSingle) {
          activeSingle.status = 'replaced';
          activeSingle.cancelledAt = timestamp;
          activeSingle.cancelReason = 'restored_previous';
        }
      }
      
      newLogs.push({
        id: newId, timestamp, displayTime, actionType: 'restore', category: targetLog.category,
        fieldPath: targetLog.fieldPath, selectionMode: targetLog.selectionMode,
        label: `기록 복원: ${targetLog.label}`, value: targetLog.value, status: 'active',
        relatedLogId: targetLog.id, source: 'user'
      });
      updatedStates = updateStateFromPath(targetLog.fieldPath, targetLog.value, targetLog.selectionMode === 'multi', true);
      setAuditLogs(newLogs);
      setTimeout(() => triggerUpdate(newLogs, updatedStates), 0);
    }
  };

  // --- Vitals Logic ---
  const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVitals(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // triggerUpdate is called to reflect numbers immediately, but no audit log here.
    setTimeout(() => triggerUpdate(auditLogs, { vitals: { ...vitals, [e.target.name]: e.target.value } }), 0);
  };

  const handleVitalBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const field = e.target.name;
    const newVal = e.target.value;
    const oldVal = (prevVitals as any)[field];
    
    if (newVal !== oldVal) {
      const { timestamp, displayTime } = getCurrentTimeStrings();
      const newLogs = [...auditLogs];
      
      if (oldVal === "") {
        newLogs.push({
          id: createLogId(), timestamp, displayTime, actionType: 'update', category: 'vitals',
          fieldPath: `vitals.${field}`, selectionMode: 'text', label: `${field.toUpperCase()} 입력`,
          value: newVal, status: 'active', source: 'user'
        });
      } else {
        newLogs.push({
          id: createLogId(), timestamp, displayTime, actionType: 'update', category: 'vitals',
          fieldPath: `vitals.${field}`, selectionMode: 'text', label: `${field.toUpperCase()} 수정`,
          value: `${oldVal} → ${newVal}`, status: 'active', source: 'user'
        });
      }
      
      setPrevVitals(vitals);
      setAuditLogs(newLogs);
      setTimeout(() => triggerUpdate(newLogs), 0);
    }
  };

  const handleSave = async () => {
    if (!session) return;
    
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientAge: scene.patients,
          patientGender: "", // Could be added to UI later
          situation: scene.safety,
          background: scene.risks.join(', '),
          bp: `${vitals.sbp}/${vitals.dbp}`,
          hr: vitals.hr,
          spo2: vitals.spo2,
          nrs: vitals.nrs,
          recommendation: primary.actions.join(', '),
          preKtas: "N/A",
          logs: auditLogs, // Persistence of audit logs
        }),
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error("SAVE_ERROR", error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // UI Helpers
  const renderBtn = (fieldPath: string, selectionMode: 'single'|'multi', labelText: string, value: string, isSelected: boolean, danger: boolean = false) => (
    <button
      className={`badge-btn ${isSelected ? 'active' : ''} ${danger && isSelected ? 'danger' : ''}`}
      onClick={() => dispatchAction('scene', fieldPath, selectionMode, labelText, value)}
    >
      {value}
    </button>
  );

  return (
    <div style={{ position: 'relative' }}>
      
      {/* Step 1: Scene Size-up */}
      <div id="step-1" className="card">
        <h2 className="section-title"><i className="ri-map-pin-line text-blue-primary"></i> 1. 현장 상황 확인</h2>
        
        <div className="sub-card">
          <div className="section-header"><div><h3>현장 안전 확인</h3></div></div>
          <div className="chip-grid">
            {["안전", "위험", "판단 어려움"].map(opt => renderBtn('scene.safety', 'single', '현장 안전 확인', opt, scene.safety === opt, opt === '위험'))}
          </div>
        </div>

        <div className="sub-card">
          <div className="section-header"><div><h3>위험 요인 (다중선택)</h3></div></div>
          <div className="chip-grid">
            {["교통사고", "화재/연기", "가스/화학물질", "폭력/자해 위험", "감염위험", "전기 위험", "추락/붕괴 위험"].map(opt => renderBtn('scene.risks', 'multi', '위험요인', opt, scene.risks.includes(opt), true))}
          </div>
        </div>

        <div className="grid-2">
          <div className="sub-card mb-0">
            <div className="section-header"><div><h3>환자 수</h3></div></div>
            <div className="chip-grid">
              {["1명", "2-4명", "5명 이상", "다수 사상자 의심"].map(opt => renderBtn('scene.patients', 'single', '환자 수', opt, scene.patients === opt, opt.includes('다수')))}
            </div>
          </div>
          <div className="sub-card mb-0">
            <div className="section-header"><div><h3>추가 지원 (다중선택)</h3></div></div>
            <div className="chip-grid">
              {["필요 없음", "추가 구급차", "구조대", "경찰", "의료지도", "소방지원"].map(opt => renderBtn('scene.support', 'multi', '추가 지원', opt, scene.support.includes(opt)))}
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
            <div><h3>의식 상태 (Mental Status)</h3></div>
          </div>
          <div className="chip-grid">
            {["명료", "혼돈/졸림", "통증에 반응", "무반응"].map(opt => renderBtn('primary.consciousness', 'single', '의식 상태', opt, primary.consciousness === opt, opt === '무반응'))}
          </div>
        </div>

        <div className="sub-card">
          <div className="section-header">
            <div className="section-icon"><i className="ri-lungs-line text-blue-primary" style={{ fontSize: '1.5rem' }}></i></div>
            <div><h3>호흡 상태 (Breathing)</h3></div>
          </div>
          <div className="chip-grid">
            {["정상", "호흡곤란", "비정상 호흡/gasping", "무호흡"].map(opt => renderBtn('primary.breathing', 'single', '호흡 상태', opt, primary.breathing === opt, opt.includes('무호흡') || opt.includes('비정상')))}
          </div>
        </div>

        <div className="sub-card">
          <div className="section-header">
            <div className="section-icon"><i className="ri-heart-pulse-line text-red-primary" style={{ fontSize: '1.5rem' }}></i></div>
            <div><h3>순환 상태 (Circulation)</h3></div>
          </div>
          <div className="chip-grid">
            {["맥박 있음", "맥박 약함", "맥박 없음", "대량출혈 있음"].map(opt => renderBtn('primary.circulation', 'single', '순환 상태', opt, primary.circulation === opt, opt === '맥박 없음' || opt.includes('대량출혈')))}
          </div>
        </div>

        <div className="sub-card">
          <div className="section-header">
            <div className="section-icon"><i className="ri-first-aid-kit-line text-blue-primary" style={{ fontSize: '1.5rem' }}></i></div>
            <div><h3>즉시 처치 상황 (다중선택)</h3></div>
          </div>
          <div className="chip-grid">
            {["CPR 진행 중", "AED 적용 중", "AED shock 시행", "산소 투여 중", "지혈 중", "기도확보 필요", "경추고정 필요", "IV/수액 필요", "혈당 측정 필요"].map(opt => renderBtn('primary.actions', 'multi', '즉시 처치 상황', opt, primary.actions.includes(opt), opt.includes("CPR") || opt.includes("AED") || opt.includes("기도확보")))}
          </div>
        </div>
      </div>

      {/* Step 3: Chief Complaint */}
      <div id="step-3" className="card">
        <h2 className="section-title"><i className="ri-search-eye-line text-blue-primary"></i> 3. 주증상 및 세부 징후 (다중선택)</h2>
        <div className="flex flex-col gap-3">
          {Object.entries(CHIEF_COMPLAINT_OPTIONS).map(([category, options]) => {
            const isSelected = complaints[category].length > 0;
            const isOpen = openComplaintCategory === category;
            
            return (
              <div key={category} style={{ border: `1px solid ${isSelected ? 'var(--blue-primary)' : 'var(--border-color)'}`, borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
                <button 
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: isSelected ? 'var(--blue-light)' : '#f8fafc', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', color: isSelected ? 'var(--blue-dark)' : '#333' }}
                  onClick={() => setOpenComplaintCategory(isOpen ? null : category)}
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
                      {options.map(opt => renderBtn(`complaints.${category}`, 'multi', `${category} 세부증상`, opt, complaints[category].includes(opt)))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 4: Vitals & SAMPLE */}
      <div id="step-4" className="card">
        <h2 className="section-title"><i className="ri-heart-pulse-fill text-blue-primary"></i> 4. 활력징후 및 SAMPLE 병력</h2>
        
        <div className="sub-card">
          <div className="section-header"><div><h3>활력징후 (Vitals)</h3></div></div>
          <div className="vitals-grid">
            {['sbp', 'dbp', 'hr', 'rr', 'spo2', 'nrs'].map(field => (
              <div key={field}>
                <label className="text-xs font-bold text-gray">{field.toUpperCase()}</label>
                <input type="number" name={field} className="form-input mt-1" value={(vitals as any)[field]} onChange={handleVitalChange} onBlur={handleVitalBlur} />
              </div>
            ))}
          </div>
          <div className="grid-2 mt-3">
            <div><label className="text-xs font-bold text-gray">체온 (BT)</label><input type="text" className="form-input mt-1" name="bt" value={vitals.bt} onChange={handleVitalChange} onBlur={handleVitalBlur} /></div>
            <div><label className="text-xs font-bold text-gray">혈당 (BST)</label><input type="text" className="form-input mt-1" name="bst" value={vitals.bst} onChange={handleVitalChange} onBlur={handleVitalBlur} /></div>
          </div>
        </div>
      </div>

      <div className="mt-6 mb-8 flex flex-col sm:flex-row justify-between gap-4">
        {session ? (
          <button 
            className="btn" 
            onClick={handleSave} 
            disabled={isSaving}
            style={{ 
              flex: 1, 
              padding: '1.25rem', 
              fontSize: '1.125rem', 
              backgroundColor: saveStatus === 'success' ? '#059669' : 'var(--blue-primary)',
              color: 'white' 
            }}
          >
            <i className={isSaving ? "ri-loader-4-line ri-spin" : (saveStatus === 'success' ? "ri-checkbox-circle-line" : "ri-save-line")}></i>
            <span className="ml-2">
              {isSaving ? '저장 중...' : (saveStatus === 'success' ? '저장 완료!' : (saveStatus === 'error' ? '저장 실패(재시도)' : 'DB에 기록 저장'))}
            </span>
          </button>
        ) : (
          <button 
            className="btn" 
            disabled
            style={{ 
              flex: 1, 
              padding: '1.25rem', 
              fontSize: '1.125rem', 
              backgroundColor: '#f1f5f9',
              color: '#94a3b8',
              cursor: 'not-allowed'
            }}
          >
            <i className="ri-lock-line"></i>
            <span className="ml-2">로그인 후 기록 저장 가능</span>
          </button>
        )}
        <button className="btn btn-primary" onClick={onComplete} style={{ flex: 1, padding: '1.25rem', fontSize: '1.125rem', backgroundColor: 'var(--green-primary)' }}>
          <i className="ri-check-double-line mr-2"></i> 평가 완료 및 인계 요약
        </button>
      </div>
      
      <div className="sticky-action-bar">
        <button className="btn" style={{ flex: 1, background: 'var(--green-primary)', color: 'white' }} onClick={onComplete}>
          <i className="ri-check-double-line mr-1"></i> 평가 완료
        </button>
      </div>

    </div>
  );
}
