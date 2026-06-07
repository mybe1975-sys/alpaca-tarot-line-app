import TarotCard from './TarotCard';
import type { LuckyItemData, TarotCardData } from '../types/tarot';

type ResultScreenProps = {
  card: TarotCardData;
  luckyItem: LuckyItemData | null;
  message: string;
  messageTitle: string;
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

function ResultScreen({ card, luckyItem, message, messageTitle, onReset }: ResultScreenProps) {
  // ラッキー情報は、選ばれたメッセージと同じ index の1件だけ表示します。
  const luckyType = luckyItem?.luckyType.trim() ?? '';
  const luckyContent = luckyItem?.luckyContent.trim() ?? '';
  const shouldShowLuckyItem = luckyType !== '' && luckyContent !== '';
  console.log('[ResultScreen] message title data', { messageTitle, message, luckyItem, card });

  return (
    <section className="screen result-screen" aria-labelledby="result-title">
      <div className="result-card-wrap">
        <TarotCard card={card} isFaceUp />
      </div>

      <div className="result-panel">
        <p className="eyebrow">Your message</p>
        <h1 id="result-title">{card.nameJa}</h1>
        <p className="english-name">{card.nameEn}</p>

        <div className="message-reading">
          {messageTitle.trim() !== '' && <p className="message-title">{messageTitle}</p>}
          <p className="message-body">{message}</p>
        </div>

        {shouldShowLuckyItem && luckyItem && (
          <div className="lucky-reading">
            <p className="lucky-label">{getLuckyLabel(luckyItem.luckyType)}</p>
            <p className="lucky-content">{luckyItem.luckyContent}</p>
          </div>
        )}
      </div>

      <p className="consultation-note">
        もっと詳しく知りたい方は、あなただけのタロット占い個別診断もしています。ぜひお気軽にご相談ください。
      </p>

      <button className="primary-button secondary-tone" type="button" onClick={onReset}>
        もう一度占う
      </button>
    </section>
  );
}

export default ResultScreen;
