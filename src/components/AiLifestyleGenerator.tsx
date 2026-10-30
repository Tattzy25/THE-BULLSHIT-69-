import React, { useState } from 'react';
import { Product, LogoAsset, GarmentColor, AiGeneratedMockup } from '../types/merch';
import { Wand2, Sparkles, Download, RefreshCw, Send, AlertCircle, Layers } from 'lucide-react';
import { downloadDataUrl } from '../utils/exportUtils';

interface AiLifestyleGeneratorProps {
  product: Product;
  color: GarmentColor;
  logo: LogoAsset;
  onClose?: () => void;
}

export const AiLifestyleGenerator: React.FC<AiLifestyleGeneratorProps> = ({
  product,
  color,
  logo,
  onClose,
}) => {
  const [prompt, setPrompt] = useState(
    `High-end commercial fashion editorial photograph of a model wearing this ${color.name.toLowerCase()} ${product.name.toLowerCase()} featuring this exact brand logo printed crisply on the chest, natural daylight in a minimalist architectural studio, 8k resolution.`
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedShots, setGeneratedShots] = useState<AiGeneratedMockup[]>([]);
  const [selectedShot, setSelectedShot] = useState<AiGeneratedMockup | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Quick preset prompt chips tailored to current product
  const PRESET_PROMPTS = [
    `Editorial lookbook shot of a model wearing this ${color.name} ${product.name} in a brutalist concrete gallery, directional soft sunlight.`,
    `Minimalist studio product flat lay of this ${color.name} ${product.name} on a raw travertine stone slab, with sunglasses and keys nearby.`,
    `Urban streetwear editorial in Tokyo at dusk with neon reflections, model wearing this ${product.name} with this brand logo clearly visible.`,
    `Clean commercial e-commerce studio shot of this ${product.name} on a pure neutral white backdrop, soft diffused commercial lighting.`,
  ];

  const handleGenerate = async (customPrompt?: string) => {
    const promptToUse = customPrompt || prompt;
    if (!promptToUse.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-mockup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          imageBase64: logo.dataUrl,
          mimeType: logo.fileType,
          aspectRatio: '1:1',
          modelPreference: 'gemini-nano-banana-2.1',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to synthesize product mockup.');
      }

      if (data.imageUrl) {
        const newMockup: AiGeneratedMockup = {
          id: `ai-${Date.now()}`,
          imageUrl: data.imageUrl,
          prompt: promptToUse,
          timestamp: Date.now(),
          modelUsed: data.modelUsed || 'gemini-nano-banana-2.1',
        };
        setGeneratedShots((prev) => [newMockup, ...prev]);
        setSelectedShot(newMockup);
      }
    } catch (err: any) {
      console.error('Mockup generation error:', err);
      setError(
        err.message || 'Unable to generate AI mockup. Check your API key or network connection.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditShot = async () => {
    if (!selectedShot || !editPrompt.trim()) return;
    setIsEditing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-mockup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Edit this existing product photo: ${editPrompt}. Maintain the item structure and brand graphic.`,
          imageBase64: selectedShot.imageUrl,
          mimeType: 'image/png',
          aspectRatio: '1:1',
          modelPreference: 'gemini-nano-banana-2.1',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply image edit.');
      }

      if (data.imageUrl) {
        const editedMockup: AiGeneratedMockup = {
          id: `ai-edit-${Date.now()}`,
          imageUrl: data.imageUrl,
          prompt: editPrompt,
          timestamp: Date.now(),
          modelUsed: data.modelUsed || 'gemini-nano-banana-2.1',
        };
        setGeneratedShots((prev) => [editedMockup, ...prev]);
        setSelectedShot(editedMockup);
        setEditPrompt('');
      }
    } catch (err: any) {
      console.error('Image edit error:', err);
      setError(err.message || 'Failed to edit image.');
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/40 via-neutral-900 to-neutral-900 border border-sky-500/20">
        <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Wand2 className="w-4 h-4" />
          <span>AI Photoshoot Generator · gemini-nano-banana-2.1</span>
        </div>
        <p className="text-xs text-neutral-300">
          Synthesize photorealistic on-model and editorial lifestyle product shots placing "{logo.name}" in bespoke environments.
        </p>
      </div>

      {/* Prompt Composer Box */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-neutral-200 block">
          Creative Scene Prompt
        </label>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Describe the environment, model, lighting, and product context..."
            className="w-full rounded-xl bg-neutral-900 border border-neutral-700/80 p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all resize-none"
          />
          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
                <span>Generate Shot</span>
              </>
            )}
          </button>
        </div>

        {/* Preset Prompt Chips */}
        <div>
          <div className="text-[11px] text-neutral-400 font-medium mb-1.5">
            Suggested photoshoot concepts:
          </div>
          <div className="flex flex-col gap-1.5">
            {PRESET_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(p);
                  handleGenerate(p);
                }}
                disabled={isGenerating}
                className="text-left text-xs p-2 rounded-lg bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer truncate"
              >
                "{p}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <div>
            <div className="font-semibold">AI Synthesis Notice</div>
            <div className="text-[11px] text-red-400/90 mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Active AI Shot Showcase & Prompt Editor */}
      {selectedShot && (
        <div className="space-y-4 pt-4 border-t border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Generated AI Mockup</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                {selectedShot.modelUsed || 'gemini-nano-banana-2.1'}
              </span>
              <button
                onClick={() =>
                  downloadDataUrl(selectedShot.imageUrl, `ai-mockup-${product.id}-${Date.now()}.png`)
                }
                className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          <div className="relative aspect-square max-w-md mx-auto rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl">
            <img
              src={selectedShot.imageUrl}
              alt="Generated mockup"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text-Prompt Image Editing */}
          <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-2">
            <div className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>Prompt-based Image Edit (gemini-nano-banana-2.1)</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="e.g. Add cinematic film grain, or change background to autumn trees..."
                className="flex-1 text-xs rounded-lg bg-neutral-950 border border-neutral-700 px-3 py-1.5 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-400"
              />
              <button
                onClick={handleEditShot}
                disabled={isEditing || !editPrompt.trim()}
                className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-neutral-950 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isEditing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Apply Edit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Gallery Thumbs */}
      {generatedShots.length > 1 && (
        <div>
          <div className="text-xs font-semibold text-neutral-300 mb-2">
            Photoshoot History ({generatedShots.length})
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {generatedShots.map((shot) => (
              <button
                key={shot.id}
                onClick={() => setSelectedShot(shot)}
                className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border transition-all cursor-pointer ${
                  selectedShot?.id === shot.id
                    ? 'border-sky-400 ring-2 ring-sky-400/50'
                    : 'border-neutral-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={shot.imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
