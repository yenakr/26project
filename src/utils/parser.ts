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

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const headerMatch = trimmed.match(dateHeaderRegex);
    if (headerMatch) {
      currentYear = headerMatch[1].slice(2);
      currentMonth = headerMatch[2];
      currentDay = headerMatch[3];
      currentMonthKey = `${currentYear}.${currentMonth}`;
    }

    const msgDateMatch = trimmed.match(dateMsgRegex);
    if (msgDateMatch) {
      currentYear = msgDateMatch[1].slice(2);
      currentMonth = msgDateMatch[2];
      currentDay = msgDateMatch[3];
      currentMonthKey = `${currentYear}.${currentMonth}`;
    }

    // Check user joined
    const joinMatch = trimmed.match(userJoinedRegex);
    if (joinMatch) {
      const rawName = joinMatch[1].split(',').pop()?.trim() || joinMatch[1].trim();
      const cleanName = cleanMemberName(rawName);
      if (cleanName && !memberMap.has(cleanName)) {
        memberMap.set(cleanName, {
          id: String(Date.now() + Math.random()),
          name: cleanName,
          attendances: {}
        });
      }
    }

    // Check @mentions
    if (trimmed.includes('@')) {
      parsedLogsCount++;
      const atSplits = trimmed.split('@').slice(1);
      const matchedNames: string[] = [];

      atSplits.forEach((atSegment) => {
        if (!atSegment.trim()) return;

        // Registered roster member list sorted by length descending (longest match first)
        const registeredNames = Array.from(memberMap.keys()).sort((a, b) => b.length - a.length);
        const longestMatchedName = findLongestMatchingMember(atSegment, registeredNames);

        let finalName = '';

        if (longestMatchedName) {
          finalName = longestMatchedName;
        } else {
          // Fallback: extract token up to space or next tag
          const rawToken = atSegment.split(/\s+/)[0].trim();
          finalName = cleanMemberName(rawToken);

          // If the raw segment has multiple words (e.g. "서울 러닝학과 이태윤"), flag as suspicious unmatched tag
          const segmentWords = atSegment.split(/\s+/).filter(Boolean);
          if (segmentWords.length > 1 && finalName.length <= 3) {
            const rawMentionSnippet = atSegment.split('@')[0].slice(0, 30).trim();
            unmatchedTags.push({
              id: String(Date.now() + Math.random()),
              rawMention: rawMentionSnippet,
              extractedName: finalName,
              lineText: trimmed,
              date: `${currentYear}.${currentMonth}.${currentDay}`
            });
          }
        }

        if (finalName && finalName.length >= 2) {
          if (!memberMap.has(finalName)) {
            memberMap.set(finalName, {
              id: String(Date.now() + Math.random()),
              name: finalName,
              attendances: {}
            });
          }

          matchedNames.push(finalName);
          const member = memberMap.get(finalName)!;
          
          const existingMonthStr = member.attendances[currentMonthKey] || '';
          const existingDays = existingMonthStr.split(',').map(s => s.trim()).filter(Boolean);

          if (!existingDays.includes(currentDay)) {
            existingDays.push(currentDay);
            existingDays.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
            member.attendances[currentMonthKey] = existingDays.join(', ');
          }
        }
      });

      if (matchedNames.length > 0) {
        detectedEvents.push({
          date: `${currentYear}.${currentMonth}.${currentDay}`,
          title: '모임',
          participants: matchedNames
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

// Longest match algorithm against registered names
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
