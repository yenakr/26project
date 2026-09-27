import { Member, ParseResult } from '../types/attendance';

export function parseKakaoTalkLog(logText: string, currentMembers: Member[] = []): ParseResult {
  const lines = logText.split(/\r?\n/);
  
  let currentYear = '26';
  let currentMonth = '9';
  let currentDay = '1';
  let currentMonthKey = '26.9';

  const memberMap = new Map<string, Member>();

  // Pre-load existing members if any
  currentMembers.forEach((m) => {
    memberMap.set(m.name.trim(), {
      ...m,
      attendances: { ...m.attendances }
    });
  });

  const detectedEvents: { date: string; title: string; participants: string[] }[] = [];
  let parsedLogsCount = 0;

  // Regex patterns
  const dateHeaderRegex = /^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/;
  const dateMsgRegex = /^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(오전|오후)\s*(\d{1,2}):(\d{2})/;
  const userJoinedRegex = /(.+?)님이 들어왔습니다\./;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Check date header or line timestamp
    const headerMatch = trimmed.match(dateHeaderRegex);
    if (headerMatch) {
      currentYear = headerMatch[1].slice(2); // '26'
      currentMonth = headerMatch[2]; // '9'
      currentDay = headerMatch[3]; // '14'
      currentMonthKey = `${currentYear}.${currentMonth}`;
    }

    const msgDateMatch = trimmed.match(dateMsgRegex);
    if (msgDateMatch) {
      currentYear = msgDateMatch[1].slice(2);
      currentMonth = msgDateMatch[2];
      currentDay = msgDateMatch[3];
      currentMonthKey = `${currentYear}.${currentMonth}`;
    }

    // Check new user joined line
    const joinMatch = trimmed.match(userJoinedRegex);
    if (joinMatch) {
      const rawName = joinMatch[1].split(',').pop()?.trim() || joinMatch[1].trim();
      const cleanName = cleanMemberName(rawName);
      if (cleanName && !memberMap.has(cleanName)) {
        memberMap.set(cleanName, {
          id: String(Date.now() + Math.random()),
          name: cleanName,
          semesterCount: '',
          tier: '신입',
          attendances: {},
          joinDate: `20${currentYear}-${currentMonth.padStart(2, '0')}-${currentDay.padStart(2, '0')}`
        });
      }
    }

    // Check for @mentions in line
    if (trimmed.includes('@')) {
      const rawMentions = extractMentions(trimmed);
      if (rawMentions.length > 0) {
        parsedLogsCount++;

        // Detect optional event title
        let eventLabel = '';
        if (/대러리|대학러닝|대련/.test(trimmed)) eventLabel = '대러리';
        else if (/레드불/.test(trimmed)) eventLabel = '레드불';
        else if (/춘천/.test(trimmed)) eventLabel = '춘천';
        else if (/YTN/.test(trimmed)) eventLabel = 'YTN';

        const matchedNames: string[] = [];

        rawMentions.forEach((mention) => {
          let cleanName = cleanMemberName(mention);
          if (!cleanName || cleanName.length < 2) return;

          // If member doesn't exist yet, create automatically as 신입
          if (!memberMap.has(cleanName)) {
            // Check if partial match exists
            const existingName = Array.from(memberMap.keys()).find(
              (k) => k === cleanName || k.endsWith(cleanName) || cleanName.endsWith(k)
            );
            if (existingName) {
              cleanName = existingName;
            } else {
              memberMap.set(cleanName, {
                id: String(Date.now() + Math.random()),
                name: cleanName,
                semesterCount: '',
                tier: '신입',
                attendances: {}
              });
            }
          }

          matchedNames.push(cleanName);
          const member = memberMap.get(cleanName)!;
          
          const existingMonthStr = member.attendances[currentMonthKey] || '';
          const existingDays = existingMonthStr.split(',').map(s => s.trim()).filter(Boolean);
          
          const dayEntry = eventLabel ? `${currentDay}(${eventLabel})` : currentDay;

          if (!existingDays.some(d => d.startsWith(currentDay))) {
            existingDays.push(dayEntry);
            existingDays.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
            member.attendances[currentMonthKey] = existingDays.join(', ');
          }
        });

        if (matchedNames.length > 0) {
          detectedEvents.push({
            date: `${currentYear}.${currentMonth}.${currentDay}`,
            title: eventLabel || '모임',
            participants: matchedNames
          });
        }
      }
    }
  });

  // Sort members alphabetically
  const sortedMembers = Array.from(memberMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'ko')
  );

  return {
    members: sortedMembers,
    parsedLogsCount,
    detectedEvents
  };
}

function cleanMemberName(raw: string): string {
  let cleaned = raw
    .replace(/^@/, '')
    .replace(/ Hun$/, '')
    .replace(/님$/, '')
    .trim();

  // Strip department/university prefix e.g. "서울 융합전자공학부 이주호" -> "이주호"
  const words = cleaned.split(/\s+/);
  if (words.length > 1) {
    const lastWord = words[words.length - 1];
    if (/^[가-힣]{2,4}$/.test(lastWord)) {
      return lastWord;
    }
  }

  return cleaned;
}

function extractMentions(text: string): string[] {
  const matches = text.match(/@[^\s@]+/g);
  if (!matches) return [];
  return matches.map(m => m.replace(/^@/, '').trim());
}
