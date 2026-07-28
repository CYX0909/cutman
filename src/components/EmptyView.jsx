import { navItems } from '../data/demoData';
import { Icon } from './Icon';

export function EmptyView({ activeView, onBack }) {
  const current = navItems.find((item) => item.id === activeView);
  return (
    <main className="empty-view">
      <div className="empty-icon"><Icon name={current?.icon ?? 'Settings'} size={30} /></div>
      <h1>{current?.label ?? '設定'}</h1>
      <p>這個模組已納入產品架構，第一版 MVP 先聚焦於風格學習、建議審核與時間線輸出。</p>
      <button className="button button--primary" onClick={onBack}><Icon name="ArrowLeft" size={16} />返回剪輯工作台</button>
    </main>
  );
}
