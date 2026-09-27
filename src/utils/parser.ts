import { Member, ParseResult } from '../types/attendance';

export function parseKakaoTalkLog(logText: string, currentMembers: Member[] = []): ParseResult {
  const lines = logText.split(/\r?\n/);
  
  let currentYear = '26';
  let currentMonth = '9';
  let currentDay = '1';
  let currentMonthKey = '26.9';

  const memberMap = new Map<string, Member>();

  // Pre-load current members if provided
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
      const rawMentions = extractMentions(trimmed);
      if (rawMentions.length > 0) {
        parsedLogsCount++;
        const matchedNames: string[] = [];

        rawMentions.forEach((mention) => {
          let cleanName = cleanMemberName(mention);
          if (!cleanName || cleanName.length < 2) return;

          if (!memberMap.has(cleanName)) {
            const existingName = Array.from(memberMap.keys()).find(
              (k) => k === cleanName || k.endsWith(cleanName) || cleanName.endsWith(k)
            );
            if (existingName) {
              cleanName = existingName;
            } else {
              memberMap.set(cleanName, {
                id: String(Date.now() + Math.random()),
                name: cleanName,
                attendances: {}
              });
            }
          }

          matchedNames.push(cleanName);
          const member = memberMap.get(cleanName)!;
          
          const existingMonthStr = member.attendances[currentMonthKey] || '';
          const existingDays = existingMonthStr.split(',').map(s => s.trim()).filter(Boolean);

          // Simple clean day number
          if (!existingDays.includes(currentDay)) {
            existingDays.push(currentDay);
            existingDays.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
            member.attendances[currentMonthKey] = existingDays.join(', ');
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
    }
  });

  const sortedMembers = Array.from(memberMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'ko')
  );

  return {
    members: sortedMembers,
    parsedLogsCount,
    detectedEvents
  };
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

function extractMentions(text: string): string[] {
  const matches = text.match(/@[^\s@]+/g);
  if (!matches) return [];
  return matches.map(m => m.replace(/^@/, '').trim());
}
