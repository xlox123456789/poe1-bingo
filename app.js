/* 流亡黯道賓果 - PoE1 中文賓果卡產生器
   純前端、無後端，狀態存 localStorage，分享用 URL hash 編碼 (title/size/items)。
*/

const STORAGE_KEY = "poe1-bingo-card-v1";

const PRESET_ITEMS = [
  "加快頭目劇情動畫（塑界者）",
  "豐收生靈之力改為大堆疊掉落",
  "穢生版《鬧鬼》再次削弱",
  "技工的保險箱加入基礎出現池",
  "塵燥之吼加入核心",
  "傭兵",
  "新增「將所有物品送入倉庫」按鈕，並套用倉庫分類",
  "支援 WASD 操作",
  "翠綠荒林加入輿圖天賦樹",
  "刪除知識卷軸、傳送卷軸，或在背包新增專用欄位",
  "新增更多卓越寶石",
  "輿圖新增魔偶欄位",
  "敏捷堆疊流派增強(千敏)",
  "登入後直接進入藏身處",
  "獸獵QOL改善",
  "力量猛射削弱",
  "前期練等技能增強／削弱（熔岩翻騰掰掰）",
  "Mirage 加入核心遊戲",
  "重擊技能再次削弱",
  "元素打擊削弱",
  "刪除召喚契約輔助",
  "每個職業的昇華職業由 3 個增加至 4 個，並各自加入一個 Phrecia 昇華職業",
  "地平石可以使用於 T17 地圖",
  "劫盜基底的定向取得方式回歸",
  "私人聯盟新增替代昇華職業選項",
  "追憶地圖增強，成為主要的追憶物品農場",
  "新增眾神殿選項",
  "新增傳奇物品",
  "挑戰獎勵不再提供整套護甲外觀",
  "新增聯盟機制專屬基底，例如祭祀、劫盜",
  "透過掉落物或傳奇物品增強，讓阿茲里重新具有價值",
  "神諭傳奇物品重製／增強，包含《神諭之殿》",
  "新增珠寶倉庫頁",
  "精髓重製，加入完美精髓",
  "Uber 碎片可以堆疊",
  "新增 Uber 頭目",
  "金司馬區通知橫幅縮小 50%",
  "裂痕堡壘：波數至少減少 25%",
  "胎贈可以堆疊",
  "豐收怪物剩餘 5 隻以下時，在小地圖顯示怪物圖示",
  "培育器可以堆疊",
  "PoE 4.0 消息",
  "最佳化遊戲，提升並穩定 FPS",
  "祖靈的試煉加入核心遊戲",
  "新增死亡紀錄",
  "眾神殿重製",
  "典獄長重製／增強",
  "新增符文與紋身倉庫頁",
  "移除獵首的 智障亂傳送 詞綴",
  "新增有趣的穢生詞綴",
  "新增 Phrecia 昇華紋身",
  "伺服器仍然沒有修好",
  "新增寶石",
  "新增贗品傳奇物品",
  "《英勇的悲劇》削弱",
  "深淵增強",
  "新增核心天賦",
  "堆疊流派削弱",
  "自施法增強",
  "新增輿圖天賦樹珠寶",
  "新增訓練假人",
  "新增聖甲蟲",
  "破壞者與陷阱／地雷增強",
  "天賦樹新增通用冷卻時間恢復速度",
  "重組裝置脫離 Settlers 機制",
  "手術大師與持久魔力藥劑自動化",
  "背包支援 Regex 搜尋",
  "自動釘劑",
  "我要釣魚",
  "我要開船",
  "惡魔貓推薦雪寶／電蜘蛛開荒",
  "二代探險搬過來一代",
];

const FREE_CELL_TEXT = "Hi,Im Mark Roberts/Jonathan Rogers";

const els = {};
["titleInput", "sizeSelect", "freeCenter", "itemsInput", "countHint",
  "fillPresetBtn", "clearItemsBtn", "generateBtn",
  "shareBtn", "shareBox", "shareUrl",
  "cardTitleDisplay", "cardMeta", "bingoStatus", "grid", "banner",
  "reshuffleBtn", "resetMarksBtn", "exportBtn", "printBtn"
].forEach(id => els[id] = document.getElementById(id));

let state = {
  title: "3.29 流亡黯道：亡焰咒海 BINGO",
  size: 5,
  freeCenter: true,
  items: [],      // full pool typed by user
  layout: [],     // items actually placed in the grid, length = size*size
  marks: [],      // boolean array length size*size
};

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function parseItems() {
  return els.itemsInput.value
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);
}

