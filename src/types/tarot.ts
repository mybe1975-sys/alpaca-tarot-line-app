export type TarotCardData = {
  id: number;
  nameJa: string;
  nameEn: string;
  meaning: string;
  messages: string[];
};

export type AppScreen = 'start' | 'select' | 'result';
