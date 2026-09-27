import { Member, ParseResult } from '../types/attendance';

export function parseKakaoTalkLog(logText: string, currentMembers: Member[]): ParseResult {
  const lines = logText.split(/\r?\n/);
  
  let currentYear = '2026';
  let currentMonth = '9';
  let currentDay = '1';
  let currentMonthKey = '26.9';

  const memberMap = new Map<string, Member>();
  // Pre-load current members
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
      const mentions = extractMentions(trimmed);
      if (mentions.length > 0) {
        parsedLogsCount++;

        // Detect optional event title (e.g., 대러리, 레드불, 춘천, YTN)
        let eventLabel = '';
        if (/대러리|대학러닝|대련/.test(trimmed)) eventLabel = '대러리';
        else if (/레드불/.test(trimmed)) eventLabel = '레드불';
        else if (/춘천/.test(trimmed)) eventLabel = '춘천';
        else if (/YTN/.test(trimmed)) eventLabel = 'YTN';

        const matchedNames: string[] = [];

        mentions.forEach((mention) => {
          const matchedMemberName = matchNameWithMembers(mention, Array.from(memberMap.values()));
          if (matchedMemberName) {
            matchedNames.push(matchedMemberName);
            const member = memberMap.get(matchedMemberName)!;
            
            const existingMonthStr = member.attendances[currentMonthKey] || '';
            const existingDays = existingMonthStr.split(',').map(s => s.trim()).filter(Boolean);
            
            const dayEntry = eventLabel ? `${currentDay}(${eventLabel})` : currentDay;

            // Avoid duplicate day entries if already present
            if (!existingDays.some(d => d.startsWith(currentDay))) {
              existingDays.push(dayEntry);
              // Sort numerically
              existingDays.sort((a, b) => {
                const numA = parseInt(a, 10);
                const numB = parseInt(b, 10);
                return numA - numB;
              });
              member.attendances[currentMonthKey] = existingDays.join(', ');
            }
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

  return {
    members: Array.from(memberMap.values()),
    parsedLogsCount,
    detectedEvents
  };
}

function cleanMemberName(raw: string): string {
  // Strip titles, department prefixes, and Hun/emojis
  return raw
    .replace(/^@/, '')
    .replace(/ Hun$/, '')
    .replace(/님$/, '')
    .replace(/^[가-힣A-Za-z0-9]+\s+(?=[가-힣]{2,4}$)/, '') // e.g. "서울 융합전자공학부 이주호" -> "이주호"
    .trim();
}

function extractMentions(text: string): string[] {
  const matches = text.match(/@[^\s@]+/g);
  if (!matches) return [];
  return matches.map(m => m.replace(/^@/, '').trim());
}

function matchNameWithMembers(mentionText: string, members: Member[]): string | null {
  const cleanedMention = cleanMemberName(mentionText);
  
  // 1. Direct name match
  const directMatch = members.find(m => m.name === cleanedMention || mentionText.includes(m.name));
  if (directMatch) return directMatch.name;

  // 2. Substring match (e.g. mention "유지훈 Hun" contains "유지훈")
  for (const m of members) {
    if (mentionText.includes(m.name) || cleanedMention.includes(m.name)) {
      return m.name;
    }
  }

  // 3. Partial name match for short nicknames like "용학" -> "전용학"
  if (cleanedMention.length >= 2) {
    const partialMatch = members.find(m => m.name.endsWith(cleanedMention));
    if (partialMatch) return partialMatch.name;
  }

  return null;
}
