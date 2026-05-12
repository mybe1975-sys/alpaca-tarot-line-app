type StartScreenProps = {
  onStart: () => void;
};

function StartScreen({ onStart }: StartScreenProps) {
  return (
    <section className="screen start-screen" aria-labelledby="app-title">
      <div className="alpaca-mark" aria-hidden="true">
        <span className="alpaca-ear alpaca-ear-left" />
        <span className="alpaca-ear alpaca-ear-right" />
        <span className="alpaca-face">
          <span className="alpaca-eye alpaca-eye-left" />
          <span className="alpaca-eye alpaca-eye-right" />
          <span className="alpaca-nose" />
        </span>
      </div>

      <div className="title-area">
        <p className="eyebrow">Alpaca Tarot</p>
        <h1 id="app-title">アルパカタロット</h1>
        <p className="lead">今日のあなたに、アルパカから小さなメッセージ</p>
      </div>

      <button className="primary-button" type="button" onClick={onStart}>
        カードを引く
      </button>
    </section>
  );
}

export default StartScreen;
