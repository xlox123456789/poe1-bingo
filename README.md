# 流亡黯道賓果（PoE1 中文賓果卡產生器）

自製的 **Path of Exile 1** 中文版賓果卡小工具。輸入你對新聯盟的預測項目，
一鍵產生賓果盤，跟公會或直播間朋友分享同一張卡，各自勾選、看誰先連線賓果。

純前端（HTML + CSS + JS），不需要資料庫、不需要登入，資料只存在瀏覽器的
`localStorage`，非常適合直接放到 GitHub Pages 上免費架設。

## 檔案結構

```
poe1-bingo/
├── index.html   主頁面
└── app.js       賓果邏輯（產生、勾選、判定連線、分享連結、匯出圖片）
```

## 功能

- 自訂標題、3×3 ~ 6×6 尺寸、是否要中央自由格
- 貼上自己的預測項目（每行一個），或一鍵套用內建的 PoE1 預設清單
- 項目不夠時會自動用預設清單補足
- 點格子勾選／取消，自動偵測橫、直、對角線是否連成賓果，並有動畫提示
- 「重新隨機排列」：項目不變，重新洗牌位置
- 「清除所有勾選」：保留卡片內容，重置進度
- 「產生分享連結」：把標題／尺寸／項目編碼進網址（`#share=...`），
  傳給朋友打開就是同一張卡，但彼此的勾選進度各自獨立、互不影響
- 「匯出圖片」：把卡片存成 PNG（使用 html2canvas，需連網）
- 「列印 / 存 PDF」：列印樣式已另外調整過
- 重新整理頁面會自動還原上一次的卡片與勾選進度（localStorage）

## 在 GitHub Pages 上架設（新手步驟）

1. 到 GitHub 建立一個新的 **public repository**，例如取名 `poe1-bingo`。
2. 把這個資料夾裡的 `index.html` 和 `app.js` 上傳到該 repo 的根目錄：
   - 網頁版做法：進到 repo 頁面 → **Add file → Upload files** →
     把兩個檔案拖進去 → **Commit changes**。
   - 或用 Git 指令：
     ```bash
     cd poe1-bingo
     git init
     git add index.html app.js
     git commit -m "PoE1 中文賓果卡"
     git branch -M main
     git remote add origin https://github.com/<你的帳號>/poe1-bingo.git
     git push -u origin main
     ```
3. 進到 repo 的 **Settings → Pages**。
4. 在 **Build and deployment → Source** 選擇 **Deploy from a branch**，
   Branch 選 `main`、資料夾選 `/(root)`，按 **Save**。
5. 等 1～2 分鐘，GitHub 會給你一個網址，格式通常是：
   ```
   https://<你的帳號>.github.io/poe1-bingo/
   ```
   打開就能直接使用了。

> 之後如果想更新內容（例如改預設清單、改配色），只要編輯檔案後
> 重新 commit / push，GitHub Pages 會在幾分鐘內自動更新。

## 自訂重點（想改就直接改檔案）

- **預設項目清單**：`app.js` 最上面的 `PRESET_ITEMS` 陣列。
- **配色**：`index.html` 的 `<style>` 區塊裡 `:root { --gold, --ember, ... }`。
- **字型**：目前用 Google Fonts 的 Cinzel／Noto Serif TC／Noto Sans TC，
  可在 `<head>` 裡的 `<link>` 換成你喜歡的字型。

## 免責聲明

本專案為粉絲自製的非商業小工具，與 Grinding Gear Games 及
《Path of Exile》官方無任何關聯。
