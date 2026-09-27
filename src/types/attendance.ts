export interface AttendanceRecord {
  [monthKey: string]: string; // Key e.g., '26.9', '26.10', '25.9', '25.3'
}

export interface Member {
  id: string;
  name: string;
  attendances: AttendanceRecord;
  targetCount?: number;
}

export interface ParseResult {
  members: Member[];
  parsedLogsCount: number;
  detectedEvents: {
    date: string;
    title: string;
    participants: string[];
  }[];
}

export interface SemesterInfo {
  id: string; // e.g., '2026-2'
  name: string; // e.g., '2026년 2학기'
  months: string[]; // e.g., ['26.9', '26.10', '26.11', '26.12', '27.1', '27.2']
  isCurrent?: boolean;
}

export type SortOption = 'name_asc' | 'count_desc' | 'count_asc' | 'completed' | 'pending';

export const DEFAULT_SEMESTERS: SemesterInfo[] = [
  {
    id: '2026-2',
    name: '2026년 2학기',
    months: ['26.9', '26.10', '26.11', '26.12', '27.1', '27.2'],
    isCurrent: true
  },
  {
    id: '2026-1',
    name: '2026년 1학기',
    months: ['26.3', '26.4', '26.5', '26.6', '26.7', '26.8']
  },
  {
    id: '2025-2',
    name: '2025년 2학기',
    months: ['25.9', '25.10', '25.11', '25.12', '26.1', '26.2']
  },
  {
    id: '2025-1',
    name: '2025년 1학기',
    months: ['25.3', '25.4', '25.5', '25.6', '25.7', '25.8']
  }
];
