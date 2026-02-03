import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimationControls } from 'framer-motion';
import { birds } from './birdData';

export type TransitionPhase =
  | 'transitioning-to-detail'
  | 'detail'
  | 'transitioning-to-gallery';

export interface TransitionRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface BirdTransitionState {
  selectedBirdId: string | null;
  phase: TransitionPhase;
  fromRect: TransitionRect | null;
  videoCurrentTime: number;
}

interface BirdTransitionContextValue extends BirdTransitionState {
  setTransition: (birdId: string, rect: TransitionRect, currentTime: number) => void;
  startBackTransition: () => void;
  completeDetailTransition: () => void;
  completeBackTransition: () => void;
}

const BirdTransitionContext = createContext<BirdTransitionContextValue | null>(null);

export function useBirdTransition() {
  const ctx = useContext(BirdTransitionContext);
  if (!ctx) throw new Error('useBirdTransition must be used within BirdTransitionProvider');
  return ctx;
}

const transitionDuration = 0.5;
const ease = [0.25, 0.1, 0.25, 1] as const;

function SharedVideoOverlay() {
  const {
    selectedBirdId,
    phase,
    fromRect,
    videoCurrentTime,
    completeDetailTransition,
    completeBackTransition,
  } = useBirdTransition();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controls = useAnimationControls();

  const bird = selectedBirdId ? birds.find((b) => b.id === selectedBirdId) : null;

  // Seek and play when overlay mounts
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !bird) return;
    const seek = () => {
      video.currentTime = videoCurrentTime;
      video.play().catch(() => {});
    };
    if (video.readyState >= 2) seek();
    else video.addEventListener('loadeddata', seek, { once: true });
  }, [bird?.id, videoCurrentTime]);

  // Animate: fromRect -> full screen on enter; full screen -> fromRect on back
  useEffect(() => {
    if (!fromRect || !bird) return;
    if (phase === 'transitioning-to-detail') {
      controls
        .start({
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          transition: { duration: transitionDuration, ease },
        })
        .then(completeDetailTransition);
    } else if (phase === 'transitioning-to-gallery') {
      controls
        .start({
          left: fromRect.left,
          top: fromRect.top,
          width: fromRect.width,
          height: fromRect.height,
          transition: { duration: transitionDuration, ease },
        })
        .then(completeBackTransition);
    }
  }, [phase, fromRect, bird, controls, completeDetailTransition, completeBackTransition]);

  if (!bird || !fromRect) return null;

  const fullScreen = {
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  };

  return createPortal(
    <motion.div
      className="bird-shared-video-overlay"
      style={{
        position: 'fixed',
        zIndex: 5,
        overflow: 'hidden',
        pointerEvents: 'none',
        border: '3px solid #73c7eb',
        boxSizing: 'border-box',
      }}
      initial={{
        left: fromRect.left,
        top: fromRect.top,
        width: fromRect.width,
        height: fromRect.height,
      }}
      animate={phase === 'detail' ? fullScreen : controls}
      transition={phase === 'detail' ? { duration: 0 } : undefined}
    >
      <video
        ref={videoRef}
        src={bird.media}
        muted
        playsInline
        loop
        autoPlay
        onEnded={(e) => e.currentTarget.play()}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </motion.div>,
    document.body
  );
}

export function BirdTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<BirdTransitionState>({
    selectedBirdId: null,
    phase: 'transitioning-to-detail',
    fromRect: null,
    videoCurrentTime: 0,
  });

  const setTransition = useCallback(
    (birdId: string, rect: TransitionRect, currentTime: number) => {
      setState({
        selectedBirdId: birdId,
        phase: 'transitioning-to-detail',
        fromRect: rect,
        videoCurrentTime: currentTime,
      });
    },
    []
  );

  const startBackTransition = useCallback(() => {
    setState((s) =>
      s.selectedBirdId && s.fromRect
        ? { ...s, phase: 'transitioning-to-gallery' }
        : s
    );
  }, []);

  const completeDetailTransition = useCallback(() => {
    setState((s) => (s.selectedBirdId ? { ...s, phase: 'detail' as TransitionPhase } : s));
  }, []);

  const completeBackTransition = useCallback(() => {
    navigate('/', { state: { fromBirdBack: true } });
    // Clear overlay after gallery has painted – avoids blank screen
    setTimeout(() => {
      setState({
        selectedBirdId: null,
        phase: 'transitioning-to-detail',
        fromRect: null,
        videoCurrentTime: 0,
      });
    }, 100);
  }, [navigate]);

  return (
    <BirdTransitionContext.Provider
      value={{
        ...state,
        setTransition,
        startBackTransition,
        completeDetailTransition,
        completeBackTransition,
      }}
    >
      {children}
      {state.selectedBirdId && <SharedVideoOverlay />}
    </BirdTransitionContext.Provider>
  );
}
