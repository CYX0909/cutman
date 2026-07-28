import { Icon } from './Icon';
import cityPreview from '../assets/city-preview.png';

export function PreviewPlayer({ playing, currentTime, onPlay, onSeek }) {
  return (
    <section className="preview-panel" aria-label="影片預覽">
      <div className="preview-image">
        <img src={cityPreview} alt="雨後藍調時刻的城市街道，行人穿越路口" />
        <div className="preview-caption">每個轉角，城市都有新的故事。</div>
      </div>
      <div className="player-controls">
        <time>{formatTime(currentTime)}</time>
        <button className="icon-button" aria-label="上一個剪輯點"><Icon name="SkipBack" size={17} /></button>
        <button className="play-button" onClick={onPlay} aria-label={playing ? '暫停' : '播放'}>
          <Icon name={playing ? 'Pause' : 'Play'} size={19} fill="currentColor" />
        </button>
        <button className="icon-button" aria-label="下一個剪輯點"><Icon name="SkipForward" size={17} /></button>
        <div className="seek-control">
          <input aria-label="播放進度" type="range" min="0" max="84" value={currentTime} onChange={(event) => onSeek(Number(event.target.value))} />
        </div>
        <span className="duration">01:24</span>
        <button className="icon-button" aria-label="全螢幕"><Icon name="Maximize" size={17} /></button>
      </div>
    </section>
  );
}

function formatTime(seconds) {
  return `00:${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}
