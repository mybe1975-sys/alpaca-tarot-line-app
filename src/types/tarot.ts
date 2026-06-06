export type LuckyItemData = {
  luckyType: string;
  luckyContent: string;
};

export type TarotCardData = {
  id: number;
  nameJa: string;
  nameEn: string;
  meaning: string;
  messages: string[];
  imageUrl?: string;
  luckyItems?: LuckyItemData[];
};

export type TarotCardsResponse = {
  cards: TarotCardData[];
};

export type AppScreen = 'start' | 'select' | 'result';
