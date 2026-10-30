import React from 'react';
import { PrintPlacement, PrintTechnique, Product, LogoAsset } from '../types/merch';
import { Sliders, Maximize2, RotateCw, Sparkles, Layers, ShieldCheck } from 'lucide-react';

interface PrintControlsProps {
  placement: PrintPlacement;
  onChangePlacement: (updates: Partial<PrintPlacement>) => void;
  product: Product;
  logo: LogoAsset;
  showGuides: boolean;
  onToggleGuides: (show: boolean) => void;
  cmykProof: boolean;
  onToggleCmykProof: (active: boolean) => void;
}

const TECHNIQUE_LABELS: Record<PrintTechnique, { label: string; desc: string }> = {
  screen: { label: 'Screen Print', desc: 'Vibrant opaque plastisol/water ink' },
  dtg: { label: 'DTG Print', desc: 'Direct-to-garment soft cotton weave blend' },
  embroidery: { label: '3D Embroidery', desc: 'Textured raised satin thread stitches' },
  foil_gold: { label: 'Gold Foil', desc: 'Hot-stamped reflective metallic gold' },
  foil_silver: { label: 'Silver Foil', desc: 'High-sheen reflective metallic silver' },
  deboss: { label: 'Blind Deboss', desc: 'Stamped 3D deep recess indentation' },
  laser: { label: 'Laser Engraved', desc: 'Precision tonal metal/wood etch' },
};

export const PrintControls: React.FC<PrintControlsProps> = ({
  placement,
  onChangePlacement,
  product,
  logo,
  showGuides,
  onToggleGuides,
  cmykProof,
  onToggleCmykProof,
}) => {
  const currentView = product.views[0];
  const maxW = currentView.printArea.maxPhysicalWidthInches;
  const effectiveScale = placement.scalePercent / 100;
  const currentPhysicalW = (maxW * effectiveScale).toFixed(1);
  const currentPhysicalH = ((maxW * effectiveScale) / logo.aspectRatio).toFixed(1);

  return (
    <div className="space-y-5">
      {/* Print Technique Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-white">Print Technique</label>
          <span className="text-[10px] font-mono text-neutral-400">
            {TECHNIQUE_LABELS[placement.technique]?.desc}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {product.supportedTechniques.map((tech) => {
            const isSelected = placement.technique === tech;
            return (
              <button
                key={tech}
                onClick={() => onChangePlacement({ technique: tech })}
                className={`px-3 py-2 text-left rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-800 border-white/80 text-white font-medium shadow-sm'
                    : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                <div className="text-xs">{TECHNIQUE_LABELS[tech]?.label || tech}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* One-Click Alignment Presets */}
      {product.presets.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-white block mb-2">
            Placement Presets
          </label>
          <div className="flex flex-wrap gap-1.5">
            {product.presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() =>
                  onChangePlacement({
                    xPercent: preset.xPercent,
                    yPercent: preset.yPercent,
                    scalePercent: preset.scalePercent,
                  })
                }
                className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer whitespace-nowrap"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scale / Size Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400 font-medium">Print Size</span>
          <span className="font-mono text-neutral-200 font-semibold">
            {currentPhysicalW}" × {currentPhysicalH}" <span className="text-neutral-500 font-normal">({placement.scalePercent}%)</span>
          </span>
        </div>
        <input
          type="range"
          min="15"
          max="120"
          value={placement.scalePercent}
          onChange={(e) => onChangePlacement({ scalePercent: Number(e.target.value) })}
          className="w-full accent-white bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Rotation Deg Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400 font-medium">Rotation</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-neutral-200">{placement.rotationDeg}°</span>
            {placement.rotationDeg !== 0 && (
              <button
                onClick={() => onChangePlacement({ rotationDeg: 0 })}
                className="text-[10px] text-neutral-500 hover:text-neutral-300 underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
        <input
          type="range"
          min="-180"
          max="180"
          value={placement.rotationDeg}
          onChange={(e) => onChangePlacement({ rotationDeg: Number(e.target.value) })}
          className="w-full accent-white bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* X / Y Millimeter Offset Nudgers */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800/60">
        <div>
          <div className="text-[11px] text-neutral-400 font-medium mb-1">Horizontal Offset (X)</div>
          <div className="flex items-center gap-1.5">
            <input
              type="range"
              min="10"
              max="90"
              value={placement.xPercent}
              onChange={(e) => onChangePlacement({ xPercent: Number(e.target.value) })}
              className="w-full accent-white bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <button
              onClick={() => onChangePlacement({ xPercent: 50 })}
              title="Center horizontally"
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 cursor-pointer"
            >
              50%
            </button>
          </div>
        </div>
        <div>
          <div className="text-[11px] text-neutral-400 font-medium mb-1">Vertical Offset (Y)</div>
          <div className="flex items-center gap-1.5">
            <input
              type="range"
              min="15"
              max="85"
              value={placement.yPercent}
              onChange={(e) => onChangePlacement({ yPercent: Number(e.target.value) })}
              className="w-full accent-white bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <button
              onClick={() => onChangePlacement({ yPercent: currentView.printArea.yPercent })}
              title="Reset vertical position"
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 cursor-pointer"
            >
              Std
            </button>
          </div>
        </div>
      </div>

      {/* Print Proofing & Guides Toggles */}
      <div className="pt-3 border-t border-neutral-800/60 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-300 font-medium">Print Safety Boundary Guides</span>
          <button
            onClick={() => onToggleGuides(!showGuides)}
            className={`w-9 h-5 rounded-full transition-colors p-0.5 cursor-pointer relative ${
              showGuides ? 'bg-sky-500' : 'bg-neutral-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                showGuides ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-300 font-medium">CMYK Soft-Proof Preview</div>
            <div className="text-[10px] text-neutral-500">Simulate physical press ink gamut</div>
          </div>
          <button
            onClick={() => onToggleCmykProof(!cmykProof)}
            className={`w-9 h-5 rounded-full transition-colors p-0.5 cursor-pointer relative ${
              cmykProof ? 'bg-amber-500' : 'bg-neutral-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                cmykProof ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
