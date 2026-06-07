# アルパカタロット

LINE 上での利用を想定した、スマートフォン向けのタロット占い Web アプリです。
React + TypeScript + Vite で構成し、バックエンドなしで動作します。

## セットアップ

```bash
npm install
```

## 開発サーバー起動

```bash
npm run dev
```

ブラウザで表示された Vite の URL を開いて確認します。スマートフォン幅での確認を推奨します。

## ビルド

```bash
npm run build
```

ビルド結果は `dist/` に出力されます。

## Google スプレッドシート連携

タロットカードの文言は、GAS API を設定すると Google スプレッドシートから取得できます。
未設定または取得失敗時は `src/data/tarotCards.ts` のデータをフォールバックとして使用します。

`.env` または Vercel の Environment Variables に次を設定します。

```env
VITE_TAROT_API_URL=https://script.google.com/macros/s/your-deployment-id/exec
```

スプレッドシートの列は次の形を想定します。

```text
id
nameJa
nameEn
image_url
meaning
message1
message2
message3
```

GAS API は React 側の型に合わせて、次の JSON を返してください。

```json
{
  "cards": [
    {
      "id": 0,
      "nameJa": "愚者",
      "nameEn": "The Fool",
      "imageUrl": "/images/cards/alpaca/137103_the-fool.png",
      "meaning": "新しい始まり、自由な心、思い切った一歩",
      "messages": [
        "今日は小さな冒険に向いています。",
        "考えすぎた荷物を少し下ろす日です。",
        "未知の道にも、あなたを待つやさしい発見があります。"
      ]
    }
  ]
}
```

GAS 側では `message1`, `message2`, `message3` など空でないメッセージ列を `messages` 配列にまとめて返す構成にしてください。画像URLは `image_url` または `imageUrl` として返せます。React 側では `cards` が3件以上あり、各カードに `id`, `nameJa`, `nameEn`, `meaning`, `messages` があることを確認してから表示します。

### GAS API 用スプレッドシート列

GAS API で 3 シート構成にする場合は、次の列名を 1 行目に設定してください。

`01_cards`

```text
card_id
name_ja
name_en
image_url
meaning
is_enabled
sort_order
```

`02_messages`

```text
card_id
title
message
lucky_type
lucky_content
is_enabled
sort_order
```

`03_settings` は今回は任意です。使う場合は次の形を想定します。

```text
key
value
is_enabled
```

- `card_id`: React 側へ返す `id` です。数値で入力してください。
- `is_enabled`: `FALSE` のカード・メッセージは API レスポンスから除外します。空欄または `TRUE` は有効として扱います。
- `sort_order`: 任意です。未入力の場合は `card_id` またはシート上の順序で並びます。
- `image_url`: React 側では `imageUrl` として返します。
- `title`: 結果画面で本文の上に表示するメッセージタイトルです。
- `lucky_type`: `action` または `item` を入力すると、React 側では「ラッキーアクション」または「ラッキーアイテム」として表示します。
- `lucky_content`: 結果画面に表示するラッキー情報の内容です。

### Google Apps Script コード

Apps Script エディタに次のコード全文を貼り付け、Web アプリとしてデプロイしてください。

```javascript
const SHEET_NAMES = {
  cards: '01_cards',
  messages: '02_messages',
  settings: '03_settings',
};

function doGet(e) {
  const data = buildTarotCardsResponse_();
  return createJsonResponse_(data, e);
}

function buildTarotCardsResponse_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const cardRows = readSheetObjects_(spreadsheet, SHEET_NAMES.cards);
  const messageRows = readSheetObjects_(spreadsheet, SHEET_NAMES.messages);

  const messageGroupsByCardId = messageRows
    .filter((row) => isEnabled_(row.is_enabled))
    .filter((row) => hasValue_(row.card_id) && hasValue_(row.message))
    .sort(compareBySortOrder_)
    .reduce((result, row) => {
      const cardId = normalizeId_(row.card_id);
      if (!result[cardId]) {
        result[cardId] = [];
      }
      result[cardId].push({
        title: String(row.title || '').trim(),
        message: String(row.message || '').trim(),
        luckyType: String(row.lucky_type || '').trim(),
        luckyContent: String(row.lucky_content || '').trim(),
      });
      return result;
    }, {});

  const cards = cardRows
    .filter((row) => isEnabled_(row.is_enabled))
    .filter((row) => hasValue_(row.card_id))
    .sort(compareCards_)
    .map((row) => {
      const id = normalizeId_(row.card_id);
      return {
        id,
        nameJa: String(row.name_ja || '').trim(),
        nameEn: String(row.name_en || '').trim(),
        imageUrl: String(row.image_url || '').trim(),
        meaning: String(row.meaning || '').trim(),
        messageTitles: (messageGroupsByCardId[id] || []).map((messageGroup) => messageGroup.title),
        messages: (messageGroupsByCardId[id] || []).map((messageGroup) => messageGroup.message),
        luckyItems: (messageGroupsByCardId[id] || []).map((messageGroup) => ({
          luckyType: messageGroup.luckyType,
          luckyContent: messageGroup.luckyContent,
          lucky_type: messageGroup.luckyType,
          lucky_content: messageGroup.luckyContent,
        })),
      };
    })
    .filter((card) => {
      return (
        Number.isFinite(card.id) &&
        card.nameJa &&
        card.nameEn &&
        card.meaning &&
        card.messages.length > 0
      );
    });

  return { cards };
}

function readSheetObjects_(spreadsheet, sheetName) {
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return [];
  }

  const headers = values[0].map((header) => String(header).trim());

  return values.slice(1).map((row) => {
    return headers.reduce((object, header, index) => {
      if (header) {
        object[header] = row[index];
      }
      return object;
    }, {});
  });
}

function createJsonResponse_(data, e) {
  const json = JSON.stringify(data);
  const callback = e && e.parameter && e.parameter.callback;

  if (callback) {
    return ContentService
      .createTextOutput(String(callback) + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function isEnabled_(value) {
  if (value === false || value === 0) {
    return false;
  }

  const normalized = String(value || '').trim().toLowerCase();
  return !['false', '0', 'no', 'disabled', 'off'].includes(normalized);
}

function hasValue_(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

function normalizeId_(value) {
  return Number(value);
}

function normalizeSortOrder_(value, fallback) {
  if (!hasValue_(value)) {
    return fallback;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function compareCards_(a, b) {
  const aOrder = normalizeSortOrder_(a.sort_order, normalizeId_(a.card_id));
  const bOrder = normalizeSortOrder_(b.sort_order, normalizeId_(b.card_id));
  return aOrder - bOrder;
}

function compareBySortOrder_(a, b) {
  const aOrder = normalizeSortOrder_(a.sort_order, 0);
  const bOrder = normalizeSortOrder_(b.sort_order, 0);
  return aOrder - bOrder;
}
```

