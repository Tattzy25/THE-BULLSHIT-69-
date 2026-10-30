import { LogoAsset } from '../types/merch';

// Scalable, crisp SVG data URLs for instant brand testing
const APEX_ATHLETIC_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="apexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
  </defs>
  <!-- Outer Shield Badge -->
  <polygon points="200,30 360,95 340,290 200,375 60,290 40,95" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linejoin="round"/>
  <polygon points="200,48 342,107 325,278 200,355 75,278 58,107" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="6 6"/>
  <!-- Mountain Apex Glyph -->
  <polygon points="200,95 285,245 235,245 200,180 165,245 115,245" fill="#FFFFFF"/>
  <polygon points="200,120 255,220 230,220 200,170 170,220 145,220" fill="#0F172A"/>
  <!-- Ribbon banner -->
  <rect x="70" y="270" width="260" height="42" rx="4" fill="#FFFFFF"/>
  <text x="200" y="299" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="22" letter-spacing="4" fill="#0F172A" text-anchor="middle">APEX CLUB</text>
  <!-- Year -->
  <text x="200" y="340" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="13" letter-spacing="3" fill="#FFFFFF" text-anchor="middle">EST. 1994 · ATHLETICS</text>
</svg>
`)}`;

const KOMOREBI_COFFEE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <!-- Sunburst ring -->
  <circle cx="200" cy="200" r="170" fill="none" stroke="#F59E0B" stroke-width="5" stroke-dasharray="14 10"/>
  <circle cx="200" cy="200" r="145" fill="#18181B" stroke="#F59E0B" stroke-width="3"/>
  <!-- Japanese sun disk -->
  <circle cx="200" cy="155" r="50" fill="#EF4444"/>
  <!-- Steam rays -->
  <path d="M 175,115 Q 165,90 180,65" fill="none" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>
  <path d="M 200,110 Q 215,85 200,60" fill="none" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>
  <path d="M 225,115 Q 235,90 220,65" fill="none" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>
  <!-- Coffee Bean & Leaves -->
  <path d="M 160,205 C 160,185 240,185 240,205 C 240,230 160,230 160,205 Z" fill="#F59E0B"/>
  <path d="M 180,195 Q 200,210 220,195" fill="none" stroke="#18181B" stroke-width="4"/>
  <!-- Typography -->
  <text x="200" y="270" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="21" letter-spacing="6" fill="#F4F4F5" text-anchor="middle">KOMOREBI</text>
  <text x="200" y="295" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="600" font-size="12" letter-spacing="4" fill="#F59E0B" text-anchor="middle">SPECIALTY ROASTERS</text>
  <text x="200" y="318" font-family="'JetBrains Mono', monospace" font-size="10" letter-spacing="2" fill="#A1A1AA" text-anchor="middle">TOKYO · KYOTO</text>
</svg>
`)}`;

const CYBERWAVE_AUDIO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06B6D4"/>
      <stop offset="50%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#EC4899"/>
    </linearGradient>
  </defs>
  <!-- Cassette / Synth grid box -->
  <rect x="50" y="80" width="300" height="200" rx="18" fill="#090D16" stroke="url(#neonGlow)" stroke-width="6"/>
  <!-- Reel Windows -->
  <circle cx="130" cy="170" r="38" fill="none" stroke="#06B6D4" stroke-width="5"/>
  <circle cx="130" cy="170" r="16" fill="#EC4899"/>
  <circle cx="270" cy="170" r="38" fill="none" stroke="#EC4899" stroke-width="5"/>
  <circle cx="270" cy="170" r="16" fill="#06B6D4"/>
  <!-- Tape tape bridge -->
  <path d="M 130,208 L 270,208" stroke="url(#neonGlow)" stroke-width="5"/>
  <!-- Soundwave equalizer -->
  <line x1="175" y1="140" x2="175" y2="190" stroke="#3B82F6" stroke-width="4" stroke-linecap="round"/>
  <line x1="187" y1="125" x2="187" y2="195" stroke="#3B82F6" stroke-width="4" stroke-linecap="round"/>
  <line x1="200" y1="110" x2="200" y2="200" stroke="#EC4899" stroke-width="4" stroke-linecap="round"/>
  <line x1="213" y1="130" x2="213" y2="195" stroke="#06B6D4" stroke-width="4" stroke-linecap="round"/>
  <line x1="225" y1="145" x2="225" y2="190" stroke="#06B6D4" stroke-width="4" stroke-linecap="round"/>
  <!-- Lower brand text -->
  <text x="200" y="325" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="28" letter-spacing="8" fill="#FFFFFF" text-anchor="middle">CYBERWAVE</text>
  <text x="200" y="355" font-family="'JetBrains Mono', monospace" font-size="12" letter-spacing="4" fill="#06B6D4" text-anchor="middle">HIGH FIDELITY AUDIO</text>
