# CutMan

CutMan 是一個「個人剪輯風格學習＋可審核自動剪輯」的產品 MVP。它把 AI 的角色設計成剪輯師助理：先學習使用者如何取捨鏡頭、安排節奏、處理轉場與混音，再提出可以逐項接受或拒絕的時間線變更。

## 第一版已完成

- 深色專業剪輯工作台、影片預覽與四軌時間線
- 個人風格摘要：節奏、轉場、字幕、音訊與鏡頭偏好
- 可運作的素材分析進度與建議審核流程
- 接受／拒絕決策會更新本機風格信心度（`localStorage`）
- 「保留原始素材」安全模式與新時間線版本提示
- 可下載 Final Cut Pro XML（FCPXML）與 CMX 3600 EDL
- CapCut Desktop／Web ZIP 相容套件：媒體、UTF-8 SRT、剪輯清單與匯入指南
- 桌面、平板與手機版響應式介面

## 執行方式

需要 Node.js 20 以上版本（Apple Silicon 原生版本即可）。

```bash
npm install
npm run dev
```

開啟終端機顯示的本機網址。正式建置：

```bash
npm run build
npm run preview
```

## 產品架構

目前 MVP 的風格引擎位於 `src/domain/styleEngine.js`，以本機資料模擬學習閉環。實際產品建議拆成下列服務：

1. **素材分析服務**：FFmpeg／PySceneDetect 產生鏡頭切點、畫面特徵、語音段落、靜音、節拍與人物資訊。
2. **風格特徵庫**：從使用者過去專案的 FCPXML／EDL／Resolve timeline 取得平均鏡頭長度、J/L cut、轉場、字幕與混音決策。
3. **建議引擎**：先以可解釋的規則與排序模型產生候選剪輯，再讓模型決定候選優先順序；不直接改動原始素材。
4. **回饋學習**：記錄使用者對每一項建議的接受、拒絕與微調差異，更新個人風格向量。
5. **剪輯軟體橋接器**：Premiere Pro 使用 UXP、DaVinci Resolve 使用 Python/Lua API、Final Cut Pro 使用 FCPXML 工作流程擴充。

## 安全與隱私原則

- 預設只建立新時間線版本，不覆寫使用者專案。
- 建議與實際套用分離，每項變更都能事前審核。
- 風格資料優先儲存在本機；若未來使用雲端分析，需提供明確的上傳同意、刪除與加密機制。
- 生成式模型不能任意控制檔案系統；所有剪輯操作應先轉成結構化、可驗證的 edit decision。

## 下一階段

CapCut 相容流程位於 `bridge/capcut/`。由於 CapCut 官方不支援直接匯入第三方專案檔，CutMan 採用 CapCut Desktop／Web 官方支援的媒體與 UTF-8 SRT 匯入方式，搭配結構化剪輯清單與新專案安全流程。可執行 `npm run capcut:package` 建立完整 Demo ZIP。
