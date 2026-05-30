import { tarotCards as fallbackTarotCards } from '../data/tarotCards';
import type { TarotCardData, TarotCardsResponse } from '../types/tarot';

const tarotApiUrl = import.meta.env.VITE_TAROT_API_URL as string | undefined;

const isTarotCardData = (value: unknown): value is TarotCardData => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const card = value as Partial<TarotCardData>;

  return (
    typeof card.id === 'number' &&
    typeof card.nameJa === 'string' &&
    typeof card.nameEn === 'string' &&
    typeof card.meaning === 'string' &&
    Array.isArray(card.messages) &&
    card.messages.length > 0 &&
    card.messages.every((message) => typeof message === 'string' && message.trim().length > 0)
  );
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

  return response.cards;
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
    return parseTarotCardsResponse(data);
  } catch (error) {
    console.error(error);
    return fallbackTarotCards;
  }
};
