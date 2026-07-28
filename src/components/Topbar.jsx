import { Icon } from './Icon';

export function Topbar({ projectName, onProjectName, onImport, onExport }) {
  return (
    <header className="topbar">
      <div className="project-title">
        <input aria-label="專案名稱" value={projectName} onChange={(event) => onProjectName(event.target.value)} />
        <span className="saved-state"><span className="status-dot" />已儲存</span>
      </div>
      <div className="topbar-actions">
        <button className="button button--ghost" onClick={onImport} aria-label="匯入素材"><Icon name="FolderPlus" size={16} /><span>匯入素材</span></button>
        <button className="button button--ghost" onClick={onExport} aria-label="輸出時間線"><Icon name="Share2" size={16} /><span>輸出時間線</span></button>
        <button className="icon-button" aria-label="說明"><Icon name="CircleHelp" /></button>
        <div className="avatar" aria-label="使用者 CYX">CYX</div>
      </div>
    </header>
  );
}
