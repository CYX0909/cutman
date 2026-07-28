import { useEffect, useRef, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { PreviewPlayer } from './components/PreviewPlayer';
import { Timeline } from './components/Timeline';
import { Inspector } from './components/Inspector';
import { ExportDialog } from './components/ExportDialog';
import { EmptyView } from './components/EmptyView';
import { capcutDemoCaptions, suggestionsSeed } from './data/demoData';
import { downloadCapCutPackage } from './domain/capcutBundle';
import { createEdl, createFcpxml, createReviewSignature, downloadText, learnFromReview, loadProfile } from './domain/styleEngine';

function App() {
  const [activeView, setActiveView] = useState('workspace');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(() => window.matchMedia('(min-width: 901px)').matches);
  const [projectName, setProjectName] = useState('城市散步 Vol. 03');
  const [profile, setProfile] = useState(loadProfile);
  const [suggestions, setSuggestions] = useState(suggestionsSeed);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [appliedSuggestionIds, setAppliedSuggestionIds] = useState([]);
  const [lastAppliedReview, setLastAppliedReview] = useState('');
  const [selectedClip, setSelectedClip] = useState('v1-2');
  const [zoom, setZoom] = useState(100);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(18);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportingType, setExportingType] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [toast, setToast] = useState('');
  const fileInputRef = useRef(null);
  const currentReviewSignature = createReviewSignature(suggestions);
  const reviewIsApplied = currentReviewSignature === lastAppliedReview;

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => setCurrentTime((time) => (time >= 84 ? 0 : time + 1)), 1000);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function analyzeFootage() {
    if (analyzing) return;
    setAnalyzing(true);
    setProgress(0);
    setAppliedSuggestionIds([]);
    setLastAppliedReview('');
    const timer = window.setInterval(() => {
      setProgress((value) => {
        const next = Math.min(100, value + 10);
        if (next === 100) {
          window.clearInterval(timer);
          window.setTimeout(() => setAnalyzing(false), 240);
          setToast('分析完成：找到 5 項符合你風格的剪輯建議');
        }
        return next;
      });
    }, 120);
  }

  function toggleSuggestion(id) {
    setSuggestions((items) => items.map((item) => item.id === id ? { ...item, accepted: !item.accepted } : item));
  }

  function applySuggestions() {
    if (reviewIsApplied) {
      setToast('這一批審核結果已套用，不會重複計入風格模型');
      return;
    }

    const acceptedIds = suggestions.filter((item) => item.accepted).map((item) => item.id);
    const acceptedCount = acceptedIds.length;
    setProfile((currentProfile) => learnFromReview(currentProfile, acceptedCount, suggestions.length));
    setAppliedSuggestionIds(acceptedIds);
    setLastAppliedReview(currentReviewSignature);
    setToast(`已建立新時間線版本，套用 ${acceptedCount} 項變更`);
  }

  function importMedia(event) {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) {
      setMediaFiles(files);
      setToast(`已加入 ${files.length} 個素材，CapCut 套件會保留原始檔案`);
    }
    event.target.value = '';
  }

  async function exportTimeline(type) {
    const safeName = projectName.trim().replace(/\s+/g, '-') || 'CutMan-Project';
    setExportingType(type);
    try {
      if (type === 'capcut') {
        const result = await downloadCapCutPackage({ projectName, suggestions, mediaFiles, captions: capcutDemoCaptions });
        const mediaMessage = result.mediaCount > 0 ? `，包含 ${result.mediaCount} 個媒體檔` : '，請解壓後加入原始媒體';
        setToast(`已輸出 ${result.filename}${mediaMessage}`);
      }
      if (type === 'edl') downloadText(`${safeName}-CutMan.edl`, createEdl(projectName, suggestions));
      if (type === 'fcpxml') downloadText(`${safeName}-CutMan.fcpxml`, createFcpxml(projectName, suggestions), 'application/xml');
      setExportOpen(false);
      if (type !== 'capcut') setToast(`已輸出 ${type === 'edl' ? 'EDL' : 'FCPXML'}`);
    } catch (error) {
      console.error('輸出失敗', error);
      setToast(`輸出失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setExportingType('');
    }
  }

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onSelect={setActiveView} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} />
      <div className="app-main">
        <Topbar projectName={projectName} onProjectName={setProjectName} onImport={() => fileInputRef.current?.click()} onExport={() => setExportOpen(true)} />
        <input ref={fileInputRef} type="file" multiple accept="video/*,audio/*,image/*,.xml,.fcpxml,.edl" hidden onChange={importMedia} />
        {activeView === 'workspace' ? (
          <div className={`workspace ${inspectorOpen ? '' : 'workspace--inspector-closed'}`}>
            <main className="editing-area">
              <div className="workspace-heading">
                <div><h1>剪輯工作台</h1><p>AI 建議皆可審核、回復，原始素材永不覆寫。</p></div>
                <button className="button button--ghost inspector-trigger" onClick={() => setInspectorOpen(true)}>風格檢查器</button>
              </div>
              <PreviewPlayer playing={playing} currentTime={currentTime} onPlay={() => setPlaying((value) => !value)} onSeek={setCurrentTime} />
              <Timeline suggestions={suggestions} selectedClip={selectedClip} onSelectClip={setSelectedClip} appliedSuggestionIds={appliedSuggestionIds} zoom={zoom} onZoom={setZoom} />
            </main>
            {inspectorOpen ? (
              <Inspector
                profile={profile}
                suggestions={suggestions}
                onAnalyze={analyzeFootage}
                analyzing={analyzing}
                progress={progress}
                onToggleSuggestion={toggleSuggestion}
                onApply={applySuggestions}
                reviewIsApplied={reviewIsApplied}
                onClose={() => setInspectorOpen(false)}
              />
            ) : null}
          </div>
        ) : <EmptyView activeView={activeView} onBack={() => setActiveView('workspace')} />}
        <footer className="statusbar"><span>專案：3840 × 2160（4K）</span><span>24 fps</span><span>Rec.709</span><span>48 kHz</span><span className="statusbar-right"><i />本機風格模型已就緒</span></footer>
      </div>
      {exportOpen ? <ExportDialog onClose={() => setExportOpen(false)} onExport={exportTimeline} exportingType={exportingType} mediaCount={mediaFiles.length} /> : null}
      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </div>
  );
}

export default App;
