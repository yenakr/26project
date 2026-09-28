import { Member, ParseResult, UnmatchedTag, ReviewItem, AttendanceSource } from '../types/attendance';

export function decodeFileBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  // Check UTF-8 BOM (0xEF, 0xBB, 0xBF)
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(bytes.subarray(3));
  }

  // Check UTF-16 LE BOM (0xFF, 0xFE)
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(bytes.subarray(2));
  }

  // Try decoding with UTF-8 (fatal: true forces error on EUC-KR byte sequence)
  try {
    const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
    const text = utf8Decoder.decode(bytes);

    // If UTF-8 produced Mojibake replacement characters or garbled tokens
    if (/[\uFFFD]/.test(text) || /(源|媛뺢만|泥웾|웾|쑁|쩰)/.test(text)) {
      throw new Error('Mojibake detected in UTF-8');
    }
    return text;
  } catch {
    // Fallback to EUC-KR / CP949 decoding
    try {
      const eucDecoder = new TextDecoder('euc-kr');
      return eucDecoder.decode(bytes);
    } catch {
      return new TextDecoder().decode(bytes);
    }
  }
}

export function parseKakaoTalkLog(logText: string, currentMembers: Member[] = []): ParseResult {
  const cleanHead = logText.trim();
  const isCsvFormat = /^(?:\uFEFF)?Date,User,Message/i.test(cleanHead) || /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/m.test(cleanHead);

  if (isCsvFormat) {
    return parseKakaoCsvLog(logText, currentMembers);
  }

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
    if (m.name && !isMojibakeName(m.name)) {
      memberMap.set(m.name.trim(), {
        ...m,
        attendances: { ...m.attendances },
        sources: m.sources ? { ...m.sources } : {}
      });
    }
  });

  const detectedEvents: { date: string; title: string; participants: string[] }[] = [];
  let parsedLogsCount = 0;

  const dateHeaderRegex = /^---+ (\d{4})년 (\d{1,2})월 (\d{1,2})일\s*([월화수목금토일]요일)? ---+/;
  const simpleDateHeaderRegex = /^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일(?:\s*([월화수목금토일]요일))?$/;
  const dotDateHeaderRegex = /^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?$/;

  // KakaoTalk Line Format 1 (Dot format): 2026. 9. 15. 오후 9:55, 유지훈 Hun : @태그들... or 2026. 3. 16. 오전 10:18: 김용준...
  const kakaoDotLineRegex = /^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.\s*(오전|오후)\s*(\d{1,2}:\d{2}(?::\d{2})?)[,:]\s*(.+?)\s*:\s*(.*)$/;
  
  // KakaoTalk Line Format 2 (Korean format): 2026년 9월 15일 오후 9:55, 유지훈 Hun : @태그들...
  const kakaoKorLineRegex = /^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(오전|오후)\s*(\d{1,2}:\d{2}(?::\d{2})?)[,:]\s*(.+?)\s*:\s*(.*)$/;

  // KakaoTalk Line Format 3 ([Sender] [Time] Message)
  const kakaoBracketMsgRegex = /^\[(.+?)\]\s*\[(오전|오후)\s*(\d{1,2}:\d{2})\]\s*(.*)$/;

  const userJoinedRegex = /(?:(\d{4})[\.년]\s*(\d{1,2})[\.월]\s*(\d{1,2})[\.일]?\s*(?:오전|오후)\s*\d{1,2}:\d{2}(?::\d{2})?[,:]\s*)?(.+?)님이 들어왔습니다\./;
  const userLeftRegex = /(?:(\d{4})[\.년]\s*(\d{1,2})[\.월]\s*(\d{1,2})[\.일]?\s*(?:오전|오후)\s*\d{1,2}:\d{2}(?::\d{2})?[,:]\s*)?(.+?)님(?:이 나갔습니다|을 내보냈습니다|을 강퇴했습니다)\./;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Check Header line formats (must match standalone date line)
    const headerMatch = trimmed.match(dateHeaderRegex) || trimmed.match(simpleDateHeaderRegex) || trimmed.match(dotDateHeaderRegex);
    if (headerMatch) {
      currentYear = headerMatch[1].slice(2);
      currentMonth = headerMatch[2];
      currentDay = headerMatch[3];
      currentDayOfWeek = headerMatch[4] || '';
      currentMonthKey = `${currentYear}.${currentMonth}`;
      return;
    }

    let senderName = '';
    let ampmStr = '오후';
    let timeStr = '12:00';
    let messageText = trimmed;
    let isFullLineMatch = false;

    // Check Kakao Formats (Date + Time + Sender + Message in one line)
    const dotMatch = trimmed.match(kakaoDotLineRegex);
    const korMatch = !dotMatch ? trimmed.match(kakaoKorLineRegex) : null;
    const bracketMatch = !dotMatch && !korMatch ? trimmed.match(kakaoBracketMsgRegex) : null;

    if (dotMatch) {
      isFullLineMatch = true;
      currentYear = dotMatch[1].slice(2);
      currentMonth = dotMatch[2];
      currentDay = dotMatch[3];
      currentMonthKey = `${currentYear}.${currentMonth}`;
      ampmStr = dotMatch[4];
      timeStr = dotMatch[5];
      senderName = dotMatch[6].trim();
      messageText = dotMatch[7];
    } else if (korMatch) {
      isFullLineMatch = true;
      currentYear = korMatch[1].slice(2);
      currentMonth = korMatch[2];
      currentDay = korMatch[3];
      currentMonthKey = `${currentYear}.${currentMonth}`;
      ampmStr = korMatch[4];
      timeStr = korMatch[5];
      senderName = korMatch[6].trim();
      messageText = korMatch[7];
    } else if (bracketMatch) {
      isFullLineMatch = true;
      senderName = bracketMatch[1].trim();
      ampmStr = bracketMatch[2];
      timeStr = bracketMatch[3];
      messageText = bracketMatch[4];
    }

    const fullYearStr = `20${currentYear}`;
    const isoDateStr = `${fullYearStr}-${currentMonth.padStart(2, '0')}-${currentDay.padStart(2, '0')}`;
    const formattedTimestampStr = `${fullYearStr}.${currentMonth.padStart(2, '0')}.${currentDay.padStart(2, '0')} · ${ampmStr} ${timeStr}`;
    const formattedFullDateStr = `${fullYearStr}년 ${currentMonth}월 ${currentDay}일 ${currentDayOfWeek ? currentDayOfWeek + ' ' : ''}${ampmStr} ${timeStr}`;

    // User Joined event
    const joinMatch = trimmed.match(userJoinedRegex);
    if (joinMatch) {
      if (joinMatch[1] && joinMatch[2] && joinMatch[3]) {
        currentYear = joinMatch[1].slice(2);
        currentMonth = joinMatch[2];
        currentDay = joinMatch[3];
      }
      const rawName = joinMatch[4].split(',').pop()?.trim() || joinMatch[4].trim();
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
      if (leftMatch[1] && leftMatch[2] && leftMatch[3]) {
        currentYear = leftMatch[1].slice(2);
        currentMonth = leftMatch[2];
        currentDay = leftMatch[3];
      }
      const rawName = leftMatch[4].split(',').pop()?.trim() || leftMatch[4].trim();
      const cleanName = cleanMemberName(rawName);
      if (cleanName) {
        if (!memberMap.has(cleanName)) {
          memberMap.set(cleanName, {
            id: String(Date.now() + Math.random()),
            name: cleanName,
            attendances: {},
            sources: {},
            leaveDate: isoDateStr
          });
        } else {
          const existing = memberMap.get(cleanName)!;
          existing.leaveDate = isoDateStr;
        }
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
          const clean = cleanMemberName(rawToken);
          targetName = resolveGivenNameAlias(clean, registeredNames);
        }

        if (targetName && targetName.length >= 2 && !validMentionsInLine.includes(targetName)) {
          validMentionsInLine.push(targetName);
        }
      });

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
          // Post-processing: Add sender to attendance list ONLY IF message is confirmed definite attendance
          if (senderName) {
            const registeredNames = Array.from(memberMap.keys()).sort((a, b) => b.length - a.length);
            const longestMatchSender = findLongestMatchingMember(senderName, registeredNames);
            const clean = longestMatchSender || cleanMemberName(senderName);
            const cleanSender = resolveGivenNameAlias(clean, registeredNames);

            if (
              cleanSender &&
              cleanSender.length >= 2 &&
              !isNonMemberName(cleanSender) &&
              !isMojibakeName(cleanSender) &&
              !validMentionsInLine.includes(cleanSender)
            ) {
              validMentionsInLine.push(cleanSender);
            }
          }

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

  postProcessAutoMergeAliases(memberMap);

  const sortedMembers = Array.from(memberMap.values())
    .filter((m) => !isNonMemberName(m.name) && !isMojibakeName(m.name))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  return {
    members: sortedMembers,
    parsedLogsCount,
    unmatchedTags,
    reviewItems,
    detectedEvents
  };
}

