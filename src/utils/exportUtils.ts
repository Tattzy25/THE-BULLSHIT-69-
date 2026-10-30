import { Product, PrintPlacement, LogoAsset, GarmentColor } from '../types/merch';

/**
 * Generates a transparent high-resolution 300 DPI PNG file
 * sized exactly to the physical print dimensions.
 */
export async function generate300DpiPrintFile(
  logo: LogoAsset,
  placement: PrintPlacement,
  product: Product,
  options: {
    includeBleed?: boolean;
    includeCropMarks?: boolean;
    bleedInches?: number;
    dpi?: number;
  } = {}
): Promise<{ dataUrl: string; widthPx: number; heightPx: number; physicalWidthInches: number; physicalHeightInches: number }> {
  const dpi = options.dpi || 300;
  const currentView = product.views[0];
  const maxWInches = currentView.printArea.maxPhysicalWidthInches;
  const maxHInches = currentView.printArea.maxPhysicalHeightInches;

  // Actual physical dimensions based on user scale slider
  const effectiveScale = placement.scalePercent / 100;
  const physicalWidthInches = Number((maxWInches * effectiveScale).toFixed(2));
  const physicalHeightInches = Number(((maxWInches * effectiveScale) / logo.aspectRatio).toFixed(2));

  // 300 DPI pixel dimensions
  const bleedInches = options.includeBleed ? (options.bleedInches || 0.125) : 0;
  const totalWInches = physicalWidthInches + (bleedInches * 2);
  const totalHInches = physicalHeightInches + (bleedInches * 2);

  const canvasWidth = Math.round(totalWInches * dpi);
  const canvasHeight = Math.round(totalHInches * dpi);

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context could not be initialized');
  }

  // Transparent canvas background
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Load logo image into an HTMLImageElement
  const img = await loadImage(logo.dataUrl);

  const drawWidth = Math.round(physicalWidthInches * dpi);
  const drawHeight = Math.round(physicalHeightInches * dpi);
  const drawX = Math.round(bleedInches * dpi);
  const drawY = Math.round(bleedInches * dpi);

  ctx.save();

  // Apply rotation if any
  if (placement.rotationDeg !== 0) {
    const centerX = drawX + drawWidth / 2;
    const centerY = drawY + drawHeight / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((placement.rotationDeg * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }

  // Draw logo
  ctx.globalAlpha = placement.opacity;

  // If invert or monochrome is applied, draw to offscreen canvas
  if (placement.invert || placement.monochromeColor) {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = img.naturalWidth || drawWidth;
    offCanvas.height = img.naturalHeight || drawHeight;
    const offCtx = offCanvas.getContext('2d');
    if (offCtx) {
      offCtx.drawImage(img, 0, 0, offCanvas.width, offCanvas.height);
      const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
      const data = imgData.data;

      if (placement.monochromeColor) {
        const hex = placement.monochromeColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) || 255;
        const g = parseInt(hex.substring(2, 4), 16) || 255;
        const b = parseInt(hex.substring(4, 6), 16) || 255;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 0) {
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
          }
        }
      } else if (placement.invert) {
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 0) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
          }
        }
      }
      offCtx.putImageData(imgData, 0, 0);
      ctx.drawImage(offCanvas, drawX, drawY, drawWidth, drawHeight);
    }
  } else {
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }

  ctx.restore();

  // Draw crop marks if requested
  if (options.includeCropMarks && options.includeBleed) {
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(1, Math.round(dpi / 150));
    const markLength = Math.round(0.25 * dpi);

    const left = drawX;
    const right = drawX + drawWidth;
    const top = drawY;
    const bottom = drawY + drawHeight;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(left, top - markLength);
    ctx.lineTo(left, top);
    ctx.moveTo(left - markLength, top);
    ctx.lineTo(left, top);

    // Top-right
    ctx.moveTo(right, top - markLength);
    ctx.lineTo(right, top);
    ctx.moveTo(right + markLength, top);
    ctx.lineTo(right, top);

    // Bottom-left
    ctx.moveTo(left, bottom + markLength);
    ctx.lineTo(left, bottom);
    ctx.moveTo(left - markLength, bottom);
    ctx.lineTo(left, bottom);

    // Bottom-right
    ctx.moveTo(right, bottom + markLength);
    ctx.lineTo(right, bottom);
    ctx.moveTo(right + markLength, bottom);
    ctx.lineTo(right, bottom);

    ctx.stroke();
    ctx.restore();
  }

  const dataUrl = canvas.toDataURL('image/png');
  return {
    dataUrl,
    widthPx: canvasWidth,
    heightPx: canvasHeight,
    physicalWidthInches,
    physicalHeightInches,
  };
}

/**
 * Downloads a data URL as a file in the browser
 */
export function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Helper to load an image from URL into HTMLImageElement
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

/**
 * Generates an HTML printable Tech Pack Specification Sheet
 */
