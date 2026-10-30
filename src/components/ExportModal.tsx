import React, { useState } from 'react';
import { Product, GarmentColor, PrintPlacement, LogoAsset, ArtworkAnalysis } from '../types/merch';
import {
  generate300DpiPrintFile,
  generateTechPackHtml,
  downloadDataUrl,
} from '../utils/exportUtils';
import { X, Download, FileCheck, Check, FileText, Layers, ShieldCheck } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  color: GarmentColor;
  placement: PrintPlacement;
  logo: LogoAsset;
  analysis: ArtworkAnalysis | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  product,
  color,
  placement,
  logo,
  analysis,
}) => {
  const [includeBleed, setIncludeBleed] = useState(true);
  const [includeCropMarks, setIncludeCropMarks] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedStatus, setExportedStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentView = product.views[0];
  const effectiveScale = placement.scalePercent / 100;
  const physicalW = (currentView.printArea.maxPhysicalWidthInches * effectiveScale).toFixed(2);
  const physicalH = ((currentView.printArea.maxPhysicalWidthInches * effectiveScale) / logo.aspectRatio).toFixed(2);
  const approxPxW = Math.round(Number(physicalW) * 300);
  const approxPxH = Math.round(Number(physicalH) * 300);

  // 1. Export 300 DPI Transparent PNG
  const handleExport300Dpi = async () => {
    setIsExporting(true);
    try {
      const result = await generate300DpiPrintFile(logo, placement, product, {
        includeBleed,
        includeCropMarks,
        dpi: 300,
      });

      const fileName = `${logo.name.toLowerCase().replace(/\s+/g, '_')}_${product.id}_300dpi_print_ready.png`;
      downloadDataUrl(result.dataUrl, fileName);
      setExportedStatus('300 DPI Print Master downloaded!');
      setTimeout(() => setExportedStatus(null), 3000);
    } catch (e: any) {
      console.error(e);
      alert('Failed to generate high-DPI export: ' + e.message);
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Export Factory Tech Pack Specification
  const handleExportTechPack = () => {
    const htmlContent = generateTechPackHtml(product, color, placement, logo, analysis);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    downloadDataUrl(url, `techpack_${product.id}_${logo.name.toLowerCase().replace(/\s+/g, '_')}.html`);
    URL.revokeObjectURL(url);
    setExportedStatus('Production Tech Pack downloaded!');
    setTimeout(() => setExportedStatus(null), 3000);
  };

  // 3. Export Studio Product Mockup (PNG)
  const handleExportMockup = async () => {
    setIsExporting(true);
    try {
      // Capture canvas mockup
      const result = await generate300DpiPrintFile(logo, placement, product, {
        includeBleed: false,
        includeCropMarks: false,
        dpi: 150,
      });
      downloadDataUrl(result.dataUrl, `mockup_${product.id}_${color.id}.png`);
      setExportedStatus('eCommerce Store Mockup downloaded!');
      setTimeout(() => setExportedStatus(null), 3000);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Export Print-Ready Assets</h2>
            <p className="text-xs text-neutral-400">
              Commercial manufacturing files, vector placements & 300 DPI transparent raster masters
            </p>
          </div>
        </div>

        {/* Print Spec Summary Card */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Target Print Physical Size:</span>
            <span className="font-mono text-white font-bold">{physicalW}" × {physicalH}"</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Master Pixel Dimensions (300 DPI):</span>
            <span className="font-mono text-sky-400 font-semibold">{approxPxW} × {approxPxH} px</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Recommended Factory Method:</span>
            <span className="font-mono text-neutral-200 capitalize">{placement.technique.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Garment Base:</span>
            <span className="font-mono text-neutral-200">{product.name} ({color.name})</span>
          </div>
        </div>

        {/* Options Toggles */}
        <div className="space-y-3 mb-6 p-3 bg-neutral-900/50 rounded-xl border border-neutral-800">
          <div className="text-xs font-semibold text-neutral-300">Print Preparation Options</div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Include 0.125" (3mm) Commercial Bleed Margin</span>
            <button
              onClick={() => setIncludeBleed(!includeBleed)}
              className={`w-9 h-5 rounded-full transition-colors p-0.5 cursor-pointer relative ${
                includeBleed ? 'bg-sky-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  includeBleed ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Include Standard Printer Corner Crop Marks</span>
            <button
              onClick={() => setIncludeCropMarks(!includeCropMarks)}
              className={`w-9 h-5 rounded-full transition-colors p-0.5 cursor-pointer relative ${
                includeCropMarks ? 'bg-sky-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  includeCropMarks ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Success toast notice */}
        {exportedStatus && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{exportedStatus}</span>
          </div>
        )}

        {/* Export Buttons */}
        <div className="space-y-2.5">
          {/* 1. Primary 300 DPI Export */}
          <button
            onClick={handleExport300Dpi}
            disabled={isExporting}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer shadow-lg active:scale-[0.99] disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-neutral-950" />
              <div className="text-left">
                <div>Download 300 DPI Master Print File (PNG)</div>
                <div className="text-[10px] text-neutral-600 font-normal">
                  Transparent alpha channel · Exact physical scale · Print shop ready
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono bg-neutral-200 px-2 py-0.5 rounded text-neutral-800">
              300 DPI
            </span>
          </button>

          {/* 2. Factory Tech Pack */}
          <button
            onClick={handleExportTechPack}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-700/80 text-white font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-sky-400" />
              <div className="text-left">
                <div>Download Production Tech Pack (Spec Sheet)</div>
                <div className="text-[10px] text-neutral-400 font-normal">
                  A4 printable documentation · Collar coordinates · Pantone codes
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">HTML / PDF</span>
          </button>

          {/* 3. eCommerce Store Mockup */}
          <button
            onClick={handleExportMockup}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-700/80 text-white font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <div>Download eCommerce Product Mockup</div>
                <div className="text-[10px] text-neutral-400 font-normal">
                  High-res studio render for Shopify, Etsy & marketing catalogs
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
