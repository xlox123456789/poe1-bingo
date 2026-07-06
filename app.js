/* 流亡黯道賓果 - PoE1 中文賓果卡產生器
   純前端、無後端，狀態存 localStorage，分享用 URL hash 編碼 (title/size/items)。
*/

const STORAGE_KEY = "poe1-bingo-card-v1";

const PRESET_ITEMS = [
  "開荒十分鐘內死於雜兵",
  "第一件暗金裝馬上被鑑定壞掉的期待",
  "六聯還沒焊接就先被拿去賣",
  "公頻吵起交易糾紛",
  "伺服器開荒當晚炸掉",
  "撿到暗金卻不知道能幹嘛",
  "Boss機制看不懂被秒殺",
  "練功練到忘記吃飯",
  "卡在某張地圖地形出不去",
  "拍賣版本一開全部秒殺搶購",
  "隊友掛機被踢出隊伍",
  "找不到公會頻道迷路",
  "舊玩家版本回歸",
  "主播直播抽到暗金全場暴動",
  "Notable 天賦大改讓主流 Build 直接作廢",
  "卡貨幣通膨破產買不起藥水",
  "卡連線問題突然掉線",
  "本命技能寶石被削弱",
  "開荒被野怪包圍團滅",
  "交易被放鴿子",
  "刷首圖撿到傳奇但不適合本流派",
  "Uber Boss 挑戰十次都失敗",
  "課金買點數買到剁手",
  "版本主流構築三天內被玩壞",
  "GGG 釋出緊急平衡補丁",
  "組隊開荒卻各玩各的",
  "熬夜刷等級隔天請假",
  "地圖詞綴疊滿被自己坑死",
  "第一次全連過關卡沒人在看",
  "公會團本卡在最後王",
  "誤刪重要裝備欲哭無淚",
  "刷寶差一點就三連但沒中",
  "新職業上線塞爆登入排隊",
  "商城新造型一開賣就搶購一空",
  "手滑洗錯天賦重練",
  "被野團抓去打圖結果送頭",
  "版本第一名速刷玩家一週內達成",
  "開荒被自己丟的陷阱炸死",
];

const els = {};
["titleInput","sizeSelect","freeCenter","itemsInput","countHint",
 "fillPresetBtn","clearItemsBtn","generateBtn",
 "shareBtn","shareBox","shareUrl",
 "cardTitleDisplay","cardMeta","bingoStatus","grid","banner",
 "reshuffleBtn","resetMarksBtn","exportBtn","printBtn"
].forEach(id => els[id] = document.getElementById(id));

let state = {
  title: "這個聯盟會發生嗎？",
  size: 5,
  freeCenter: true,
  items: [],      // full pool typed by user
  layout: [],     // items actually placed in the grid, length = size*size
  marks: [],      // boolean array length size*size
};

function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function parseItems(){
  return els.itemsInput.value
    .split("\n")
    .map(s=>s.trim())
    .filter(Boolean);
}

function updateCountHint(){
  const size = parseInt(els.sizeSelect.value,10);
  const free = els.freeCenter.checked && (size % 2 === 1);
  const needed = size*size - (free?1:0);
  const have = parseItems().length;
  const hint = els.countHint;
  if(have >= needed){
    hint.className = "count-hint";
    hint.textContent = `已輸入 ${have} 項，需要 ${needed} 項 — 足夠，多餘的會隨機保留備用。`;
  } else {
    hint.className = "count-hint bad";
    hint.textContent = `已輸入 ${have} 項，需要 ${needed} 項 — 還少 ${needed-have} 項，產生時將自動用預設清單補足。`;
  }
}

function buildLayout(){
  const size = parseInt(els.sizeSelect.value,10);
  const free = els.freeCenter.checked && (size % 2 === 1);
  const needed = size*size - (free?1:0);

  let pool = parseItems();
  if(pool.length < needed){
    const extra = shuffle(PRESET_ITEMS.filter(p=>!pool.includes(p)));
    let i=0;
    while(pool.length < needed && i < extra.length){ pool.push(extra[i]); i++; }
    // still short? repeat with numbering
    let n=2;
    while(pool.length < needed){
      const base = PRESET_ITEMS[(pool.length) % PRESET_ITEMS.length];
      pool.push(`${base}（第${n}次）`);
      n++;
    }
  }
  const chosen = shuffle(pool).slice(0, needed);
  const cells = shuffle(chosen);

  const layout = [];
  const centerIdx = Math.floor((size*size)/2);
  let ci = 0;
  for(let i=0;i<size*size;i++){
    if(free && i === centerIdx){ layout.push({text:"自由格", free:true}); }
    else { layout.push({text:cells[ci], free:false}); ci++; }
  }
  return layout;
}

function generate(){
  const size = parseInt(els.sizeSelect.value,10);
  state.title = els.titleInput.value.trim() || "流亡黯道賓果";
  state.size = size;
  state.freeCenter = els.freeCenter.checked;
  state.items = parseItems();
  state.layout = buildLayout();
  state.marks = state.layout.map(c => !!c.free);
  save();
  render();
}

