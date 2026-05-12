import { TriageData, TriageResult } from "./triage";

export interface Hospital {
  id: string;
  name: string;
  sido: string;
  sigungu: string;
  address: string;
  type: string;
  tags: string[];
  distanceKm: number;
  etaMinutes: number;
  lat: number | null;
  lng: number | null;
  phone: string;
  source: string;
  dataStatus: string;
  realtimeStatus: {
    connected: boolean;
    erBedsAvailable: number | null;
    pediatricBedsAvailable: number | null;
    icuAvailable: boolean | null;
    severeDiseaseCapacity: boolean | null;
    lastSyncedAt: string | null;
    displayLabel: string;
  };
  transportDecision: {
    requiresPhoneConfirm: boolean;
    confirmMessage: string;
  };
}

// In the future, this mock data will be replaced by emergency_hospitals.json fetched via API.
export const mockHospitals: Hospital[] = [
  {
    id: "H001",
    name: "한양대학교병원",
    sido: "서울특별시",
    sigungu: "성동구",
    address: "서울특별시 성동구 왕십리로 222",
    type: "권역응급의료센터",
    tags: ["권역응급의료센터", "중증외상", "심혈관", "뇌졸중"],
    distanceKm: 2.4,
    etaMinutes: 8,
    lat: null,
    lng: null,
    phone: "02-2290-8114",
    source: "응급의료기관 기본정보",
    dataStatus: "static_seed",
    realtimeStatus: {
      connected: false,
      erBedsAvailable: null,
      pediatricBedsAvailable: null,
      icuAvailable: null,
      severeDiseaseCapacity: null,
      lastSyncedAt: null,
      displayLabel: "실시간 병상 정보 연동 예정"
    },
    transportDecision: {
      requiresPhoneConfirm: true,
      confirmMessage: "수용 가능 여부는 이송 전 병원 확인 필요"
    }
  },
  {
    id: "H002",
    name: "건국대학교병원",
    sido: "서울특별시",
    sigungu: "광진구",
    address: "서울특별시 광진구 능동로 120",
    type: "지역응급의료센터",
    tags: ["지역응급의료센터", "심혈관", "뇌졸중"],
    distanceKm: 4.1,
    etaMinutes: 12,
    lat: null,
    lng: null,
    phone: "02-2030-5114",
    source: "응급의료기관 기본정보",
    dataStatus: "static_seed",
    realtimeStatus: {
      connected: false,
      erBedsAvailable: null,
      pediatricBedsAvailable: null,
      icuAvailable: null,
      severeDiseaseCapacity: null,
      lastSyncedAt: null,
      displayLabel: "실시간 병상 정보 연동 예정"
    },
    transportDecision: {
      requiresPhoneConfirm: true,
      confirmMessage: "수용 가능 여부는 이송 전 병원 확인 필요"
    }
  },
  {
    id: "H003",
    name: "국립중앙의료원",
    sido: "서울특별시",
    sigungu: "중구",
    address: "서울특별시 중구 을지로 245",
    type: "권역응급의료센터",
    tags: ["권역응급의료센터", "심혈관", "소아응급"],
    distanceKm: 5.5,
    etaMinutes: 15,
    lat: null,
    lng: null,
    phone: "02-2260-7114",
    source: "응급의료기관 기본정보",
    dataStatus: "static_seed",
    realtimeStatus: {
      connected: false,
      erBedsAvailable: null,
      pediatricBedsAvailable: null,
      icuAvailable: null,
      severeDiseaseCapacity: null,
      lastSyncedAt: null,
      displayLabel: "실시간 병상 정보 연동 예정"
    },
    transportDecision: {
      requiresPhoneConfirm: true,
      confirmMessage: "수용 가능 여부는 이송 전 병원 확인 필요"
    }
  },
  {
    id: "H004",
    name: "순천향대학교 서울병원",
    sido: "서울특별시",
    sigungu: "용산구",
    address: "서울특별시 용산구 대사관로 59",
    type: "지역응급의료센터",
    tags: ["지역응급의료센터", "소아응급"],
    distanceKm: 6.2,
    etaMinutes: 18,
    lat: null,
    lng: null,
    phone: "02-709-9114",
    source: "응급의료기관 기본정보",
    dataStatus: "static_seed",
    realtimeStatus: {
      connected: false,
      erBedsAvailable: null,
      pediatricBedsAvailable: null,
      icuAvailable: null,
      severeDiseaseCapacity: null,
      lastSyncedAt: null,
      displayLabel: "실시간 병상 정보 연동 예정"
    },
    transportDecision: {
      requiresPhoneConfirm: true,
      confirmMessage: "수용 가능 여부는 이송 전 병원 확인 필요"
    }
  },
  {
    id: "H005",
    name: "성동구보건소",
    sido: "서울특별시",
    sigungu: "성동구",
    address: "서울특별시 성동구 고산자로 270",
    type: "지역응급의료기관",
    tags: ["지역응급의료기관"],
    distanceKm: 1.2,
    etaMinutes: 4,
    lat: null,
    lng: null,
    phone: "02-2286-7114",
    source: "응급의료기관 기본정보",
    dataStatus: "static_seed",
    realtimeStatus: {
      connected: false,
      erBedsAvailable: null,
      pediatricBedsAvailable: null,
      icuAvailable: null,
      severeDiseaseCapacity: null,
      lastSyncedAt: null,
      displayLabel: "실시간 병상 정보 연동 예정"
    },
    transportDecision: {
      requiresPhoneConfirm: true,
      confirmMessage: "수용 가능 여부는 이송 전 병원 확인 필요"
    }
  }
];

