type StartScreenProps = {
  errorMessage?: string;
  isLoading?: boolean;
  onStart: () => void | Promise<void>;
};

function StartScreen({ errorMessage, isLoading = false, onStart }: StartScreenProps) {
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
        {/* 表紙のサブタイトルは、指定どおり2行で読めるように改行を固定します。 */}
        <p className="lead">
          今のあなたに、
          <br />
          アルパカから小さなメッセージ
        </p>
      </div>

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <button className="primary-button" type="button" onClick={onStart} disabled={isLoading}>
        {isLoading ? 'カードを読み込み中...' : 'カードを引く'}
      </button>
    </section>
  );
}

export default StartScreen;
