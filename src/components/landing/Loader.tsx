import React, { useState, useEffect } from 'react';

interface LoaderProps {
  onComplete: () => void;
}

export const Loader: React.FC<LoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isMeasured, setIsMeasured] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Check if already shown in this session
    const hasSeen = sessionStorage.getItem('gecko_demo_loader_seen');
    if (hasSeen) {
      onComplete();
      return;
    }

    // Adaptive timer for dimension line draw
    const startTime = Date.now();
    const duration = 1100; // ms

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setIsMeasured(true);

        setTimeout(() => {
          setIsExiting(true);
          sessionStorage.setItem('gecko_demo_loader_seen', 'true');
          setTimeout(onComplete, 380);
        }, 160);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleSkip = () => {
    sessionStorage.setItem('gecko_demo_loader_seen', 'true');
    setIsExiting(true);
    setTimeout(onComplete, 150);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] bg-bg flex flex-col items-center justify-center select-none cursor-pointer transition-transform duration-380 ease-out ${
        isExiting ? '-translate-y-full' : 'translate-y-0'
      }`}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="text-center space-y-4 max-w-sm w-full px-6">
        {/* Wordmark */}
        <h1 className="font-serif-display font-medium text-[32px] text-primary tracking-tight">
          Gecko Glazing
        </h1>

        {/* The Measurement Dimension Line Motif */}
        <div className="relative py-4">
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-ink-3 mb-1">
            <span>SURVEY CALIBRATION</span>
            <span>{String(progress).padStart(3, '0')} mm</span>
          </div>

          {/* Dimension Line with End Ticks */}
          <div className="relative h-[1px] w-full bg-line-strong overflow-visible">
            {/* Left Tick */}
            <span className="absolute left-0 -top-1 w-[1px] h-[9px] bg-ink-2" />

            {/* Active Drawing Line */}
            <div
              className={`h-[1.5px] transition-all duration-75 ${
                isMeasured ? 'bg-accent' : 'bg-primary'
              }`}
              style={{ width: `${progress}%` }}
            />

            {/* Right Tick */}
            <span className="absolute right-0 -top-1 w-[1px] h-[9px] bg-ink-2" />
          </div>
        </div>

        <p className="text-[11px] text-ink-3 italic">
          Click anywhere or press Esc to enter workspace
        </p>
      </div>
    </div>
  );
};
