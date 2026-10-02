export interface AttendanceRecord {
  [monthKey: string]: string; // Key e.g., '26.9', '26.10', '25.9'
}

export interface AttendanceSource {
  id: string;
  timestamp: string; // e.g. "2026년 9월 18일 금요일 오후 10:02"
  sender: string;
  message: string;
  decisionType: 'auto' | 'review' | 'manual';
}

export type MemberRoleType = '미지정' | '신입회원' | '정회원' | 'OB회원';

export interface Member {
  id: string;
  name: string;
  attendances: AttendanceRecord;
  sources?: Record<string, AttendanceSource[]>; // Key e.g., '26.9.18'
  memberType?: MemberRoleType;
  targetCount?: number;
  joinDate?: string; // YYYY-MM-DD
  leaveDate?: string; // YYYY-MM-DD
}

export interface ReviewCandidate {
  name: string;
  isSelected: boolean;
}

export interface ReviewItem {
  id: string;
  timestampStr: string; // e.g. "2026.09.18 · 오후 6:42"
  formattedDate: string; // e.g. "2026년 9월 18일 금요일 오후 6:42"
  year: string;
  month: string;
  day: string;
  monthKey: string;
  sender: string;
  fullMessage: string;
  candidates: ReviewCandidate[];
}

export interface UnmatchedTag {
  id: string;
  rawMention: string;
  extractedName: string;
  lineText: string;
  date: string;
  score: number;
  reason?: string;
}

export interface ParseResult {
  members: Member[];
  parsedLogsCount: number;
  unmatchedTags: UnmatchedTag[];
  reviewItems: ReviewItem[];
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

export type SortOption = 'name_asc' | 'count_desc' | 'count_asc';

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
