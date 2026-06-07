import { tarotCards as fallbackTarotCards } from '../data/tarotCards';
import type { LuckyItemData, TarotCardData, TarotCardsResponse } from '../types/tarot';

const tarotApiUrl = import.meta.env.VITE_TAROT_API_URL as string | undefined;

type RawTarotCardData = Omit<TarotCardData, 'imageUrl' | 'messageTitles' | 'messages' | 'luckyItems'> & {
  imageUrl?: unknown;
  image_url?: unknown;
  messages?: unknown;
  messageTitles?: unknown;
  message_titles?: unknown;
  titles?: unknown;
  luckyItems?: unknown;
  lucky_items?: unknown;
  luckyItem?: unknown;
  lucky_item?: unknown;
};

type RawLuckyItemData = Partial<LuckyItemData> & {
  lucky_type?: unknown;
  lucky_content?: unknown;
};

type RawMessageItemData = RawLuckyItemData & {
  title?: unknown;
  message?: unknown;
};

const isStringArrayValue = (value: unknown): boolean => {
  return value === undefined || (Array.isArray(value) && value.every((item) => typeof item === 'string'));
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

const isMessageItemData = (value: unknown): value is RawMessageItemData => {
  return Boolean(value && typeof value === 'object' && 'message' in value);
};

const isTarotCardData = (value: unknown): value is TarotCardData => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const card = value as Partial<RawTarotCardData>;
  const imageUrl = card.imageUrl ?? card.image_url;
  const messageTitles = card.messageTitles ?? card.message_titles ?? card.titles;
  const luckyItems = card.luckyItems ?? card.lucky_items ?? card.luckyItem ?? card.lucky_item;

  return (
    typeof card.id === 'number' &&
    typeof card.nameJa === 'string' &&
    typeof card.nameEn === 'string' &&
    typeof card.meaning === 'string' &&
    Array.isArray(card.messages) &&
    card.messages.length > 0 &&
    card.messages.every((message: unknown) => {
      return typeof message === 'string'
        ? message.trim().length > 0
        : isMessageItemData(message) && normalizeString(message.message).length > 0;
    }) &&
    (imageUrl === undefined || typeof imageUrl === 'string') &&
    isStringArrayValue(messageTitles) &&
    isLuckyItemsValue(luckyItems)
  );
};

const normalizeString = (value: unknown): string => {
  return value === undefined || value === null ? '' : String(value);
};

const normalizeLuckyItemData = (luckyItem: RawLuckyItemData): LuckyItemData => {
  const luckyType = luckyItem.luckyType ?? luckyItem.lucky_type;
  const luckyContent = luckyItem.luckyContent ?? luckyItem.lucky_content;

  return {
    luckyType: normalizeString(luckyType),
    luckyContent: normalizeString(luckyContent),
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
  const rawMessages = Array.isArray(card.messages) ? card.messages : [];
  // GAS の返し方が配列分割でも行オブジェクトでも、同じ index の title/message/lucky に揃えます。
  const messageItems = rawMessages.filter((message) => isMessageItemData(message));
  const messageTitles = Array.isArray(card.messageTitles)
    ? card.messageTitles
    : Array.isArray(card.message_titles)
      ? card.message_titles
      : Array.isArray(card.titles)
        ? card.titles
        : messageItems.map((messageItem) => normalizeString(messageItem.title));
  const messages = messageItems.length > 0
    ? messageItems.map((messageItem) => normalizeString(messageItem.message))
    : rawMessages.map((message) => normalizeString(message));
  const luckyItems = card.luckyItems ?? card.lucky_items ?? card.luckyItem ?? card.lucky_item;

  return {
    id: card.id,
    nameJa: card.nameJa,
    nameEn: card.nameEn,
    meaning: card.meaning,
    messageTitles: messageTitles.map((title) => normalizeString(title)),
    messages,
    imageUrl: typeof imageUrl === 'string' ? imageUrl : undefined,
    luckyItems: normalizeLuckyItemsValue(luckyItems) ?? messageItems.map((messageItem) => normalizeLuckyItemData(messageItem)),
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
