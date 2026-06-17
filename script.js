"use strict";

/**
 * ガチャに登場するカード一覧。
 *
 * weightは同じレアリティ内での相対的な抽選比率。
 * 現在はすべて1なので、同一レアリティ内では均等に抽選される。
 */
const CARD_MASTER = [
  {
    id: "C-001",
    name: "反証可能性",
    category: "PHILOSOPHY",
    rarity: "N",
    symbol: "⚗",
    description: "科学的主張は、誤りだと示されうる条件を持つべきだという考え。",
    quote: "TEST IT",
    weight: 1,
  },
  {
    id: "C-002",
    name: "モデル生物",
    category: "BIOLOGY",
    rarity: "N",
    symbol: "🧬",
    description: "生命現象を理解するために、研究上の代表として用いられる生物。",
    quote: "REPRESENT",
    weight: 1,
  },
  {
    id: "C-003",
    name: "仮説演繹法",
    category: "METHOD",
    rarity: "N",
    symbol: "∴",
    description: "仮説から予測を導き、観察や実験によって検討する推論方法。",
    quote: "PREDICT",
    weight: 1,
  },
  {
    id: "C-004",
    name: "再現可能性",
    category: "METHOD",
    rarity: "N",
    symbol: "↻",
    description: "同じ手続きから、整合的な結果を再び得られるという性質。",
    quote: "REPEAT",
    weight: 1,
  },
  {
    id: "C-005",
    name: "因果介入",
    category: "CAUSATION",
    rarity: "R",
    symbol: "⟶",
    description: "対象を操作したときに結果が変化するかを通じて、因果を捉える。",
    quote: "INTERVENE",
    weight: 1,
  },
  {
    id: "C-006",
    name: "パラダイム転換",
    category: "HISTORY",
    rarity: "R",
    symbol: "◈",
    description: "研究を支える基本的な見方や問題設定が、大きく組み替わること。",
    quote: "SHIFT",
    weight: 1,
  },
  {
    id: "C-007",
    name: "機械論的説明",
    category: "EXPLANATION",
    rarity: "R",
    symbol: "⚙",
    description: "実体・活動・組織化から、現象が生じる仕組みを説明する。",
    quote: "HOW IT WORKS",
    weight: 1,
  },
  {
    id: "C-008",
    name: "グルーのパラドクス",
    category: "INDUCTION",
    rarity: "R",
    symbol: "◆",
    description: "どの述語が帰納に適しているのかを問い直す、ネルソン・グッドマンの問題。",
    quote: "GRUE",
    weight: 1,
  },
  {
    id: "C-009",
    name: "目的論的ヒューリスティック",
    category: "TELEOLOGY",
    rarity: "SR",
    symbol: "◎",
    description: "対象が何を維持・達成するかという観点から、仮説探索を進める。",
    quote: "FOR THE SAKE OF",
    weight: 1,
  },
  {
    id: "C-010",
    name: "オートポイエーシス",
    category: "LIFE",
    rarity: "SR",
    symbol: "∞",
    description: "構成要素の産出ネットワークが、自らの組織を再生産するという生命観。",
    quote: "SELF-PRODUCING",
    weight: 1,
  },
  {
    id: "C-011",
    name: "差異を生み出す差異",
    category: "INFORMATION",
    rarity: "SR",
    symbol: "Δ",
    description: "ある体系にとって効果を持つ差異として、情報を捉える表現。",
    quote: "A DIFFERENCE",
    weight: 1,
  },
  {
    id: "C-012",
    name: "探究するエージェント",
    category: "AGENCY",
    rarity: "SSR",
    symbol: "✦",
    description: "環境を探索し、状態を評価し、次の可能性を切り開く行為主体。",
    quote: "OPEN THE SPACE",
    weight: 1,
  },
];

/**
 * レアリティごとの提供割合。
 * 合計値は必ず100にする。
 */
const RARITY_RATES = [
  { rarity: "SSR", rate: 5 },
  { rarity: "SR", rate: 20 },
  { rarity: "R", rate: 35 },
  { rarity: "N", rate: 40 },
];

const STORAGE_KEYS = {
  lastDrawDate: "daily-gacha:last-draw-date",
  lastCardId: "daily-gacha:last-card-id",
  collection: "daily-gacha:collection",
};

const drawButton = document.querySelector("#draw-button");
const drawStatus = document.querySelector("#draw-status");
const countdown = document.querySelector("#countdown");
const resultSection = document.querySelector("#result-section");
const resultCard = document.querySelector("#result-card");
const resultCategory = document.querySelector("#result-category");
const resultRarity = document.querySelector("#result-rarity");
const resultSymbol = document.querySelector("#result-symbol");
const resultName = document.querySelector("#result-name");
const resultDescription = document.querySelector("#result-description");
const resultNumber = document.querySelector("#result-number");
const resultQuote = document.querySelector("#result-quote");
const resultMessage = document.querySelector("#result-message");
const collectionGrid = document.querySelector("#collection-grid");
const collectionCount = document.querySelector("#collection-count");
const revealDialog = document.querySelector("#reveal-dialog");

