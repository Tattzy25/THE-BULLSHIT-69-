import React, { useRef } from 'react';
import { LogoAsset } from '../types/merch';
import { SAMPLE_LOGOS } from '../data/sampleLogos';
import { UploadCloud, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';

interface LogoUploaderProps {
  currentLogo: LogoAsset;
  onSelectLogo: (logo: LogoAsset) => void;
  onInvertChange: (invert: boolean) => void;
  isInverted: boolean;
  onTriggerAnalysis: () => void;
  isAnalyzing: boolean;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  currentLogo,
  onSelectLogo,
  onInvertChange,
  isInverted,
  onTriggerAnalysis,
  isAnalyzing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const newLogo: LogoAsset = {
          id: `custom-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          dataUrl,
          width: img.naturalWidth || 500,
          height: img.naturalHeight || 500,
          aspectRatio: (img.naturalWidth || 500) / (img.naturalHeight || 500),
          fileType: file.type || 'image/png',
          isSample: false,
        };
        onSelectLogo(newLogo);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="group relative border border-dashed border-neutral-700 hover:border-neutral-500 rounded-xl p-4 text-center bg-neutral-900/30 hover:bg-neutral-900/60 transition-all cursor-pointer"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={handleFileUpload}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300 group-hover:text-white transition-colors">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium text-neutral-200">
            Upload custom logo or graphic
          </div>
          <div className="text-[11px] text-neutral-500">
            PNG, SVG, JPG, WebP · High-res or vector recommended
          </div>
        </div>
      </div>

      {/* Active Logo Details Card */}
      <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-neutral-950 border border-neutral-800 p-1 flex items-center justify-center overflow-hidden">
            <img
              src={currentLogo.dataUrl}
              alt={currentLogo.name}
              className={`max-w-full max-h-full object-contain ${
                isInverted ? 'filter invert' : ''
              }`}
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-white truncate max-w-[150px]">
              {currentLogo.name}
            </div>
            <div className="text-[10px] font-mono text-neutral-400">
              {currentLogo.width} × {currentLogo.height} px · {currentLogo.fileType.split('/')[1]?.toUpperCase() || 'PNG'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Invert Color Button */}
          <button
            onClick={() => onInvertChange(!isInverted)}
            title="Invert Artwork Colors (e.g. Black to White for dark garments)"
            className={`p-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              isInverted
                ? 'bg-white text-neutral-950 border-white font-semibold'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* AI Artwork Check Button */}
          <button
            onClick={onTriggerAnalysis}
            disabled={isAnalyzing}
            title="Analyze print feasibility, Pantone PMS colors, and fabric recommendations"
            className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-medium text-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">AI Check</span>
          </button>
        </div>
      </div>

      {/* Sample Logos Selector */}
      <div>
        <div className="text-[11px] text-neutral-400 font-medium mb-2">
          Or try sample brand graphics:
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {SAMPLE_LOGOS.map((sample) => {
            const isSelected = sample.id === currentLogo.id;
            return (
              <button
                key={sample.id}
                onClick={() => onSelectLogo(sample)}
                title={sample.name}
                className={`p-1.5 aspect-square rounded-lg border transition-all cursor-pointer flex items-center justify-center bg-neutral-950 ${
                  isSelected
                    ? 'border-sky-400 ring-1 ring-sky-400/50'
                    : 'border-neutral-800 hover:border-neutral-600'
                }`}
              >
                <img
                  src={sample.dataUrl}
                  alt={sample.name}
                  className="max-h-full max-w-full object-contain"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
