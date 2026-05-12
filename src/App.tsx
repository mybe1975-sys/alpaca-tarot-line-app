import { useState } from 'react';
import CardSelectScreen from './components/CardSelectScreen';
import ResultScreen from './components/ResultScreen';
import StartScreen from './components/StartScreen';
import { tarotCards } from './data/tarotCards';
import type { AppScreen, TarotCardData } from './types/tarot';

const drawThreeCards = (): TarotCardData[] => {
  return [...tarotCards].sort(() => Math.random() - 0.5).slice(0, 3);
};

const pickMessage = (card: TarotCardData): string => {
  const index = Math.floor(Math.random() * card.messages.length);
  return card.messages[index];
};

function App() {
  const [screen, setScreen] = useState<AppScreen>('start');
  const [drawnCards, setDrawnCards] = useState<TarotCardData[]>([]);
  const [selectedCard, setSelectedCard] = useState<TarotCardData | null>(null);
  const [selectedMessage, setSelectedMessage] = useState('');

  const handleStart = () => {
    setDrawnCards(drawThreeCards());
    setSelectedCard(null);
    setSelectedMessage('');
    setScreen('select');
  };

  const handleSelectCard = (card: TarotCardData) => {
    setSelectedCard(card);
    setSelectedMessage(pickMessage(card));
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
      {screen === 'start' && <StartScreen onStart={handleStart} />}
      {screen === 'select' && (
        <CardSelectScreen cards={drawnCards} onSelectCard={handleSelectCard} />
      )}
      {screen === 'result' && selectedCard && (
        <ResultScreen card={selectedCard} message={selectedMessage} onReset={handleReset} />
      )}
    </main>
  );
}

export default App;
