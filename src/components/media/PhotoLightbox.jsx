import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  ShieldCheck, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Maximize2
} from 'lucide-react';

/**
 * PhotoLightbox — Full-Screen Distraction-Free Image Viewer
 */
const PhotoLightbox = ({ 
  photos, 
  currentIndex, 
  isOpen, 
  onClose, 
  onNavigate 
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    setZoomLevel(1);
  }, [currentIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && photos.length > 1) {
        onNavigate((currentIndex + 1) % photos.length);
      } else if (e.key === 'ArrowLeft' && photos.length > 1) {
        onNavigate((currentIndex - 1 + photos.length) % photos.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, photos, onClose, onNavigate]);

  if (!isOpen || !photos || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleDownload = () => {
    if (!currentPhoto?.url) return;
    const a = document.createElement('a');
    a.href = currentPhoto.url;
    a.download = `sanitized_memory_${Date.now()}.webp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-6 select-none">
        {/* Top Control Bar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-white/70 bg-white/10 px-3 py-1.5 rounded-full">
              {currentIndex + 1} / {photos.length}
            </span>
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full text-xs font-mono">
              <ShieldCheck size={14} />
              <span>EXIF Stripped</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoom(-0.25)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
            <button
              onClick={() => handleZoom(0.25)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={handleDownload}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Download Image"
            >
              <Download size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-white transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Previous Button */}
        {photos.length > 1 && (
          <button
            onClick={() => onNavigate((currentIndex - 1 + photos.length) % photos.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            title="Previous Photo"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Next Button */}
        {photos.length > 1 && (
          <button
            onClick={() => onNavigate((currentIndex + 1) % photos.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            title="Next Photo"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Main Photo Canvas */}
        <div className="flex-1 max-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden">
          <motion.img
            key={currentPhoto.id || currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: zoomLevel }}
            transition={{ duration: 0.2 }}
            src={currentPhoto.url}
            alt={currentPhoto.caption || 'Sanitized memory'}
            className="max-h-[75vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl transition-transform cursor-grab active:cursor-grabbing"
            draggable={false}
          />

          {/* Caption & Metadata Footer */}
          {currentPhoto.caption && (
            <div className="mt-4 max-w-xl text-center px-4">
              <p className="text-white text-sm sm:text-base font-medium bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl inline-block border border-white/10">
                {currentPhoto.caption}
              </p>
            </div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};

export default PhotoLightbox;
