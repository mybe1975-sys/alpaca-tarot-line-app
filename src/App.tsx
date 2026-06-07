import { useState } from 'react';
import { fetchTarotCards } from './api/tarotCards';
import CardSelectScreen from './components/CardSelectScreen';
import ResultScreen from './components/ResultScreen';
import StartScreen from './components/StartScreen';
import type { AppScreen, LuckyItemData, TarotCardData } from './types/tarot';

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
  const [selectedMessageTitle, setSelectedMessageTitle] = useState('');
  const [selectedMessage, setSelectedMessage] = useState('');
  const [selectedLuckyItem, setSelectedLuckyItem] = useState<LuckyItemData | null>(null);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleStart = async () => {
    setIsLoadingCards(true);
    setErrorMessage('');
    setSelectedCard(null);
    setSelectedMessageTitle('');
    setSelectedMessage('');
    setSelectedLuckyItem(null);

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
    // messageTitles/messages/luckyItems は同じ index で並ぶため、ここで1件だけ選びます。
    const messageIndex = pickMessageIndex(card);
    console.log('[App] selected message data', {
      messageIndex,
      messageTitle: card.messageTitles?.[messageIndex],
      message: card.messages[messageIndex],
      luckyItem: card.luckyItems?.[messageIndex],
      card,
    });
    setSelectedCard(card);
    setSelectedMessageTitle(card.messageTitles?.[messageIndex] ?? '');
    setSelectedMessage(card.messages[messageIndex]);
    setSelectedLuckyItem(card.luckyItems?.[messageIndex] ?? null);
    setScreen('result');
  };

  const handleReset = () => {
    setDrawnCards([]);
    setSelectedCard(null);
    setSelectedMessageTitle('');
    setSelectedMessage('');
    setSelectedLuckyItem(null);
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
          luckyItem={selectedLuckyItem}
          message={selectedMessage}
          messageTitle={selectedMessageTitle}
          onReset={handleReset}
        />
      )}
    </main>
  );
}

export default App;
