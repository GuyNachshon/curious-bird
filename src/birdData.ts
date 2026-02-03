import { loadBirdsFromCsv } from './loadBirdsFromCsv';

export interface BirdData {
  id: string;
  media: string;
  label: string;
  english: {
    title: string;
    details: string[];
  };
  hebrew: {
    title: string;
    details: string[];
  };
  arabic: {
    title: string;
    details: string[];
  };
  additionalInfo?: {
    english: string;
    hebrew: string;
    arabic: string;
  };
}

export const birds: BirdData[] = loadBirdsFromCsv();
