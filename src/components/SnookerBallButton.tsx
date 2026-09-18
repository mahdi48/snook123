import React from 'react';
import { BallConfig, ActionMode } from '../types';
import { toPersianDigits } from '../utils/persian';
import { soundManager } from '../utils/audio';

interface SnookerBallButtonProps {
  ball: BallConfig;
  actionMode: ActionMode;
  onClick: (ball: BallConfig) => void;
  disabled?: boolean;
}

export const SnookerBallButton: React.FC<SnookerBallButtonProps> = ({
  ball,
  actionMode,
  onClick,
  disabled = false,
}) => {
  const handleClick = () => {
    if (disabled) return;
    if (actionMode === 'pot') {
      soundManager.playBallHitSound();
      setTimeout(() => soundManager.playPocketSound(), 90);
    } else {
      soundManager.playClickSound();
    }
    onClick(ball);
  };

  const isPot = actionMode === 'pot';
  const prefix = isPot ? '+' : '-';

  return (
    <button
      type="button"
      id={`ball-btn-${ball.id}`}
      onClick={handleClick}
      disabled={disabled}
      className={`group relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-150 active:scale-95 touch-manipulation focus:outline-none select-none ${
        disabled ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:scale-105 cursor-pointer'
      }`}
      aria-label={`${ball.nameFa} ${ball.points} امتیاز`}
    >
      {/* 3D Ball Sphere */}
      <div
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg transition-transform"
        style={{
          background: ball.bgGradient,
          boxShadow: `
            inset -5px -5px 12px ${ball.shadowColor},
            inset 4px 4px 10px rgba(255, 255, 255, 0.4),
            0 8px 16px rgba(0, 0, 0, 0.55),
            0 2px 4px rgba(0, 0, 0, 0.3)
          `,
        }}
      >
        {/* Specular Glint (Top-left shine reflection) */}
        <div
          className="absolute top-1.5 left-2 w-4 h-2.5 rounded-full blur-[0.8px] pointer-events-none transform -rotate-25 opacity-85"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)',
          }}
        />

        {/* Ambient occlusion shadow inside bottom */}
        <div
          className="absolute bottom-1 w-8 h-2 rounded-full blur-xs opacity-60 pointer-events-none"
          style={{ background: ball.shadowColor }}
        />

        {/* Ball Points Badge in Center */}
        <div
          className="relative z-10 flex items-center justify-center font-black tracking-tight"
          style={{
            color: ball.textColor,
            textShadow: ball.id === 'yellow' ? 'none' : '0 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          <span className="text-base sm:text-lg font-bold">
            {prefix}{toPersianDigits(ball.points)}
          </span>
        </div>
      </div>

      {/* Ball Persian Name Label */}
      <span className="mt-1.5 text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
        {ball.nameFa}
      </span>
    </button>
  );
};
