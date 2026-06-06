import TarotCard from './TarotCard';
import type { LuckyItemData, TarotCardData } from '../types/tarot';

type ResultScreenProps = {
  card: TarotCardData;
  luckyItems: LuckyItemData[];
  message: string;
  onReset: () => void;
};

const getLuckyLabel = (luckyType: string): string => {
  const normalizedType = luckyType.trim().toLowerCase();

  if (normalizedType === 'action' || normalizedType === 'ラッキーアクション') {
    return 'ラッキーアクション';
  }

  if (normalizedType === 'item' || normalizedType === 'ラッキーアイテム') {
    return 'ラッキーアイテム';
  }

  return 'ラッキー情報';
};

function ResultScreen({ card, luckyItems, message, onReset }: ResultScreenProps) {
  const visibleLuckyItems = luckyItems.filter((luckyItem) => luckyItem.luckyContent.trim() !== '');
  console.log('[ResultScreen] card lucky fields', {
    luckyItems: card.luckyItems,
    lucky_items: (card as { lucky_items?: unknown }).lucky_items,
    luckyItem: (card as { luckyItem?: unknown }).luckyItem,
    propLuckyItems: luckyItems,
    visibleLuckyItems,
  });

  return (
    <section className="screen result-screen" aria-labelledby="result-title">
      <div className="result-card-wrap">
        <TarotCard card={card} isFaceUp />
      </div>

      <div className="result-panel">
        <p className="eyebrow">Your message</p>
        <h1 id="result-title">{card.nameJa}</h1>
        <p className="english-name">{card.nameEn}</p>

        <dl className="reading-list">
          <div>
            <dt>カードの意味</dt>
            <dd>{card.meaning}</dd>
          </div>
          <div>
            <dt>今日のメッセージ</dt>
            <dd>{message}</dd>
          </div>
          {visibleLuckyItems.map((luckyItem, index) => (
            <div className="lucky-reading" key={`${luckyItem.luckyType}-${index}`}>
              <dt>{getLuckyLabel(luckyItem.luckyType)}</dt>
              <dd>{luckyItem.luckyContent}</dd>
            </div>
          ))}
        </dl>

        <div className="alpaca-balloon">
          <span className="mini-alpaca" aria-hidden="true">
            ᵔᴥᵔ
          </span>
          <p>アルパカは、あなたのペースで進めば大丈夫と言っています。</p>
        </div>
      </div>

      <button className="primary-button secondary-tone" type="button" onClick={onReset}>
        もう一度占う
      </button>
    </section>
  );
}

export default ResultScreen;