/**
 * 現在の端末時刻を「YYYY-MM-DD」形式で返す。
 * UTCではなく利用者のローカル日付を使う。
 *
 * @param {Date} [date=new Date()] 対象日時
 * @returns {string} ローカル日付
 *
 * @example
 * getLocalDateKey(new Date(2026, 5, 17));
 * // "2026-06-17"
 */
function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 0以上1未満の乱数を返す。
 * 利用可能な場合はWeb Crypto APIを使い、通常のMath.randomより偏りにくくする。
 *
 * @returns {number} 0以上1未満の乱数
 *
 * @example
 * const value = secureRandom();
 * // 0 <= value < 1
 */
function secureRandom() {
  if (window.crypto?.getRandomValues) {
    const buffer = new Uint32Array(1);
    window.crypto.getRandomValues(buffer);
    return buffer[0] / 2 ** 32;
  }

  return Math.random();
}

/**
 * localStorageから所持カード情報を取得する。
 *
 * @returns {Record<string, number>} カードIDをキー、所持枚数を値とするオブジェクト
 */
function loadCollection() {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEYS.collection);
    return rawValue ? JSON.parse(rawValue) : {};
  } catch (error) {
    console.warn("コレクション情報を読み込めませんでした。", error);
    return {};
  }
}

/**
 * 所持カード情報をlocalStorageに保存する。
 *
 * @param {Record<string, number>} collection 保存対象
 * @returns {void}
 */
function saveCollection(collection) {
  localStorage.setItem(STORAGE_KEYS.collection, JSON.stringify(collection));
}

/**
 * 指定レアリティのカードから、weightを考慮して1枚選ぶ。
 *
 * @param {string} rarity レアリティ
 * @returns {object} 抽選されたカード
 */
function selectCardByRarity(rarity) {
  const candidates = CARD_MASTER.filter((card) => card.rarity === rarity);
  const totalWeight = candidates.reduce((sum, card) => sum + card.weight, 0);
  let randomValue = secureRandom() * totalWeight;

  for (const card of candidates) {
    randomValue -= card.weight;

    if (randomValue < 0) {
      return card;
    }
  }

  return candidates[candidates.length - 1];
}

/**
 * レアリティ提供割合に従ってカードを1枚抽選する。
 *
 * @returns {object} 抽選されたカード
 *
 * @example
 * const card = drawCard();
 * console.log(card.name);
 */
function drawCard() {
  const roll = secureRandom() * 100;
  let cumulativeRate = 0;

  for (const setting of RARITY_RATES) {
    cumulativeRate += setting.rate;

    if (roll < cumulativeRate) {
      return selectCardByRarity(setting.rarity);
    }
  }

  return selectCardByRarity("N");
}

/**
 * 本日すでにガチャを引いたか確認する。
 *
 * @returns {boolean} 本日抽選済みならtrue
 */
function hasDrawnToday() {
  const lastDrawDate = localStorage.getItem(STORAGE_KEYS.lastDrawDate);
  return lastDrawDate === getLocalDateKey();
}

/**
 * 直近で引いたカードを取得する。
 *
 * @returns {object|null} カードが見つからない場合はnull
 */
function getLastDrawnCard() {
  const lastCardId = localStorage.getItem(STORAGE_KEYS.lastCardId);
  return CARD_MASTER.find((card) => card.id === lastCardId) ?? null;
}

/**
 * レアリティに対応したCSSクラスを返す。
 *
 * @param {string} rarity レアリティ
 * @returns {string} CSSクラス名
 */
function getRarityClass(rarity) {
  return `card--${rarity.toLowerCase()}`;
}

/**
 * 抽選結果カードを画面に表示する。
 *
 * @param {object} card 表示対象カード
 * @param {boolean} [isNewDraw=false] 今回新たに引いたカードか
 * @returns {void}
 */
function renderResult(card, isNewDraw = false) {
  resultCard.className = `card card--large ${getRarityClass(card.rarity)}`;
  resultCategory.textContent = card.category;
  resultRarity.textContent = card.rarity;
  resultSymbol.textContent = card.symbol;
  resultName.textContent = card.name;
  resultDescription.textContent = card.description;
  resultNumber.textContent = card.id;
  resultQuote.textContent = card.quote;
  resultMessage.textContent = isNewDraw
    ? `${card.rarity}「${card.name}」を獲得しました。`
    : "本日獲得したカードです。";

  resultSection.hidden = false;

  if (isNewDraw) {
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => resultCard.focus(), 750);
  }
}

/**
 * 所持状況をもとにカード図鑑を描画する。
 *
 * @returns {void}
 */
