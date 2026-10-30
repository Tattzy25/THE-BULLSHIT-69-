import React from 'react';
import { Product, ProductCategory, GarmentColor } from '../types/merch';
import { PRODUCTS } from '../data/products';
import { Shirt, Coffee, Compass, ShoppingBag, BookOpen, RotateCcw } from 'lucide-react';

interface ProductSelectorProps {
  selectedProduct: Product;
  onSelectProduct: (product: Product) => void;
  selectedColor: GarmentColor;
  onSelectColor: (color: GarmentColor) => void;
  activeViewIndex: number;
  onSelectView: (index: number) => void;
}

const CATEGORY_ICONS: Record<ProductCategory, React.ReactNode> = {
  Apparel: <Shirt className="w-3.5 h-3.5" />,
  Drinkware: <Coffee className="w-3.5 h-3.5" />,
  Headwear: <Compass className="w-3.5 h-3.5" />,
  Bags: <ShoppingBag className="w-3.5 h-3.5" />,
  Stationery: <BookOpen className="w-3.5 h-3.5" />,
};

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  selectedProduct,
  onSelectProduct,
  selectedColor,
  onSelectColor,
  activeViewIndex,
  onSelectView,
}) => {
  const [activeCategory, setActiveCategory] = React.useState<ProductCategory>('Apparel');

  const categories: ProductCategory[] = ['Apparel', 'Drinkware', 'Headwear', 'Bags', 'Stationery'];
  const filteredProducts = PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-4">
      {/* Category Segmented Control Tabs */}
      <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              const firstInCat = PRODUCTS.find((p) => p.category === cat);
              if (firstInCat && firstInCat.id !== selectedProduct.id) {
                onSelectProduct(firstInCat);
              }
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeCategory === cat
                ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {CATEGORY_ICONS[cat]}
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Product Cards Row */}
      <div className="grid grid-cols-2 gap-2">
        {filteredProducts.map((p) => {
          const isSelected = p.id === selectedProduct.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectProduct(p)}
              className={`p-3 text-left rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-neutral-800/80 border-neutral-600 ring-1 ring-neutral-500/50'
                  : 'bg-neutral-900/40 border-neutral-800/80 hover:bg-neutral-800/40 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                <div className="text-[11px] text-neutral-400 line-clamp-1">{p.subtitle}</div>
              </div>
              <div className="mt-2 text-[10px] font-mono text-neutral-500 truncate">
                {p.colors.length} colorways
              </div>
            </button>
          );
        })}
      </div>

      {/* View Switcher (if product has multiple views e.g. Front & Back) */}
      {selectedProduct.views.length > 1 && (
        <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60">
          <span className="text-[11px] text-neutral-400 font-medium">Perspective View</span>
          <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
            {selectedProduct.views.map((v, idx) => (
              <button
                key={v.id}
                onClick={() => onSelectView(idx)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                  activeViewIndex === idx
                    ? 'bg-white text-neutral-950 font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Garment Color Swatches */}
      <div className="pt-2 border-t border-neutral-800/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-neutral-400 font-medium">Garment Color</span>
          <span className="text-[11px] font-mono text-neutral-300">
            {selectedColor.name} <span className="text-neutral-500">({selectedColor.pantoneApprox || selectedColor.hex})</span>
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selectedProduct.colors.map((c) => {
            const isColorActive = c.id === selectedColor.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectColor(c)}
                title={`${c.name} (${c.pantoneApprox || c.hex})`}
                className={`w-7 h-7 rounded-full border transition-all cursor-pointer relative flex items-center justify-center ${
                  isColorActive
                    ? 'border-white scale-110 ring-2 ring-neutral-400/40 ring-offset-2 ring-offset-neutral-950'
                    : 'border-neutral-700/80 hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {isColorActive && (
                  <div
                    className={`w-2 h-2 rounded-full ${
                      c.isDark ? 'bg-white' : 'bg-neutral-900'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
