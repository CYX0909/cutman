import assert from 'node:assert/strict';
import test from 'node:test';
import { strFromU8, unzipSync } from 'fflate';
import { createCapCutPackage, createCapCutSrt } from '../src/domain/capcutBundle.js';
import { createCapCutManifest, createEdl, createFcpxml, createReviewSignature } from '../src/domain/styleEngine.js';

const suggestions = [
  { id: 1, time: '00:00:10:14', title: '移除停頓 & 保留節奏', detail: '縮短 < 1 秒', category: '節奏', accepted: true },
  { id: 2, time: '00:00:18:22', title: '未採用', detail: '不應輸出', category: '轉場', accepted: false },
];

test('審核簽章會反映每一項選擇', () => {
  assert.equal(createReviewSignature(suggestions), '1:1|2:0');
  assert.equal(createReviewSignature(suggestions.map((item) => ({ ...item, accepted: true }))), '1:1|2:1');
});

test('EDL 使用有效的 24 fps 非零長度事件', () => {
  const edl = createEdl('測試專案', suggestions);
  assert.match(edl, /001 {2}AX\s+V\s+C\s+00:00:00:00 00:00:01:00 00:00:10:14 00:00:11:14/);
  assert.doesNotMatch(edl, /未採用/);
});

test('FCPXML 定義 format、gap 與正確位置的 marker', () => {
  const fcpxml = createFcpxml('測試 & 專案', suggestions);
  assert.match(fcpxml, /<format id="r1"[^>]+frameDuration="1\/24s"/);
  assert.match(fcpxml, /<gap name="CutMan AI 建議"[^>]+duration="2160\/24s">/);
  assert.match(fcpxml, /<marker start="254\/24s" duration="1\/24s" value="移除停頓 &amp; 保留節奏" note="縮短 &lt; 1 秒"\/>/);
  assert.doesNotMatch(fcpxml, /未採用/);
});

test('CapCut manifest 強制使用新專案安全模式', () => {
  const manifest = JSON.parse(createCapCutManifest('測試專案', suggestions));
  assert.equal(manifest.schema, 'cutman.capcut-package.v2');
  assert.equal(manifest.target.directProjectImport, false);
  assert.equal(manifest.project.preserveOriginal, true);
  assert.equal(manifest.project.safetyMode, 'new-project-only');
  assert.deepEqual(manifest.approvedEdits.map((item) => item.id), [1]);
});

test('CapCut SRT 使用 UTF-8 相容時間格式', () => {
  assert.equal(createCapCutSrt([{ start: 0.5, end: 4, text: '繁體中文字幕' }]), '1\n00:00:00,500 --> 00:00:04,000\n繁體中文字幕\n');
});

test('CapCut ZIP 包含媒體、SRT、清單與匯入指南', async () => {
  const mediaFile = {
    name: '城市 01.mp4',
    type: 'video/mp4',
    size: 3,
    async arrayBuffer() { return Uint8Array.from([1, 2, 3]).buffer; },
  };
  const result = await createCapCutPackage({
    projectName: '測試專案',
    suggestions,
    mediaFiles: [mediaFile],
    captions: [{ start: 0.5, end: 4, text: '測試字幕' }],
  });
  const files = unzipSync(result.bytes);
  assert.deepEqual(Object.keys(files).sort(), ['CAPCUT_IMPORT_GUIDE.txt', 'captions.srt', 'edit_plan.json', 'media/01_城市-01.mp4']);
  assert.equal(strFromU8(files['captions.srt']), '1\n00:00:00,500 --> 00:00:04,000\n測試字幕\n');
  const manifest = JSON.parse(strFromU8(files['edit_plan.json']));
  assert.equal(manifest.media[0].packagePath, 'media/01_城市-01.mp4');
  assert.match(strFromU8(files['CAPCUT_IMPORT_GUIDE.txt']), /CapCut Desktop/);
});
