import { createCapCutManifest } from './styleEngine.js';

const CAPCUT_MEDIA_EXTENSION = /\.(?:3gp|aac|aiff?|avi|bmp|flac|flv|heic|heif|jpe?g|m4a|m4v|mkv|mov|mp3|mp4|png|wav|webp)$/i;

export function isCapCutMediaFile(file) {
  return /^(?:audio|image|video)\//.test(file.type) || CAPCUT_MEDIA_EXTENSION.test(file.name);
}

export function createCapCutSrt(captions) {
  return captions.map((caption, index) => {
    if (!(caption.end > caption.start)) throw new RangeError(`第 ${index + 1} 段字幕的結束時間必須晚於開始時間`);
    return `${index + 1}\n${formatSrtTime(caption.start)} --> ${formatSrtTime(caption.end)}\n${caption.text.trim()}`;
  }).join('\n\n').concat('\n');
}

export function createCapCutGuide(projectName, mediaCount) {
  const mediaStep = mediaCount > 0
    ? `3. 將 media 資料夾內的 ${mediaCount} 個檔案全部匯入，依檔名前綴排序後加入時間線。`
    : '3. 此套件未包含媒體；請把原始影片、音訊或圖片匯入 CapCut，再依 edit_plan.json 排列。';
  return `CutMan × CapCut 相容套件\n\n專案：${projectName}\n安全模式：只建立新專案，保留所有原始素材\n\nCapCut Desktop（macOS／Windows）\n1. 將 ZIP 解壓縮到本機資料夾。若匯入失敗，請改用純英文路徑。\n2. 開啟 CapCut Desktop，選擇「建立專案」。不要開啟或覆寫既有草稿。\n${mediaStep}\n4. 開啟「字幕／Captions」→「新增字幕／Add Captions」→ 匯入 captions.srt。\n5. 依 edit_plan.json 的 approvedEdits 核對剪輯建議、時間碼與順序。\n6. 字幕為 CutMan Demo 內容；若不適用於實際素材，請在 CapCut 中刪除或替換。\n\nCapCut Web\n1. 建立新影片並上傳 media 資料夾內的媒體。\n2. 到 Captions，選擇 Upload caption file，匯入 captions.srt。\n3. 依 edit_plan.json 完成時間線調整。\n\n重要限制\n- CapCut 官方目前不支援第三方專案檔直接匯入，因此本套件不是 CapCut 草稿檔。\n- 本套件只使用官方支援的媒體與 UTF-8 SRT 匯入流程。\n- CapCut 手機版不能直接匯入 SRT；請先在 Desktop 或 Web 匯入後再使用 CapCut Cloud Sync。\n`;
}

export async function createCapCutPackage({ projectName, suggestions, mediaFiles = [], captions = [] }) {
  const { strToU8, zipSync } = await import('fflate');
  const supportedMedia = mediaFiles.filter(isCapCutMediaFile);
  const mediaInventory = supportedMedia.map((file, index) => ({
    order: index + 1,
    originalName: file.name,
    packagePath: `media/${String(index + 1).padStart(2, '0')}_${sanitizeFilename(file.name)}`,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
  }));
  const mediaEntries = await Promise.all(supportedMedia.map(async (file, index) => [
    mediaInventory[index].packagePath,
    new Uint8Array(await file.arrayBuffer()),
  ]));
  const entries = Object.fromEntries(mediaEntries);
  entries['edit_plan.json'] = strToU8(createCapCutManifest(projectName, suggestions, mediaInventory));
  entries['captions.srt'] = strToU8(createCapCutSrt(captions));
  entries['CAPCUT_IMPORT_GUIDE.txt'] = strToU8(createCapCutGuide(projectName, supportedMedia.length));
  return {
    bytes: zipSync(entries, { level: 1 }),
    mediaCount: supportedMedia.length,
    skippedCount: mediaFiles.length - supportedMedia.length,
  };
}

export async function downloadCapCutPackage(options) {
  const result = await createCapCutPackage(options);
  const filename = `${sanitizeFilename(options.projectName.trim() || 'CutMan-Project')}-CapCut.zip`;
  downloadBlob(filename, new Blob([result.bytes], { type: 'application/zip' }));
  return { ...result, filename };
}

function formatSrtTime(secondsValue) {
  const totalMilliseconds = Math.max(0, Math.round(secondsValue * 1000));
  const milliseconds = totalMilliseconds % 1000;
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)},${pad(milliseconds, 3)}`;
}

function pad(value, length) {
  return String(value).padStart(length, '0');
}

function sanitizeFilename(value) {
  const safeCharacters = Array.from(value, (character) => character.charCodeAt(0) < 32 || '\\/:*?"<>|'.includes(character) ? '-' : character).join('');
  return safeCharacters.replace(/\s+/g, '-').replace(/-+/g, '-');
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
