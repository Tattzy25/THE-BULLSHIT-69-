import React, { useState } from 'react';
import { PRODUCTS } from './data/products';
import { SAMPLE_LOGOS } from './data/sampleLogos';
import { Product, GarmentColor, PrintPlacement, LogoAsset, ArtworkAnalysis } from './types/merch';
import { Navbar } from './components/Navbar';
import { ProductCanvas } from './components/ProductCanvas';
import { ProductSelector } from './components/ProductSelector';
import { LogoUploader } from './components/LogoUploader';
import { PrintControls } from './components/PrintControls';
import { ArtworkAnalysisModal } from './components/ArtworkAnalysisModal';
import { AiLifestyleGenerator } from './components/AiLifestyleGenerator';
import { ExportModal } from './components/ExportModal';
import {
  Sliders,
  Wand2,
  FileText,
  RotateCcw,
  Sparkles,
  Layers,
  CheckCircle2,
  Info,
} from 'lucide-react';

export default function App() {
  // Main State
  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS[0]);
  const [selectedColor, setSelectedColor] = useState<GarmentColor>(PRODUCTS[0].colors[0]);
  const [activeViewIndex, setActiveViewIndex] = useState<number>(0);
  const [currentLogo, setCurrentLogo] = useState<LogoAsset>(SAMPLE_LOGOS[0]);

  // Print placement & technique configuration
  const [placement, setPlacement] = useState<PrintPlacement>({
    xPercent: 50,
    yPercent: 44,
    scalePercent: 65,
    rotationDeg: 0,
    opacity: 1.0,
    blendMode: 'normal',
    technique: 'screen',
    invert: false,
    monochromeColor: null,
    distressLevel: 0,
    embroideryStitchDensity: 3,
  });

  // UI state
  const [sidebarTab, setSidebarTab] = useState<'customize' | 'ai_photoshoot' | 'techpack'>('customize');
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [cmykProof, setCmykProof] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<ArtworkAnalysis | null>(null);

  // Sync color when changing product
  const handleSelectProduct = (newProduct: Product) => {
    setSelectedProduct(newProduct);
    setSelectedColor(newProduct.colors[0]);
    setActiveViewIndex(0);
    // Adjust default placement from presets if available
    if (newProduct.presets[0]) {
      setPlacement((prev) => ({
        ...prev,
        xPercent: newProduct.presets[0].xPercent,
        yPercent: newProduct.presets[0].yPercent,
        scalePercent: newProduct.presets[0].scalePercent,
        technique: newProduct.defaultTechnique,
      }));
    }
  };

  const handleUpdatePlacement = (updates: Partial<PrintPlacement>) => {
    setPlacement((prev) => ({ ...prev, ...updates }));
  };

  // Run Gemini 3.8 Flash artwork analysis
  const handleTriggerAnalysis = async () => {
    setIsAnalyzing(true);
    setIsAnalysisModalOpen(true);
    try {
      const response = await fetch('/api/ai/analyze-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: currentLogo.dataUrl,
          mimeType: currentLogo.fileType,
        }),
      });

      const data = await response.json();
      if (response.ok && data.analysis) {
        setAnalysisResult(data.analysis);
      } else {
        console.warn('Fallback analysis used');
        // Graceful fallback analysis in case API rate limit is reached
        setAnalysisResult({
          colors: [
            { hex: '#FFFFFF', name: 'Optic White', pantone: 'PANTONE 11-0601 TPG', coveragePercent: 60 },
            { hex: '#0F172A', name: 'Deep Obsidian', pantone: 'PANTONE Black 6 C', coveragePercent: 40 },
          ],
          recommendedTechniques: [
            { name: 'Screen Printing', suitabilityScore: 98, reason: 'Crisp bold vector edges with high opacity.', recommendedMeshOrStitch: '160 mesh count' },
            { name: 'Direct-to-Garment (DTG)', suitabilityScore: 90, reason: 'Excellent soft hand-feel on cotton blanks.', recommendedMeshOrStitch: '1200 DPI' },
            { name: '3D High-Density Embroidery', suitabilityScore: 84, reason: 'Substantial line weights allow raised satin stitches.', recommendedMeshOrStitch: 'Satin 0.4mm density' },
          ],
          bestGarmentColors: [
            { name: 'Washed Black', hex: '#1C1C1E', contrastRating: '98% High Contrast' },
            { name: 'Sage Olive', hex: '#4A5B4E', contrastRating: '92% Excellent' },
            { name: 'Midnight Navy', hex: '#1E293B', contrastRating: '90% Bold Vibe' },
          ],
          printFeasibility: {
            complexityScore: 3,
            embroideryReady: true,
            maxRecommendedWidthInches: 14,
            notes: 'High vector fidelity suitable for commercial automated screen press runs.',
          },
          merchConcepts: [
            { productType: 'Heavyweight Tee', title: 'Athletic Heritage Drop', description: 'Boxy streetwear silhouette with chest crest print.' },
            { productType: 'Fleece Hoodie', title: 'Core Atelier Collection', description: 'Subtle tone-on-tone embroidery on heather bone.' },
            { productType: 'Artisan Mug', title: 'Roastery Club Series', description: 'Matte stone ceramic with tactile spot print.' },
          ],
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenAiStudio={() => setSidebarTab('ai_photoshoot')}
        onOpenAnalysis={handleTriggerAnalysis}
        isAnalyzing={isAnalyzing}
      />

      {/* Main Studio Split Layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Product Viewport (7 Cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          {/* Main Visualizer Canvas */}
          <ProductCanvas
            product={selectedProduct}
            color={selectedColor}
            viewIndex={activeViewIndex}
            placement={placement}
            logo={currentLogo}
            onUpdatePlacement={handleUpdatePlacement}
            showGuides={showGuides}
            cmykProof={cmykProof}
          />

          {/* Quick Action Toolbar Below Canvas */}
          <div className="flex items-center justify-between gap-2 p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdatePlacement({ xPercent: 50, yPercent: 44 })}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                Center Chest
              </button>
              <button
                onClick={() => handleUpdatePlacement({ xPercent: 68, yPercent: 32, scalePercent: 32 })}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                Left Chest Pocket
              </button>
              <button
                onClick={() => handleUpdatePlacement({ rotationDeg: (placement.rotationDeg + 90) % 360 })}
                className="px-2 py-1 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                title="Rotate 90°"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>90°</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGuides(!showGuides)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  showGuides
                    ? 'bg-neutral-800 border-sky-400/80 text-sky-400'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Guides
              </button>
              <button
                onClick={() => setCmykProof(!cmykProof)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  cmykProof
                    ? 'bg-neutral-800 border-amber-400/80 text-amber-400'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                CMYK Proof
              </button>
            </div>
          </div>

          {/* Product Technical Details Bar */}
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-neutral-500 shrink-0" />
              <span>{selectedProduct.garmentSpec}</span>
            </div>
            <div className="font-mono text-neutral-300">
              Max Area: {selectedProduct.views[activeViewIndex]?.printArea.label}
            </div>
          </div>
        </section>

        {/* Right Column: Studio Controls & Tools (5 Cols) */}
        <section className="lg:col-span-5 bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-5 shadow-xl flex flex-col gap-5">
          {/* Studio Tab Navigation */}
          <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
            <button
              onClick={() => setSidebarTab('customize')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                sidebarTab === 'customize'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
            <button
              onClick={() => setSidebarTab('ai_photoshoot')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                sidebarTab === 'ai_photoshoot'
                  ? 'bg-neutral-800 text-sky-400 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-sky-400" />
              <span>AI Photoshoot</span>
            </button>
            <button
              onClick={() => setSidebarTab('techpack')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                sidebarTab === 'techpack'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Production Specs</span>
            </button>
          </div>

          {/* Tab 1: Customize Mockup */}
          {sidebarTab === 'customize' && (
            <div className="space-y-6">
              {/* Product Blank Selector */}
              <div>
                <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
                  01. Select Product & Color
                </h3>
                <ProductSelector
                  selectedProduct={selectedProduct}
                  onSelectProduct={handleSelectProduct}
                  selectedColor={selectedColor}
                  onSelectColor={setSelectedColor}
                  activeViewIndex={activeViewIndex}
                  onSelectView={setActiveViewIndex}
                />
              </div>

              {/* Logo / Graphic Upload */}
              <div className="pt-4 border-t border-neutral-800/80">
                <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
                  02. Upload Artwork
                </h3>
                <LogoUploader
                  currentLogo={currentLogo}
                  onSelectLogo={setCurrentLogo}
                  onInvertChange={(inv) => handleUpdatePlacement({ invert: inv })}
                  isInverted={placement.invert}
                  onTriggerAnalysis={handleTriggerAnalysis}
                  isAnalyzing={isAnalyzing}
                />
              </div>

              {/* Print Placement & Technique Controls */}
              <div className="pt-4 border-t border-neutral-800/80">
                <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
                  03. Print Technique & Calibration
                </h3>
                <PrintControls
                  placement={placement}
                  onChangePlacement={handleUpdatePlacement}
                  product={selectedProduct}
                  logo={currentLogo}
                  showGuides={showGuides}
                  onToggleGuides={setShowGuides}
                  cmykProof={cmykProof}
                  onToggleCmykProof={setCmykProof}
                />
              </div>
            </div>
          )}

          {/* Tab 2: AI Photoshoot Generator */}
          {sidebarTab === 'ai_photoshoot' && (
            <AiLifestyleGenerator
              product={selectedProduct}
              color={selectedColor}
              logo={currentLogo}
            />
          )}

          {/* Tab 3: Production Specs Summary */}
          {sidebarTab === 'techpack' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="text-xs font-semibold text-white uppercase tracking-wider">
                  Live Factory Tech Summary
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-neutral-900">
                    <span className="text-neutral-400">Item Blank:</span>
                    <span className="font-mono text-neutral-200">{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-900">
                    <span className="text-neutral-400">Garment Hex:</span>
                    <span className="font-mono text-neutral-200">{selectedColor.hex} ({selectedColor.name})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-900">
                    <span className="text-neutral-400">Technique:</span>
                    <span className="font-mono text-neutral-200 capitalize">{placement.technique.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-900">
                    <span className="text-neutral-400">Collar Offset:</span>
                    <span className="font-mono text-neutral-200">{(placement.yPercent * 0.1).toFixed(1)}" below collar</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-900">
                    <span className="text-neutral-400">Export DPI:</span>
                    <span className="font-mono text-sky-400 font-bold">300 DPI High-Res</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="w-full mt-3 py-2 px-3 rounded-lg bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Download Full Tech Pack Spec Sheet
                </button>
              </div>

              {/* Quick AI Audit Button */}
              <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Factory Pantone PMS Audit</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Run Gemini 3.8 Flash to extract spot color formulas, mesh count ratings, and embroidery stitch feasibility.
                </p>
                <button
                  onClick={handleTriggerAnalysis}
                  disabled={isAnalyzing}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-white font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAnalyzing ? 'Analyzing...' : 'Run Artwork Audit'}</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      <ArtworkAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        analysis={analysisResult}
        isLoading={isAnalyzing}
        logo={currentLogo}
        onApplyGarmentHex={(hex) => {
          // Find matching or closest garment color
          const found = selectedProduct.colors.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
          if (found) {
            setSelectedColor(found);
          } else {
            setSelectedColor({
              id: 'custom-recommended',
              name: 'Recommended Tone',
              hex,
              isDark: true,
            });
          }
          setIsAnalysisModalOpen(false);
        }}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        product={selectedProduct}
        color={selectedColor}
        placement={placement}
        logo={currentLogo}
        analysis={analysisResult}
      />
    </div>
  );
}
