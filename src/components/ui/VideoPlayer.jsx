"use client";

import { forwardRef, useRef, useEffect } from "react";

export const VideoPlayer = forwardRef(({ 
  src, 
  segments = 5, 
  onSegmentComplete, 
  onEnded, 
  showControls = false,
  demoMode = false 
}, ref) => {
  const internalRef = useRef(null);
  const activeRef = ref || internalRef;
  const lastTriggeredSegment = useRef(-1);

  const handleTimeUpdate = (e) => {
    const video = e.currentTarget;
    if (!isFinite(video.duration) || video.duration === 0) return;

    const segmentDuration = video.duration / segments;
    const t = video.currentTime;

    // Reset on seek back
    const currentSegment = Math.floor(t / segmentDuration);
    if (currentSegment < lastTriggeredSegment.current) {
      lastTriggeredSegment.current = currentSegment - 1;
    }

    const threshold = (lastTriggeredSegment.current + 1) * segmentDuration;

    if (t >= threshold && lastTriggeredSegment.current < segments - 1) {
      lastTriggeredSegment.current++;
      onSegmentComplete(lastTriggeredSegment.current);
    }
  };

  return (
    <div className="relative w-full h-auto bg-black rounded-[var(--radius-card)] overflow-hidden">
      <video
        ref={activeRef}
        src={src}
        className="w-full h-auto object-cover max-h-[80vh]"
        playsInline
        muted
        controls={showControls}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onEnded}
        onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          if (demoMode && isFinite(video.duration) && video.duration > 20) {
            video.currentTime = Math.max(0, video.duration - 15);
            console.log("[DEV] Demo Mode FF Jump to T-15s executed.");
          }
        }}
      />
      {!showControls && (
        <div 
          className="absolute inset-0 z-10" 
          onContextMenu={(e) => e.preventDefault()} 
        />
      )}
    </div>
  );
});

VideoPlayer.displayName = "VideoPlayer";
