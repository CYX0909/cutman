import { navItems } from '../data/demoData';
import { Icon } from './Icon';

export function Sidebar({ activeView, onSelect, collapsed, onToggle }) {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="brand-row">
        <div className="brand-mark" aria-hidden="true"><span /></div>
        <strong className="brand-name">CutMan</strong>
        <button className="icon-button sidebar-toggle" onClick={onToggle} aria-label={collapsed ? '展開側邊欄' : '收合側邊欄'}>
          <Icon name={collapsed ? 'PanelLeftOpen' : 'PanelLeftClose'} size={19} />
        </button>
      </div>

      <nav className="main-nav" aria-label="主要導覽">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'is-active' : ''}`}
            onClick={() => onSelect(item.id)}
            aria-label={item.label}
            aria-current={activeView === item.id ? 'page' : undefined}
          >
            <Icon name={item.icon} size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={() => onSelect('settings')} aria-label="設定">
          <Icon name="Settings" size={20} />
          <span>設定</span>
        </button>
        <div className="local-mode"><span className="status-dot" />本機模式</div>
      </div>
    </aside>
  );
}
