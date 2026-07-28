import { styleSignals } from '../data/demoData';
import { Icon } from './Icon';

export function Inspector({ profile, suggestions, onAnalyze, analyzing, progress, onToggleSuggestion, onApply, reviewIsApplied, onClose }) {
  const acceptedCount = suggestions.filter((suggestion) => suggestion.accepted).length;
  return (
    <aside className="inspector">
      <div className="inspector-heading">
        <div><h2>我的剪輯風格</h2><p>依據 {profile.sessions} 次剪輯工作階段</p></div>
        {onClose ? <button className="icon-button inspector-close" onClick={onClose} aria-label="關閉檢查器"><Icon name="X" /></button> : null}
      </div>

      <div className="confidence-block">
        <div className="confidence-ring" style={{ '--confidence': `${profile.confidence * 3.6}deg` }}><strong>{profile.confidence}%</strong></div>
        <div><span>風格信心度</span><p>{analyzing ? '正在比對素材與你的剪輯決策…' : '模型已準備好產生本次剪輯建議。'}</p></div>
      </div>

      <button className="button button--outline analyze-button" onClick={onAnalyze} disabled={analyzing}>
        <Icon name={analyzing ? 'LoaderCircle' : 'ScanLine'} size={17} className={analyzing ? 'spin' : ''} />
        {analyzing ? `分析中 ${progress}%` : '開始分析'}
      </button>
      {analyzing ? <div className="analysis-progress"><span style={{ width: `${progress}%` }} /></div> : null}

      <section className="inspector-section">
        <h3>觀察摘要</h3>
        <div className="signal-list">
          {styleSignals.map((signal) => (
            <div className="signal-row" key={signal.id}>
              <div><span>{signal.label}</span><strong>{signal.value}</strong></div>
              <span className="mini-meter"><i style={{ width: `${signal.score}%` }} /></span>
            </div>
          ))}
        </div>
      </section>

      <section className="inspector-section inspector-section--suggestions">
        <div className="section-title"><h3>待審核變更</h3><span>{acceptedCount}/{suggestions.length} 已選</span></div>
        <div className="suggestion-list">
          {suggestions.map((suggestion) => (
            <label className={`suggestion ${suggestion.accepted ? 'is-accepted' : ''}`} key={suggestion.id}>
              <input type="checkbox" checked={suggestion.accepted} onChange={() => onToggleSuggestion(suggestion.id)} />
              <span className="suggestion-check"><Icon name={suggestion.accepted ? 'Check' : 'X'} size={12} /></span>
              <span className="suggestion-time">{suggestion.time}</span>
              <span><strong>{suggestion.title}</strong><small>{suggestion.detail}</small></span>
            </label>
          ))}
        </div>
      </section>

      <div className="safety-row">
        <div><Icon name="ShieldCheck" size={18} /><span><strong>保留原始素材</strong><small>只建立新的時間線版本</small></span></div>
        <span className="safety-badge" aria-label="保留原始素材安全模式已鎖定"><Icon name="Lock" size={12} />已鎖定</span>
      </div>

      <button className="button button--primary apply-button" onClick={onApply} disabled={acceptedCount === 0 || analyzing || reviewIsApplied}>
        <Icon name="WandSparkles" size={17} />{reviewIsApplied ? `已套用 ${acceptedCount} 項` : `套用建議（${acceptedCount}）`}
      </button>
    </aside>
  );
}
