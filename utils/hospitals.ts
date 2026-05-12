import { TriageData, TriageResult } from "./triage";

export interface Hospital {
  id: string;
  name: string;
  type: string;
  distanceKm: number;
  etaMinutes: number;
  beds: {
    emergency: number;
    pediatric: number;
    isolation: number;
  };
  capabilities: {
    icu: boolean;
    surgery: boolean;
    stroke: boolean;
    cardiac: boolean;
    trauma: boolean;
    delivery: boolean;
    pediatric: boolean;
  };
  lastUpdated: string;
  phone: string;
  address: string;
}

export const mockHospitals: Hospital[] = [
  {
    id: "H001",
    name: "한양대학교병원",
    type: "권역응급의료센터",
    distanceKm: 2.4,
    etaMinutes: 8,
    beds: { emergency: 3, pediatric: 1, isolation: 0 },
    capabilities: { icu: true, surgery: true, stroke: true, cardiac: true, trauma: true, delivery: true, pediatric: true },
    lastUpdated: "방금 전",
    phone: "02-2290-8114",
    address: "서울특별시 성동구 왕십리로 222"
  },
  {
    id: "H002",
    name: "건국대학교병원",
    type: "지역응급의료센터",
    distanceKm: 4.1,
    etaMinutes: 12,
    beds: { emergency: 5, pediatric: 0, isolation: 1 },
    capabilities: { icu: true, surgery: true, stroke: true, cardiac: true, trauma: false, delivery: true, pediatric: false },
    lastUpdated: "5분 전",
    phone: "02-2030-5114",
    address: "서울특별시 광진구 능동로 120"
  },
  {
    id: "H003",
    name: "국립중앙의료원",
    type: "권역응급의료센터",
    distanceKm: 5.5,
    etaMinutes: 15,
    beds: { emergency: 0, pediatric: 0, isolation: 2 },
    capabilities: { icu: true, surgery: true, stroke: true, cardiac: true, trauma: true, delivery: false, pediatric: true },
    lastUpdated: "방금 전",
    phone: "02-2260-7114",
    address: "서울특별시 중구 을지로 245"
  },
  {
    id: "H004",
    name: "순천향대학교 서울병원",
    type: "지역응급의료센터",
    distanceKm: 6.2,
    etaMinutes: 18,
    beds: { emergency: 12, pediatric: 2, isolation: 1 },
    capabilities: { icu: true, surgery: true, stroke: false, cardiac: true, trauma: false, delivery: true, pediatric: true },
    lastUpdated: "10분 전",
    phone: "02-709-9114",
    address: "서울특별시 용산구 대사관로 59"
  },
  {
    id: "H005",
    name: "성동구보건소",
    type: "지역응급의료기관",
    distanceKm: 1.2,
    etaMinutes: 4,
    beds: { emergency: 2, pediatric: 0, isolation: 0 },
    capabilities: { icu: false, surgery: false, stroke: false, cardiac: false, trauma: false, delivery: false, pediatric: false },
    lastUpdated: "1시간 전",
    phone: "02-2286-7114",
    address: "서울특별시 성동구 고산자로 270"
  }
];

export interface RecommendedHospital extends Hospital {
  matchScore: number;
  recommendationReason: string;
}

export function rankHospitals(data: TriageData, triageResult: TriageResult, hospitals: Hospital[] = mockHospitals): RecommendedHospital[] {
  return hospitals.map(h => {
    let score = 0;
    const reasons = [];

    // Distance & Bed Base Score
    if (h.beds.emergency > 0) {
      score += 10;
      reasons.push("병상 있음");
    } else {
      score -= 50; // Penalty for no beds
      reasons.push("병상 부족");
    }
    
    score += Math.max(0, 20 - h.etaMinutes); // Closer is better

    // Disease specific scoring
    const comp = data.complaints;
    
    // Cardiac Arrest
    if (comp["심정지/무반응"]?.length > 0) {
      if (h.capabilities.icu) { score += 30; reasons.push("ICU 가능"); }
      if (h.capabilities.cardiac) { score += 20; }
    }
    
    // ACS / Cardiac
    if (comp["흉통/흉부불편감"]?.length > 0) {
      if (h.capabilities.cardiac) {
        score += 50;
        reasons.push("심혈관 가능");
      } else {
        score -= 30;
      }
    }

    // Stroke
    if (comp["신경학적 이상"]?.length > 0) {
      if (h.capabilities.stroke) {
        score += 50;
        reasons.push("뇌졸중 수용");
      } else {
        score -= 30;
      }
    }

    // Trauma
    if (comp["외상"]?.length > 0 && triageResult.level <= 2) {
      if (h.capabilities.trauma) {
        score += 50;
        reasons.push("외상센터/수용");
      } else {
        score -= 30;
      }
    }

    // Peds
    if (comp["소아/영아 응급"]?.length > 0) {
      if (h.capabilities.pediatric) {
        score += 50;
        reasons.push("소아응급 가능");
      } else {
        score -= 50;
      }
    }

    if (h.etaMinutes <= 10) reasons.push(`ETA ${h.etaMinutes}분`);

    return {
      ...h,
      matchScore: score,
      recommendationReason: reasons.slice(0, 3).join(" + ") || "가까운 거리"
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
