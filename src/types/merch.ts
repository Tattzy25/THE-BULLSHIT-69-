export type ProductCategory = 'Apparel' | 'Drinkware' | 'Headwear' | 'Bags' | 'Stationery';

export type PrintTechnique = 
  | 'dtg' 
  | 'screen' 
  | 'embroidery' 
  | 'foil_gold' 
  | 'foil_silver' 
  | 'deboss' 
  | 'laser';

export interface GarmentColor {
  id: string;
  name: string;
  hex: string;
  pantoneApprox?: string;
  isDark: boolean;
}

export interface PrintAreaConfig {
  xPercent: number; // Center X default (0-100)
  yPercent: number; // Center Y default (0-100)
  widthPercent: number; // Default width (0-100)
  heightPercent: number; // Default height (0-100)
  maxPhysicalWidthInches: number;
  maxPhysicalHeightInches: number;
  label: string;
}

export interface ProductView {
  id: string;
  name: string;
  printArea: PrintAreaConfig;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  description: string;
  garmentSpec: string; // e.g. "240 GSM 100% Combed Ringspun Cotton"
  colors: GarmentColor[];
  defaultColorId: string;
  views: ProductView[];
  defaultTechnique: PrintTechnique;
  supportedTechniques: PrintTechnique[];
  presets: {
    name: string;
    xPercent: number;
    yPercent: number;
    scalePercent: number;
  }[];
}

export interface PrintPlacement {
  xPercent: number; // 0 to 100 relative to print area
  yPercent: number; // 0 to 100 relative to print area
  scalePercent: number; // 10 to 150
  rotationDeg: number; // -180 to 180
  opacity: number; // 0.1 to 1.0
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay';
  technique: PrintTechnique;
  invert: boolean;
  monochromeColor: string | null; // null for original colors
  distressLevel: number; // 0 to 100 (vintage ink crackle)
  embroideryStitchDensity: number; // 1 to 5
}

export interface LogoAsset {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  fileType: string;
  isSample?: boolean;
}

export interface PantoneColor {
  hex: string;
  name: string;
  pantone: string;
  coveragePercent?: number;
}

export interface ArtworkAnalysis {
  colors: PantoneColor[];
  recommendedTechniques: {
    name: string;
    suitabilityScore: number;
    reason: string;
    recommendedMeshOrStitch?: string;
  }[];
  bestGarmentColors: {
    name: string;
    hex: string;
    contrastRating: string;
  }[];
  printFeasibility: {
    complexityScore: number;
    embroideryReady: boolean;
    maxRecommendedWidthInches: number;
    notes: string;
  };
  merchConcepts: {
    productType: string;
    title: string;
    description: string;
  }[];
}

export interface AiGeneratedMockup {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
  modelUsed?: string;
}
