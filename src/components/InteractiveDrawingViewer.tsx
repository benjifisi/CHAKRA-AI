import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RefreshCw, 
  Move, 
  Maximize2, 
  Download, 
  ExternalLink,
  Hand,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface InteractiveDrawingViewerProps {
  imageUrl: string;
  title?: string;
  fileName?: string;
}

export const InteractiveDrawingViewer: React.FC<InteractiveDrawingViewerProps> = ({
  imageUrl,
  title = 'Engineering Drawing',
  fileName = 'Drawing.png',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan, Zoom & Rotation State
  const [scale, setScale] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Refs for drag tracking
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  panRef.current = pan;

  // Ref for multi-touch pinch zoom
  const touchStartDistRef = useRef<number | null>(null);
  const scaleStartRef = useRef<number>(1.0);

  // Clamping helper
  const clampScale = (newScale: number) => {
    return Number(Math.min(Math.max(newScale, 0.4), 6.0).toFixed(2));
  };

  // Mouse drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - panRef.current.x,
      y: e.clientY - panRef.current.y,
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Mobile Touch Handling (Single Finger Pan + Two Finger Pinch-to-Zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single finger drag
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - panRef.current.x,
        y: e.touches[0].clientY - panRef.current.y,
      };
      touchStartDistRef.current = null;
    } else if (e.touches.length === 2) {
      // Two fingers pinch
      setIsDragging(false);
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      touchStartDistRef.current = dist;
      scaleStartRef.current = scale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    } else if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const ratio = currentDist / touchStartDistRef.current;
      setScale(clampScale(scaleStartRef.current * ratio));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = null;
  };

  // Mouse Wheel Smooth Zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      setScale((prev) => clampScale(prev * zoomFactor));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Control Actions
  const handleZoomIn = () => setScale((prev) => clampScale(prev + 0.25));
  const handleZoomOut = () => setScale((prev) => clampScale(prev - 0.25));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1.0);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };
  const handleFitWidth = () => {
    setScale(1.6);
    setPan({ x: 0, y: 0 });
  };

  const handleDoubleClick = () => {
    if (scale > 1.2) {
      handleReset();
    } else {
      setScale(2.2);
    }
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 flex flex-col shadow-2xl overflow-hidden select-none">
      {/* Top Toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Metadata */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="font-mono text-cyan-300 font-bold truncate max-w-xs sm:max-w-md">
            {fileName}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono font-semibold hidden sm:inline-flex items-center gap-1">
            <Move className="w-3 h-3 text-cyan-400" />
            <span>CSS Transform Pan & Zoom</span>
          </span>
        </div>

        {/* Center: Interactive Pan/Zoom Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 rounded-lg border border-slate-800 transition-colors cursor-pointer"
            title="Zoom Out (or scroll down)"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Percentage Badge / Reset Trigger */}
          <button
            onClick={handleReset}
            className="bg-slate-950 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-mono font-bold text-cyan-400 hover:text-cyan-200 transition-colors cursor-pointer min-w-[56px] text-center"
            title="Click to reset view"
          >
            {Math.round(scale * 100)}%
          </button>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 rounded-lg border border-slate-800 transition-colors cursor-pointer"
            title="Zoom In (or scroll up)"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Reset / Fit Button */}
          <button
            onClick={handleReset}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 rounded-lg border border-slate-800 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
            title="Reset Pan & Zoom (Double Click)"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-mono">Reset</span>
          </button>

          {/* Fit Width */}
          <button
            onClick={handleFitWidth}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 rounded-lg border border-slate-800 transition-colors cursor-pointer hidden sm:flex items-center gap-1 text-[11px]"
            title="Fit to Width"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-mono">Fit</span>
          </button>

          {/* 90° Rotate */}
          <button
            onClick={handleRotate}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 rounded-lg border border-slate-800 transition-colors cursor-pointer"
            title="Rotate 90 degrees"
            aria-label="Rotate"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Tab & Download Options */}
        <div className="flex items-center gap-2">
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="Open in new window"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">Raw Image</span>
          </a>
          <a
            href={imageUrl}
            download
            className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 border border-cyan-700/60 transition-colors"
            title="Download full resolution file"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </div>

      {/* Interactive CAD Canvas Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        style={{ touchAction: 'none' }}
        className={`w-full h-[70vh] relative overflow-hidden flex items-center justify-center bg-slate-950 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Background Grid Pattern (Blueprint Aesthetic) */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #0ea5e9 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Floating Mobile & Desktop Interaction Hint */}
        <div className="absolute top-3 left-3 z-10 bg-slate-950/85 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] text-slate-300 font-mono flex items-center gap-2 backdrop-blur-md shadow-md pointer-events-none">
          <Hand className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="hidden sm:inline">
            Click & drag to pan freely · Scroll wheel to zoom · Double-click to toggle zoom
          </span>
          <span className="sm:hidden">
            Drag to pan · Pinch to zoom · Double-tap to reset
          </span>
        </div>

        {/* Floating Reset Pill if Panned or Zoomed */}
        {(pan.x !== 0 || pan.y !== 0 || scale !== 1.0) && (
          <button
            onClick={handleReset}
            className="absolute bottom-3 left-3 z-10 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Center (100%)</span>
          </button>
        )}

        {/* Transformable Drawing Image */}
        <div
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.09s cubic-bezier(0.2, 0, 0, 1)',
          }}
          className="will-change-transform flex items-center justify-center p-4 pointer-events-none"
        >
          <img
            src={imageUrl}
            alt={title}
            draggable={false}
            className="max-h-[66vh] max-w-[90vw] md:max-w-[80vw] object-contain rounded-lg shadow-2xl border border-slate-800/80 pointer-events-auto select-none bg-slate-900"
          />
        </div>
      </div>
    </div>
  );
};
