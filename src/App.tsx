import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css'
import arrowSvg from './assets/arrow.svg'
import { birds } from './birdData';
import { useBirdTransition } from './BirdTransitionContext';

function App() {
  const navigate = useNavigate();
  const { setTransition, selectedBirdId } = useBirdTransition();
  const [failedVideoIds, setFailedVideoIds] = useState<Set<string>>(new Set());

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
    <div className="gallery-container">
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
