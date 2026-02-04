import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css'
import arrowSvg from './assets/arrow.svg'
import { birds } from './birdData';
import { useBirdTransition } from './BirdTransitionContext';

const IDLE_HINT_DELAY_MS = 60_000;
const IDLE_HINT_DURATION_MS = 5_000;

function App() {
  const navigate = useNavigate();
  const { setTransition, selectedBirdId } = useBirdTransition();
  const [failedVideoIds, setFailedVideoIds] = useState<Set<string>>(new Set());
  const [showIdleHint, setShowIdleHint] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintDurationRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleIdleHint = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (hintDurationRef.current) clearTimeout(hintDurationRef.current);
    setShowIdleHint(false);
    idleTimerRef.current = setTimeout(() => {
      setShowIdleHint(true);
      hintDurationRef.current = setTimeout(() => {
        setShowIdleHint(false);
        scheduleIdleHint();
      }, IDLE_HINT_DURATION_MS);
    }, IDLE_HINT_DELAY_MS);
  }, []);

  useEffect(() => {
    scheduleIdleHint();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (hintDurationRef.current) clearTimeout(hintDurationRef.current);
    };
  }, [scheduleIdleHint]);

  useEffect(() => {
    const container = document.querySelector('.gallery-container');
    if (!container) return;
    const reset = () => scheduleIdleHint();
    container.addEventListener('pointermove', reset);
    container.addEventListener('pointerdown', reset);
    container.addEventListener('scroll', reset);
    container.addEventListener('keydown', reset);
    return () => {
      container.removeEventListener('pointermove', reset);
      container.removeEventListener('pointerdown', reset);
      container.removeEventListener('scroll', reset);
      container.removeEventListener('keydown', reset);
    };
  }, [scheduleIdleHint]);

  const handleVideoError = useCallback((birdId: string) => {
    setFailedVideoIds((prev) => new Set(prev).add(birdId));
  }, []);

  const visibleBirds = birds.filter((b) => !failedVideoIds.has(b.id));

  const handleBirdClick = (e: React.MouseEvent, birdId: string) => {
    const card = e.currentTarget;
    const mediaWrap = card.querySelector('.bird-media-wrap') as HTMLElement | null;
    const video = card.querySelector('video') as HTMLVideoElement | null;
    const currentTime = video?.currentTime ?? 0;
    const rect = mediaWrap?.getBoundingClientRect() ?? card.getBoundingClientRect();
    setTransition(birdId, {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    }, currentTime);
    navigate(`/bird/${birdId}`);
  };

  return (
    <div className={`gallery-container ${showIdleHint ? 'idle-hint-active' : ''}`}>
      <div className="gallery-grid">
        {visibleBirds.map((bird) => (
          <div key={bird.id} className="bird-card" onClick={(e) => handleBirdClick(e, bird.id)}>
            <div
              className={`bird-media-wrap ${selectedBirdId === bird.id ? 'bird-media-wrap-hiding' : ''}`}
            >
              <video
                src={bird.media}
                muted
                playsInline
                loop
                autoPlay
                onEnded={(e) => e.currentTarget.play()}
                onError={() => handleVideoError(bird.id)}
              />
            </div>
            <div className="bird-label">
              <img src={arrowSvg} alt="Arrow" className="arrow-icon" />
              <p>{bird.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App
