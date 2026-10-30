import React from 'react';
import { ArtworkAnalysis, LogoAsset } from '../types/merch';
import { X, Sparkles, CheckCircle, AlertTriangle, Layers, Palette, Lightbulb } from 'lucide-react';

interface ArtworkAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: ArtworkAnalysis | null;
  isLoading: boolean;
  logo: LogoAsset;
  onApplyGarmentHex?: (hex: string) => void;
}

export const ArtworkAnalysisModal: React.FC<ArtworkAnalysisModalProps> = ({
  isOpen,
  onClose,
  analysis,
  isLoading,
  logo,
  onApplyGarmentHex,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">AI Print Feasibility & Pantone Audit</h2>
            <p className="text-xs text-neutral-400">
              Powered by Gemini 3.8 Flash · Factory production evaluation for "{logo.name}"
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-sm font-medium text-neutral-200">
              Analyzing artwork vectors and color separations...
            </div>
            <div className="text-xs text-neutral-500">
              Matching Pantone PMS coated library and evaluating embroidery stitch density
            </div>
          </div>
        )}

        {/* Analysis Results View */}
        {!isLoading && analysis && (
          <div className="space-y-6">
            {/* Pantone Spot Colors */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-sky-400" />
                <span>Identified Spot Colors (Pantone PMS Coated)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {analysis.colors.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-3"
                  >
                    <div
                      className="w-8 h-8 rounded-lg border border-neutral-700/80 shrink-0 shadow-inner"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-white truncate">
                        {c.pantone}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate">{c.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Print Technique Feasibility Scores */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Recommended Manufacturing Methods</span>
              </h3>
              <div className="space-y-2">
                {analysis.recommendedTechniques.map((tech, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{tech.name}</span>
                        {tech.recommendedMeshOrStitch && (
                          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                            {tech.recommendedMeshOrStitch}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">{tech.reason}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        {tech.suitabilityScore}/100
                      </div>
                      <div className="text-[10px] text-neutral-500">Suitability</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Garment Colors */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                High-Contrast Garment Recommendations
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {analysis.bestGarmentColors.map((g, idx) => (
                  <button
                    key={idx}
                    onClick={() => onApplyGarmentHex?.(g.hex)}
                    className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-600 transition-colors text-left flex items-center gap-2.5 cursor-pointer"
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-neutral-700 shrink-0"
                      style={{ backgroundColor: g.hex }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white truncate">{g.name}</div>
                      <div className="text-[10px] text-neutral-400 truncate">{g.contrastRating}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Production Feasibility Assessment */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Detail Complexity Score</span>
                <span className="font-mono text-white font-semibold">
                  {analysis.printFeasibility.complexityScore} / 10
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Embroidery Ready</span>
                <span
                  className={`font-semibold flex items-center gap-1 ${
                    analysis.printFeasibility.embroideryReady ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {analysis.printFeasibility.embroideryReady ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" /> High Detail
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" /> Simplify for stitches
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-neutral-400 pt-2 border-t border-neutral-800">
                {analysis.printFeasibility.notes}
              </p>
            </div>

            {/* AI Merchandise Concepts */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Merchandise Campaign Angles</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {analysis.merchConcepts.map((concept, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                    <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                      {concept.productType}
                    </div>
                    <div className="text-xs font-bold text-white mt-1">{concept.title}</div>
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-3">
                      {concept.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer"
          >
            Close Assessment
          </button>
        </div>
      </div>
    </div>
  );
};
