export type MemberTier = '신입' | '정회원_1' | '정회원_2' | 'OB';

export interface AttendanceRecord {
  // Key format: '26.9', '26.10', '26.11', '26.12'
  [monthKey: string]: string; 
}

export interface Member {
  id: string;
  name: string;
  semesterCount: string; // '', '1', '2', '3', '3+'
  tier: MemberTier;
  attendances: AttendanceRecord;
  inactiveStatus?: string; // '군 휴학', '비활동' 등
  note?: string; // '페널티 지급' 등
  joinDate?: string; // YYYY-MM-DD
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