function updateCountHint() {
  const size = parseInt(els.sizeSelect.value, 10);
  const free = els.freeCenter.checked && (size % 2 === 1);
  const needed = size * size - (free ? 1 : 0);
  const have = parseItems().length;
  const hint = els.countHint;
  if (have >= needed) {
    hint.className = "count-hint";
    hint.textContent = `已輸入 ${have} 項，需要 ${needed} 項 — 足夠，多餘的會隨機保留備用。`;
  } else {
    hint.className = "count-hint bad";
    hint.textContent = `已輸入 ${have} 項，需要 ${needed} 項 — 還少 ${needed - have} 項，產生時將自動用預設清單補足。`;
  }
}

function buildLayout() {
  const size = parseInt(els.sizeSelect.value, 10);
  const free = els.freeCenter.checked && (size % 2 === 1);
  const needed = size * size - (free ? 1 : 0);

  let pool = parseItems();
  if (pool.length < needed) {
    const extra = shuffle(PRESET_ITEMS.filter(p => !pool.includes(p)));
    let i = 0;
    while (pool.length < needed && i < extra.length) { pool.push(extra[i]); i++; }
    // still short? repeat with numbering
    let n = 2;
    while (pool.length < needed) {
      const base = PRESET_ITEMS[(pool.length) % PRESET_ITEMS.length];
      pool.push(`${base}（第${n}次）`);
      n++;
    }
  }
  const chosen = shuffle(pool).slice(0, needed);
  const cells = shuffle(chosen);

  const layout = [];
  const centerIdx = Math.floor((size * size) / 2);
  let ci = 0;
  for (let i = 0; i < size * size; i++) {
    if (free && i === centerIdx) { layout.push({ text: FREE_CELL_TEXT, free: true }); }
    else { layout.push({ text: cells[ci], free: false }); ci++; }
  }
  return layout;
}

function generate() {
  const size = parseInt(els.sizeSelect.value, 10);
  state.title = els.titleInput.value.trim() || "流亡黯道賓果";
  state.size = size;
  state.freeCenter = els.freeCenter.checked;
  state.items = parseItems();
  state.layout = buildLayout();
  state.marks = state.layout.map(c => !!c.free);
  save();
  render();
}

function reshuffle() {
  if (state.layout.length === 0) return generate();
  const size = state.size;
  const free = state.freeCenter && (size % 2 === 1);
  const texts = state.layout.filter(c => !c.free).map(c => c.text);
  const shuffled = shuffle(texts);
  const centerIdx = Math.floor((size * size) / 2);
  const layout = [];
  let ci = 0;
  for (let i = 0; i < size * size; i++) {
    if (free && i === centerIdx) { layout.push({ text: FREE_CELL_TEXT, free: true }); }
    else { layout.push({ text: shuffled[ci], free: false }); ci++; }
  }
  state.layout = layout;
  state.marks = layout.map(c => !!c.free);
  save();
  render();
}

function toggleMark(i) {
  if (state.layout[i].free) return;
  state.marks[i] = !state.marks[i];
  save();
  render(true);
}

function resetMarks() {
  state.marks = state.layout.map(c => !!c.free);
  save();
  render();
}

function computeWinLines() {
  const size = state.size;
  const lines = [];
  for (let r = 0; r < size; r++) {
    lines.push(Array.from({ length: size }, (_, c) => r * size + c));
  }
  for (let c = 0; c < size; c++) {
    lines.push(Array.from({ length: size }, (_, r) => r * size + c));
  }
  lines.push(Array.from({ length: size }, (_, i) => i * size + i));
  lines.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)));

  const complete = lines.filter(line => line.every(idx => state.marks[idx]));
  return complete;
}

let lastCompleteCount = 0;

function render(fromToggle) {
  els.cardTitleDisplay.textContent = state.title;
  const markedCount = state.marks.filter(Boolean).length - (state.freeCenter && state.size % 2 === 1 ? 1 : 0);
  els.cardMeta.textContent = `${state.size} × ${state.size} ‧ 已勾選 ${Math.max(markedCount, 0)} 格`;

  els.grid.style.gridTemplateColumns = `repeat(${state.size}, 1fr)`;
  els.grid.innerHTML = "";

  const winLines = computeWinLines();
  const winCells = new Set(winLines.flat());

  state.layout.forEach((cell, i) => {
    const div = document.createElement("div");
    div.className = "cell" + (cell.free ? " free" : "") + (state.marks[i] ? " marked" : "") + (winCells.has(i) ? " win-line" : "");
    div.innerHTML = `<span class="txt">${escapeHtml(cell.text)}</span>`;
    if (!cell.free) {
      div.addEventListener("click", () => toggleMark(i));
    }
    els.grid.appendChild(div);
  });

  if (winLines.length > 0) {
    els.bingoStatus.textContent = `已達成 ${winLines.length} 條連線！`;
  } else {
    els.bingoStatus.textContent = "";
  }

  if (fromToggle && winLines.length > lastCompleteCount) {
    triggerBanner();
  }
  lastCompleteCount = winLines.length;
}

