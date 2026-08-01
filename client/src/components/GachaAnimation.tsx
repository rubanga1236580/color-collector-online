import { useEffect, useMemo, useRef, useState } from 'react';
import { COLORS } from '../data/colors';

type AnimationPhase = 'waiting' | 'painting' | 'stop' | 'newColor' | 'burst' | 'result';
type GachaRarity = 'normal' | 'rare' | 'superRare' | 'legendRare' | 'specialRare';

type GachaAnimationProps = {
  color: string;
  rarity: GachaRarity;
  isNew: boolean;
  onComplete: () => void;
};

const rarityLabelMap: Record<GachaRarity, string> = {
  normal: 'Normal',
  rare: 'Rare',
  superRare: 'Super Rare',
  legendRare: 'Legend Rare',
  specialRare: 'Special Rare',
};

const PHASE_DURATIONS: Record<AnimationPhase, number> = {
  waiting: 0,
  painting: 2500,
  stop: 1500,
  newColor: 1800,
  burst: 1200,
  result: 1500,
};

function normalizeColor(input: string): string {
  const value = input.trim();
  if (!value) {
    return '#ffffff';
  }
  return value;
}

function getRarityEffectColor(rarity: GachaRarity): string {
  switch (rarity) {
    case 'normal':
      return '#ffffff';
    case 'rare':
      return '#22c55e';
    case 'superRare':
      return '#2563eb';
    case 'legendRare':
      return '#facc15';
    case 'specialRare':
      return '#f9a8d4';
    default:
      return '#ffffff';
  }
}