export function generateTechPackHtml(
  product: Product,
  color: GarmentColor,
  placement: PrintPlacement,
  logo: LogoAsset,
  analysisData?: any
): string {
  const currentView = product.views[0];
  const effectiveScale = placement.scalePercent / 100;
  const physicalWidth = (currentView.printArea.maxPhysicalWidthInches * effectiveScale).toFixed(2);
  const physicalHeight = ((currentView.printArea.maxPhysicalWidthInches * effectiveScale) / logo.aspectRatio).toFixed(2);
  const techniqueNames: Record<string, string> = {
    screen: 'Screen Print (Plastisol / Water-Based)',
    dtg: 'Direct-to-Garment (DTG Digital Print)',
    embroidery: '3D High-Density Embroidery',
    foil_gold: 'Hot Stamped Metallic Gold Foil',
    foil_silver: 'Hot Stamped Metallic Silver Foil',
    deboss: 'Blind Deep Stamp Deboss',
    laser: 'Precision Fiber Laser Engraving',
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tech Pack - ${product.name} Print Specification</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; line-height: 1.5; margin: 0; padding: 20px; font-size: 13px; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
    .title { font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin: 0; color: #0f172a; }
    .subtitle { font-size: 11px; color: #64748b; margin-top: 4px; font-family: monospace; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; background: #fafafa; }
    .card h3 { margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #f1f5f9; }
    .label { color: #64748b; }
    .value { font-weight: 600; color: #0f172a; font-family: monospace; }
    .swatch { display: inline-block; width: 14px; height: 14px; border-radius: 3px; vertical-align: middle; margin-right: 6px; border: 1px solid #cbd5e1; }
    .artwork-preview { text-align: center; padding: 24px; background: ${color.hex}; border-radius: 8px; border: 1px solid #cbd5e1; min-height: 220px; display: flex; align-items: center; justify-content: center; }
    .notes { background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; font-size: 11px; color: #92400e; margin-top: 16px; }
    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">Production Tech Pack</h1>
      <div class="subtitle">PROJECT: MERCHCRAFT-PROD-${Date.now().toString().slice(-6)} · SPEC SHEET</div>
    </div>
    <div style="text-align: right; font-family: monospace; font-size: 11px; color: #64748b;">
      DATE: ${new Date().toLocaleDateString()}
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <h3>Garment & Blank Specifications</h3>
      <div class="row"><span class="label">Item Style:</span><span class="value">${product.name}</span></div>
      <div class="row"><span class="label">Category:</span><span class="value">${product.category}</span></div>
      <div class="row"><span class="label">Garment Weight:</span><span class="value">${product.garmentSpec}</span></div>
      <div class="row">
        <span class="label">Colorway:</span>
        <span class="value"><span class="swatch" style="background:${color.hex}"></span>${color.name} (${color.pantoneApprox || color.hex})</span>
      </div>
      <div class="row"><span class="label">Print Location:</span><span class="value">${currentView.printArea.label}</span></div>
    </div>

    <div class="card">
      <h3>Print Production Specs</h3>
      <div class="row"><span class="label">Print Technique:</span><span class="value">${techniqueNames[placement.technique] || placement.technique}</span></div>
      <div class="row"><span class="label">Artwork Dimensions:</span><span class="value">${physicalWidth}" W × ${physicalHeight}" H</span></div>
      <div class="row"><span class="label">Target Resolution:</span><span class="value">300 DPI High-Definition</span></div>
      <div class="row"><span class="label">Collar Offset:</span><span class="value">${(placement.yPercent * 0.1).toFixed(1)}" down from collar seam</span></div>
      <div class="row"><span class="label">Horizontal Alignment:</span><span class="value">${placement.xPercent === 50 ? 'Centered (1:1)' : placement.xPercent < 50 ? 'Left Pocket Bias' : 'Right Chest Bias'}</span></div>
    </div>
  </div>

  <div class="card">
    <h3>Artwork Master & Production Placement</h3>
    <div class="artwork-preview">
      <img src="${logo.dataUrl}" style="max-height: 180px; max-width: 80%; object-fit: contain; ${placement.invert ? 'filter: invert(1);' : ''}" alt="Artwork Master" />
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-top: 8px;">
      <span>File: ${logo.name}</span>
      <span>Color Model: RGB to CMYK Standard Process</span>
      <span>Bleed: 0.125" / 3mm</span>
    </div>
  </div>

  ${analysisData?.colors?.length ? `
  <div class="card" style="margin-top: 16px;">
    <h3>Identified Pantone Spot Colors</h3>
    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
      ${analysisData.colors.map((c: any) => `
        <div style="display: flex; align-items: center; gap: 8px; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 4px; background: #fff;">
          <span class="swatch" style="background:${c.hex}"></span>
          <div>
            <div style="font-weight: 700; font-size: 11px;">${c.pantone || c.hex}</div>
            <div style="font-size: 9px; color: #64748b;">${c.name}</div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <div class="notes">
    <strong>Factory Quality Control Instructions:</strong> Ensure ink cure temperature reaches 320°F (160°C) for plastisol prints. For embroidery, check backing stabilizer density to prevent fabric puckering around high-density fills.
  </div>

  <div class="footer">
    Generated automatically by MerchCraft AI Studio · Print-ready vector and 300 DPI raster production assets attached.
  </div>
</body>
</html>
`;
}