</svg>
`)}`;

const SOLSTICE_BOTANICAL_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <!-- Minimalist fine-line botanical emblem -->
  <circle cx="200" cy="200" r="165" fill="none" stroke="#10B981" stroke-width="2"/>
  <circle cx="200" cy="200" r="156" fill="none" stroke="#10B981" stroke-width="1" stroke-dasharray="4 6"/>
  
  <!-- Symmetrical botanical branch -->
  <path d="M 200,80 C 200,160 200,240 200,280" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round"/>
  <!-- Leaf pairs -->
  <path d="M 200,110 C 160,100 150,130 200,140" fill="#10B981" opacity="0.8"/>
  <path d="M 200,110 C 240,100 250,130 200,140" fill="#10B981" opacity="0.8"/>
  <path d="M 200,160 C 150,150 140,185 200,195" fill="#10B981" opacity="0.8"/>
  <path d="M 200,160 C 250,150 260,185 200,195" fill="#10B981" opacity="0.8"/>
  <path d="M 200,215 C 165,210 155,235 200,245" fill="#10B981" opacity="0.8"/>
  <path d="M 200,215 C 235,210 245,235 200,245" fill="#10B981" opacity="0.8"/>

  <!-- Serif brand wordmark -->
  <text x="200" y="325" font-family="'Plus Jakarta Sans', Georgia, serif" font-weight="700" font-size="20" letter-spacing="6" fill="#F4F4F5" text-anchor="middle">SOLSTICE</text>
  <text x="200" y="348" font-family="'JetBrains Mono', monospace" font-size="10" letter-spacing="4" fill="#34D399" text-anchor="middle">ORGANIC BOTANICALS</text>
</svg>
`)}`;

const AURA_MONOGRAM_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <!-- Minimalist High-Fashion Luxury Monogram -->
  <circle cx="200" cy="200" r="170" fill="none" stroke="#E2E8F0" stroke-width="3"/>
  <!-- Overlapping Geometric Letters A & M -->
  <path d="M 140,260 L 200,110 L 260,260" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="square"/>
  <line x1="162" y1="210" x2="238" y2="210" stroke="#FFFFFF" stroke-width="10"/>
  <circle cx="200" cy="180" r="8" fill="#F59E0B"/>
  <!-- Clean Luxury Label -->
  <text x="200" y="315" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="26" letter-spacing="10" fill="#FFFFFF" text-anchor="middle">AURA</text>
  <text x="200" y="342" font-family="'JetBrains Mono', monospace" font-weight="500" font-size="11" letter-spacing="5" fill="#94A3B8" text-anchor="middle">ATELIER · PARIS</text>
</svg>
`)}`;

export const SAMPLE_LOGOS: LogoAsset[] = [
  {
    id: 'sample-apex',
    name: 'Apex Athletic Club',
    dataUrl: APEX_ATHLETIC_SVG,
    width: 400,
    height: 400,
    aspectRatio: 1,
    fileType: 'image/svg+xml',
    isSample: true,
  },
  {
    id: 'sample-komorebi',
    name: 'Komorebi Coffee',
    dataUrl: KOMOREBI_COFFEE_SVG,
    width: 400,
    height: 400,
    aspectRatio: 1,
    fileType: 'image/svg+xml',
    isSample: true,
  },
  {
    id: 'sample-cyberwave',
    name: 'CyberWave Audio',
    dataUrl: CYBERWAVE_AUDIO_SVG,
    width: 400,
    height: 400,
    aspectRatio: 1,
    fileType: 'image/svg+xml',
    isSample: true,
  },
  {
    id: 'sample-solstice',
    name: 'Solstice Botanicals',
    dataUrl: SOLSTICE_BOTANICAL_SVG,
    width: 400,
    height: 400,
    aspectRatio: 1,
    fileType: 'image/svg+xml',
    isSample: true,
  },
  {
    id: 'sample-aura',
    name: 'Aura Atelier',
    dataUrl: AURA_MONOGRAM_SVG,
    width: 400,
    height: 400,
    aspectRatio: 1,
    fileType: 'image/svg+xml',
    isSample: true,
  },
];
