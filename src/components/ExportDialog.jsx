import { Icon } from './Icon';

const options = [
  { id: 'capcut', title: 'CapCut 相容套件', detail: 'ZIP：媒體、UTF-8 SRT、剪輯清單與匯入指南', icon: 'Clapperboard' },
  { id: 'fcpxml', title: 'Final Cut Pro XML', detail: '適用 Final Cut Pro 與 DaVinci Resolve', icon: 'FileCode2' },
  { id: 'edl', title: 'CMX 3600 EDL', detail: '適用 Premiere Pro、Resolve 與 Avid', icon: 'FileText' },
];

export function ExportDialog({ onClose, onExport, exportingType, mediaCount }) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="export-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="dialog-heading"><div><h2 id="export-title">輸出至剪輯軟體</h2><p>建議會輸出為新的時間線，不覆寫原始專案。</p></div><button className="icon-button" onClick={onClose} aria-label="關閉"><Icon name="X" /></button></div>
        <div className="export-options">
          {options.map((option) => (
            <button key={option.id} onClick={() => onExport(option.id)} disabled={Boolean(exportingType)} aria-busy={exportingType === option.id}>
              <Icon name={option.icon} size={23} />
              <span><strong>{exportingType === option.id ? '正在建立套件…' : option.title}</strong><small>{option.id === 'capcut' && mediaCount > 0 ? `將封裝 ${mediaCount} 個已匯入檔案` : option.detail}</small></span>
              <Icon name={exportingType === option.id ? 'LoaderCircle' : 'Download'} size={17} className={exportingType === option.id ? 'spin' : ''} />
            </button>
          ))}
        </div>
        <div className="integration-note"><Icon name="PlugZap" size={17} /><span><strong>CapCut Desktop／Web 相容</strong>使用官方支援的媒體與 SRT 匯入流程；套件只建立全新專案，絕不寫入或覆蓋既有草稿。</span></div>
      </section>
    </div>
  );
}