function renderCollection() {
  const collection = loadCollection();
  const ownedCardIds = CARD_MASTER.filter((card) => collection[card.id] > 0);
  collectionCount.textContent = `${ownedCardIds.length} / ${CARD_MASTER.length}`;

  collectionGrid.replaceChildren();

  for (const card of CARD_MASTER) {
    const ownedCount = collection[card.id] ?? 0;
    const isOwned = ownedCount > 0;
    const article = document.createElement("article");

    article.className = [
      "card",
      "collection-card",
      getRarityClass(card.rarity),
      isOwned ? "" : "collection-card--locked",
    ]
      .filter(Boolean)
      .join(" ");

    article.innerHTML = `
      <div class="card__shine" aria-hidden="true"></div>
      <div class="card__topline">
        <span class="card__category">${isOwned ? card.category : "UNKNOWN"}</span>
        <span class="card__rarity">${card.rarity}</span>
      </div>
      ${isOwned ? `<span class="card__owned-count" aria-label="所持枚数">${ownedCount}枚</span>` : ""}
      <div class="card__symbol" aria-hidden="true">${isOwned ? card.symbol : "?"}</div>
      <div class="card__content">
        <h3 class="card__name">${isOwned ? card.name : "未発見のカード"}</h3>
        <p class="card__description">
          ${isOwned ? card.description : "ガチャを引いてカードを発見しよう。"}
        </p>
      </div>
      <div class="card__footer">
        <span>${isOwned ? card.id : "???-???"}</span>
        <span>${isOwned ? card.quote : "LOCKED"}</span>
      </div>
    `;

    collectionGrid.append(article);
  }
}

/**
 * その日の抽選可否に合わせてボタンと状態表示を更新する。
 *
 * @returns {void}
 */
function updateDrawAvailability() {
  const drawn = hasDrawnToday();
  const buttonMain = drawButton.querySelector(".draw-button__main");
  const buttonSub = drawButton.querySelector(".draw-button__sub");

  drawButton.disabled = drawn;
  drawStatus.textContent = drawn ? "本日は抽選済みです" : "抽選できます";
  drawStatus.className = `status-value ${
    drawn ? "status-value--used" : "status-value--available"
  }`;
  buttonMain.textContent = drawn ? "本日のガチャは終了" : "ガチャを引く";
  buttonSub.textContent = drawn ? "明日また引けます" : "本日あと1回";
}

/**
 * 次の日付に切り替わるまでの残り時間を更新する。
 *
 * @returns {void}
 */
function updateCountdown() {
  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0,
  );
  const difference = Math.max(0, nextMidnight.getTime() - now.getTime());

  const totalSeconds = Math.floor(difference / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  countdown.textContent = `${hours}:${minutes}:${seconds}`;

  // 日付が変わった直後に抽選可否を再評価する。
  if (difference < 1000) {
    updateDrawAvailability();
  }
}

/**
 * 抽選演出を表示し、指定時間後に閉じる。
 *
 * @param {number} [duration=1400] 表示時間（ミリ秒）
 * @returns {Promise<void>} 演出終了時に解決するPromise
 */
function playRevealAnimation(duration = 1400) {
  return new Promise((resolve) => {
    if (typeof revealDialog.showModal === "function") {
      revealDialog.showModal();
    } else {
      revealDialog.setAttribute("open", "");
    }

    window.setTimeout(() => {
      revealDialog.close?.();
      revealDialog.removeAttribute("open");
      resolve();
    }, duration);
  });
}

/**
 * ガチャを実行し、結果と所持状況を保存する。
 *
 * @returns {Promise<void>}
 */
async function handleDraw() {
  // 多重クリックや日付判定の競合を防ぐため、実行直後にボタンを無効化する。
  if (hasDrawnToday() || drawButton.disabled) {
    updateDrawAvailability();
    return;
  }

  drawButton.disabled = true;
  await playRevealAnimation();

  const card = drawCard();
  const collection = loadCollection();

  collection[card.id] = (collection[card.id] ?? 0) + 1;

  // 抽選結果と日付を同じタイミングで保存する。
  saveCollection(collection);
  localStorage.setItem(STORAGE_KEYS.lastDrawDate, getLocalDateKey());
  localStorage.setItem(STORAGE_KEYS.lastCardId, card.id);

  renderResult(card, true);
  renderCollection();
  updateDrawAvailability();
}

/**
 * アプリ初期化処理。
 *
 * @returns {void}
 */
function initializeApp() {
  renderCollection();
  updateDrawAvailability();
  updateCountdown();

  const lastCard = getLastDrawnCard();

  if (hasDrawnToday() && lastCard) {
    renderResult(lastCard);
  }

  drawButton.addEventListener("click", handleDraw);
  window.setInterval(updateCountdown, 1000);
}

initializeApp();
