import { Member, ParseResult, UnmatchedTag, ReviewItem, AttendanceSource } from '../types/attendance';

export function parseKakaoTalkLog(logText: string, currentMembers: Member[] = []): ParseResult {
  const lines = logText.split(/\r?\n/);
  
  let currentYear = '26';
  let currentMonth = '9';
  let currentDay = '1';
  let currentMonthKey = '26.9';
  let currentDayOfWeek = '';

  const memberMap = new Map<string, Member>();
  const unmatchedTags: UnmatchedTag[] = [];
  const reviewItems: ReviewItem[] = [];

  // Pre-load current registered members
  currentMembers.forEach((m) => {
    memberMap.set(m.name.trim(), {
      ...m,
      attendances: { ...m.attendances },
      sources: m.sources ? { ...m.sources } : {}
    });
  });

  const detectedEvents: { date: string; title: string; participants: string[] }[] = [];
  let parsedLogsCount = 0;

  const dateHeaderRegex = /^---+ (\d{4})년 (\d{1,2})월 (\d{1,2})일\s*([월화수목금토일]요일)? ---+/;
  const simpleDateHeaderRegex = /^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일(?:\s*([월화수목금토일]요일))?/;
  const dotDateHeaderRegex = /^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.\s*$/;

  // KakaoTalk Line Format 1: 2026. 9. 15. 오후 9:55, 유지훈 Hun : @태그들...
  const kakaoFullLineRegex = /^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.\s*(오전|오후)\s*(\d{1,2}:\d{2}),?\s*(.+?)\s*:\s*(.*)$/;
  
  // KakaoTalk Line Format 2: [유지훈 Hun] [오후 9:55] @태그들...
  const kakaoBracketMsgRegex = /^\[(.+?)\]\s*\[(오전|오후)\s*(\d{1,2}:\d{2})\]\s*(.*)$/;

  const userJoinedRegex = /(.+?)님이 들어왔습니다\./;
  const userLeftRegex = /(.+?)님(?:이 나갔습니다|을 내보냈습니다|을 강퇴했습니다)\./;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Check Header line formats
    const headerMatch = trimmed.match(dateHeaderRegex) || trimmed.match(simpleDateHeaderRegex);
    if (headerMatch) {
      currentYear = headerMatch[1].slice(2);
      currentMonth = headerMatch[2];
      currentDay = headerMatch[3];
      currentDayOfWeek = headerMatch[4] || '';
      currentMonthKey = `${currentYear}.${currentMonth}`;
      return;
    }

    const dotHeaderMatch = trimmed.match(dotDateHeaderRegex);
    if (dotHeaderMatch) {
      currentYear = dotHeaderMatch[1].slice(2);
      currentMonth = dotHeaderMatch[2];
      currentDay = dotHeaderMatch[3];
      currentMonthKey = `${currentYear}.${currentMonth}`;
      return;
    }

    let senderName = '';
    let ampmStr = '오후';
    let timeStr = '12:00';
    let messageText = trimmed;

    // Check Kakao Format 1 (Date + Time + Sender + Message in one line)
    const fullLineMatch = trimmed.match(kakaoFullLineRegex);
    if (fullLineMatch) {
      currentYear = fullLineMatch[1].slice(2);
      currentMonth = fullLineMatch[2];
      currentDay = fullLineMatch[3];
      currentMonthKey = `${currentYear}.${currentMonth}`;
      ampmStr = fullLineMatch[4];
      timeStr = fullLineMatch[5];
      senderName = fullLineMatch[6].trim();
      messageText = fullLineMatch[7];
    } else {
      // Check Kakao Format 2 ([Sender] [Time] Message)
      const bracketMatch = trimmed.match(kakaoBracketMsgRegex);
      if (bracketMatch) {
        senderName = bracketMatch[1].trim();
        ampmStr = bracketMatch[2];
        timeStr = bracketMatch[3];
        messageText = bracketMatch[4];
      }
    }

    const fullYearStr = `20${currentYear}`;
    const isoDateStr = `${fullYearStr}-${currentMonth.padStart(2, '0')}-${currentDay.padStart(2, '0')}`;
    const formattedTimestampStr = `${fullYearStr}.${currentMonth.padStart(2, '0')}.${currentDay.padStart(2, '0')} · ${ampmStr} ${timeStr}`;
    const formattedFullDateStr = `${fullYearStr}년 ${currentMonth}월 ${currentDay}일 ${currentDayOfWeek ? currentDayOfWeek + ' ' : ''}${ampmStr} ${timeStr}`;

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
          sources: {},
          joinDate: isoDateStr
        });
      } else if (cleanName && memberMap.has(cleanName)) {
        const existing = memberMap.get(cleanName)!;
        if (!existing.joinDate) existing.joinDate = isoDateStr;
      }
    }

    // User Left / Kicked event
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
    if (messageText.includes('@')) {
      const rawAtSegments = messageText.split('@').slice(1);
      const validMentionsInLine: string[] = [];

      rawAtSegments.forEach((segment) => {
        if (!segment.trim()) return;

        if (isNonMemberHandle(segment, messageText, Array.from(memberMap.keys()))) {
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

        if (targetName && targetName.length >= 2 && !validMentionsInLine.includes(targetName)) {
          validMentionsInLine.push(targetName);
        }
      });

      // Auto-include message sender if sender is valid and not already tagged in the message
      if (senderName) {
        const registeredNames = Array.from(memberMap.keys()).sort((a, b) => b.length - a.length);
        const longestMatchSender = findLongestMatchingMember(senderName, registeredNames);
        const cleanSender = longestMatchSender || cleanMemberName(senderName);

        if (
          cleanSender &&
          cleanSender.length >= 2 &&
          !/^(카카오톡|알림|방장|운영진|관리자|bot|system)$/i.test(cleanSender) &&
          !validMentionsInLine.includes(cleanSender)
        ) {
          validMentionsInLine.unshift(cleanSender);
        }
      }

      if (validMentionsInLine.length > 0) {
        const isFutureOrQuestion = isQuestionOrFutureMessage(messageText);
        const isRetrospective = isRetrospectiveMessage(messageText);

        // Tier 2: Needs Review (검토 필요)
        // If message has question/future keywords OR has only 1 tagged member without clear retrospective keyword
        if (isFutureOrQuestion || (validMentionsInLine.length === 1 && !isRetrospective)) {
          reviewItems.push({
            id: String(Date.now() + Math.random()),
            timestampStr: formattedTimestampStr,
            formattedDate: formattedFullDateStr,
            year: currentYear,
            month: currentMonth,
            day: currentDay,
            monthKey: currentMonthKey,
            sender: senderName || '카카오톡',
            fullMessage: messageText,
            candidates: validMentionsInLine.map((name) => ({ name, isSelected: true }))
          });

          if (validMentionsInLine.length === 1) {
            unmatchedTags.push({
              id: String(Date.now() + Math.random()),
              rawMention: validMentionsInLine[0],
              extractedName: validMentionsInLine[0],
              lineText: trimmed,
              date: `${currentYear}.${currentMonth}.${currentDay}`,
              score: 1,
              reason: '검토 필요 메시지'
            });
          }
        }
        // Tier 1: Definite Attendance (확실한 출석)
        else {
          parsedLogsCount++;
          const sourceObj: AttendanceSource = {
            id: String(Date.now() + Math.random()),
            timestamp: formattedFullDateStr,
            sender: senderName || '카카오톡',
            message: messageText,
            decisionType: 'auto'
          };

          const dayKey = `${currentMonthKey}.${currentDay}`;

          validMentionsInLine.forEach((name) => {
            if (!memberMap.has(name)) {
              memberMap.set(name, {
                id: String(Date.now() + Math.random()),
                name,
                attendances: {},
                sources: {},
                joinDate: isoDateStr
              });
            }

            const member = memberMap.get(name)!;
            const existingMonthStr = member.attendances[currentMonthKey] || '';
            const existingDays = existingMonthStr.split(',').map((s) => s.trim()).filter(Boolean);

            if (!existingDays.includes(currentDay)) {
              existingDays.push(currentDay);
              existingDays.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
              member.attendances[currentMonthKey] = existingDays.join(', ');
            }

            if (!member.sources) member.sources = {};
            if (!member.sources[dayKey]) member.sources[dayKey] = [];

            // Avoid duplicate source records
            const alreadyHasSource = member.sources[dayKey].some((s) => s.message === messageText);
            if (!alreadyHasSource) {
              member.sources[dayKey].push(sourceObj);
            }
          });

          detectedEvents.push({
            date: `${currentYear}.${currentMonth}.${currentDay}`,
            title: '출석 인증',
            participants: validMentionsInLine
          });
        }
      }
    }
  });

  const sortedMembers = Array.from(memberMap.values())
    .filter((m) => !/^(멘션|멘션하기|답장|사진|동영상|이모티콘|파일|보이스톡|페이스톡|공지|투표|카카오톡|운영진|관리자|알림|알림톡)$/i.test(m.name))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  return {
    members: sortedMembers,
    parsedLogsCount,
    unmatchedTags,
    reviewItems,
    detectedEvents
  };
}