function triggerBanner() {
  els.banner.classList.remove("show");
  void els.banner.offsetWidth;
  els.banner.classList.add("show");
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  }[m]));
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { /* storage full or blocked, ignore */ }
}

function load() {
  // 每次開啟頁面都先清掉本機舊存檔，避免改版後卡池被舊快取蓋掉
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }

  // priority 1: shared link in URL hash
  const hash = location.hash.replace(/^#/, "");
  if (hash.startsWith("share=")) {
    try {
      const json = decodeURIComponent(escape(atob(hash.slice(6))));
      const shared = JSON.parse(json);
      if (shared && shared.title && shared.layout) {
        // 新格式：直接還原格子順序，跟分享者拿到完全一樣的排列
        els.titleInput.value = shared.title;
        els.sizeSelect.value = String(shared.size || 5);
        els.freeCenter.checked = !!shared.freeCenter;

        state.title = shared.title;
        state.size = shared.size || 5;
        state.freeCenter = !!shared.freeCenter;
        state.layout = shared.layout.map(t => t === null
          ? { text: FREE_CELL_TEXT, free: true }
          : { text: t, free: false });
        state.items = shared.layout.filter(t => t !== null);
        state.marks = state.layout.map(c => !!c.free);
        els.itemsInput.value = state.items.join("\n");

        save();
        render();
        history.replaceState(null, "", location.pathname);
        return;
      }
      if (shared && shared.title && shared.items) {
        // 舊格式相容：只有項目池，沒有固定排列（會重新洗牌，排列可能跟分享者不同）
        els.titleInput.value = shared.title;
        els.sizeSelect.value = String(shared.size || 5);
        els.freeCenter.checked = !!shared.freeCenter;
        els.itemsInput.value = (shared.items || []).join("\n");
        generate();
        history.replaceState(null, "", location.pathname);
        return;
      }
    } catch (e) { /* ignore malformed hash */ }
  }
  // priority 2: 沒有分享連結時，一律用程式內最新的 PRESET_ITEMS 重新產生
  // 項目欄顯示「完整卡池」，實際格子仍會依尺寸隨機抽取所需數量
  els.itemsInput.value = PRESET_ITEMS.join("\n");
  generate();
}

function makeShareUrl() {
  const payload = {
    title: state.title,
    size: state.size,
    freeCenter: state.freeCenter,
    // 直接帶「實際格子順序」，free 格用 null 標記，確保對方打開時排列完全一致
    layout: state.layout.map(c => c.free ? null : c.text),
  };
  const json = JSON.stringify(payload);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  const url = `${location.origin}${location.pathname}#share=${b64}`;
  return url;
}

async function exportImage() {
  if (typeof html2canvas === "undefined") {
    alert("圖片匯出元件載入失敗，請確認網路連線後重新整理再試一次。");
    return;
  }
  const frame = document.querySelector(".card-frame");
  const canvas = await html2canvas(frame, { backgroundColor: "#100d0a", scale: 2 });
  const link = document.createElement("a");
  link.download = `${state.title || "poe1-bingo"}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/* events */
els.itemsInput.addEventListener("input", updateCountHint);
els.sizeSelect.addEventListener("change", updateCountHint);
els.freeCenter.addEventListener("change", updateCountHint);

els.fillPresetBtn.addEventListener("click", () => {
  els.itemsInput.value = shuffle(PRESET_ITEMS).join("\n");
  updateCountHint();
});
els.clearItemsBtn.addEventListener("click", () => {
  els.itemsInput.value = "";
  updateCountHint();
});
els.generateBtn.addEventListener("click", generate);
els.reshuffleBtn.addEventListener("click", reshuffle);
els.resetMarksBtn.addEventListener("click", resetMarks);
els.exportBtn.addEventListener("click", exportImage);
els.printBtn.addEventListener("click", () => window.print());
els.shareBtn.addEventListener("click", () => {
  els.shareUrl.value = makeShareUrl();
  els.shareBox.classList.add("show");
  els.shareUrl.select();
});

load();
updateCountHint();
