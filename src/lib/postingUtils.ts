/**
 * Posting & Google Sheet Sync Utilities
 */

export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const MONTH_MAP: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12
};

const DAY_NAMES = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'
];

const IGNORE_WORDS = [
  'approved', 'posted', 'in production', 'changes required', 'draft', 'pending',
  'true', 'false', 'yes', 'no', 'completed', 'scheduled'
];

export function tryExtractDate(raw: string, baseDate = new Date()): string | null {
  const str = raw.trim().replace(/^["']|["']$/g, '');
  if (!str) return null;
  const baseYear = baseDate.getFullYear();

  // 1. ISO YYYY-MM-DD
  const iso = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (iso) {
    return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
  }

  // 2. Day-MonthName: e.g. "21-Oct", "21 Oct", "21-Oct-26", "21-Oct-2026", "21st Oct", "Wed 21 Oct"
  const dMonth = str.match(/(?:[a-zA-Z]+[\s\,\.\-]+)?(\d{1,2})(?:st|nd|rd|th)?[\s\-\/\,]+([a-zA-Z]+)(?:[\s\-\/\,]+(\d{2,4}))?/i);
  if (dMonth) {
    const day = dMonth[1].padStart(2, '0');
    const mNum = MONTH_MAP[dMonth[2].toLowerCase()];
    if (mNum) {
      let year = baseYear;
      if (dMonth[3]) {
        const rawY = parseInt(dMonth[3], 10);
        year = rawY < 100 ? (2000 + rawY) : rawY;
      }
      return `${year}-${String(mNum).padStart(2, '0')}-${day}`;
    }
  }

  // 3. MonthName-Day: e.g. "Oct 21", "October 21", "Oct-21", "Oct 21, 2026"
  const mDay = str.match(/([a-zA-Z]+)[\s\-\/\,]+(\d{1,2})(?:st|nd|rd|th)?(?:[\s\-\/\,]+(\d{2,4}))?/i);
  if (mDay) {
    const mNum = MONTH_MAP[mDay[1].toLowerCase()];
    if (mNum) {
      const day = mDay[2].padStart(2, '0');
      let year = baseYear;
      if (mDay[3]) {
        const rawY = parseInt(mDay[3], 10);
        year = rawY < 100 ? (2000 + rawY) : rawY;
      }
      return `${year}-${String(mNum).padStart(2, '0')}-${day}`;
    }
  }

  // 4. DD/MM/YYYY or DD/MM/YY (e.g. 02/10/26, 15/10/2026)
  const dmy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{2,4}))?/);
  if (dmy) {
    const p1 = parseInt(dmy[1], 10);
    const p2 = parseInt(dmy[2], 10);
    let year = baseYear;
    if (dmy[3]) {
      const rawY = parseInt(dmy[3], 10);
      year = rawY < 100 ? (2000 + rawY) : rawY;
    }
    // DD/MM/YYYY (Indian standard in sheets)
    if (p1 <= 31 && p2 <= 12) {
      return `${year}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
    }
    // MM/DD/YYYY
    if (p1 <= 12 && p2 <= 31) {
      return `${year}-${String(p1).padStart(2, '0')}-${String(p2).padStart(2, '0')}`;
    }
  }

  // 5. Excel / Google Sheets Serial Date Number (e.g. 45000 to 47000)
  const serial = parseFloat(str);
  if (!isNaN(serial) && serial >= 40000 && serial <= 60000) {
    const excelEpoch = new Date(1899, 11, 30);
    const converted = new Date(excelEpoch.getTime() + serial * 86400000);
    if (!isNaN(converted.getTime())) {
      return formatDateKey(converted);
    }
  }

  return null;
}

export interface ParsedSheetPost {
  date: string;
  contentType: 'Reel' | 'Graphic';
  title: string;
  isPosted?: boolean;
}

export function parseSheetRow(rawLine: string, baseDate = new Date()): ParsedSheetPost | null {
  const line = rawLine.trim();
  if (!line) return null;

  // Ignore header rows
  const lowerLine = line.toLowerCase();
  if (
    (lowerLine.includes('date') && lowerLine.includes('day')) ||
    (lowerLine.includes('date') && lowerLine.includes('type')) ||
    (lowerLine.includes('date') && lowerLine.includes('post')) ||
    (lowerLine.includes('assigned to') && lowerLine.includes('status')) ||
    (lowerLine.includes('content calendar') || lowerLine.includes('selected images'))
  ) {
    return null;
  }

  // Split by Tab (Google Sheets copy-paste) or comma
  const cells = (line.includes('\t') ? line.split('\t') : line.split(','))
    .map(c => c.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);

  if (cells.length === 0) return null;

  let parsedDate: string | null = null;
  let parsedType: 'Reel' | 'Graphic' = 'Graphic';
  let isPosted = false;
  let explicitTitle = '';
  const candidateTitles: string[] = [];

  for (const cell of cells) {
    const lower = cell.toLowerCase().trim();

    // 1. Try extracting date if not already found
    if (!parsedDate) {
      const extracted = tryExtractDate(cell, baseDate);
      if (extracted) {
        parsedDate = extracted;
        continue;
      }
    }

    // 2. Check for "Posted"
    if (lower === 'posted') {
      isPosted = true;
      continue;
    }

    // 3. Skip pure day of week columns (e.g. Friday, Sat)
    if (DAY_NAMES.includes(lower)) {
      continue;
    }

    // 4. Skip common status and boolean keywords
    if (IGNORE_WORDS.includes(lower)) {
      continue;
    }

    // 5. Skip time ranges like "7 to 8 PM", "18:00", "6 PM"
    if (/^\d{1,2}\s*(to|-)\s*\d{1,2}\s*(pm|am)?$/i.test(cell) || /^\d{1,2}(:\d{2})?\s*(pm|am)$/i.test(cell)) {
      continue;
    }

    // 6. Skip URLs (drive links, whatsapp links)
    if (cell.startsWith('http://') || cell.startsWith('https://')) {
      continue;
    }

    // 7. Check for creative type prefixes (e.g. "Reel - Founder Reel", "LI - Event")
    const reelMatch = cell.match(/^reel\s*[-:\s]\s*(.*)$/i);
    if (reelMatch) {
      parsedType = 'Reel';
      const concept = reelMatch[1].trim();
      if (concept) explicitTitle = concept;
      continue;
    }

    const liMatch = cell.match(/^li\s*[-:\s]\s*(.*)$/i);
    if (liMatch) {
      parsedType = 'Graphic';
      const concept = liMatch[1].trim();
      if (concept) explicitTitle = concept;
      continue;
    }

    const carouselMatch = cell.match(/^carousel\s*\d*\s*[-:\s]?\s*(.*)$/i);
    if (carouselMatch) {
      parsedType = 'Graphic';
      const concept = carouselMatch[1].trim() || cell;
      if (concept) explicitTitle = concept;
      continue;
    }

    // Standalone type keywords
    if (lower === 'reel' || lower === 'reels' || lower === 'video') {
      parsedType = 'Reel';
      continue;
    }
    if (lower === 'li' || lower === 'graphic' || lower === 'graphics' || lower === 'image' || lower === 'carousel') {
      parsedType = 'Graphic';
      continue;
    }

    // Candidate title
    candidateTitles.push(cell);
  }

  // CRITICAL: A row MUST have a valid date to be a scheduled post!
  // Note rows without a date should NOT be imported on today's date!
  if (!parsedDate) {
    return null;
  }

  // Choose the best title
  let finalTitle = explicitTitle;
  if (!finalTitle && candidateTitles.length > 0) {
    // Pick the longest descriptive candidate (avoids short person names like Jay)
    finalTitle = candidateTitles.reduce((a, b) => (b.length > a.length ? b : a), candidateTitles[0]);
  }

  if (!finalTitle || finalTitle.toLowerCase() === 'reel' || finalTitle.toLowerCase() === 'graphic' || finalTitle.toLowerCase() === 'li') {
    finalTitle = `${parsedType} Posting`;
  }

  return {
    date: parsedDate,
    contentType: parsedType,
    title: finalTitle,
    isPosted
  };
}
