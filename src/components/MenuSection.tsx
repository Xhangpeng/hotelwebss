import React, { useState, useEffect } from 'react';
import {
  Plus,
  Flame,
  Star,
  Clock,
  Check,
  Search,
  Sparkles,
  Utensils,
  Wine,
  Sun,
  Coffee,
  Info
} from 'lucide-react';
import {
  MENU_ITEMS,
  ALL_DAY_CATEGORIES,
  LUNCH_CATEGORIES,
  BAR_CATEGORIES
} from '../data/menuData';
import { MenuItem, MenuSectionType, SpiceLevel, BookingType, CartItem } from '../types/restaurant';

interface Props {
  activeMenuSection: MenuSectionType;
  onChangeMenuSection: (section: MenuSectionType) => void;
  onAddToCart: (item: MenuItem, portion: 'full' | 'half', spiceLevel: SpiceLevel) => void;
  onOpenItemModal: (item: MenuItem) => void;
  bookingType?: BookingType;
  onChangeBookingType?: (type: BookingType) => void;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  cartItems?: CartItem[];
  onUpdateQuantity?: (cartItemId: string, qty: number) => void;
  onRemoveItem?: (cartItemId: string) => void;
}

export const MenuSection: React.FC<Props> = ({
  activeMenuSection,
  onChangeMenuSection,
  onAddToCart,
  onOpenItemModal,
  selectedCategory: propCategory,
  onSelectCategory: propOnSelectCategory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg' | 'jain'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItemIds, setAddedItemIds] = useState<{ [id: string]: boolean }>({});
  const [animatingParticles, setAnimatingParticles] = useState<{ [id: string]: number }>({});

  // Reset category filter when sub menu changes
  useEffect(() => {
    setSelectedCategory('all');
  }, [activeMenuSection]);

  const currentCategories =
    activeMenuSection === 'lunch'
      ? LUNCH_CATEGORIES
      : activeMenuSection === 'bar'
      ? BAR_CATEGORIES
      : ALL_DAY_CATEGORIES;

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesSection = item.menuSection === activeMenuSection;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesDietary =
      dietaryFilter === 'all' ||
      item.dietary === dietaryFilter ||
      (dietaryFilter === 'jain' && (item.dietary === 'jain' || item.name.toLowerCase().includes('jain')));
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.hindiName && item.hindiName.includes(searchQuery));

    return matchesSection && matchesCategory && matchesDietary && matchesSearch;
  });

  const handleQuickAdd = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(item, 'full', item.spiceLevel);

    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setAnimatingParticles((prev) => ({ ...prev, [item.id]: Date.now() }));

    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1200);

    setTimeout(() => {
      setAnimatingParticles((prev) => {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      });
    }, 900);
  };

  return (
    <section id="menu" className="py-16 md:py-24 max-w-7xl mx-auto px-6 scroll-mt-20">
      {/* Section Header with 3 Sub-Menu Tabs */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto pb-8">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-700 font-semibold font-sans-body">
          <Utensils className="w-3.5 h-3.5 text-amber-600" />
          <span>Curated Indian Bistro Menus</span>
          <span aria-hidden="true">·</span>
          <span>Connaught Place</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-serif-display font-bold text-stone-900 tracking-tight">
          The Shankar Dining Spread
        </h2>

        <p className="text-sm text-stone-600 leading-relaxed font-sans-body">
          Select between our traditional <strong>All Day Menu</strong>, executive <strong>Lunch Specials & Thalis</strong>, and our botanical <strong>Bar & Spirits Menu</strong>.
        </p>

        {/* 3 Sub Menus Navigator Pills */}
        <div className="flex items-center p-1.5 bg-stone-200/80 rounded-2xl border border-stone-300/80 shadow-inner mt-4 w-full sm:w-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => onChangeMenuSection('all_day')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeMenuSection === 'all_day'
                ? 'bg-amber-900 text-white shadow-md'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-300/60'
            }`}
          >
            <Coffee className="w-4 h-4 text-amber-300" />
            <span>All Day Menu</span>
          </button>

          <button
            onClick={() => onChangeMenuSection('lunch')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeMenuSection === 'lunch'
                ? 'bg-amber-900 text-white shadow-md'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-300/60'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-300" />
            <span>Lunch Specials & Thalis</span>
          </button>

          <button
            onClick={() => onChangeMenuSection('bar')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeMenuSection === 'bar'
                ? 'bg-amber-900 text-white shadow-md'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-300/60'
            }`}
          >
            <Wine className="w-4 h-4 text-amber-300" />
            <span>Bar Menu & Spirits</span>
          </button>
        </div>
      </div>

      {/* Sub-menu Context Strip */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            {activeMenuSection === 'all_day' &&
              'All Day Menu served continuously from 12:00 PM to 11:30 PM. Prepared fresh in clay tandoors.'}
            {activeMenuSection === 'lunch' &&
              'Lunch Specials & Royal Thalis served daily 12:00 PM – 4:00 PM. Includes unlimited rice & naan refills for dine-in.'}
            {activeMenuSection === 'bar' &&
              'Artisanal mixology, Indian craft beers & Nashik wines. Cocktails served with house-smoked botanicals.'}
          </span>
        </div>

        {/* Search bar inside menu */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search dish or ingredient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-800 text-stone-900 font-sans-body"
          />
        </div>
      </div>

      {/* Filter Toolbar: Categories & Dietary */}
      <div className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        {/* Dynamic Category Segmented Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {currentCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-amber-300 shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Dietary Toggle */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg shrink-0">
          <button
            onClick={() => setDietaryFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              dietaryFilter === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setDietaryFilter('veg')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              dietaryFilter === 'veg'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            <span>Pure Veg</span>
          </button>
          <button
            onClick={() => setDietaryFilter('non-veg')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              dietaryFilter === 'non-veg'
                ? 'bg-white text-rose-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
            <span>Non-Veg</span>
          </button>
        </div>
      </div>

      {/* Grid of Food / Beverage Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 p-8 space-y-3 mt-6">
          <p className="text-sm font-medium text-stone-800">No dishes found in this category.</p>
          <p className="text-xs text-stone-500">
            Try switching to another tab or clearing your search filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setDietaryFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-6">
          {filteredItems.map((item) => {
            const isJustAdded = !!addedItemIds[item.id];
            const hasParticle = !!animatingParticles[item.id];

            return (
              <div
                key={item.id}
                className="group relative flex flex-col bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Product Image Container */}
                <div
                  className="relative h-56 sm:h-64 bg-stone-100 overflow-hidden cursor-pointer"
                  onClick={() => onOpenItemModal(item)}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                  {/* Dietary marker in top corner */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 shadow-xs">
                    <span
                      className={`w-2.5 h-2.5 rounded-full border border-current ${
                        item.dietary === 'veg'
                          ? 'text-emerald-600 bg-emerald-500'
                          : item.dietary === 'vegan'
                          ? 'text-teal-600 bg-teal-500'
                          : 'text-rose-600 bg-rose-500'
                      }`}
                    />
                    <span className="capitalize text-stone-800 text-[10px] tracking-wide">
                      {item.dietary}
                    </span>
                  </div>

                  {/* Special Badges: Chef Special / Alcohol ABV */}
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                    {item.isChefSpecial && (
                      <span className="bg-stone-950/85 text-amber-300 px-2 py-0.5 rounded text-[10px] tracking-wider uppercase font-medium backdrop-blur-xs">
                        Chef Special
                      </span>
                    )}
                    {item.alcoholPercentage && (
                      <span className="bg-amber-950/90 text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] tracking-wider font-mono font-bold backdrop-blur-xs">
                        {item.alcoholPercentage}
                      </span>
                    )}
                  </div>

                  {/* Hindi Title & Rating Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    {item.hindiName && (
                      <span className="text-xs text-stone-200 font-sans-body drop-shadow-sm">
                        {item.hindiName}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-xs font-semibold bg-stone-900/80 px-2 py-0.5 rounded backdrop-blur-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="tabular-nums">{item.rating}</span>
                      <span className="text-stone-400 text-[10px]">({item.reviewsCount})</span>
                    </div>
                  </div>
                </div>

                {/* Details Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    {/* Unboxed clean metadata */}
                    <div className="flex items-center gap-2 text-xs text-stone-500 font-sans-body flex-wrap">
                      <span className="capitalize">{item.category.replace(/_/g, ' ')}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span className="tabular-nums">{item.prepTimeMinutes} min</span>
                      </span>

                      {item.volumeOrServing && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-stone-500">{item.volumeOrServing}</span>
                        </>
                      )}

                      {item.spiceLevel > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-0.5 text-amber-800">
                            <Flame className="w-3 h-3 text-amber-700" />
                            <span>
                              {item.spiceLevel === 1 ? 'Mild' : item.spiceLevel === 2 ? 'Medium' : 'Desi Hot'}
                            </span>
                          </span>
                        </>
                      )}
                    </div>

                    <h3
                      onClick={() => onOpenItemModal(item)}
                      className="text-lg font-serif-display font-semibold text-stone-900 hover:text-amber-900 transition-colors cursor-pointer leading-snug"
                    >
                      {item.name}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-sans-body">
                      {item.description}
                    </p>
                  </div>

                  {/* Price & Actions Baseline */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between relative">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold font-mono text-stone-900 tabular-nums">
                          ₹{item.price}
                        </span>
                        {item.halfPrice && (
                          <span className="text-[11px] text-stone-500 font-mono">
                            / Half: ₹{item.halfPrice}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 block font-sans-body">Taxes incl.</span>
                    </div>

                    <div className="flex items-center gap-2 relative">
                      <button
                        onClick={() => onOpenItemModal(item)}
                        className="px-2.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors font-medium cursor-pointer"
                      >
                        Customize
                      </button>

                      {/* Animated Quick Add Button */}
                      <button
                        onClick={(e) => handleQuickAdd(item, e)}
                        disabled={isJustAdded}
                        className={`relative px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                          isJustAdded
                            ? 'bg-emerald-600 text-white scale-105 shadow-md'
                            : 'bg-amber-900 hover:bg-amber-800 text-white shadow-xs active:scale-95'
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 animate-bounce" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>

                      {/* Floating Particle Upward Animation Badge */}
                      {hasParticle && (
                        <div className="absolute -top-7 right-4 pointer-events-none animate-float-fade flex items-center gap-1 bg-amber-400 text-stone-950 font-bold text-xs px-2 py-0.5 rounded-full shadow-md z-30">
                          <Sparkles className="w-3 h-3 text-stone-950" />
                          <span>+1 to Bag</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
