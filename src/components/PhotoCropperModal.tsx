import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  ZoomIn,
  Move,
  RotateCcw,
  Check,
  UploadCloud,
  UserCheck
} from 'lucide-react';
import type { PhotoCrop } from '../types/news';
import { saveAvatarToDisk } from '../services/storage';

interface PhotoCropperModalProps {
  isOpen: boolean;
  authorName: string;
  initialImage: string;
  initialCrop?: PhotoCrop;
  onClose: () => void;
  onSave: (authorName: string, newImage: string, newCrop: PhotoCrop) => void;
}

export const PhotoCropperModal: React.FC<PhotoCropperModalProps> = ({
  isOpen,
  authorName,
  initialImage,
  initialCrop = { zoom: 1, panX: 0, panY: 0 },
  onClose,
  onSave,
}) => {
  const [previewImage, setPreviewImage] = useState<string>(initialImage);
  const [zoomLevel, setZoomLevel] = useState<number>(initialCrop?.zoom || 1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({
    x: initialCrop?.panX || 0,
    y: initialCrop?.panY || 0,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever author or initial parameters change
  useEffect(() => {
    if (isOpen) {
      setPreviewImage(initialImage);
      setZoomLevel(initialCrop?.zoom || 1);
      setPanPosition({
        x: initialCrop?.panX || 0,
        y: initialCrop?.panY || 0,
      });
    }
  }, [isOpen, initialImage, initialCrop?.zoom, initialCrop?.panX, initialCrop?.panY]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle local image file upload from user device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setPreviewImage(base64);
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });

        // Also try to persist locally to public/authors/ via backend endpoint if available
        try {
          const safeName = authorName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-') + `-${Date.now()}.png`;
          const diskRes = await saveAvatarToDisk(safeName, base64);
          if (diskRes.success && diskRes.url) {
            setPreviewImage(diskRes.url);
          }
        } catch {
          // If server disk upload fails, base64 remains active
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Mouse drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanPosition({
      x: Math.round(e.clientX - dragStartRef.current.x),
      y: Math.round(e.clientY - dragStartRef.current.y),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag handling for mobile / tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - panPosition.x,
        y: e.touches[0].clientY - panPosition.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanPosition({
      x: Math.round(e.touches[0].clientX - dragStartRef.current.x),
      y: Math.round(e.touches[0].clientY - dragStartRef.current.y),
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleSave = () => {
    onSave(authorName, previewImage, {
      zoom: Number(zoomLevel.toFixed(2)),
      panX: Math.round(panPosition.x),
      panY: Math.round(panPosition.y),
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header institucional del cropper */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                Encuadre Editorial
              </span>
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                {authorName}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-1">
              Encuadrar y Ajustar Foto del Alumno
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Alineá el rostro para que quede nítido y centrado tanto en portada como en miniaturas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition cursor-pointer"
            aria-label="Cerrar modal de encuadre"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visualizador Interactivo con Arrastre y Cuadro Guía */}
        <div className="p-4 sm:p-6 space-y-4">
          <div
            className="relative w-full h-72 sm:h-80 bg-slate-950 rounded-2xl overflow-hidden border border-slate-300 cursor-grab active:cursor-grabbing select-none flex items-center justify-center shadow-inner"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Imagen Transformada con transformOrigin top center */}
            <div
              className="w-full h-full relative"
              style={{
                transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
                transformOrigin: 'top center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
            >
              <img
                src={previewImage}
                alt={authorName}
                className="w-full h-full object-cover object-top pointer-events-none select-none"
                draggable={false}
              />
            </div>

            {/* Cuadrícula Guía de Composición Visual (Regla de Tercios) */}
            <div className="absolute inset-0 pointer-events-none border border-white/30 grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-white/20" />
              <div className="border-r border-white/20" />
              <div />
            </div>

            {/* Indicador flotante en el visor */}
            <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5 pointer-events-none shadow-md">
              <Move className="w-3.5 h-3.5 text-indigo-300" />
              <span>Arrastrá para reencuadrar el rostro</span>
            </div>
          </div>

          {/* Barra de Controles: Zoom y Selector de Archivo */}
          <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 shrink-0">
                <ZoomIn className="w-4 h-4 text-slate-500" />
                <span>Zoom: {zoomLevel.toFixed(1)}x</span>
              </div>

              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                className="flex-1 min-w-[140px] h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                aria-label="Control de zoom"
              />

              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 rounded-lg flex items-center gap-1 transition cursor-pointer shrink-0 font-medium border border-slate-200 bg-white"
                title="Restablecer encuadre y zoom"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reiniciar</span>
              </button>
            </div>

            {/* Subir Nueva Foto desde la PC */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <UploadCloud className="w-4 h-4 text-slate-400" />
                <span>¿Cargar otra fotografía de la máquina?</span>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm transition cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-slate-500" />
                <span>Seleccionar archivo...</span>
              </button>
            </div>
          </div>
        </div>

        {/* Acciones Finales del Modal de Encuadre */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/80 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Aplicar a todas sus investigaciones</span>
          </button>
        </div>

      </div>
    </div>
  );
};