function isQuestionOrFutureMessage(text: string): boolean {
  const futureOrQuestionRegex = /\?|내일|모레|글피|가실|뛰실|신청|모집|어디|시간|늦|혹시|갈 사람|참석하시|오시나요|몇 시|몇시|갈분|가실분|가실 분|뛰실 분|뛸 분|올 사람|오실 분/;
  return futureOrQuestionRegex.test(text);
}

function isRetrospectiveMessage(text: string): boolean {
  const retrospectiveRegex = /수고|고생|달렸|뛰었|완료|마무리|좋았|사진|오하운|러닝|템포런|인증|참석|수고하셨|고생하셨|감사|오늘|러닝완료|출석/;
  return retrospectiveRegex.test(text);
}

function isNonMemberHandle(segment: string, lineText: string, registeredNames: string[]): boolean {
  const token = segment.split(/\s+/)[0].trim();

  if (/^(all|garmin_korea|official|wtdeyewear|bushman_life|멘션|멘션하기|답장|사진|동영상|이모티콘|파일|보이스톡|페이스톡|공지|투표|카카오톡)$/i.test(token)) {
    return true;
  }

  if (/[_.]/.test(token)) {
    const isRegistered = registeredNames.some((n) => n === token || token.startsWith(n));
    if (!isRegistered) return true;
  }

  if (/(인스타|팔로우|계정|아이디|http|www|instagram)/i.test(lineText)) {
    const isRegistered = registeredNames.some((n) => n === token);
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
        attendances: {},
        sources: {}
      });
    }
  });

  return Array.from(existingMap.values())
    .filter((m) => !/^(멘션|멘션하기|답장|사진|동영상|이모티콘|파일|보이스톡|페이스톡|공지|투표|카카오톡)$/i.test(m.name))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}

function cleanMemberName(raw: string): string {
  let cleaned = raw
    .replace(/^@/, '')
    .replace(/ Hun$/, '')
    .replace(/님$/, '')
    .trim();

  if (/^(멘션|멘션하기|답장|사진|동영상|이모티콘|파일|보이스톡|페이스톡|공지|투표|카카오톡|운영진|관리자|알림|알림톡)$/i.test(cleaned)) {
    return '';
  }

  const words = cleaned.split(/\s+/);
  if (words.length > 1) {
    const lastWord = words[words.length - 1];
    if (/^[가-힣]{2,4}$/.test(lastWord)) {
      return lastWord;
    }
  }

  return cleaned;
}
