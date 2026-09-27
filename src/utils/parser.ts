import { Member, ParseResult, UnmatchedTag } from '../types/attendance';

export function parseKakaoTalkLog(logText: string, currentMembers: Member[] = []): ParseResult {
  const lines = logText.split(/\r?\n/);
  
  let currentYear = '26';
  let currentMonth = '9';
  let currentDay = '1';
  let currentMonthKey = '26.9';

  const memberMap = new Map<string, Member>();
  const unmatchedTags: UnmatchedTag[] = [];

  // Pre-load current registered members
  currentMembers.forEach((m) => {
    memberMap.set(m.name.trim(), {
      ...m,
      attendances: { ...m.attendances }
    });
  });

  const detectedEvents: { date: string; title: string; participants: string[] }[] = [];
  let parsedLogsCount = 0;

  const dateHeaderRegex = /^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/;
  const dateMsgRegex = /^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(오전|오후)\s*(\d{1,2}):(\d{2})/;
  const userJoinedRegex = /(.+?)님이 들어왔습니다\./;
  const userLeftRegex = /(.+?)님(?:이 나갔습니다|을 내보냈습니다|을 강퇴했습니다)\./;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Date header
    const headerMatch = trimmed.match(dateHeaderRegex);
    if (headerMatch) {
      currentYear = headerMatch[1].slice(2);
      currentMonth = headerMatch[2];
      currentDay = headerMatch[3];
      currentMonthKey = `${currentYear}.${currentMonth}`;
    }

    // Message timestamp
    const msgDateMatch = trimmed.match(dateMsgRegex);
    if (msgDateMatch) {
      currentYear = msgDateMatch[1].slice(2);
      currentMonth = msgDateMatch[2];
      currentDay = msgDateMatch[3];
      currentMonthKey = `${currentYear}.${currentMonth}`;
    }

    const fullYearStr = `20${currentYear}`;
    const isoDateStr = `${fullYearStr}-${currentMonth.padStart(2, '0')}-${currentDay.padStart(2, '0')}`;

    // User Joined event
    const joinMatch = trimmed.match(userJoinedRegex);
    if (joinMatch) {
      const rawName = joinMatch[1].split(',').pop()?.trim() || joinMatch[1].trim();
      const cleanName = cleanMemberName(rawName);
      if (cleanName && !memberMap.has(cleanName)) {
        memberMap.set(cleanName, {
          id: String(Date.now() + Math.random()),
          name: cleanName,
          attendances: {},
          joinDate: isoDateStr
        });
      } else if (cleanName && memberMap.has(cleanName)) {
        const existing = memberMap.get(cleanName)!;
        if (!existing.joinDate) existing.joinDate = isoDateStr;
      }
    }

    // User Left / Kicked event (퇴장 감지)
    const leftMatch = trimmed.match(userLeftRegex);
    if (leftMatch) {
      const rawName = leftMatch[1].split(',').pop()?.trim() || leftMatch[1].trim();
      const cleanName = cleanMemberName(rawName);
      if (cleanName && memberMap.has(cleanName)) {
        const existing = memberMap.get(cleanName)!;
        existing.leaveDate = isoDateStr;
      }
    }

    // Process @mentions
    if (trimmed.includes('@')) {
      const rawAtSegments = trimmed.split('@').slice(1);
      const validMentionsInLine: string[] = [];

      rawAtSegments.forEach((segment) => {
        if (!segment.trim()) return;

        if (isNonMemberHandle(segment, trimmed, Array.from(memberMap.keys()))) {
          return;
        }

        const registeredNames = Array.from(memberMap.keys()).sort((a, b) => b.length - a.length);
        const longestMatch = findLongestMatchingMember(segment, registeredNames);

        let targetName = '';
        if (longestMatch) {
          targetName = longestMatch;
        } else {
          const rawToken = segment.split(/\s+/)[0].trim();
          targetName = cleanMemberName(rawToken);
        }

        if (targetName && targetName.length >= 2) {
          validMentionsInLine.push(targetName);
        }
      });

      if (validMentionsInLine.length >= 2) {
        parsedLogsCount++;
        validMentionsInLine.forEach((name) => {
          if (!memberMap.has(name)) {
            memberMap.set(name, {
              id: String(Date.now() + Math.random()),
              name,
              attendances: {},
              joinDate: isoDateStr
            });
          }

          const member = memberMap.get(name)!;
          const existingMonthStr = member.attendances[currentMonthKey] || '';
          const existingDays = existingMonthStr.split(',').map(s => s.trim()).filter(Boolean);

          if (!existingDays.includes(currentDay)) {
            existingDays.push(currentDay);
            existingDays.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
            member.attendances[currentMonthKey] = existingDays.join(', ');
          }
        });

        detectedEvents.push({
          date: `${currentYear}.${currentMonth}.${currentDay}`,
          title: '출석 인증',
          participants: validMentionsInLine
        });
      } else if (validMentionsInLine.length === 1) {
        const name = validMentionsInLine[0];
        unmatchedTags.push({
          id: String(Date.now() + Math.random()),
          rawMention: name,
          extractedName: name,
          lineText: trimmed,
          date: `${currentYear}.${currentMonth}.${currentDay}`,
          score: 1,
          reason: '단일 태그 (확인 필요)'
        });
      }
    }
  });

  const sortedMembers = Array.from(memberMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'ko')
  );

  return {
    members: sortedMembers,
    parsedLogsCount,
    unmatchedTags,
    detectedEvents
  };
}

function isNonMemberHandle(segment: string, lineText: string, registeredNames: string[]): boolean {
  const token = segment.split(/\s+/)[0].trim();

  if (/^(all|garmin_korea|official|wtdeyewear|bushman_life)$/i.test(token)) {
    return true;
  }

  if (/[_.]/.test(token)) {
    const isRegistered = registeredNames.some(n => n === token || token.startsWith(n));
    if (!isRegistered) return true;
  }

  if (/(인스타|팔로우|계정|아이디|http|www|instagram)/i.test(lineText)) {
    const isRegistered = registeredNames.some(n => n === token);
    if (!isRegistered && /^[a-zA-Z0-9_.]+$/.test(token)) {
      return true;
    }
  }

  if (/^[a-zA-Z0-9_. -]+$/.test(token) && !registeredNames.includes(token)) {
    return true;
  }

  return false;
}

function findLongestMatchingMember(atSegment: string, sortedMemberNames: string[]): string | null {
  const cleanSegment = atSegment.trim();
  for (const name of sortedMemberNames) {
    if (cleanSegment.startsWith(name)) {
      return name;
    }
  }
  return null;
}

export function parseRosterText(rosterText: string, currentMembers: Member[]): Member[] {
  const rawNames = rosterText
    .split(/[\n,\r\/;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2);

  const existingMap = new Map<string, Member>();
  currentMembers.forEach((m) => existingMap.set(m.name, m));

  rawNames.forEach((name) => {
    const cleanName = cleanMemberName(name);
    if (cleanName && !existingMap.has(cleanName)) {
      existingMap.set(cleanName, {
        id: String(Date.now() + Math.random()),
        name: cleanName,
        attendances: {}
      });
    }
  });

  return Array.from(existingMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}

function cleanMemberName(raw: string): string {
  let cleaned = raw
    .replace(/^@/, '')
    .replace(/ Hun$/, '')
    .replace(/님$/, '')
    .trim();

  const words = cleaned.split(/\s+/);
  if (words.length > 1) {
    const lastWord = words[words.length - 1];
    if (/^[가-힣]{2,4}$/.test(lastWord)) {
      return lastWord;
    }
  }

  return cleaned;
}
