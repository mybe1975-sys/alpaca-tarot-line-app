export type LuckyItemData = {
  luckyType: string;
  luckyContent: string;
};

export type TarotCardData = {
  id: number;
  nameJa: string;
  nameEn: string;
  meaning: string;
  // 02_messages の title を messages と同じ順番で保持します。
  messageTitles?: string[];
  messages: string[];
  imageUrl?: string;
  luckyItems?: LuckyItemData[];
};

export type TarotCardsResponse = {
  cards: TarotCardData[];
};

export type AppScreen = 'start' | 'select' | 'result';
