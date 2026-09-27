export interface AttendanceRecord {
  [monthKey: string]: string; // Key e.g., '26.9', '26.10', '25.9'
}

export interface Member {
  id: string;
  name: string;
  attendances: AttendanceRecord;
  targetCount?: number;
  joinDate?: string; // YYYY-MM-DD
  leaveDate?: string; // YYYY-MM-DD
}

export interface UnmatchedTag {
  id: string;
  rawMention: string; // e.g. "garmin_korea" or "서울 러닝학과 이태윤"
  extractedName: string; // e.g. "서울"
  lineText: string;
  date: string;
  score: number; // 규칙 점수 (-3 ~ +5)
  reason?: string;
}

export interface ParseResult {
  members: Member[];
  parsedLogsCount: number;
  unmatchedTags: UnmatchedTag[];
  detectedEvents: {
    date: string;
    title: string;
    participants: string[];
  }[];
}

export interface SemesterInfo {
  id: string;
  name: string;
  months: string[]; // e.g. ['26.9', '26.10', '26.11', '26.12', '27.1', '27.2']
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isCurrent?: boolean;
}

export type SortOption = 'name_asc' | 'count_desc' | 'count_asc' | 'completed' | 'pending';

export const DEFAULT_SEMESTERS: SemesterInfo[] = [
  {
    id: '2026-2',
    name: '2026년 2학기',
    months: ['26.9', '26.10', '26.11', '26.12', '27.1', '27.2'],
    startDate: '2026-09-01',
    endDate: '2027-02-28',
    isCurrent: true
  },
  {
    id: '2026-1',
    name: '2026년 1학기',
    months: ['26.3', '26.4', '26.5', '26.6', '26.7', '26.8'],
    startDate: '2026-03-01',
    endDate: '2026-08-31'
  },
  {
    id: '2025-2',
    name: '2025년 2학기',
    months: ['25.9', '25.10', '25.11', '25.12', '26.1', '26.2'],
    startDate: '2025-09-01',
    endDate: '2026-02-28'
  },
  {
    id: '2025-1',
    name: '2025년 1학기',
    months: ['25.3', '25.4', '25.5', '25.6', '25.7', '25.8'],
    startDate: '2025-03-01',
    endDate: '2025-08-31'
  }
];
