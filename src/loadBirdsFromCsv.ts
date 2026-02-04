import Papa from 'papaparse';
import type { BirdData } from './birdData';
import csvRaw from './data/data.csv?raw';

export function loadBirdsFromCsv(): BirdData[] {
  const parsed = Papa.parse<Record<string, string>>(csvRaw, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    console.warn('CSV parse errors:', parsed.errors);
  }

  return parsed.data.map((row, index) => rowToBird(row, index));
}

function rowToBird(row: Record<string, string>, index: number): BirdData {
  const serial = row['Serial number']?.trim() ?? String(index);
  const label = `[AV—${serial}]`;

  const genderEn = row['Gender English']?.trim() ?? 'Male';
  const genderHe = row['Gender Hebrew']?.trim() ?? 'זכר';
  const genderAr = row['Gender Arabic']?.trim() ?? 'ذكر';

  const taxidermyEn = `${genderEn}`;
  const taxidermyHe = genderHe;
  const taxidermyAr = genderAr;

  const familyEn = row['Family English']?.trim() ?? '';
  const familyHe = row['Family Hebrew']?.trim() ?? '';
  const familyAr = row['Family Arabic']?.trim() ?? '';

  const familyLineEn = familyEn ? `${familyEn} family` : '';
  const familyLineHe = familyHe ? `משפחת ה${familyHe}` : '';
  const familyLineAr = familyAr ? `الفصيلة ${familyAr}` : '';

  const collectedEn = row['Collected on English']?.trim() ?? '';
  const collectedHe = row['Collected on Hebrew']?.trim() ?? '';
  const collectedAr = row['Collected on Arabic']?.trim() ?? '';

  const locationEn = row['collected at english']?.trim() ?? '';
  const locationHe = row['collected at hebrew']?.trim() ?? '';
  const locationAr = row['collected at arabic']?.trim() ?? '';

  const collectedAtEn = locationEn ? `Collected at ${locationEn}` : '';
  const collectedAtHe = locationHe ? `נאסף ב${locationHe}` : '';
  const collectedAtAr = locationAr ? `جمع في ${locationAr}` : '';

  const additionalEn = row['Additional Info English']?.trim() ?? '';
  const additionalHe = row['Additional Info Hebrew']?.trim() ?? '';
  const additionalAr = row['Additional Info Arabic']?.trim() ?? '';
  const hasAdditionalInfo = !!(additionalEn || additionalHe || additionalAr);

  return {
    id: serial,
    media: `${import.meta.env.VITE_VIDEO_BASE_URL ?? ''}/videos/${serial}.mp4`,
    audio: `${import.meta.env.VITE_VIDEO_BASE_URL ?? ''}/audio/${serial}.aac`,
    label,
    ...(hasAdditionalInfo && {
      additionalInfo: {
        english: additionalEn,
        hebrew: additionalHe,
        arabic: additionalAr,
      },
    }),
    english: {
      title: row['Name English']?.trim() ?? '',
      details: [familyLineEn, taxidermyEn, collectedAtEn, collectedEn].filter(Boolean),
    },
    hebrew: {
      title: row['Name Hebrew']?.trim() ?? '',
      details: [familyLineHe, taxidermyHe, collectedAtHe, collectedHe].filter(Boolean),
    },
    arabic: {
      title: row['Name Arabic']?.trim() ?? '',
      details: [familyLineAr, taxidermyAr, collectedAtAr, collectedAr].filter(Boolean),
    },
  };
}
