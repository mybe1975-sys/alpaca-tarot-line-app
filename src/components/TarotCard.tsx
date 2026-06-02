import { useState, type CSSProperties } from 'react';
import type { TarotCardData } from '../types/tarot';

type TarotCardProps = {
  card: TarotCardData;
  index?: number;
  isFaceUp: boolean;
  onSelect?: () => void;
};

function TarotCard({ card, index = 0, isFaceUp, onSelect }: TarotCardProps) {
  const style = { '--delay': `${index * 90}ms` } as CSSProperties;

  if (onSelect) {
    return (
      <button
        className="tarot-card tarot-card-button"
        type="button"
        style={style}
        onClick={onSelect}
        aria-label={`${index + 1}枚目のカードを選ぶ`}
      >
        <CardContent card={card} isFaceUp={isFaceUp} />
      </button>
    );
  }

  return (
    <div className="tarot-card tarot-card-static is-face-up" style={style} aria-label={card.nameJa}>
      <CardContent card={card} isFaceUp={isFaceUp} />
    </div>
  );
}

function CardContent({ card, isFaceUp }: { card: TarotCardData; isFaceUp: boolean }) {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = card.imageUrl?.trim();

  if (isFaceUp) {
    if (imageUrl && !hasImageError) {
      return (
        <div className="card-face card-front card-image-face">
          <img
            className="card-image"
            src={imageUrl}
            alt={`${card.nameJa} ${card.nameEn}`}
            onError={() => setHasImageError(true)}
          />
        </div>
      );
    }

    return (
      <div className="card-face card-front">
        <span className="card-number">{String(card.id).padStart(2, '0')}</span>
        <span className="card-symbol" aria-hidden="true">
          ✦
        </span>
        <span className="card-name-ja">{card.nameJa}</span>
        <span className="card-name-en">{card.nameEn}</span>
      </div>
    );
  }

  return (
    <div className="card-face card-back">
      <span className="card-back-star" aria-hidden="true">
        ✧
      </span>
      <span className="card-back-title">Alpaca Tarot</span>
      <span className="card-back-line" />
    </div>
  );
}

export default TarotCard;
