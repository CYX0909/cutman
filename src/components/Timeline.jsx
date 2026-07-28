import { clipTracks } from '../data/demoData';
import { Icon } from './Icon';

export function Timeline({ suggestions, selectedClip, onSelectClip, appliedSuggestionIds, zoom, onZoom }) {
  const appliedIds = new Set(appliedSuggestionIds);

  return (
    <section className="timeline-panel" aria-label="剪輯時間線">
      <div className="timeline-toolbar">
        <div className="tool-group">
          {['MousePointer2', 'Scissors', 'Magnet', 'Link2', 'Trash2'].map((name, index) => (
            <button key={name} className={`icon-button ${index === 0 ? 'is-selected' : ''}`} aria-label={`時間線工具 ${index + 1}`}><Icon name={name} size={17} /></button>
          ))}
        </div>
        <div className="zoom-control">
          <Icon name="ZoomOut" size={15} />
          <input aria-label="時間線縮放" type="range" min="70" max="130" value={zoom} onChange={(event) => onZoom(Number(event.target.value))} />
          <Icon name="ZoomIn" size={15} />
        </div>
      </div>

      <div className="timeline-content" style={{ '--timeline-zoom': `${zoom}%` }}>
        <div className="track-label track-label--ruler">軌道</div>
        <div className="ruler">
          {[0, 10, 20, 30, 40, 50, 60, 70, 80].map((second) => <span key={second}>{`00:${String(second).padStart(2, '0')}`}</span>)}
        </div>

        <div className="track-label track-label--marker">AI</div>
        <div className="marker-track">
          {suggestions.map((suggestion, index) => (
            <span key={suggestion.id} className={`ai-marker ${appliedIds.has(suggestion.id) ? 'is-applied' : ''}`} style={{ left: `${8 + index * 18}%` }} title={suggestion.title}>
              <Icon name="Sparkles" size={12} />
            </span>
          ))}
          <span className="playhead" style={{ left: '23%' }} />
        </div>

        {clipTracks.map((track) => (
          <div className="track-row" key={track.id}>
            <div className="track-label">
              <strong>{track.name}</strong><span>{track.detail}</span>
              <div><Icon name={track.type === 'video' ? 'Eye' : 'Volume2'} size={13} /><Icon name="Lock" size={12} /></div>
            </div>
            <div className={`clips clips--${track.type}`}>
              {track.clips.map((clip) => (
                <button
                  key={clip.id}
                  className={`clip clip--${track.type} ${clip.tone ? `clip--${clip.tone}` : ''} ${track.color ? `clip--${track.color}` : ''} ${selectedClip === clip.id ? 'is-selected' : ''}`}
                  style={{ width: `${clip.width}%` }}
                  onClick={() => onSelectClip(clip.id)}
                  title={clip.label}
                >
                  {track.type === 'audio' ? <><span className="waveform" /><small>{clip.label}</small></> : <span>{clip.label}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
