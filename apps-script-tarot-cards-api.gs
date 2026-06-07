const SHEET_NAMES = {
  cards: '01_cards',
  messages: '02_messages',
};

const MESSAGE_COLUMN_INDEXES = {
  title: 3,
};

function doGet(e) {
  try {
    return createJsonOutput_(buildTarotCardsResponse_(), e);
  } catch (error) {
    return createJsonOutput_(
      {
        cards: [],
        error: String(error && error.message ? error.message : error),
      },
      e
    );
  }
}

function buildTarotCardsResponse_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const cardRows = readSheetRows_(spreadsheet, SHEET_NAMES.cards);
  const messageRows = readSheetRows_(spreadsheet, SHEET_NAMES.messages);
  const messageGroupsByCardId = buildMessageGroupsByCardId_(messageRows);

  const cards = cardRows
    .filter((row) => isEnabled_(row.is_enabled))
    .filter((row) => hasValue_(row.card_id))
    .sort(compareCards_)
    .map((row) => {
      const id = normalizeNumber_(row.card_id);
      return {
        id,
        nameJa: normalizeString_(row.name_ja),
        nameEn: normalizeString_(row.name_en),
        imageUrl: normalizeString_(row.image_url),
        meaning: normalizeString_(row.meaning),
        messageTitles: (messageGroupsByCardId[String(id)] || []).map((messageGroup) => messageGroup.title),
        messages: (messageGroupsByCardId[String(id)] || []).map((messageGroup) => messageGroup.message),
        luckyItems: (messageGroupsByCardId[String(id)] || []).map((messageGroup) => ({
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
        card.nameJa !== '' &&
        card.nameEn !== '' &&
        card.meaning !== '' &&
        card.messages.length > 0
      );
    });

  return { cards };
}

function buildMessageGroupsByCardId_(messageRows) {
  return messageRows
    .filter((row) => isEnabled_(row.is_enabled))
    .filter((row) => hasValue_(row.card_id))
    .filter((row) => hasValue_(row.message))
    .sort(compareMessages_)
    .reduce((messageGroupsByCardId, row) => {
      const cardId = String(normalizeNumber_(row.card_id));
      if (!messageGroupsByCardId[cardId]) {
        messageGroupsByCardId[cardId] = [];
      }
      messageGroupsByCardId[cardId].push({
        title: normalizeString_(row.title || row.__values[MESSAGE_COLUMN_INDEXES.title]),
        message: normalizeString_(row.message),
        luckyType: normalizeString_(row.lucky_type),
        luckyContent: normalizeString_(row.lucky_content),
      });
      return messageGroupsByCardId;
    }, {});
}

function readSheetRows_(spreadsheet, sheetName) {
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return [];
  }

  const headers = values[0].map((header) => normalizeString_(header));

  return values.slice(1).map((valuesRow, rowIndex) => {
    return headers.reduce(
      (row, header, columnIndex) => {
        if (header !== '') {
          row[header] = valuesRow[columnIndex];
        }
        return row;
      },
      { __rowIndex: rowIndex + 2, __values: valuesRow }
    );
  });
}

function createJsonOutput_(data, e) {
  const json = JSON.stringify(data);
  const callback = e && e.parameter && e.parameter.callback;

  if (callback) {
    return ContentService.createTextOutput(String(callback) + '(' + json + ');').setMimeType(
      ContentService.MimeType.JAVASCRIPT
    );
  }

  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function isEnabled_(value) {
  if (value === false || value === 0) {
    return false;
  }

  const normalized = normalizeString_(value).toLowerCase();
  return normalized !== 'false' && normalized !== '0';
}

function hasValue_(value) {
  return value !== null && value !== undefined && normalizeString_(value) !== '';
}

function normalizeString_(value) {
  return String(value === null || value === undefined ? '' : value).trim();
}

function normalizeNumber_(value) {
  return Number(value);
}

function normalizeSortOrder_(row, fallback) {
  if (!hasValue_(row.sort_order)) {
    return fallback;
  }

  const sortOrder = normalizeNumber_(row.sort_order);
  return Number.isFinite(sortOrder) ? sortOrder : fallback;
}

function compareCards_(a, b) {
  const aId = normalizeNumber_(a.card_id);
  const bId = normalizeNumber_(b.card_id);
  const aOrder = normalizeSortOrder_(a, Number.isFinite(aId) ? aId : a.__rowIndex);
  const bOrder = normalizeSortOrder_(b, Number.isFinite(bId) ? bId : b.__rowIndex);
  return aOrder - bOrder;
}

function compareMessages_(a, b) {
  const aOrder = normalizeSortOrder_(a, a.__rowIndex);
  const bOrder = normalizeSortOrder_(b, b.__rowIndex);
  return aOrder - bOrder;
}