function postProcessAutoMergeAliases(memberMap: Map<string, Member>) {
  const allMemberNames = Array.from(memberMap.keys());
  const fullLengthNames = allMemberNames.filter((n) => n.length >= 3 && /^[가-힣]+$/.test(n));

  allMemberNames.forEach((shortName) => {
    if (shortName.length === 2 && /^[가-힣]{2}$/.test(shortName) && memberMap.has(shortName)) {
      const candidates = fullLengthNames.filter((full) => full.endsWith(shortName));
      if (candidates.length === 1) {
        const targetFullName = candidates[0];
        if (targetFullName !== shortName && memberMap.has(targetFullName)) {
          const sourceMember = memberMap.get(shortName)!;
          const targetMember = memberMap.get(targetFullName)!;

          Object.entries(sourceMember.attendances).forEach(([mKey, daysStr]) => {
            const targetDays = (targetMember.attendances[mKey] || '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            const sourceDays = daysStr
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);

            const combinedDays = Array.from(new Set([...targetDays, ...sourceDays])).sort(
              (a, b) => parseInt(a, 10) - parseInt(b, 10)
            );
            targetMember.attendances[mKey] = combinedDays.join(', ');
          });

          if (sourceMember.sources) {
            if (!targetMember.sources) targetMember.sources = {};
            Object.entries(sourceMember.sources).forEach(([dKey, srcList]) => {
              if (!targetMember.sources![dKey]) targetMember.sources![dKey] = [];
              srcList.forEach((src) => {
                if (!targetMember.sources![dKey].some((e) => e.message === src.message)) {
                  targetMember.sources![dKey].push(src);
                }
              });
            });
          }

          memberMap.delete(shortName);
        }
      }
    }
  });
}

