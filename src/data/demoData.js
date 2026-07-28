export const styleSignals = [
  { id: 'pace', label: '節奏', value: '平均鏡頭 3.2 秒', score: 82 },
  { id: 'transition', label: '轉場', value: '偏好硬切', score: 94 },
  { id: 'caption', label: '字幕', value: '下方置中・雙行內', score: 78 },
  { id: 'audio', label: '音訊', value: '對白優先', score: 91 },
  { id: 'shot', label: '鏡頭偏好', value: '中景與動態鏡頭', score: 74 },
];

export const suggestionsSeed = [
  { id: 1, time: '00:00:10:14', title: '移除停頓片段', detail: '縮短 0.6 秒，維持對白節奏', category: '節奏', accepted: true },
  { id: 2, time: '00:00:18:22', title: '於動作點切換', detail: '將切點前移 8 格', category: '轉場', accepted: true },
  { id: 3, time: '00:00:33:05', title: '平衡對白音量', detail: '對白提高 +2 dB', category: '音訊', accepted: true },
  { id: 4, time: '00:00:46:17', title: '插入 B-roll 鏡頭', detail: '以街景覆蓋跳接', category: '鏡頭', accepted: true },
  { id: 5, time: '00:01:08:09', title: '延長音樂淡出', detail: '尾奏延長 1.2 秒', category: '音訊', accepted: false },
];

export const capcutDemoCaptions = [
  { start: 0.5, end: 4, text: '每個轉角，城市都有新的故事。' },
  { start: 4.2, end: 8, text: 'CutMan 先觀察你的節奏與鏡頭選擇。' },
  { start: 8.2, end: 14, text: '每一項建議都能先審核，再套用。' },
  { start: 14.2, end: 19.5, text: '原始素材永遠保留，剪輯風格仍然是你。' },
];

export const clipTracks = [
  {
    id: 'v1',
    name: 'V1',
    detail: '主畫面',
    type: 'video',
    clips: [
      { id: 'v1-1', width: 15, tone: 'street', label: '開場街景' },
      { id: 'v1-2', width: 21, tone: 'crossing', label: '人物過街' },
      { id: 'v1-3', width: 18, tone: 'skyline', label: '城市遠景' },
      { id: 'v1-4', width: 16, tone: 'night', label: '夜間街道' },
      { id: 'v1-5', width: 22, tone: 'street', label: '步行跟拍' },
    ],
  },
  {
    id: 'v2',
    name: 'V2',
    detail: 'B-roll',
    type: 'video',
    clips: [
      { id: 'v2-1', width: 13, tone: 'bike', label: '單車' },
      { id: 'v2-2', width: 17, tone: 'station', label: '車站' },
      { id: 'v2-3', width: 20, tone: 'coffee', label: '咖啡店' },
      { id: 'v2-4', width: 15, tone: 'neon', label: '霓虹招牌' },
      { id: 'v2-5', width: 24, tone: 'rain', label: '雨夜' },
    ],
  },
  { id: 'a1', name: 'A1', detail: '對白', type: 'audio', color: 'voice', clips: [{ id: 'a1-1', width: 100, label: 'Narration.wav' }] },
  { id: 'a2', name: 'A2', detail: '音樂', type: 'audio', color: 'music', clips: [{ id: 'a2-1', width: 100, label: 'City Lights.wav' }] },
];

export const navItems = [
  { id: 'workspace', label: '剪輯工作台', icon: 'Clapperboard' },
  { id: 'style', label: '風格模型', icon: 'BrainCircuit' },
  { id: 'library', label: '素材庫', icon: 'FolderOpen' },
  { id: 'learning', label: '學習紀錄', icon: 'History' },
  { id: 'export', label: '輸出中心', icon: 'Upload' },
];
