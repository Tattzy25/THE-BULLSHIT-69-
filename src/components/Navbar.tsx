import React from 'react';
import { Download, Sparkles, Wand2, FileText, Layers } from 'lucide-react';

interface NavbarProps {
  onOpenExport: () => void;
  onOpenAiStudio: () => void;
  onOpenAnalysis: () => void;
  isAnalyzing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenExport,
  onOpenAiStudio,
  onOpenAnalysis,
  isAnalyzing,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-50">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="/" className="text-base font-bold tracking-tight text-white whitespace-nowrap">
          MerchCraft <span className="font-light text-neutral-400">Studio</span>
        </a>
        <span className="hidden sm:inline-block text-[11px] font-mono text-neutral-500 border-l border-neutral-800 pl-3">
          300 DPI · On-Demand
        </span>
      </div>

      {/* Zone 2: Navigation & Quick Tools */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-400">
        <button
          onClick={onOpenAnalysis}
          disabled={isAnalyzing}
          className="hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isAnalyzing ? 'Analyzing Logo...' : 'AI Print Check'}</span>
        </button>
        <button
          onClick={onOpenAiStudio}
          className="hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <Wand2 className="w-3.5 h-3.5 text-sky-400" />
          <span>AI Photoshoot</span>
        </button>
        <span className="text-neutral-500" aria-hidden="true">·</span>
        <span className="text-neutral-500">Vector & Raster Engine</span>
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenExport}
          className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-white hover:bg-neutral-200 transition-colors rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-sm active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-neutral-950" />
          <span>Export Print Files</span>
        </button>
      </div>
    </header>
  );
};
