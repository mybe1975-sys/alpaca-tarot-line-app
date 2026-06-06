import { useState } from 'react';
import { fetchTarotCards } from './api/tarotCards';
import CardSelectScreen from './components/CardSelectScreen';
import ResultScreen from './components/ResultScreen';
import StartScreen from './components/StartScreen';
import type { AppScreen, TarotCardData } from './types/tarot';

const drawThreeCards = (cards: TarotCardData[]): TarotCardData[] => {
  return [...cards].sort(() => Math.random() - 0.5).slice(0, 3);
};

const pickMessageIndex = (card: TarotCardData): number => {
  const index = Math.floor(Math.random() * card.messages.length);
  return index;
};

function App() {
  const [screen, setScreen] = useState<AppScreen>('start');
  const [drawnCards, setDrawnCards] = useState<TarotCardData[]>([]);
  const [selectedCard, setSelectedCard] = useState<TarotCardData | null>(null);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleStart = async () => {
    setIsLoadingCards(true);
    setErrorMessage('');
    setSelectedCard(null);
    setSelectedMessage('');

    try {
      const cards = await fetchTarotCards();
      setDrawnCards(drawThreeCards(cards));
      setScreen('select');
    } catch {
      setErrorMessage('カード情報を読み込めませんでした。時間をおいてもう一度お試しください。');
    } finally {
      setIsLoadingCards(false);
    }
  };

  const handleSelectCard = (card: TarotCardData) => {
    const messageIndex = pickMessageIndex(card);
    setSelectedCard(card);
    setSelectedMessage(card.messages[messageIndex]);
    setScreen('result');
  };

  const handleReset = () => {
    setDrawnCards([]);
    setSelectedCard(null);
    setSelectedMessage('');
    setScreen('start');
  };

  return (
    <main className="app-shell">
      {screen === 'start' && (
        <StartScreen
          errorMessage={errorMessage}
          isLoading={isLoadingCards}
          onStart={handleStart}
        />
      )}
      {screen === 'select' && (
        <CardSelectScreen cards={drawnCards} onSelectCard={handleSelectCard} />
      )}
      {screen === 'result' && selectedCard && (
        <ResultScreen
          card={selectedCard}
          luckyItems={selectedCard.luckyItems ?? []}
          message={selectedMessage}
          onReset={handleReset}
        />
      )}
    </main>
  );
}

export default App;