function parseKakaoCsvLog(csvText: string, currentMembers: Member[] = []): ParseResult {
  const memberMap = new Map<string, Member>();
  const unmatchedTags: UnmatchedTag[] = [];
  const reviewItems: ReviewItem[] = [];
  const detectedEvents: { date: string; title: string; participants: string[] }[] = [];
  let parsedLogsCount = 0;

  currentMembers.forEach((m) => {
    if (m.name && !isMojibakeName(m.name)) {
      memberMap.set(m.name.trim(), {
        ...m,
        attendances: { ...m.attendances },
        sources: m.sources ? { ...m.sources } : {}
      });
    }
  });

  const records = parseCsvRecords(csvText);

  records.forEach((record) => {
    const fullYearStr = record.fullYear;
    const currentYear = fullYearStr.slice(2);
    const currentMonth = String(parseInt(record.month, 10));
    const currentDay = String(parseInt(record.day, 10));
    const currentMonthKey = `${currentYear}.${currentMonth}`;

    const ampmStr = record.ampm;
    const timeStr = record.time;
    const senderName = record.sender;
    const messageText = record.message;

    const isoDateStr = `${fullYearStr}-${currentMonth.padStart(2, '0')}-${currentDay.padStart(2, '0')}`;
    const formattedTimestampStr = `${fullYearStr}.${currentMonth.padStart(2, '0')}.${currentDay.padStart(2, '0')} · ${ampmStr} ${timeStr}`;
    const formattedFullDateStr = `${fullYearStr}년 ${currentMonth}월 ${currentDay}일 ${ampmStr} ${timeStr}`;

    // User Joined event
    const joinMatch = messageText.match(/(.+?)님이 들어왔습니다\./);
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
    const leftMatch = messageText.match(/(.+?)님(?:이 나갔습니다|을 내보냈습니다|을 강퇴했습니다)\./);
    if (leftMatch) {
      const rawName = leftMatch[1].split(',').pop()?.trim() || leftMatch[1].trim();
      const cleanName = cleanMemberName(rawName);
      if (cleanName) {
        if (!memberMap.has(cleanName)) {
          memberMap.set(cleanName, {
            id: String(Date.now() + Math.random()),
            name: cleanName,
            attendances: {},
            sources: {},
            leaveDate: isoDateStr
          });
        } else {
          const existing = memberMap.get(cleanName)!;
          existing.leaveDate = isoDateStr;
        }
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
          const clean = cleanMemberName(rawToken);
          targetName = resolveGivenNameAlias(clean, registeredNames);
        }

        if (targetName && targetName.length >= 2 && !validMentionsInLine.includes(targetName)) {
          validMentionsInLine.push(targetName);
        }
      });

      if (validMentionsInLine.length > 0) {
        const isFutureOrQuestion = isQuestionOrFutureMessage(messageText);
        const isRetrospective = isRetrospectiveMessage(messageText);

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
              lineText: `${record.timestamp} ${senderName}: ${messageText}`,
              date: `${currentYear}.${currentMonth}.${currentDay}`,
              score: 1,
              reason: '검토 필요 메시지'
            });
          }
        } else {
          // Definite attendance
          if (senderName) {
            const registeredNames = Array.from(memberMap.keys()).sort((a, b) => b.length - a.length);
            const longestMatchSender = findLongestMatchingMember(senderName, registeredNames);
            const clean = longestMatchSender || cleanMemberName(senderName);
            const cleanSender = resolveGivenNameAlias(clean, registeredNames);

            if (
              cleanSender &&
              cleanSender.length >= 2 &&
              !isNonMemberName(cleanSender) &&
              !isMojibakeName(cleanSender) &&
              !validMentionsInLine.includes(cleanSender)
            ) {
              validMentionsInLine.push(cleanSender);
            }
          }

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

  postProcessAutoMergeAliases(memberMap);

  const sortedMembers = Array.from(memberMap.values())
    .filter((m) => !isNonMemberName(m.name) && !isMojibakeName(m.name))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  return {
    members: sortedMembers,
    parsedLogsCount,
    unmatchedTags,
    reviewItems,
    detectedEvents
  };
}