Apps Script の `ContentService` では任意の CORS ヘッダーを直接追加できません。通常の `fetch()` で利用する場合は、Web アプリの公開範囲を `全員` または `Anyone` にして、`/exec` URL を `VITE_TAROT_API_URL` に設定してください。必要に応じて `?callback=...` の JSONP 形式でも返せるようにしています。

## Vercel 向け設定

このプロジェクトには `vercel.json` を追加済みです。

- Framework: `vite`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`
- SPA 用 rewrite: すべてのパスを `/index.html` に戻す

Vercel の管理画面で自動検出された値が違う場合は、上記に合わせてください。

## フォルダ構成

```text
src/
  App.tsx
  main.tsx
  components/
    StartScreen.tsx
    CardSelectScreen.tsx
    ResultScreen.tsx
    TarotCard.tsx
  data/
    tarotCards.ts
  styles/
    global.css
  types/
    tarot.ts
```

- `src/data/tarotCards.ts`: 大アルカナ22枚のカードデータ
- `src/App.tsx`: 画面遷移、3枚抽選、結果メッセージ選択
- `src/components/`: 各画面とカード表示のコンポーネント
- `src/styles/global.css`: スマートフォン向けの全体デザイン

## Git 初期化

このフォルダを Git 管理する場合は、プロジェクト直下で次を実行します。

```bash
git init
git add .
git commit -m "Initial alpaca tarot app"
git branch -M main
```

`node_modules/`、`dist/`、`.env`、`.vercel/` などは `.gitignore` で除外しています。

## GitHub 公開手順

1. GitHub で新しいリポジトリを作成します。
2. リポジトリ名は例として `alpaca-tarot-line-app` にします。
3. GitHub 側では README、`.gitignore`、license を自動生成しない設定にすると、このローカル内容と衝突しにくくなります。
4. 作成後に表示される URL を使って remote を追加します。

HTTPS の例:

```bash
git remote add origin https://github.com/OWNER/alpaca-tarot-line-app.git
git push -u origin main
```

SSH の例:

```bash
git remote add origin git@github.com:OWNER/alpaca-tarot-line-app.git
git push -u origin main
```

設定確認:

```bash
git remote -v
git status
```

## Vercel デプロイ手順

GitHub 連携でのデプロイが一番簡単です。

1. Vercel にログインします。
2. `Add New...` から `Project` を選びます。
3. GitHub の `alpaca-tarot-line-app` リポジトリを Import します。
4. Framework Preset が `Vite` になっていることを確認します。
5. Build Command が `npm run build`、Output Directory が `dist` になっていることを確認します。
6. `Deploy` を押します。
7. デプロイ完了後に発行される `https://...vercel.app` の URL を控えます。

GitHub と接続した Vercel プロジェクトでは、通常 `main` ブランチへの push が本番デプロイ、Pull Request や他ブランチへの push がプレビューデプロイになります。

Vercel CLI を使う場合:

```bash
npm install -g vercel
vercel
vercel --prod
```

## LIFF 連携手順

LIFF SDK を追加する場合は、まず依存関係を追加します。

```bash
npm install @line/liff
```

ローカル用に `.env` を作成します。`.env.example` を参考にしてください。

```env
VITE_LIFF_ID=your-liff-id
```

実装時は `src/main.tsx` または新規作成する `src/liff.ts` で `liff.init()` を呼び出します。

LINE Developers Console 側の流れ:

1. LINE Developers Console で LINE Login チャネルを作成します。
2. LIFF タブを開き、LIFF アプリを追加します。
3. Endpoint URL に Vercel の本番 URL を設定します。例: `https://your-project.vercel.app`
4. Size はスマホ向けに `Full` または `Tall` を選びます。
5. 必要な Scope を選びます。プロフィールや ID トークンが不要なら最小限にします。
6. 発行された LIFF ID を `.env` と Vercel の Environment Variables に `VITE_LIFF_ID` として登録します。
7. Vercel で再デプロイします。
8. 発行された LIFF URL、例 `https://liff.line.me/{liffId}` を LINE アプリから開いて確認します。

Vercel の環境変数設定:

1. Vercel の対象 Project を開きます。
2. `Settings` -> `Environment Variables` を開きます。
3. Name に `VITE_LIFF_ID`、Value に LIFF ID を入れます。
4. Production、Preview、Development の必要な環境に追加します。
5. 変更後に再デプロイします。

将来的な LINE シェア機能は、`src/components/ResultScreen.tsx` に共有ボタンを追加し、選ばれたカード名とメッセージを渡す形で実装できます。
