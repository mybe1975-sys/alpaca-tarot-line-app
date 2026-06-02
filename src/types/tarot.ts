export type TarotCardData = {
  id: number;
  nameJa: string;
  nameEn: string;
  meaning: string;
  messages: string[];
  imageUrl?: string;
};

export type TarotCardsResponse = {
  cards: TarotCardData[];
};

export type AppScreen = 'start' | 'select' | 'result';