function reshuffle(){
  if(state.layout.length === 0) return generate();
  const size = state.size;
  const free = state.freeCenter && (size % 2 === 1);
  const texts = state.layout.filter(c=>!c.free).map(c=>c.text);
  const shuffled = shuffle(texts);
  const centerIdx = Math.floor((size*size)/2);
  const layout = [];
  let ci = 0;
  for(let i=0;i<size*size;i++){
    if(free && i === centerIdx){ layout.push({text:"自由格", free:true}); }
    else { layout.push({text:shuffled[ci], free:false}); ci++; }
  }
  state.layout = layout;
  state.marks = layout.map(c => !!c.free);
  save();
  render();
}

function toggleMark(i){
  if(state.layout[i].free) return;
  state.marks[i] = !state.marks[i];
  save();
  render(true);
}

function resetMarks(){
  state.marks = state.layout.map(c => !!c.free);
  save();
  render();
}

function computeWinLines(){
  const size = state.size;
  const lines = [];
  for(let r=0;r<size;r++){
    lines.push(Array.from({length:size}, (_,c)=> r*size+c));
  }
  for(let c=0;c<size;c++){
    lines.push(Array.from({length:size}, (_,r)=> r*size+c));
  }
  lines.push(Array.from({length:size}, (_,i)=> i*size+i));
  lines.push(Array.from({length:size}, (_,i)=> i*size+(size-1-i)));

  const complete = lines.filter(line => line.every(idx => state.marks[idx]));
  return complete;
}

let lastCompleteCount = 0;

function render(fromToggle){
  els.cardTitleDisplay.textContent = state.title;
  const markedCount = state.marks.filter(Boolean).length - (state.freeCenter && state.size%2===1 ? 1 : 0);
  els.cardMeta.textContent = `${state.size} × ${state.size} ‧ 已勾選 ${Math.max(markedCount,0)} 格`;

  els.grid.style.gridTemplateColumns = `repeat(${state.size}, 1fr)`;
  els.grid.innerHTML = "";

  const winLines = computeWinLines();
  const winCells = new Set(winLines.flat());

  state.layout.forEach((cell, i) => {
    const div = document.createElement("div");
    div.className = "cell" + (cell.free ? " free" : "") + (state.marks[i] ? " marked" : "") + (winCells.has(i) ? " win-line" : "");
    div.innerHTML = `<span class="txt">${escapeHtml(cell.text)}</span>`;
    if(!cell.free){
      div.addEventListener("click", () => toggleMark(i));
    }
    els.grid.appendChild(div);
  });

  if(winLines.length > 0){
    els.bingoStatus.textContent = `已達成 ${winLines.length} 條連線！`;
  } else {
    els.bingoStatus.textContent = "";
  }

  if(fromToggle && winLines.length > lastCompleteCount){
    triggerBanner();
  }
  lastCompleteCount = winLines.length;
}

function triggerBanner(){
  els.banner.classList.remove("show");
  void els.banner.offsetWidth;
  els.banner.classList.add("show");
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[m]));
}

function save(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }catch(e){ /* storage full or blocked, ignore */ }
}

function load(){
  // priority 1: shared link in URL hash
  const hash = location.hash.replace(/^#/, "");
  if(hash.startsWith("share=")){
    try{
      const json = decodeURIComponent(escape(atob(hash.slice(6))));
      const shared = JSON.parse(json);
      if(shared && shared.title && shared.items){
        els.titleInput.value = shared.title;
        els.sizeSelect.value = String(shared.size || 5);
        els.freeCenter.checked = !!shared.freeCenter;
        els.itemsInput.value = (shared.items || []).join("\n");
        generate();
        history.replaceState(null, "", location.pathname);
        return;
      }
    }catch(e){ /* ignore malformed hash */ }
  }
  // priority 2: local saved state
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const saved = JSON.parse(raw);
      if(saved && saved.layout && saved.layout.length){
        state = saved;
        els.titleInput.value = state.title;
        els.sizeSelect.value = String(state.size);
        els.freeCenter.checked = state.freeCenter;
        els.itemsInput.value = (state.items && state.items.length ? state.items : []).join("\n");
        render();
        return;
      }
    }
  }catch(e){ /* ignore */ }
  // priority 3: fresh default card
  els.itemsInput.value = shuffle(PRESET_ITEMS).slice(0, 24).join("\n");
  generate();
}

function makeShareUrl(){
  const payload = {
    title: state.title,
    size: state.size,
    freeCenter: state.freeCenter,
    items: state.items.length ? state.items : state.layout.filter(c=>!c.free).map(c=>c.text),
  };
  const json = JSON.stringify(payload);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  const url = `${location.origin}${location.pathname}#share=${b64}`;
  return url;
}

async function exportImage(){
  if(typeof html2canvas === "undefined"){
    alert("圖片匯出元件載入失敗，請確認網路連線後重新整理再試一次。");
    return;
  }
  const frame = document.querySelector(".card-frame");
  const canvas = await html2canvas(frame, {backgroundColor:"#100d0a", scale:2});
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
