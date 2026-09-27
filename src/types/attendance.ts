export interface AttendanceRecord {
  [monthKey: string]: string; // Key e.g., '26.9', '26.10', '26.11', '26.12'
}

export interface Member {
  id: string;
  name: string;
  attendances: AttendanceRecord;
  targetCount?: number; // 기본 목표 참석 횟수 (기본 4회)
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

export type SortOption = 'name_asc' | 'count_desc' | 'count_asc' | 'completed' | 'pending';
