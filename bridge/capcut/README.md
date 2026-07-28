# CapCut Demo 橋接器

這個目錄提供 CutMan 與 CapCut Desktop／Web 的安全相容流程，已在 macOS 的 CapCut Desktop 8.9.1 驗證套件內容。

## 為什麼不是直接匯入專案？

CapCut 官方目前不支援直接匯入第三方剪輯專案。CutMan 因此輸出官方可匯入的媒體、UTF-8 SRT、`edit_plan.json` 與繁中操作指南，全部透過新建專案完成。

官方參考：

- https://www.capcut.com/help/how-to-import-subtitles
- https://www.capcut.com/help/how-to-export-pro-project

## 產生素材

```bash
chmod +x bridge/capcut/build_demo_media.sh
./bridge/capcut/build_demo_media.sh
```

產生的檔案位於 `bridge/capcut/demo-package/`：

- `media/01_establishing.mp4` 到 `05_closing_wide.mp4`
- `media/city-bed.wav`
- `captions.srt`
- `edit_plan.json`
- `CAPCUT_IMPORT_GUIDE.txt`

## 建立 ZIP 相容套件

```bash
npm run capcut:package
```

輸出為 `bridge/capcut/CutMan-CapCut-Demo.zip`，解壓後即可依指南匯入 CapCut Desktop／Web。

## CapCut Demo 操作

1. 在 CapCut 首頁選擇「建立專案」。
2. 建立名稱為 `CutMan CapCut Demo` 的全新專案。
3. 匯入 `demo-package/media/` 內的五段 MP4 與一段 WAV。
4. 依檔名前綴排序，將五段影片加入主時間線。
5. 將 `city-bed.wav` 加入音訊軌並設為約 `-12 dB`。
6. 從「文字／字幕」匯入 `captions.srt`。
7. 確認總長 20 秒，切點位於 4、8、12、16 秒。

Demo 只建立新專案，不得修改既有草稿。
