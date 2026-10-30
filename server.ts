import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware for large payload handling (logos and images in base64)
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Server-side Gemini client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Analyze logo artwork for print feasibility, Pantone matching,
 * and garment recommendations using gemini-3.8-flash.
 */
app.post('/api/ai/analyze-artwork', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/png' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Artwork image is required.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `Analyze this brand logo/graphic artwork for commercial merchandise manufacturing.
Evaluate:
1. Dominant colors in the logo, providing hex code, color name, and the closest Pantone Matching System (PMS) coated code (e.g., PANTONE 186 C).
2. The recommended print methods ranked (Screen Print, Direct-to-Garment/DTG, Embroidery, Foil Stamping, Laser Engraving) with rationale.
3. Optimal garment background colors (e.g. Heather Gray, Washed Black, Vintage Cream) and contrast score (0-100).
4. Estimated print complexity score (1-10) and minimum line weight/detail assessment for screen printing and embroidery.
5. Print resolution quality estimate and recommended maximum print dimensions in inches.
6. Three catchy marketing merchandise product copy ideas (title & 1-sentence vibe).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            colors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  hex: { type: Type.STRING },
                  name: { type: Type.STRING },
                  pantone: { type: Type.STRING },
                  coveragePercent: { type: Type.NUMBER },
                },
                required: ['hex', 'name', 'pantone'],
              },
            },
            recommendedTechniques: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  suitabilityScore: { type: Type.NUMBER },
                  reason: { type: Type.STRING },
                  recommendedMeshOrStitch: { type: Type.STRING },
                },
                required: ['name', 'suitabilityScore', 'reason'],
              },
            },
            bestGarmentColors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  hex: { type: Type.STRING },
                  contrastRating: { type: Type.STRING },
                },
                required: ['name', 'hex', 'contrastRating'],
              },
            },
            printFeasibility: {
              type: Type.OBJECT,
              properties: {
                complexityScore: { type: Type.NUMBER },
                embroideryReady: { type: Type.BOOLEAN },
                maxRecommendedWidthInches: { type: Type.NUMBER },
                notes: { type: Type.STRING },
              },
              required: ['complexityScore', 'embroideryReady', 'maxRecommendedWidthInches', 'notes'],
            },
            merchConcepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productType: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['productType', 'title', 'description'],
              },
            },
          },
          required: [
            'colors',
            'recommendedTechniques',
            'bestGarmentColors',
            'printFeasibility',
            'merchConcepts',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, analysis: parsed });
  } catch (error: any) {
    console.error('Error analyzing artwork:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze artwork with Gemini.',
    });
  }
});

/**
 * Generate AI Contextual Product Shots using gemini-nano-banana-2.1 or gemini-3.1-flash-lite-image
 * Also supports text-prompt image generation and image editing.
 */
app.post('/api/ai/generate-mockup', async (req, res) => {
  try {
    const {
      prompt,
      imageBase64,
      mimeType = 'image/png',
      aspectRatio = '1:1',
      modelPreference = 'gemini-nano-banana-2.1',
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'A descriptive prompt is required.' });
    }

    const parts: any[] = [];

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType,
        },
      });
    }

    parts.push({
      text: prompt,
    });

    // Try selected model, with graceful fallback
    const modelsToTry = [
      modelPreference,
      'gemini-nano-banana-2.1',
      'gemini-3.1-flash-lite-image',
    ];

    let lastError: any = null;
    let imageUrl: string | null = null;
    let textFeedback = '';

    for (const model of [...new Set(modelsToTry)]) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
            },
          },
        });

        const returnedParts = response.candidates?.[0]?.content?.parts ?? [];
        for (const part of returnedParts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType ?? 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          } else if (part.text) {
            textFeedback += part.text + ' ';
          }
        }

        if (imageUrl) {
          return res.json({
            success: true,
            imageUrl,
            modelUsed: model,
            textFeedback: textFeedback.trim(),
          });
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed:`, err?.message);
        // Continue to next model if available
      }
    }

    // If image generation was not available due to quota/credentials, provide rich descriptive advice
    return res.status(lastError?.status || 500).json({
      error:
        lastError?.message ||
        'Unable to synthesize image. You can use our real-time interactive studio for instant high-DPI rendering!',
      details: lastError?.message,
    });
  } catch (error: any) {
    console.error('Error generating mockup:', error);
    return res.status(500).json({
      error: error?.message || 'Server failed while processing AI image generation.',
    });
  }
});

// Vite middleware in dev or static files in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`MerchCraft Studio server running on port ${port}`);
});
