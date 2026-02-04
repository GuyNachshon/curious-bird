import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BirdDetail.css';
import arrowSvg from './assets/arrow.svg';
import { birds } from './birdData';
import { useBirdTransition } from './BirdTransitionContext';

function BirdDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedBirdId, startBackTransition } = useBirdTransition();
  const bird = birds.find(b => b.id === id);
  const useOverlayVideo = selectedBirdId === id;
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!bird?.audio) return;
    const el = audioRef.current;
    if (!el) return;
    el.play().catch(() => {});
    return () => {
      el.pause();
      el.currentTime = 0;
    };
  }, [bird?.id, bird?.audio]);

  useEffect(() => {
    if (isExiting) audioRef.current?.pause();
  }, [isExiting]);

  if (!bird) {
    return <div>Bird not found</div>;
  }

  const handleBackClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!useOverlayVideo) {
      navigate('/');
      return;
    }
    setIsExiting(true);
    setTimeout(() => startBackTransition(), 150);
  };

  const handleAdditionalInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAdditionalInfo(!showAdditionalInfo);
  };

  return (
    <div className={`bird-detail-container ${isExiting ? 'detail-exiting' : ''}`}>
      {bird.audio && (
        <audio ref={audioRef} src={bird.audio} loop playsInline aria-hidden />
      )}
      <div className={`info-panel-wrapper ${isExiting ? 'detail-exiting' : ''}`}>
        <div className="info-panel expanded">
          <div className="info-sections">
            <div className="info-section english-section">
              <p className="info-row info-title">{bird.english.title}</p>
              {bird.english.details.map((detail, index) => (
                <p key={index} className="info-row">{detail}</p>
              ))}
            </div>

            <div className="section-divider" />

            <div className="info-section arabic-section" dir="rtl">
              <p className="info-row info-title">{bird.arabic.title}</p>
              {bird.arabic.details.map((detail, index) => (
                <p key={index} className="info-row">{detail}</p>
              ))}
            </div>

            <div className="section-divider" />

            <div className="info-section hebrew-section" dir="rtl">
              <p className="info-row info-title">{bird.hebrew.title}</p>
              {bird.hebrew.details.map((detail, index) => (
                <p key={index} className="info-row">{detail}</p>
              ))}
            </div>
          </div>

          <div className="label-section">
            <img
              src={arrowSvg}
              alt=""
              className="toggle-arrow expanded"
            />
            <p className="label-text">{bird.label}</p>
          </div>
        </div>

        {bird.additionalInfo && (
          <div className="additional-info-block">
            <button
              type="button"
              className={`additional-info-trigger ${showAdditionalInfo ? 'expanded' : ''}`}
              onClick={handleAdditionalInfoClick}
              aria-label={showAdditionalInfo ? 'Close additional info' : 'Show additional info'}
              aria-expanded={showAdditionalInfo}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect className="plus-line-h" y="10" width="22" height="2" fill="#73C7EB"/>
                <rect className="plus-line-v" x="10" y="0" width="2" height="22" fill="#73C7EB"/>
              </svg>
            </button>
            <div className={`additional-info-content ${showAdditionalInfo ? 'expanded' : ''}`}>
              <div className="additional-info-inner">
                {bird.additionalInfo.hebrew && (
                  <p className="additional-info-text additional-info-hebrew" dir="rtl">{bird.additionalInfo.hebrew}</p>
                )}
                {bird.additionalInfo.arabic && (
                  <p className="additional-info-text additional-info-arabic" dir="rtl">{bird.additionalInfo.arabic}</p>
                )}
                {bird.additionalInfo.english && (
                  <p className="additional-info-text additional-info-english" dir="ltr">{bird.additionalInfo.english}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`back-arrow ${isExiting ? 'detail-exiting' : ''}`} onClick={handleBackClick}>
        <img src={arrowSvg} alt="Back" className="back-arrow-icon" />
      </div>

      {useOverlayVideo ? (
        <div className="bird-detail-media-wrap bird-detail-media-placeholder" aria-hidden />
      ) : (
        <div className="bird-detail-media-wrap">
          <video
            src={bird.media}
            muted
            playsInline
            loop
            autoPlay
            onEnded={(e) => e.currentTarget.play()}
          />
        </div>
      )}
    </div>
  );
}

export default BirdDetail;