interface CsvRecord {
  fullYear: string;
  month: string;
  day: string;
  ampm: string;
  time: string;
  timestamp: string;
  sender: string;
  message: string;
}

function parseCsvRecords(csvText: string): CsvRecord[] {
  const results: CsvRecord[] = [];
  let i = 0;
  const len = csvText.length;

  if (csvText.startsWith('Date,User,Message') || csvText.startsWith('\uFEFFDate,User,Message')) {
    const eol = csvText.indexOf('\n');
    if (eol !== -1) i = eol + 1;
  }

  while (i < len) {
    const sub = csvText.slice(i, i + 35);
    const dateMatch = sub.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})[,,\s]/);
    if (!dateMatch) {
      const nextN = csvText.indexOf('\n', i);
      if (nextN === -1) break;
      i = nextN + 1;
      continue;
    }

    const fullYear = dateMatch[1];
    const month = dateMatch[2];
    const day = dateMatch[3];
    const hourNum = parseInt(dateMatch[4], 10);
    const minStr = dateMatch[5];
    const ampm = hourNum >= 12 ? '오후' : '오전';
    const displayHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
    const time = `${displayHour}:${minStr}`;

    i += dateMatch[0].length;

    let sender = '';
    if (i < len && csvText[i] === '"') {
      i++;
      let endQuote = csvText.indexOf('",', i);
      if (endQuote === -1) endQuote = csvText.indexOf('"\n', i);
      if (endQuote !== -1) {
        sender = csvText.slice(i, endQuote).replace(/""/g, '"');
        i = endQuote + 2;
      }
    } else {
      const comma = csvText.indexOf(',', i);
      if (comma !== -1) {
        sender = csvText.slice(i, comma);
        i = comma + 1;
      }
    }

    let message = '';
    if (i < len && csvText[i] === '"') {
      i++;
      let msgBuf = '';
      while (i < len) {
        if (csvText[i] === '"') {
          if (i + 1 < len && csvText[i + 1] === '"') {
            msgBuf += '"';
            i += 2;
          } else {
            i++;
            break;
          }
        } else {
          msgBuf += csvText[i];
          i++;
        }
      }
      message = msgBuf;
      if (i < len && csvText[i] === '\r') i++;
      if (i < len && csvText[i] === '\n') i++;
    } else {
      const eol = csvText.indexOf('\n', i);
      if (eol !== -1) {
        message = csvText.slice(i, eol).trim();
        i = eol + 1;
      } else {
        message = csvText.slice(i).trim();
        i = len;
      }
    }

    results.push({
      fullYear,
      month,
      day,
      ampm,
      time,
      timestamp: `${fullYear}-${month}-${day}`,
      sender: sender.trim(),
      message: message.trim()
    });
  }

  return results;
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
    .filter((m) => !isNonMemberName(m.name) && !isMojibakeName(m.name))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}

