import { tarotCards as fallbackTarotCards } from '../data/tarotCards';
import type { LuckyItemData, TarotCardData, TarotCardsResponse } from '../types/tarot';

const tarotApiUrl = import.meta.env.VITE_TAROT_API_URL as string | undefined;

type RawTarotCardData = Omit<TarotCardData, 'imageUrl'> & {
  imageUrl?: unknown;
  image_url?: unknown;
  luckyItems?: unknown;
  lucky_items?: unknown;
  luckyItem?: unknown;
  lucky_item?: unknown;
};

type RawLuckyItemData = Partial<LuckyItemData> & {
  lucky_type?: unknown;
  lucky_content?: unknown;
};

const isLuckyItemData = (value: unknown): value is RawLuckyItemData => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const luckyItem = value as RawLuckyItemData;
  const luckyType = luckyItem.luckyType ?? luckyItem.lucky_type;
  const luckyContent = luckyItem.luckyContent ?? luckyItem.lucky_content;

  return luckyType !== undefined || luckyContent !== undefined;
};

const isTarotCardData = (value: unknown): value is TarotCardData => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const card = value as Partial<RawTarotCardData>;
  const imageUrl = card.imageUrl ?? card.image_url;
  const luckyItems = card.luckyItems ?? card.lucky_items ?? card.luckyItem ?? card.lucky_item;

  return (
    typeof card.id === 'number' &&
    typeof card.nameJa === 'string' &&
    typeof card.nameEn === 'string' &&
    typeof card.meaning === 'string' &&
    Array.isArray(card.messages) &&
    card.messages.length > 0 &&
    card.messages.every((message) => typeof message === 'string' && message.trim().length > 0) &&
    (imageUrl === undefined || typeof imageUrl === 'string') &&
    isLuckyItemsValue(luckyItems)
  );
};

const normalizeLuckyItemData = (luckyItem: RawLuckyItemData): LuckyItemData => {
  const luckyType = luckyItem.luckyType ?? luckyItem.lucky_type;
  const luckyContent = luckyItem.luckyContent ?? luckyItem.lucky_content;

  return {
    luckyType: luckyType === undefined || luckyType === null ? '' : String(luckyType),
    luckyContent: luckyContent === undefined || luckyContent === null ? '' : String(luckyContent),
  };
};

const isLuckyItemsValue = (value: unknown): boolean => {
  if (value === undefined) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every((luckyItem) => isLuckyItemData(luckyItem));
  }

  return isLuckyItemData(value);
};

const normalizeLuckyItemsValue = (value: unknown): LuckyItemData[] | undefined => {
  if (Array.isArray(value)) {
    return value
      .filter((luckyItem) => isLuckyItemData(luckyItem))
      .map((luckyItem) => normalizeLuckyItemData(luckyItem));
  }

  if (isLuckyItemData(value)) {
    return [normalizeLuckyItemData(value)];
  }

  return undefined;
};

const normalizeTarotCardData = (card: RawTarotCardData): TarotCardData => {
  const imageUrl = typeof card.imageUrl === 'string' ? card.imageUrl : card.image_url;
  const luckyItems = card.luckyItems ?? card.lucky_items ?? card.luckyItem ?? card.lucky_item;

  return {
    id: card.id,
    nameJa: card.nameJa,
    nameEn: card.nameEn,
    meaning: card.meaning,
    messages: card.messages,
    imageUrl: typeof imageUrl === 'string' ? imageUrl : undefined,
    luckyItems: normalizeLuckyItemsValue(luckyItems),
  };
};

const parseTarotCardsResponse = (value: unknown): TarotCardData[] => {
  if (!value || typeof value !== 'object') {
    throw new Error('Tarot API response must be an object.');
  }

  const response = value as Partial<TarotCardsResponse>;

  if (!Array.isArray(response.cards) || response.cards.length < 3) {
    throw new Error('Tarot API response must include at least 3 cards.');
  }

  if (!response.cards.every(isTarotCardData)) {
    throw new Error('Tarot API response includes invalid card data.');
  }

  const normalizedCards = response.cards.map((card) => normalizeTarotCardData(card as RawTarotCardData));
  console.log('[tarotCards] normalized cards', normalizedCards);
  return normalizedCards;
};

export const fetchTarotCards = async (): Promise<TarotCardData[]> => {
  if (!tarotApiUrl) {
    return fallbackTarotCards;
  }

  try {
    const response = await fetch(tarotApiUrl);

    if (!response.ok) {
      throw new Error(`Tarot API request failed: ${response.status}`);
    }

    const data = (await response.json()) as unknown;
    console.log('[tarotCards] received JSON', data);
    return parseTarotCardsResponse(data);
  } catch (error) {
    console.error('[tarotCards] failed to fetch or parse API response', error);
    return fallbackTarotCards;
  }
};
