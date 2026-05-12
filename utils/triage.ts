export interface TriageData {
  primary: {
    consciousness: string;
    breathing: string;
    circulation: string;
    actions: string[];
  };
  complaints: Record<string, string[]>;
  vitals: {
    sbp: string;
    dbp: string;
    hr: string;
    spo2: string;
    nrs: string;
  };
}

export interface TriageResult {
  level: number;
  label: string;
  reasons: string[];
  recommendation: string;
}

export function calculateSeverity(data: TriageData): TriageResult {
  const { primary, complaints, vitals } = data;
  const sbp = parseInt(vitals.sbp, 10);
  const hr = parseInt(vitals.hr, 10);
  const spo2 = parseInt(vitals.spo2, 10);

  const reasonsLevel1: string[] = [];
  const reasonsLevel2: string[] = [];
  const reasonsLevel3: string[] = [];

  // --- LEVEL 1 CHECKS ---
  if (primary.consciousness === "무반응" && (primary.breathing === "비정상 호흡" || primary.breathing === "무호흡" || primary.breathing === "정상 호흡 없음 / gasping" || complaints["심정지/무반응"]?.includes("정상 호흡 없음/gasping"))) {
    reasonsLevel1.push("무반응 + 무호흡/비정상 호흡 (심정지 의심)");
  }
  if (primary.circulation === "맥박 없음" || complaints["심정지/무반응"]?.includes("맥박 없음")) reasonsLevel1.push("맥박 없음");
  if (primary.actions.includes("CPR 진행 중") || complaints["심정지/무반응"]?.includes("CPR 진행 중")) reasonsLevel1.push("CPR 진행 중");
  if (primary.actions.includes("AED 적용 중") || primary.actions.includes("AED shock 시행") || complaints["심정지/무반응"]?.includes("AED shock 시행 횟수 입력")) reasonsLevel1.push("AED 적용/Shock 시행");
  if (primary.circulation === "대량출혈 있음" && (primary.consciousness === "통증 반응" || primary.consciousness === "무반응" || primary.consciousness === "혼돈/졸림" || sbp < 90)) {
    reasonsLevel1.push("대량출혈 + 의식/혈압 저하");
  }
  if (primary.actions.includes("기도확보 필요")) reasonsLevel1.push("기도폐쇄 의심/기도확보 필요");
  if (!isNaN(spo2) && spo2 < 85) reasonsLevel1.push(`SpO₂ 85% 미만 (${spo2}%)`);
  if (!isNaN(sbp) && sbp < 80) reasonsLevel1.push(`SBP 80mmHg 미만 (${sbp}mmHg)`);
  if (complaints["외상"]?.length > 0 && complaints["외상"]?.includes("의식저하")) reasonsLevel1.push("중증 외상 + 의식저하");
  if (complaints["신경학적 이상"]?.includes("경련 동반")) reasonsLevel1.push("지속 경련 의심"); // simplification
  if (complaints["알레르기/중독"]?.length > 0 && (primary.breathing === "호흡곤란" || sbp < 90)) reasonsLevel1.push("아나필락시스 의심 + 혈압저하/호흡곤란");

  if (reasonsLevel1.length > 0) {
    return {
      level: 1,
      label: "Level 1: 즉시 소생/응급처치 필요",
      reasons: reasonsLevel1,
      recommendation: "가장 가까운 수용 가능 응급의료기관 및 의료지도 우선."
    };
  }

  // --- LEVEL 2 CHECKS ---
  const chestPainOpts = complaints["흉통/흉부불편감"] || [];
  if (chestPainOpts.length > 0 && (chestPainOpts.includes("식은땀") || chestPainOpts.includes("어깨/팔/턱/등 방사통") || chestPainOpts.includes("호흡곤란 동반") || chestPainOpts.includes("12유도 ECG 시행") || chestPainOpts.includes("ST elevation 의심"))) {
    reasonsLevel2.push("흉통 + 고위험 징후(식은땀/방사통/호흡곤란 등)");
  }
  if (complaints["신경학적 이상"]?.length > 0 && complaints["신경학적 이상"]?.includes("마지막 정상 확인 시각, LKW 입력")) {
    reasonsLevel2.push("신경학적 이상 + 마지막 정상 시각 확인 가능 (초기 뇌졸중 의심)");
  }
  if (!isNaN(spo2) && spo2 >= 85 && spo2 <= 90) reasonsLevel2.push(`SpO₂ 85-90% (${spo2}%)`);
  if (!isNaN(sbp) && sbp >= 80 && sbp <= 90) reasonsLevel2.push(`SBP 80-90mmHg (${sbp}mmHg)`);
  if (!isNaN(hr) && (hr >= 130 || hr < 50)) reasonsLevel2.push(`HR 이상 (${hr}회/분)`);
  if (primary.consciousness === "혼돈/졸림" || primary.consciousness === "통증 반응") reasonsLevel2.push("의식저하 (호흡/맥박 유지)");
  if (primary.breathing === "호흡곤란" && (complaints["호흡곤란"]?.includes("보조근 사용") || complaints["호흡곤란"]?.includes("똑바로 눕지 못함/기좌호흡") || complaints["호흡곤란"]?.includes("청색증"))) {
    reasonsLevel2.push("심한 호흡곤란 (보조근 사용/기좌호흡/청색증)");
  }
  if (complaints["신경학적 이상"]?.includes("심한 두통")) reasonsLevel2.push("심한 두통 + 신경학적 이상");
  if (complaints["외상"]?.includes("사고기전: 교통사고") || complaints["외상"]?.includes("사고기전: 추락") || complaints["외상"]?.includes("경추/척추 손상 의심")) {
    reasonsLevel2.push("외상 + 고위험 손상기전");
  }
  if ((complaints["복통/출혈"]?.includes("토혈") || complaints["복통/출혈"]?.includes("혈변/흑색변")) && (complaints["복통/출혈"]?.includes("실신/어지러움") || sbp < 100)) {
    reasonsLevel2.push("GI Bleeding 의심 + 어지러움/혈압저하");
  }
  if (complaints["알레르기/중독"]?.includes("호흡곤란") || complaints["알레르기/중독"]?.includes("입술/혀/목 부종")) {
    reasonsLevel2.push("알레르기 반응 + 호흡기 증상");
  }

  if (reasonsLevel2.length > 0) {
    return {
      level: 2,
      label: "Level 2: 고위험 응급",
      reasons: reasonsLevel2,
      recommendation: "전문 진료 가능 병원 우선 확인 필요."
    };
  }

  // --- LEVEL 3 CHECKS ---
  const nrs = parseInt(vitals.nrs, 10);
  if (!isNaN(nrs) && nrs >= 4) reasonsLevel3.push(`중등도 통증 (NRS ${nrs})`);
  if (complaints["복통/출혈"]?.includes("심한 복통") || complaints["복통/출혈"]?.includes("지속")) reasonsLevel3.push("지속되는 복통");
  if (primary.breathing === "호흡곤란" && (!isNaN(spo2) && spo2 >= 90 && spo2 <= 94)) reasonsLevel3.push(`경증 호흡곤란 (SpO₂ ${spo2}%)`);
  if (complaints["외상"]?.length > 0) reasonsLevel3.push("외상 소견 (쇼크 없음)");
  
  if (reasonsLevel3.length > 0 || Object.values(complaints).some(arr => arr.length > 0)) {
    if (reasonsLevel3.length === 0) reasonsLevel3.push("주증상 호소 (안정적 활력징후)");
    return {
      level: 3,
      label: "Level 3: 응급실 진료 필요",
      reasons: reasonsLevel3,
      recommendation: "응급실 평가 필요. 거리와 수용 가능 여부를 함께 고려."
    };
  }

  // --- LEVEL 4-5 ---
  return {
    level: 4,
    label: "Level 4-5 가능",
    reasons: ["입력된 즉각적 생명위협 소견 없음"],
    recommendation: "현재 입력 기준으로 즉각적 생명위협 소견은 낮음. 단, 실제 판단은 구급대원/의료진 평가에 따름."
  };
}
