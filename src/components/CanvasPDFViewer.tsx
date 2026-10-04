import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw,
  ChevronLeft, 
  ChevronRight, 
  Download, 
  ExternalLink, 
  Maximize2, 
  Hand,
  Move,
  FileText,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

// Configure PDF.js Worker
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
} catch {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

interface CanvasPDFViewerProps {
  fileUrl: string;
  fileName?: string;
  title?: string;
}

export const CanvasPDFViewer: React.FC<CanvasPDFViewerProps> = ({
  fileUrl,
  fileName = 'Document.pdf',
  title = 'Authentic Technical Document'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Document state
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Free Pan & Zoom Navigation State
  const [scale, setScale] = useState<number>(1.2);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  panRef.current = pan;

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    setPan({ x: 0, y: 0 });
    setScale(1.2);

    const loadPdf = async () => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}: Unable to load ${fileUrl}`);
        }
        const arrayBuffer = await response.arrayBuffer();

        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/',
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('PDF.js loading error:', err);
        if (!isCancelled) {
          setError(err.message || 'Could not load PDF document.');
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [fileUrl]);

  // Render Crisp Page to Canvas
  // We re-render when currentPage, rotation, or doc changes
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let renderTask: any = null;
    let isCancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        // Render at a high-definition base scale (2.0) so zooming in remains crystal sharp
        const renderScale = 2.0;
        const viewport = page.getViewport({ scale: renderScale, rotation });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        // Display dimensions at 1.0 base
        canvas.style.width = `${Math.floor(viewport.width / (renderScale / 1.0))}px`;
        canvas.style.height = `${Math.floor(viewport.height / (renderScale / 1.0))}px`;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;
      } catch (err: any) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Page render error:', err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, currentPage, rotation]);

  // Mouse Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary click
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

  // Touch Pan Handlers (Mobile / Trackpad)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - panRef.current.x,
        y: e.touches[0].clientY - panRef.current.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPan({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse Wheel Smooth Zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelZoom = (e: WheelEvent) => {
      e.preventDefault();
      // Calculate zoom factor
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      setScale((prev) => {
        const next = prev * zoomFactor;
        return Number(Math.min(Math.max(next, 0.3), 4.5).toFixed(2));
      });
    };

    container.addEventListener('wheel', handleWheelZoom, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheelZoom);
    };
  }, []);

  // Zoom Button Controls
  const handleZoomIn = () => setScale((prev) => Number(Math.min(prev + 0.25, 4.5).toFixed(2)));
  const handleZoomOut = () => setScale((prev) => Number(Math.max(prev - 0.25, 0.3).toFixed(2)));
  const handleResetView = () => {
    setScale(1.2);
    setPan({ x: 0, y: 0 });
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 flex flex-col shadow-inner overflow-hidden select-none">
      {/* CAD-Style Navigation & Action Toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Document Info & Mode */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-teal-300 font-bold truncate max-w-xs sm:max-w-sm">
            {fileName}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-500/40 font-mono font-semibold flex items-center gap-1">
            <Move className="w-3 h-3 text-teal-400" />
            <span>Free Pan & Zoom</span>
          </span>
        </div>

        {/* Center: Controls (Pagination, Zoom, Reset) */}
        <div className="flex items-center gap-2">
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1 hover:text-teal-300 disabled:opacity-30 cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="p-1 hover:text-teal-300 disabled:opacity-30 cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Zoom & Reset Bar */}
          <div className="flex items-center bg-slate-950 px-1.5 py-1 rounded-lg border border-slate-800 text-[11px] text-slate-300 gap-1">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:text-teal-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="Zoom Out (or scroll down)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={handleResetView}
              className="font-mono text-[10px] px-1.5 py-0.5 hover:bg-slate-800 rounded text-center text-teal-400 font-bold hover:text-teal-200 transition-colors cursor-pointer"
              title="Click to Reset View (100% Center)"
            >
              {Math.round(scale * 100)}%
            </button>

            <button
              onClick={handleZoomIn}
              className="p-1 hover:text-teal-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="Zoom In (or scroll up)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleResetView}
              className="p-1 hover:text-teal-300 hover:bg-slate-800 rounded transition-colors cursor-pointer ml-1 pl-1.5 border-l border-slate-800 flex items-center gap-1 text-[10px]"
              title="Fit to Center"
            >
              <RefreshCw className="w-3 h-3 text-slate-400 hover:text-teal-300" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              onClick={handleRotate}
              className="p-1 hover:text-teal-300 hover:bg-slate-800 rounded transition-colors cursor-pointer ml-1 pl-1.5 border-l border-slate-800"
              title="Rotate 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded text-[11px] font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="Open in Native Browser Tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Tab</span>
          </a>
          <a
            href={fileUrl}
            download
            className="px-2.5 py-1 bg-teal-950 hover:bg-teal-900 text-teal-300 rounded text-[11px] font-semibold flex items-center gap-1.5 border border-teal-700/60 transition-colors"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </div>

      {/* Free Interactive Viewport with Pan & Zoom */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleResetView}
        className={`w-full h-[72vh] relative overflow-hidden flex items-center justify-center bg-slate-900/90 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Floating Quick Hint */}
        <div className="absolute top-3 left-3 z-10 bg-slate-950/80 border border-slate-800/80 px-2.5 py-1 rounded-lg text-[10px] text-slate-400 font-mono flex items-center gap-1.5 backdrop-blur-sm pointer-events-none">
          <Hand className="w-3 h-3 text-teal-400" />
          <span>Click & drag to move freely · Scroll wheel to zoom · Double click to reset</span>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
            <div className="text-xs text-slate-200 font-medium">
              Rendering High-Precision Vector Canvas...
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Decoding authentic engineering blueprint
            </p>
          </div>
        )}

        {/* Error Fallback */}
        {error && (
          <div className="p-8 text-center bg-slate-950/95 rounded-xl border border-rose-500/40 max-w-md my-auto space-y-3 z-20 shadow-2xl">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Direct Rendering Notice</h4>
            <p className="text-xs text-slate-400">{error}</p>
            <div className="flex justify-center gap-3 pt-2">
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Native Tab</span>
              </a>
              <a
                href={fileUrl}
                download
                className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        )}

        {/* Freely Movable and Scalable Canvas Container */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.08s ease-out',
          }}
          className="will-change-transform flex items-center justify-center p-8 pointer-events-none"
        >
          <canvas 
            ref={canvasRef} 
            className="shadow-2xl rounded-sm bg-white border border-slate-700/80 block pointer-events-auto"
          />
        </div>
      </div>
    </div>
  );
};