export function cleanMemberName(raw: string): string {
  if (!raw) return '';

  let cleaned = raw
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '')
    .replace(/^@/, '')
    .replace(/ Hun$/, '')
    .replace(/님$/, '')
    .replace(/[\(\[\{].*?[\)\]\}]/g, '')
    .trim();

  if (/^\d+년?$/i.test(cleaned) || /^\d+$/.test(cleaned) || isNonMemberName(cleaned) || isMojibakeName(cleaned)) {
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

export function isNonMemberName(name: string): boolean {
  const trimmed = name.trim();
  if (/^\d+년?$/i.test(trimmed) || /^\d+$/.test(trimmed)) return true;
  return /^(멘션|멘션하기|답장|사진|동영상|이모티콘|파일|보이스톡|페이스톡|공지|투표|카카오톡|운영진|관리자|알림|알림톡)$/i.test(trimmed);
}

export function isMojibakeName(name: string): boolean {
  if (/[\uFFFD]/.test(name)) return true;
  if (/(源|媛뺢만|泥웾|웾|쑁|쩰)/.test(name)) return true;
  if (/^[\u4E00-\u9FFF]{2,}/.test(name)) return true;
  return false;
}

export function resolveGivenNameAlias(rawName: string, registeredNames: string[]): string {
  const clean = cleanMemberName(rawName);
  if (!clean || clean.length < 2) return clean;

  // Exact match
  if (registeredNames.includes(clean)) {
    return clean;
  }

  // If clean is 2 or 3 Korean characters (e.g. "규태"), check registered names ending with "규태" (e.g. "강규태")
  if (/^[가-힣]{2,3}$/.test(clean)) {
    const candidates = registeredNames.filter(
      (full) => full.length > clean.length && full.endsWith(clean)
    );
    // Auto-resolve ONLY if uniquely matching 1 candidate (no surname conflicts like 강규태 & 김규태)
    if (candidates.length === 1) {
      return candidates[0];
    }
  }

  return clean;
}

