type StartScreenProps = {
  errorMessage?: string;
  isLoading?: boolean;
  onStart: () => void | Promise<void>;
};

function StartScreen({ errorMessage, isLoading = false, onStart }: StartScreenProps) {
  return (
    <section className="screen start-screen" aria-labelledby="app-title">
      {/* トップ画面では、配置済みのタイトル画像をメインビジュアルとして表示します。 */}
      <img
        className="title-image"
        src="/images/cards/alpaca/137701_title.jpg"
        alt="アルパカタロット"
      />

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