export interface RecommendedHospital extends Hospital {
  matchScore: number;
  recommendationReason: string[];
  confirmItems: string[];
}

export function rankHospitals(data: TriageData, triageResult: TriageResult, hospitals: Hospital[] = mockHospitals): RecommendedHospital[] {
  return hospitals.map(h => {
    let score = 0;
    const reasons: string[] = [];
    const confirmItems: string[] = ["응급실 수용 가능 여부"];

    // 1. Distance & ETA Base Score
    score += Math.max(0, 30 - h.etaMinutes);
    if (h.etaMinutes <= 15) {
      reasons.push(`현장 기준 가까운 응급의료기관 (예상 ${h.etaMinutes}분)`);
    }

    // 2. Type & Level Matching
    if (triageResult.level <= 2) {
      if (h.type.includes("권역")) {
        score += 50;
        reasons.push(`중증도 Level ${triageResult.level} 대응 권역응급의료센터 고려`);
      } else if (h.type.includes("지역응급의료센터")) {
        score += 30;
        reasons.push(`중증도 Level ${triageResult.level} 대응 지역응급의료센터 고려`);
      } else {
        score -= 20; // Level 1-2 환자에게 기관급은 페널티
      }
      confirmItems.push("중환자실/입원 가능 여부");
    } else {
      if (h.type.includes("지역응급의료기관")) {
        score += 20;
        reasons.push("경증 환자 적합 지역응급의료기관");
      }
    }

    // 3. Disease specific tags
    const comp = data.complaints;
    
    // Cardiac Arrest / ACS
    if (comp["심정지/무반응"]?.length > 0 || comp["흉통/흉부불편감"]?.length > 0) {
      if (h.tags.includes("심혈관")) {
        score += 40;
        reasons.push("심혈관 중재 필요성 고려");
      }
      if (!confirmItems.includes("심혈관 중재 가능 여부")) {
        confirmItems.push("심혈관 중재/시술 가능 여부");
      }
    }

    // Stroke
    if (comp["신경학적 이상"]?.length > 0) {
      if (h.tags.includes("뇌졸중")) {
        score += 40;
        reasons.push("뇌졸중 재관류술 필요성 고려");
      }
      if (!confirmItems.includes("뇌졸중 시술 가능 여부")) {
        confirmItems.push("뇌졸중 수술/시술 가능 여부");
      }
    }

    // Trauma
    if (comp["외상"]?.length > 0 && triageResult.level <= 3) {
      if (h.tags.includes("중증외상")) {
        score += 40;
        reasons.push("중증외상 대응 필요성 고려");
      }
      if (!confirmItems.includes("외상외과 수술/수용 여부")) {
        confirmItems.push("외상외과 수술/수용 여부");
      }
    }

    // Peds
    if (comp["소아/영아 응급"]?.length > 0) {
      if (h.tags.includes("소아응급")) {
        score += 50;
        reasons.push("소아응급 대응 병원 우선 고려");
      } else {
        score -= 30; // 소아 불가 기관 페널티
      }
      if (!confirmItems.includes("소아응급의학/소아과 전문의 진료 여부")) {
        confirmItems.push("소아응급 전문의 진료 가능 여부");
      }
    }

    return {
      ...h,
      matchScore: score,
      recommendationReason: reasons.slice(0, 3), // max 3 reasons
      confirmItems: confirmItems.slice(0, 3)     // max 3 confirm items
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
