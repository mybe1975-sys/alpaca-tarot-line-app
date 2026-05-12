import TarotCard from './TarotCard';
import type { TarotCardData } from '../types/tarot';

type ResultScreenProps = {
  card: TarotCardData;
  message: string;
  onReset: () => void;
};

function ResultScreen({ card, message, onReset }: ResultScreenProps) {
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
