const PROFILE_KEY = 'cutman.profile.v1';
const FRAME_RATE = 24;
const TIMELINE_DURATION_FRAMES = 90 * FRAME_RATE;

const defaultProfile = {
  version: 1,
  confidence: 87,
  sessions: 12,
  acceptedChanges: 86,
  rejectedChanges: 14,
  lastUpdated: new Date().toISOString(),
};

export function loadProfile() {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    return saved ? { ...defaultProfile, ...JSON.parse(saved) } : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

export function learnFromReview(profile, acceptedCount, totalCount) {
  const acceptedChanges = profile.acceptedChanges + acceptedCount;
  const rejectedChanges = profile.rejectedChanges + totalCount - acceptedCount;
  const total = acceptedChanges + rejectedChanges;
  const agreement = total > 0 ? acceptedChanges / total : 0;
  const nextProfile = {
    ...profile,
    confidence: Math.min(97, Math.round(72 + agreement * 23)),
    sessions: profile.sessions + 1,
    acceptedChanges,
    rejectedChanges,
    lastUpdated: new Date().toISOString(),
  };
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
  } catch {
    // 儲存空間不可用時仍保留本次工作階段內的學習結果。
  }
  return nextProfile;
}

export function createReviewSignature(suggestions) {
  return suggestions.map((item) => `${item.id}:${item.accepted ? 1 : 0}`).join('|');
}

export function createEdl(projectName, suggestions) {
  const approved = suggestions.filter((item) => item.accepted);
  const events = approved.map((item, index) => {
    const event = String(index + 1).padStart(3, '0');
    const recordInFrames = timecodeToFrames(item.time);
    const sourceIn = framesToTimecode(0);
    const sourceOut = framesToTimecode(FRAME_RATE);
    const recordIn = framesToTimecode(recordInFrames);
    const recordOut = framesToTimecode(recordInFrames + FRAME_RATE);
    return `${event}  AX       V     C        ${sourceIn} ${sourceOut} ${recordIn} ${recordOut}\n* FROM CLIP NAME: CUTMAN_AI_${item.id}\n* ${item.title} — ${item.detail}`;
  });
  return `TITLE: ${projectName}\nFCM: NON-DROP FRAME\n\n${events.join('\n\n')}\n`;
}

export function createFcpxml(projectName, suggestions) {
  const markers = suggestions
    .filter((item) => item.accepted)
    .map((item) => `            <marker start="${timecodeToFrames(item.time)}/24s" duration="1/24s" value="${escapeXml(item.title)}" note="${escapeXml(item.detail)}"/>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<fcpxml version="1.11">\n  <resources>\n    <format id="r1" name="FFVideoFormat3840x2160p24" frameDuration="1/24s" width="3840" height="2160" colorSpace="1-1-1 (Rec. 709)"/>\n  </resources>\n  <library>\n    <event name="CutMan AI 建議">\n      <project name="${escapeXml(projectName)}">\n        <sequence duration="${TIMELINE_DURATION_FRAMES}/24s" format="r1" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">\n          <spine>\n            <gap name="CutMan AI 建議" offset="0s" start="0s" duration="${TIMELINE_DURATION_FRAMES}/24s">\n${markers}\n            </gap>\n          </spine>\n        </sequence>\n      </project>\n    </event>\n  </library>\n</fcpxml>\n`;
}

export function createCapCutManifest(projectName, suggestions, mediaInventory = []) {
  const approved = suggestions.filter((item) => item.accepted);
  return JSON.stringify({
    schema: 'cutman.capcut-package.v2',
    target: {
      application: 'CapCut',
      testedVersion: '8.9.1',
      platforms: ['desktop-macos', 'desktop-windows', 'web'],
      integrationMode: 'media-srt-package',
      directProjectImport: false,
    },
    project: {
      name: `${projectName} — CapCut`,
      safetyMode: 'new-project-only',
      preserveOriginal: true,
    },
    media: mediaInventory,
    captions: {
      path: 'captions.srt',
      format: 'SubRip',
      encoding: 'UTF-8',
      language: 'zh-Hant',
    },
    approvedEdits: approved.map((item) => ({
      id: item.id,
      timecode: item.time,
      category: item.category,
      action: item.title,
      detail: item.detail,
    })),
    packageLayout: {
      mediaDirectory: 'media',
      captionsFile: 'captions.srt',
      guideFile: 'CAPCUT_IMPORT_GUIDE.txt',
    },
    limitations: [
      'CapCut 目前不支援直接匯入第三方剪輯專案檔。',
      '相容包採用官方支援的媒體與 SRT 匯入流程。',
      '只允許建立全新專案，不修改既有草稿。',
    ],
  }, null, 2);
}

function escapeXml(value) {
  return value.replace(/[<>&"']/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]);
}

function timecodeToFrames(value) {
  const match = /^(\d{2}):(\d{2}):(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new TypeError(`無效的 24 fps timecode：${value}`);

  const [, hoursText, minutesText, secondsText, framesText] = match;
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  const seconds = Number(secondsText);
  const frames = Number(framesText);
  if (minutes > 59 || seconds > 59 || frames >= FRAME_RATE) throw new RangeError(`超出範圍的 24 fps timecode：${value}`);
  return ((hours * 60 + minutes) * 60 + seconds) * FRAME_RATE + frames;
}

function framesToTimecode(totalFrames) {
  const frames = totalFrames % FRAME_RATE;
  const totalSeconds = Math.floor(totalFrames / FRAME_RATE);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  return [hours, minutes, seconds, frames].map((part) => String(part).padStart(2, '0')).join(':');
}

export function downloadText(filename, content, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
