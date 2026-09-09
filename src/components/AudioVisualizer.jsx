import React from 'react';

export default function AudioVisualizer({ status = 'idle', barCount = 18 }) {
  // status: 'idle' | 'listening' | 'speaking' | 'processing'
  const isActive = status === 'listening' || status === 'speaking';
  const isSpeaking = status === 'speaking';
  const isListening = status === 'listening';

  return (
    <div className="flex items-center justify-center gap-1.5 h-12 px-4 py-2">
      {Array.from({ length: barCount }).map((_, i) => {
        // Compute pseudo random height variations for realistic waveform
        const heights = [28, 45, 18, 60, 35, 75, 40, 85, 55, 90, 60, 80, 42, 65, 30, 50, 22, 38];
        const baseHeight = heights[i % heights.length];
        
        let dynamicHeight = '6px';
        let barColor = 'bg-slate-700';

        if (isSpeaking) {
          dynamicHeight = `${baseHeight}%`;
          barColor = 'bg-gradient-to-t from-teal-500 to-cyan-300 shadow-sm shadow-cyan-500/50';
        } else if (isListening) {
          dynamicHeight = `${Math.max(15, baseHeight * 0.75)}%`;
          barColor = 'bg-gradient-to-t from-cyan-600 to-teal-400 animate-pulse';
        } else if (status === 'processing') {
          dynamicHeight = '14px';
          barColor = 'bg-cyan-500/60 animate-pulse';
        }

        const animDelay = `${(i * 0.08).toFixed(2)}s`;
        const animDuration = isSpeaking ? '0.7s' : '1.1s';

        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-150 ${barColor}`}
            style={{
              height: dynamicHeight,
              animationDelay: animDelay,
              animationDuration: animDuration,
              transition: 'height 0.12s ease-in-out'
            }}
          />
        );
      })}
    </div>
  );
}
