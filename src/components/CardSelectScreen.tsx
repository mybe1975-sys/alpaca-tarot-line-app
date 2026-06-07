import TarotCard from './TarotCard';
import type { TarotCardData } from '../types/tarot';

type CardSelectScreenProps = {
  cards: TarotCardData[];
  onSelectCard: (card: TarotCardData) => void;
};

function CardSelectScreen({ cards, onSelectCard }: CardSelectScreenProps) {
  return (
    <section className="screen select-screen" aria-labelledby="select-title">
      <div className="compact-header">
        <p className="eyebrow">Choose one card</p>
        {/* 選択画面の見出しは、スマホで読みやすい2行に固定します。 */}
        <h1 id="select-title">
          気になるカードを
          <br />
          1枚選んでください
        </h1>
      </div>

      <div className="card-row" aria-label="タロットカードを3枚表示">
        {cards.map((card, index) => (
          <TarotCard
            key={card.id}
            card={card}
            index={index}
            isFaceUp={false}
            onSelect={() => onSelectCard(card)}
          />
        ))}
      </div>

      <p className="hint-text">直感で、いちばん目に留まるカードをタップ</p>
    </section>
  );
}

export default CardSelectScreen;
