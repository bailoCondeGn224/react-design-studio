// src/components/storefront/ImageZoomDialog.tsx
import { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ImageZoomDialogProps {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

export const ImageZoomDialog = ({ imageUrl, isOpen, onClose, productName }: ImageZoomDialogProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ distance: number; scale: number }>({ distance: 0, scale: 1 });

  useEffect(() => {
    if (isOpen) {
      // Reset on open
      setScale(1);
      setPosition({ x: 0, y: 0 });
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale(prev => {
      const newScale = Math.max(prev - 0.5, 1);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for pinch zoom
  const getTouchDistance = (touches: React.TouchList) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom start
      e.preventDefault();
      touchStartRef.current = {
        distance: getTouchDistance(e.touches),
        scale: scale,
      };
    } else if (e.touches.length === 1 && scale > 1) {
      // Single touch drag
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      const scaleChange = currentDistance / touchStartRef.current.distance;
      const newScale = Math.min(Math.max(touchStartRef.current.scale * scaleChange, 1), 4);
      setScale(newScale);

      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // Drag while zoomed
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Double tap to zoom
  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2.5);
    } else {
      handleReset();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black z-[100] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Full screen image viewer */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center">
        {/* Top bar with product name and close button */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm truncate flex-1 mr-4">
              {productName}
            </h3>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
            >
              <X className="h-6 w-6 text-white" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Image container */}
        <div
          ref={imageRef}
          className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleDoubleClick}
        >
          <div
            className="relative transition-transform duration-200 ease-out"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center',
            }}
          >
            <img
              src={imageUrl}
              alt={productName}
              className="max-w-[90vw] max-h-[80vh] object-contain select-none"
              draggable={false}
            />
          </div>
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md rounded-full p-2 shadow-lg">
            {/* Zoom out */}
            <button
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
            >
              <ZoomOut className="h-5 w-5 text-white" strokeWidth={2.5} />
            </button>

            {/* Scale indicator */}
            <div className="px-3 text-white font-semibold text-sm min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </div>

            {/* Zoom in */}
            <button
              onClick={handleZoomIn}
              disabled={scale >= 4}
              className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
            >
              <ZoomIn className="h-5 w-5 text-white" strokeWidth={2.5} />
            </button>

            {/* Reset */}
            <div className="w-px h-6 bg-white/20 mx-1" />
            <button
              onClick={handleReset}
              disabled={scale === 1}
              className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
              title="Réinitialiser"
            >
              <Maximize2 className="h-5 w-5 text-white" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Help text */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
            <p className="text-white text-xs font-medium">
              {scale === 1
                ? 'Double-tap ou pincer pour zoomer'
                : 'Glisser pour déplacer • Pincer pour zoomer'
              }
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
