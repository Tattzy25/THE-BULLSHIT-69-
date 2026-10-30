import React, { useRef, useState, useEffect } from 'react';
import { Product, GarmentColor, PrintPlacement, LogoAsset } from '../types/merch';
import { Move, ZoomIn, Eye, Sliders, CheckCircle2 } from 'lucide-react';

interface ProductCanvasProps {
  product: Product;
  color: GarmentColor;
  viewIndex: number;
  placement: PrintPlacement;
  logo: LogoAsset;
  onUpdatePlacement: (updates: Partial<PrintPlacement>) => void;
  showGuides: boolean;
  cmykProof: boolean;
}

export const ProductCanvas: React.FC<ProductCanvasProps> = ({
  product,
  color,
  viewIndex,
  placement,
  logo,
  onUpdatePlacement,
  showGuides,
  cmykProof,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, initialPlacementX: 50, initialPlacementY: 50 });

  const currentView = product.views[viewIndex] || product.views[0];
  const printArea = currentView.printArea;

  // Handle drag to position logo
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      initialPlacementX: placement.xPercent,
      initialPlacementY: placement.yPercent,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaXPercent = ((e.clientX - dragStart.x) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - dragStart.y) / rect.height) * 100;

      const newX = Math.min(95, Math.max(5, dragStart.initialPlacementX + deltaXPercent));
      const newY = Math.min(95, Math.max(5, dragStart.initialPlacementY + deltaYPercent));

      onUpdatePlacement({
        xPercent: Math.round(newX * 10) / 10,
        yPercent: Math.round(newY * 10) / 10,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, onUpdatePlacement]);

  // Calculate physical size in inches based on current scale
  const effectiveScale = placement.scalePercent / 100;
  const currentPhysicalW = (printArea.maxPhysicalWidthInches * effectiveScale).toFixed(1);
  const currentPhysicalH = ((printArea.maxPhysicalWidthInches * effectiveScale) / logo.aspectRatio).toFixed(1);

  // CSS blend styles based on print technique
  const getTechniqueStyles = () => {
    switch (placement.technique) {
      case 'embroidery':
        return {
          filter: `drop-shadow(1px 1px 1px rgba(0,0,0,0.7)) drop-shadow(-1px -1px 0.5px rgba(255,255,255,0.4)) contrast(1.15)`,
          mixBlendMode: 'normal' as const,
        };
      case 'foil_gold':
        return {
          filter: `brightness(1.2) contrast(1.3) sepia(0.9) hue-rotate(5deg) saturate(2.5) drop-shadow(0 1px 2px rgba(0,0,0,0.5))`,
          mixBlendMode: 'screen' as const,
        };
      case 'foil_silver':
        return {
          filter: `brightness(1.4) contrast(1.2) grayscale(1) drop-shadow(0 1px 2px rgba(0,0,0,0.5))`,
          mixBlendMode: 'screen' as const,
        };
      case 'deboss':
      case 'laser':
        return {
          filter: `drop-shadow(0px -1px 1px rgba(0,0,0,0.9)) drop-shadow(0px 1px 1px rgba(255,255,255,0.2)) brightness(0.7) contrast(1.4)`,
          mixBlendMode: color.isDark ? ('overlay' as const) : ('multiply' as const),
        };
      case 'dtg':
        return {
          mixBlendMode: color.isDark ? ('screen' as const) : ('multiply' as const),
          opacity: placement.opacity * 0.94,
        };
      case 'screen':
      default:
        return {
          mixBlendMode: placement.blendMode,
          filter: placement.distressLevel > 0 ? `contrast(1.2) brightness(0.95)` : undefined,
        };
    }
  };

  return (
    <div className="relative w-full aspect-square max-w-[640px] mx-auto select-none rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 shadow-2xl border border-neutral-800/80 flex items-center justify-center overflow-hidden">
      {/* Studio Lighting Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,rgba(0,0,0,0.7)_80%)] pointer-events-none" />

      {/* Main Mockup Container */}
      <div
        ref={containerRef}
        className={`relative w-full h-full flex items-center justify-center transition-all duration-300 ${
          cmykProof ? 'contrast-95 saturate-85 brightness-95' : ''
        }`}
      >
        {/* Photorealistic Product Silhouette Vector */}
        {renderProductBase(product.id, color.hex, currentView.id === 'back')}

        {/* Bounding Print Safe Zone (Visual Overlay) */}
        {showGuides && (
          <div
            className="absolute border border-dashed border-sky-400/60 bg-sky-500/5 rounded pointer-events-none transition-all duration-200"
            style={{
              left: `${printArea.xPercent - printArea.widthPercent / 2}%`,
              top: `${printArea.yPercent - printArea.heightPercent / 2}%`,
              width: `${printArea.widthPercent}%`,
              height: `${printArea.heightPercent}%`,
            }}
          >
            <div className="absolute top-1 left-2 text-[10px] font-mono text-sky-400 font-medium tracking-wider">
              {printArea.label}
            </div>
            {/* Center crosshair */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <div className="w-full h-[1px] bg-sky-400" />
              <div className="h-full w-[1px] bg-sky-400 absolute" />
            </div>
          </div>
        )}

        {/* Interactive Logo Layer */}
        <div
          onMouseDown={handleMouseDown}
          className={`absolute cursor-grab active:cursor-grabbing group transition-transform ${
            isDragging ? 'scale-[1.02]' : ''
          }`}
          style={{
            left: `${placement.xPercent}%`,
            top: `${placement.yPercent}%`,
            transform: `translate(-50%, -50%) rotate(${placement.rotationDeg}deg)`,
            width: `${printArea.widthPercent * (placement.scalePercent / 100)}%`,
            zIndex: 20,
          }}
        >
          {/* Active selection bounding ring */}
          <div
            className={`relative rounded p-1 transition-all ${
              showGuides || isDragging ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/50' : 'group-hover:ring-1 group-hover:ring-white/40'
            }`}
          >
            <img
              src={logo.dataUrl}
              alt="Logo print placement"
              draggable={false}
              className="w-full h-auto object-contain transition-all"
              style={{
                opacity: placement.opacity,
                filter: `${placement.invert ? 'invert(1) ' : ''}${
                  placement.monochromeColor ? `drop-shadow(0 0 0 ${placement.monochromeColor}) ` : ''
                }${getTechniqueStyles().filter || ''}`,
                mixBlendMode: getTechniqueStyles().mixBlendMode,
              }}
            />

            {/* Embroidery Stitch Texture Overlay Effect */}
            {placement.technique === 'embroidery' && (
              <div
                className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
                style={{
                  backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.4) 0px, rgba(0,0,0,0.5) 1px, transparent 2px)`,
                  backgroundSize: '3px 3px',
                }}
              />
            )}

            {/* Foil Specular Sheen Effect */}
            {(placement.technique === 'foil_gold' || placement.technique === 'foil_silver') && (
              <div
                className="absolute inset-0 pointer-events-none opacity-30 mix-blend-color-dodge animate-pulse"
                style={{
                  background:
                    placement.technique === 'foil_gold'
                      ? 'linear-gradient(135deg, rgba(255,223,0,0.6) 0%, transparent 50%, rgba(255,215,0,0.8) 100%)'
                      : 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, transparent 50%, rgba(200,200,200,0.9) 100%)',
                }}
              />
            )}
          </div>

          {/* Quick Hover Dimension Caliper Badge */}
          {(showGuides || isDragging) && (
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 bg-black/80 backdrop-blur-md rounded border border-neutral-700 text-[10px] font-mono text-neutral-300 pointer-events-none flex items-center gap-1.5 shadow-lg">
              <Move className="w-2.5 h-2.5 text-sky-400" />
              <span>{currentPhysicalW}" × {currentPhysicalH}"</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Canvas Mode Indicators */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <span className="text-xs font-mono text-neutral-400 bg-neutral-900/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-neutral-800">
          {product.name} · {currentView.name}
        </span>
        {cmykProof && (
          <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 backdrop-blur-md px-2 py-0.5 rounded border border-amber-800/80">
            CMYK Gamut Proof
          </span>
        )}
      </div>

      {/* Realtime Physical Measurement HUD */}
      <div className="absolute bottom-4 right-4 flex items-center gap-3 text-[11px] font-mono text-neutral-400 bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-800">
        <div>Scale: <span className="text-neutral-200 font-semibold">{placement.scalePercent}%</span></div>
        <div className="text-neutral-600">|</div>
        <div>Size: <span className="text-sky-400 font-semibold">{currentPhysicalW}" × {currentPhysicalH}"</span></div>
      </div>
    </div>
  );
};

/**
 * Realistic vector renderer for product silhouettes
 * Accurately models fabric folds, highlights, ribbing, shadows and curves
 */
function renderProductBase(productId: string, hexColor: string, isBackView: boolean) {
  switch (productId) {
    case 'heavyweight-tee':
      return (
        <svg viewBox="0 0 500 500" className="w-[90%] h-[90%] drop-shadow-2xl">
          <defs>
            <filter id="fabricNoise" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
              <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.04 0" />
              <feComposite in2="SourceGraphic" in="gl" operator="in" />
            </filter>
            <linearGradient id="teeShadow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="60%" stopColor="#000000" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="foldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
              <stop offset="50%" stopColor="#000000" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Cast Drop Shadow */}
          <ellipse cx="250" cy="465" rx="190" ry="22" fill="#000000" opacity="0.4" filter="blur(10px)" />

          {/* T-Shirt Body Outline */}
          <path
            d="M 175,65 C 205,80 295,80 325,65 L 430,130 C 445,140 455,160 440,195 L 395,230 L 365,190 L 375,440 C 375,455 365,460 350,460 L 150,460 C 135,460 125,455 125,440 L 135,190 L 105,230 L 60,195 C 45,160 55,140 70,130 Z"
            fill={hexColor}
            stroke="#000000"
            strokeWidth="1.5"
            strokeOpacity="0.2"
          />

          {/* Shading and Fabric Depth Overlay */}
          <path
            d="M 175,65 C 205,80 295,80 325,65 L 430,130 C 445,140 455,160 440,195 L 395,230 L 365,190 L 375,440 C 375,455 365,460 350,460 L 150,460 C 135,460 125,455 125,440 L 135,190 L 105,230 L 60,195 C 45,160 55,140 70,130 Z"
            fill="url(#teeShadow)"
          />

          {/* Sleeve Seams */}
          <path d="M 135,190 C 132,150 148,110 175,65" fill="none" stroke="#000000" strokeWidth="2" strokeOpacity="0.15" />
          <path d="M 365,190 C 368,150 352,110 325,65" fill="none" stroke="#000000" strokeWidth="2" strokeOpacity="0.15" />

          {/* Natural Fabric Folds / Wrinkles */}
          <path d="M 130,280 Q 180,310 200,320" fill="none" stroke="#000000" strokeWidth="4" strokeOpacity="0.12" strokeLinecap="round" />
          <path d="M 370,290 Q 320,320 300,330" fill="none" stroke="#000000" strokeWidth="4" strokeOpacity="0.12" strokeLinecap="round" />
          <path d="M 140,380 Q 250,400 360,380" fill="none" stroke="#000000" strokeWidth="3" strokeOpacity="0.1" strokeLinecap="round" />

          {/* Collar Ribbing */}
          {isBackView ? (
            <path d="M 175,65 C 215,75 285,75 325,65 C 315,80 185,80 175,65 Z" fill="#000000" opacity="0.25" />
          ) : (
            <g>
              {/* Collar Scoop Inside */}
              <path d="M 175,65 C 210,110 290,110 325,65 C 300,82 200,82 175,65 Z" fill="#000000" opacity="0.3" />
              {/* Collar Ribbed Band */}
              <path
                d="M 175,65 C 210,122 290,122 325,65 C 295,108 205,108 175,65 Z"
                fill={hexColor}
                stroke="#000000"
                strokeWidth="1.5"
                strokeOpacity="0.25"
              />
              <path d="M 178,68 C 212,120 288,120 322,68" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.2" />
            </g>
          )}

          {/* Bottom Hem Stitching */}
          <line x1="130" y1="445" x2="370" y2="445" stroke="#000000" strokeWidth="1.5" strokeOpacity="0.2" strokeDasharray="3 2" />
        </svg>
      );

    case 'fleece-hoodie':
      return (
        <svg viewBox="0 0 500 500" className="w-[90%] h-[90%] drop-shadow-2xl">
          <defs>
            <linearGradient id="hoodieShadow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#000000" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <ellipse cx="250" cy="465" rx="195" ry="24" fill="#000000" opacity="0.45" filter="blur(10px)" />
          {/* Main Hoodie Silhouette with Pouch and Thick Hem */}
          <path
            d="M 180,95 C 200,75 300,75 320,95 L 435,160 C 455,175 460,205 440,240 L 390,265 L 375,445 C 375,460 365,465 350,465 L 150,465 C 135,465 125,460 125,445 L 110,265 L 60,240 C 40,205 45,175 65,160 Z"
            fill={hexColor}
            stroke="#000000"
            strokeWidth="1.5"
            strokeOpacity="0.2"
          />
          <path
            d="M 180,95 C 200,75 300,75 320,95 L 435,160 C 455,175 460,205 440,240 L 390,265 L 375,445 C 375,460 365,465 350,465 L 150,465 C 135,465 125,460 125,445 L 110,265 L 60,240 C 40,205 45,175 65,160 Z"
            fill="url(#hoodieShadow)"
          />
          {/* Kangaroo Pouch Pocket */}
          <path
            d="M 160,330 L 195,300 L 305,300 L 340,330 L 345,435 L 155,435 Z"
            fill={hexColor}
            stroke="#000000"
            strokeWidth="2"
            strokeOpacity="0.3"
          />
          <path d="M 195,300 L 305,300" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.2" />
          <path d="M 160,330 L 195,300" stroke="#000000" strokeWidth="2.5" strokeOpacity="0.2" />
          <path d="M 340,330 L 305,300" stroke="#000000" strokeWidth="2.5" strokeOpacity="0.2" />

          {/* Heavy Double-Layered Hood Collar */}
          <path
            d="M 165,95 C 160,40 340,40 335,95 C 310,140 190,140 165,95 Z"
            fill={hexColor}
            stroke="#000000"
            strokeWidth="2"
            strokeOpacity="0.3"
          />
          {/* Inner Hood Cavity Shadow */}
          <path d="M 195,95 C 200,60 300,60 305,95 C 285,125 215,125 195,95 Z" fill="#000000" opacity="0.35" />
          {/* Braided Drawstrings */}
          <path d="M 215,115 Q 212,175 218,215" fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
          <path d="M 285,115 Q 288,175 282,215" fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
          {/* Drawstring metal aglets */}
          <rect x="216" y="212" width="4" height="10" rx="1" fill="#71717a" />
          <rect x="280" y="212" width="4" height="10" rx="1" fill="#71717a" />
        </svg>
      );

    case 'ceramic-mug':
      return (
        <svg viewBox="0 0 500 500" className="w-[85%] h-[85%] drop-shadow-2xl">
          <defs>
            <linearGradient id="mugCylinder" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.35" />
              <stop offset="15%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="45%" stopColor="#ffffff" stopOpacity="0.0" />
              <stop offset="85%" stopColor="#000000" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="ceramicGloss" x1="20%" y1="0%" x2="35%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <ellipse cx="230" cy="445" rx="130" ry="25" fill="#000000" opacity="0.4" filter="blur(8px)" />
          {/* Mug Handle */}
          <path
            d="M 320,165 C 430,170 430,340 310,355 L 305,320 C 385,310 385,200 315,195 Z"
            fill={hexColor}
            stroke="#000000"
            strokeWidth="1.5"
            strokeOpacity="0.25"
          />
          <path
            d="M 320,165 C 430,170 430,340 310,355 L 305,320 C 385,310 385,200 315,195 Z"
            fill="url(#mugCylinder)"
          />
          {/* Mug Body */}
          <path
            d="M 120,135 C 120,135 120,380 120,400 C 120,430 330,430 330,400 L 330,135 Z"
            fill={hexColor}
          />
          <path
            d="M 120,135 C 120,135 120,380 120,400 C 120,430 330,430 330,400 L 330,135 Z"
            fill="url(#mugCylinder)"
          />
          {/* Gloss vertical highlight */}
          <rect x="155" y="135" width="40" height="275" fill="url(#ceramicGloss)" />
          {/* Exposed Raw Clay Baseline */}
          <path d="M 120,390 C 120,425 330,425 330,390 L 330,400 C 330,430 120,430 120,400 Z" fill="#9A7B56" opacity="0.8" />
          {/* Mug Rim Oval Top */}
          <ellipse cx="225" cy="135" rx="105" ry="26" fill={hexColor} stroke="#000000" strokeWidth="1" strokeOpacity="0.2" />
          {/* Inner Cup Hollow & Liquid Surface */}
          <ellipse cx="225" cy="135" rx="95" ry="21" fill="#18181b" opacity="0.6" />
          <ellipse cx="225" cy="137" rx="90" ry="19" fill="#2E1C14" />
        </svg>
      );

    case 'dad-cap':
      return (
        <svg viewBox="0 0 500 500" className="w-[85%] h-[85%] drop-shadow-2xl">
          <defs>
            <linearGradient id="capShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="60%" stopColor="#000000" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
            </linearGradient>
          </defs>
          <ellipse cx="250" cy="420" rx="180" ry="26" fill="#000000" opacity="0.4" filter="blur(8px)" />
          {/* Cap Crown 6-Panel Dome */}
          <path
            d="M 110,320 C 105,170 395,170 390,320 C 340,345 160,345 110,320 Z"
            fill={hexColor}
            stroke="#000000"
            strokeWidth="1.5"
            strokeOpacity="0.2"
          />
          <path
            d="M 110,320 C 105,170 395,170 390,320 C 340,345 160,345 110,320 Z"
            fill="url(#capShadow)"
          />
          {/* Crown Seam Lines */}
          <path d="M 250,170 L 250,335" stroke="#000000" strokeWidth="2" strokeOpacity="0.2" />
          <path d="M 250,170 Q 170,220 125,320" stroke="#000000" strokeWidth="2" strokeOpacity="0.2" />
          <path d="M 250,170 Q 330,220 375,320" stroke="#000000" strokeWidth="2" strokeOpacity="0.2" />
          {/* Sewn Ventilation Eyelets */}
          <circle cx="210" cy="240" r="4" fill="#000000" opacity="0.3" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.3" />
          <circle cx="290" cy="240" r="4" fill="#000000" opacity="0.3" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.3" />
          <circle cx="160" cy="260" r="4" fill="#000000" opacity="0.3" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.3" />
          <circle cx="340" cy="260" r="4" fill="#000000" opacity="0.3" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.3" />
          {/* Top Squatchee Button */}
          <ellipse cx="250" cy="170" rx="12" ry="7" fill={hexColor} stroke="#000000" strokeWidth="1.5" strokeOpacity="0.3" />
          {/* Pre-Curved Visor Bill */}
          <path
            d="M 95,320 C 130,410 370,410 405,320 C 345,345 155,345 95,320 Z"
            fill={hexColor}
            stroke="#000000"
            strokeWidth="1.5"
            strokeOpacity="0.25"
          />
          <path
            d="M 95,320 C 130,410 370,410 405,320 C 345,345 155,345 95,320 Z"
            fill="url(#capShadow)"
          />
          {/* 4 Rows of Visor Stitching */}
          <path d="M 120,338 C 150,390 350,390 380,338" fill="none" stroke="#000000" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="3 2" />
          <path d="M 130,346 C 160,395 340,395 370,346" fill="none" stroke="#000000" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="3 2" />
          <path d="M 140,354 C 170,400 330,400 360,354" fill="none" stroke="#000000" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="3 2" />
        </svg>
      );

    case 'canvas-tote':
      return (
        <svg viewBox="0 0 500 500" className="w-[85%] h-[85%] drop-shadow-2xl">
          <defs>
            <linearGradient id="toteShadow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#000000" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          <ellipse cx="250" cy="465" rx="160" ry="20" fill="#000000" opacity="0.35" filter="blur(8px)" />
          {/* Stitched Shoulder Straps */}
          <path
            d="M 190,200 L 190,65 C 190,40 310,40 310,65 L 310,200 L 290,200 L 290,65 C 290,55 210,55 210,65 L 210,200 Z"
            fill={hexColor}
            stroke="#000000"
            strokeWidth="1.5"
            strokeOpacity="0.25"
          />
          {/* Main Canvas Bag Body */}
          <path
            d="M 120,180 L 380,180 L 365,450 L 135,450 Z"
            fill={hexColor}
            stroke="#000000"
            strokeWidth="1.5"
            strokeOpacity="0.25"
          />
          <path d="M 120,180 L 380,180 L 365,450 L 135,450 Z" fill="url(#toteShadow)" />
          {/* Top Hem & X-Box Handle Reinforcement Stitching */}
          <rect x="185" y="180" width="28" height="35" fill="none" stroke="#000000" strokeWidth="1" strokeOpacity="0.3" />
          <line x1="185" y1="180" x2="213" y2="215" stroke="#000000" strokeWidth="1" strokeOpacity="0.3" />
          <line x1="213" y1="180" x2="185" y2="215" stroke="#000000" strokeWidth="1" strokeOpacity="0.3" />

          <rect x="287" y="180" width="28" height="35" fill="none" stroke="#000000" strokeWidth="1" strokeOpacity="0.3" />
          <line x1="287" y1="180" x2="315" y2="215" stroke="#000000" strokeWidth="1" strokeOpacity="0.3" />
          <line x1="315" y1="180" x2="287" y2="215" stroke="#000000" strokeWidth="1" strokeOpacity="0.3" />

          {/* Gusset Fold Creases */}
          <path d="M 155,200 L 160,435" stroke="#000000" strokeWidth="1.5" strokeOpacity="0.12" />
          <path d="M 345,200 L 340,435" stroke="#000000" strokeWidth="1.5" strokeOpacity="0.12" />
        </svg>
      );

    case 'steel-tumbler':
      return (
        <svg viewBox="0 0 500 500" className="w-[85%] h-[85%] drop-shadow-2xl">
          <defs>
            <linearGradient id="metalSpecular" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.5" />
              <stop offset="20%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="45%" stopColor="#ffffff" stopOpacity="0.0" />
              <stop offset="75%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <ellipse cx="250" cy="455" rx="75" ry="16" fill="#000000" opacity="0.45" filter="blur(6px)" />
          {/* Tumbler Body */}
          <path
            d="M 185,115 L 315,115 L 305,440 C 305,450 195,450 195,440 Z"
            fill={hexColor}
            stroke="#000000"
            strokeWidth="1.5"
            strokeOpacity="0.3"
          />
          <path d="M 185,115 L 315,115 L 305,440 C 305,450 195,450 195,440 Z" fill="url(#metalSpecular)" />
          {/* Brushed Stainless Steel Top Rim Band */}
          <rect x="183" y="105" width="134" height="15" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          {/* Vacuum Seal Acrylic Cap */}
          <path d="M 190,105 L 195,75 L 305,75 L 310,105 Z" fill="#334155" stroke="#000000" strokeWidth="1.5" strokeOpacity="0.4" />
          <rect x="235" y="68" width="30" height="10" rx="3" fill="#64748B" />
        </svg>
      );

    case 'hardcover-journal':
    default:
      return (
        <svg viewBox="0 0 500 500" className="w-[85%] h-[85%] drop-shadow-2xl">
          <defs>
            <linearGradient id="leatherGrain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="70%" stopColor="#000000" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <ellipse cx="260" cy="445" rx="140" ry="18" fill="#000000" opacity="0.4" filter="blur(8px)" />
          {/* Notebook Spine Shadow */}
          <rect x="135" y="80" width="22" height="360" rx="4" fill="#000000" opacity="0.3" />
          {/* Cover */}
          <rect x="150" y="80" width="215" height="360" rx="10" fill={hexColor} stroke="#000000" strokeWidth="2" strokeOpacity="0.25" />
          <rect x="150" y="80" width="215" height="360" rx="10" fill="url(#leatherGrain)" />
          {/* Spine Groove */}
          <line x1="168" y1="80" x2="168" y2="440" stroke="#000000" strokeWidth="2" strokeOpacity="0.4" />
          <line x1="170" y1="80" x2="170" y2="440" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.15" />
          {/* Elastic Band */}
          <rect x="330" y="80" width="16" height="360" fill="#18181b" opacity="0.85" rx="2" />
          {/* Bookmark Ribbon */}
          <path d="M 230,80 L 230,455 L 240,445 L 250,455 L 250,80 Z" fill="#B91C1C" opacity="0.9" />
        </svg>
      );
  }
}