export default function GachaAnimation({ color, rarity, isNew, onComplete }: GachaAnimationProps) {
  const [phase, setPhase] = useState<AnimationPhase>('waiting');
  const [resultReady, setResultReady] = useState(false);
  const completedRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const animationStartedRef = useRef(false);
  const colorData = useMemo(() => COLORS.find((item) => item.id === color), [color]);
  const safeColor = useMemo(() => colorData?.displayColor ?? normalizeColor(color), [colorData, color]);
  const resultCode = useMemo(() => colorData?.code ?? normalizeColor(color), [colorData, color]);
  const effectColor = useMemo(() => getRarityEffectColor(rarity), [rarity]);

  const clearAllTimers = () => {
    for (const timer of timersRef.current) {
      window.clearTimeout(timer);
    }
    timersRef.current = [];
  };

  useEffect(() => {
    completedRef.current = false;
    animationStartedRef.current = false;
    setResultReady(false);
    clearAllTimers();
    setPhase('waiting');
  }, [color, rarity, isNew]);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  useEffect(() => {
    switch (phase) {
      case 'waiting':
        console.log('[GA] waiting');
        break;
      case 'painting':
        console.log('[GA] painting start');
        break;
      case 'stop':
        console.log('[GA] stop start');
        break;
      case 'newColor':
        console.log('[GA] newColor start');
        break;
      case 'burst':
        console.log('[GA] burst start');
        break;
      case 'result':
        console.log('[GA] result start');
        break;
      default:
        break;
    }
  }, [phase]);

  const startAnimationSequence = () => {
    if (animationStartedRef.current) {
      return;
    }

    animationStartedRef.current = true;
    clearAllTimers();

    timersRef.current.push(
      window.setTimeout(() => {
        setPhase('stop');
      }, PHASE_DURATIONS.painting),
    );

    if (isNew) {
      timersRef.current.push(
        window.setTimeout(() => {
          setPhase('newColor');
        }, PHASE_DURATIONS.painting + PHASE_DURATIONS.stop),
      );

      timersRef.current.push(
        window.setTimeout(() => {
          setPhase('burst');
        }, PHASE_DURATIONS.painting + PHASE_DURATIONS.stop + PHASE_DURATIONS.newColor),
      );

      timersRef.current.push(
        window.setTimeout(() => {
          setPhase('result');
          setResultReady(false);
        }, PHASE_DURATIONS.painting + PHASE_DURATIONS.stop + PHASE_DURATIONS.newColor + PHASE_DURATIONS.burst),
      );

      timersRef.current.push(
        window.setTimeout(() => {
          setResultReady(true);
        }, PHASE_DURATIONS.painting + PHASE_DURATIONS.stop + PHASE_DURATIONS.newColor + PHASE_DURATIONS.burst + PHASE_DURATIONS.result),
      );

      return;
    }

    timersRef.current.push(
      window.setTimeout(() => {
        setPhase('burst');
      }, PHASE_DURATIONS.painting + PHASE_DURATIONS.stop),
    );

    timersRef.current.push(
      window.setTimeout(() => {
        setPhase('result');
        setResultReady(false);
      }, PHASE_DURATIONS.painting + PHASE_DURATIONS.stop + PHASE_DURATIONS.burst),
    );

    timersRef.current.push(
      window.setTimeout(() => {
        setResultReady(true);
      }, PHASE_DURATIONS.painting + PHASE_DURATIONS.stop + PHASE_DURATIONS.burst + PHASE_DURATIONS.result),
    );
  };

  const handleStageClick = () => {
    if (phase === 'waiting') {
      startAnimationSequence();
      setPhase('painting');
      return;
    }

    if (phase === 'result' && resultReady && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  };

  return (
    <section className="gacha-animation" aria-live="polite" aria-label="ガチャ演出">
      <style>{`
        .gacha-animation {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, calc(-50% - 30px));
          width: min(600px, 90vw);
          height: min(600px, 80vh);
          border-radius: 16px;
          background: rgba(0, 0, 0, 0.78);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.18);
          z-index: 3000;
        }

        .gacha-stage {
          height: 75%;
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          text-align: center;
          color: #fff;
          animation: stage-fade 280ms ease;
          font-family: "Segoe UI", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", sans-serif;
        }

        .phase-waiting .waiting-wrap {
          width: 96%;
          height: 96%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .phase-waiting .question {
          font-size: 180px;
          margin: 0;
          line-height: 1;
          animation: pulse 900ms ease-in-out infinite;
          text-shadow: 0 0 24px rgba(255, 255, 255, 0.35);
        }

        .tap-to-continue {
          margin: 0;
          font-size: 22px;
          letter-spacing: 0.06em;
          color: rgba(255, 255, 255, 0.92);
          animation: click-blink 1100ms ease-in-out infinite;
        }

        .paint-scene {
          position: relative;
          width: min(340px, 92%);
          height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .paint-question {
          margin: 0;
          font-size: 180px;
          line-height: 1;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 0 24px rgba(255, 255, 255, 0.2);
        }

        .paint-glow {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 180px;
          line-height: 1;
          color: #ffffff;
          text-shadow: 0 0 22px rgba(255, 255, 255, 0.7), 0 0 48px rgba(255, 255, 255, 0.45);
          clip-path: inset(0 100% 0 0);
          animation: paint-reveal 2500ms ease-out forwards;
          pointer-events: none;
        }

        .paint-color-reveal {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 180px;
          line-height: 1;
          clip-path: inset(0 100% 0 0);
          opacity: 0;
          filter: drop-shadow(0 0 0 rgba(255, 255, 255, 0));
          animation: paint-color-appear 2500ms ease-out forwards;
          pointer-events: none;
        }

        .paint-mask-question {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 180px;
          line-height: 1;
          opacity: 0;
          clip-path: inset(0 100% 0 0);
          filter: saturate(1.18) brightness(1.06);
          animation: paint-mask-reveal 2500ms ease-out forwards;
          pointer-events: none;
        }

        .paint-color-band {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 0;
          height: 42px;
          border-radius: 999px;
          opacity: 0.18;
          transform: translate(-50%, -50%);
          filter: blur(2.2px) saturate(1.2);
          animation: paint-band-sweep 2500ms ease-out forwards;
          pointer-events: none;
        }

        .paint-trail {
          position: absolute;
          left: -140px;
          top: 50%;
          width: 130px;
          height: 18px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.55) 45%, rgba(255, 255, 255, 0.9));
          filter: blur(1.2px);
          transform: translateY(-50%);
          animation: brush-trail-sweep 2500ms ease-in-out forwards;
          pointer-events: none;
        }

        .paint-stroke {
          position: absolute;
          left: 50%;
          top: 50%;
          height: 14px;
          width: 0;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.22));
          box-shadow: 0 0 14px rgba(255, 255, 255, 0.38);
          transform: translate(-50%, -50%);
          animation: paint-stroke-grow 2500ms ease-out forwards;
          pointer-events: none;
        }

        .paint-brush {
          position: absolute;
          left: -68px;
          top: 50%;
          font-size: 90px;
          transform: translateY(-50%);
          filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5));
          animation: brush-sweep 2500ms linear forwards;
          pointer-events: none;
        }

        .phase-burst .burst-wrap {
          position: relative;
          width: min(280px, 88%);
          height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }

        .phase-stop .stop-wrap {
          position: relative;
          width: min(340px, 92%);
          height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          overflow: hidden;
        }

        .phase-stop .stop-wrap::before {
          content: '';
          position: absolute;
          inset: -18%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.62) 0%, rgba(255, 255, 255, 0.26) 34%, rgba(255, 255, 255, 0) 74%);
          animation: stop-charge-glow 2000ms ease-in-out forwards;
          pointer-events: none;
        }

        .phase-stop .stop-question {
          position: relative;
          z-index: 1;
          margin: 0;
          font-size: 180px;
          line-height: 1;
          color: #ffffff;
          text-shadow: 0 0 14px rgba(255, 255, 255, 0.52), 0 0 36px rgba(255, 255, 255, 0.46);
          animation: stop-question-charge 2000ms ease-in-out forwards;
        }

        .phase-newColor .new-color-wrap {
          position: relative;
          width: min(420px, 92%);
          min-height: 124px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          overflow: hidden;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0.08));
          border-top: 2px solid rgba(255, 255, 255, 0.9);
          border-bottom: 2px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 28px rgba(255, 255, 255, 0.24);
        }

        .phase-newColor .new-color-wrap::before {
          content: '';
          position: absolute;
          left: -14%;
          right: -14%;
          top: 50%;
          height: 72%;
          transform: translateY(-50%);
          background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.42), rgba(255, 255, 255, 0));
          animation: new-color-band-sweep 1000ms ease-out forwards;
          pointer-events: none;
        }

        .phase-reveal .reveal-wrap {
          position: relative;
          width: min(260px, 88%);
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .phase-reveal .reveal-bg-pulse {
          position: absolute;
          inset: -30%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.08) 35%, rgba(255, 255, 255, 0) 72%);
          opacity: 0.18;
          animation: reveal-bg-pulse 2200ms ease-in-out infinite;
          pointer-events: none;
        }

        .phase-reveal .reveal-question {
          margin: 0;
          font-size: 180px;
          line-height: 1;
          color: rgba(255, 255, 255, 0.92);
          text-shadow: 0 0 18px rgba(255, 255, 255, 0.35);
          position: relative;
          z-index: 1;
          animation: reveal-question-breathe 2200ms ease-in-out infinite;
        }

        .phase-reveal .reveal-pulse {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 180px;
          line-height: 1;
          color: #ffffff;
          opacity: 0.25;
          text-shadow: 0 0 24px rgba(255, 255, 255, 0.65), 0 0 42px rgba(255, 255, 255, 0.45);
          animation: reveal-pulse 1200ms ease-in-out infinite;
          pointer-events: none;
        }

        .new-color-text {
          position: relative;
          z-index: 1;
          margin: 0;
          font-size: clamp(30px, 8vw, 44px);
          font-weight: 800;
          letter-spacing: 0.14em;
          color: #ffffff;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.45);
          animation: new-color-pop 1000ms ease-out forwards;
        }

        .burst-orb {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
          animation: paint-burst-core 1200ms ease-out forwards;
          border: 2px solid rgba(255, 255, 255, 0.85);
          position: relative;
          z-index: 2;
        }

        .burst-splash {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 22px;
          height: 22px;
          margin-left: -11px;
          margin-top: -11px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.7);
          opacity: 0;
          filter: brightness(1.08);
          animation: splash-fly 1200ms ease-out forwards;
        }

        .splash-1 {
          --tx: -74px;
          --ty: -46px;
          animation-delay: 90ms;
        }

        .splash-2 {
          --tx: 78px;
          --ty: -44px;
          animation-delay: 120ms;
        }

        .splash-3 {
          --tx: -92px;
          --ty: 12px;
          animation-delay: 145ms;
        }

        .splash-4 {
          --tx: 94px;
          --ty: 18px;
          animation-delay: 165ms;
        }

        .splash-5 {
          --tx: 0px;
          --ty: -88px;
          animation-delay: 185ms;
        }

        .burst-label {
          font-size: 20px;
          letter-spacing: 0.06em;
        }

        .phase-result .result-wrap {
          width: 96%;
          height: 96%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .result-orb {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.85);
          box-shadow: 0 0 18px rgba(255, 255, 255, 0.35);
        }

        .result-color {
          font-size: 42px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .result-status {
          font-size: 18px;
          opacity: 0.95;
        }

        .is-new {
          color: #80f8a8;
          font-weight: 700;
        }

        .is-old {
          color: #f5d57d;
          font-weight: 700;
        }

        @keyframes stage-fade {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        @keyframes click-blink {
          0%,
          100% {
            opacity: 0.45;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes paint-burst-core {
          0% {
            transform: scale(0.35);
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.75);
          }
          55% {
            transform: scale(2.75);
            box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.12);
          }
          100% {
            transform: scale(2.45);
            box-shadow: 0 0 24px 8px rgba(255, 255, 255, 0.28);
          }
        }

        @keyframes splash-fly {
          0% {
            transform: translate(0, 0) scale(0.2);
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(1.15);
            opacity: 0.28;
          }
        }

        @keyframes brush-sweep {
          0% {
            left: -68px;
            transform: translateY(-50%) rotate(-8deg);
            opacity: 0.9;
          }
          50% {
            transform: translateY(-50%) rotate(8deg);
            opacity: 1;
          }
          82% {
            opacity: 1;
          }
          100% {
            left: calc(100% + 80px);
            transform: translateY(-50%) rotate(-4deg);
            opacity: 0.95;
          }
        }

        @keyframes brush-trail-sweep {
          0% {
            left: -140px;
            opacity: 0;
            transform: translateY(-50%) scaleX(0.55);
          }
          15% {
            opacity: 0.85;
          }
          72% {
            opacity: 0.65;
          }
          100% {
            left: calc(50% - 24px);
            opacity: 0;
            transform: translateY(-50%) scaleX(0.35);
          }
        }

        @keyframes paint-stroke-grow {
          0% {
            width: 0;
            opacity: 0;
          }
          25% {
            opacity: 0.8;
          }
          100% {
            width: 240px;
            opacity: 0.75;
          }
        }

        @keyframes paint-reveal {
          0% {
            clip-path: inset(0 100% 0 0);
            opacity: 0.25;
          }
          30% {
            opacity: 0.5;
          }
          100% {
            clip-path: inset(0 0 0 0);
            opacity: 1;
          }
        }

        @keyframes paint-color-appear {
          0% {
            clip-path: inset(0 100% 0 0);
            opacity: 0;
            filter: drop-shadow(0 0 0 rgba(255, 255, 255, 0));
          }
          46% {
            clip-path: inset(0 76% 0 0);
            opacity: 0;
          }
          68% {
            clip-path: inset(0 60% 0 0);
            opacity: 0.22;
            filter: drop-shadow(0 0 22px rgba(255, 255, 255, 0.85));
          }
          84% {
            clip-path: inset(0 42% 0 0);
            opacity: 0.72;
            filter: drop-shadow(0 0 14px rgba(255, 255, 255, 0.5));
          }
          100% {
            clip-path: inset(0 0 0 0);
            opacity: 1;
            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.2));
          }
        }

        @keyframes paint-mask-reveal {
          0% {
            clip-path: inset(0 100% 0 0);
            opacity: 0;
          }
          40% {
            clip-path: inset(0 78% 0 0);
            opacity: 0.08;
          }
          72% {
            clip-path: inset(0 48% 0 0);
            opacity: 0.72;
          }
          100% {
            clip-path: inset(0 0 0 0);
            opacity: 0.9;
          }
        }

        @keyframes paint-band-sweep {
          0% {
            width: 0;
            opacity: 0.16;
            transform: translate(-50%, -50%) scaleX(0.6);
          }
          24% {
            width: 64px;
            opacity: 0.5;
          }
          72% {
            width: 190px;
            opacity: 0.64;
          }
          100% {
            width: 248px;
            opacity: 0.8;
            transform: translate(-50%, -50%) scaleX(1);
          }
        }

        @keyframes new-color-halo {
          0% {
            opacity: 0;
            transform: scale(0.84);
          }
          40% {
            opacity: 1;
            transform: scale(1.02);
          }
          100% {
            opacity: 0.82;
            transform: scale(1);
          }
        }

        @keyframes stop-charge-glow {
          0% {
            opacity: 0.22;
            transform: scale(0.82);
          }
          55% {
            opacity: 0.98;
            transform: scale(1.06);
          }
          100% {
            opacity: 0.7;
            transform: scale(1);
          }
        }

        @keyframes stop-question-charge {
          0% {
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
          100% {
            transform: scale(1.03);
            opacity: 0.98;
          }
        }

        @keyframes new-color-band-sweep {
          0% {
            opacity: 0;
            transform: translateY(-50%) translateX(-24%);
          }
          45% {
            opacity: 0.95;
            transform: translateY(-50%) translateX(0%);
          }
          100% {
            opacity: 0.3;
            transform: translateY(-50%) translateX(22%);
          }
        }

        @keyframes new-color-pop {
          0% {
            opacity: 0;
            transform: scale(0.9);
            letter-spacing: 0.2em;
          }
          45% {
            opacity: 1;
            transform: scale(1.04);
            letter-spacing: 0.14em;
          }
          100% {
            opacity: 1;
            transform: scale(1);
            letter-spacing: 0.14em;
          }
        }

        @keyframes reveal-pulse {
          0%,
          100% {
            opacity: 0.22;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.06);
          }
        }

        @keyframes reveal-question-breathe {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.11);
          }
        }

        @keyframes reveal-bg-pulse {
          0%,
          100% {
            opacity: 0.1;
            transform: scale(0.92);
          }
          50% {
            opacity: 0.28;
            transform: scale(1.08);
          }
        }
      `}</style>

      <div
        className={`gacha-stage phase-${phase}`}
        onClick={handleStageClick}
        style={{ cursor: phase === 'waiting' || (phase === 'result' && resultReady) ? 'pointer' : 'default' }}
      >
        {phase === 'waiting' && (
          <div className="waiting-wrap">
            <p className="question">？</p>
            <p className="tap-to-continue">クリックしてください</p>
          </div>
        )}

        {phase === 'painting' && (
          <div className="paint-scene" aria-label="筆で塗っている">
            <p className="paint-question">？</p>
            <span className="paint-glow" aria-hidden="true">？</span>
            <span className="paint-mask-question" style={{ color: effectColor }} aria-hidden="true">？</span>
            <span className="paint-color-reveal" style={{ color: effectColor }} aria-hidden="true">？</span>
            <span
              className="paint-color-band"
              style={{
                background: `linear-gradient(90deg, rgba(0, 0, 0, 0), ${effectColor}AA 55%, ${effectColor}F2 100%)`,
                boxShadow: `0 0 16px ${effectColor}66`,
              }}
              aria-hidden="true"
            />
            <span className="paint-stroke" aria-hidden="true" />
            <span className="paint-trail" aria-hidden="true" />
            <span className="paint-brush" aria-hidden="true">🖌</span>
          </div>
        )}

        {phase === 'stop' && (
          <div className="stop-wrap" aria-label="塗り完了表示">
            <p className="stop-question" style={{ color: effectColor }}>？</p>
          </div>
        )}

        {phase === 'newColor' && (
          <div className="new-color-wrap" aria-label="新規カラー演出">
            <p className="new-color-text">NEW COLOR</p>
          </div>
        )}

        {phase === 'burst' && (
          <div className="burst-wrap">
            <div className="burst-orb" style={{ backgroundColor: safeColor }} />
            <span className="burst-splash splash-1" style={{ backgroundColor: safeColor }} aria-hidden="true" />
            <span className="burst-splash splash-2" style={{ backgroundColor: safeColor }} aria-hidden="true" />
            <span className="burst-splash splash-3" style={{ backgroundColor: safeColor }} aria-hidden="true" />
            <span className="burst-splash splash-4" style={{ backgroundColor: safeColor }} aria-hidden="true" />
            <span className="burst-splash splash-5" style={{ backgroundColor: safeColor }} aria-hidden="true" />
          </div>
        )}

        {phase === 'result' && (
          <div className="result-wrap">
            <div className="result-orb" style={{ backgroundColor: safeColor }} aria-hidden="true" />
            <p className="result-color">{resultCode}</p>
            <p className="result-status">{rarityLabelMap[rarity]}</p>
            <p className="result-status">
              {isNew ? <span className="is-new">NEW!</span> : <span className="is-old">既存カラー</span>}
            </p>
            <p className="tap-to-continue">{resultReady ? 'クリックしてください' : '表示中...'}</p>
          </div>
        )}
      </div>
    </section>
  );
}
