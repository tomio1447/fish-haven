import { Link } from "wouter";
import { ArrowLeft, ShoppingBag, Filter, X, Info, ChevronRight } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  FISHING_RODS, 
  FISHING_LINES, 
  HOOKS, 
  TREBLE_HOOKS,
  FLOATS, 
  REELS, 
  SINKERS, 
  ARTIFICIAL_LURES,
  STRINGERS,
  FISHING_TYPES,
  getPowerName,
  getActionName,
  type FishingType,
  type ArtificialLureDepth
} from "@shared/equipment";
import { NATURAL_BAITS } from "@shared/fishData";

import breadImg from '@assets/generated_images/stylized_bread_bait.png';
import wormImg from '@assets/generated_images/stylized_worm_bait.png';
import lureImg from '@assets/generated_images/stylized_lure_bait.png';

import hookSmallImg from '@assets/generated_images/hook_size_12.png';
import hookMedSmallImg from '@assets/generated_images/hook_size_8.png';
import hookMedImg from '@assets/generated_images/hook_size_4.png';
import hookMedLargeImg from '@assets/generated_images/hook_size_1.png';
import hookLargeImg from '@assets/generated_images/hook_size_2_0.png';
import hookXLargeImg from '@assets/generated_images/hook_size_4_0.png';

const HOOK_IMAGES: Record<string, string> = {
  'hook_12': hookSmallImg,
  'hook_8': hookMedSmallImg,
  'hook_4': hookMedImg,
  'hook_1': hookMedLargeImg,
  'hook_2_0': hookLargeImg,
  'hook_4_0': hookXLargeImg,
};

type MainCategory = 'rods' | 'reels' | 'lines' | 'floats' | 'terminal' | 'baits' | 'stringers';
type BaitGroup = 'natural' | 'artificial';
type NaturalBaitSubgroup = 'general' | 'carnivore';
type ArtificialBaitSubgroup = 'surface' | 'midwater' | 'deep';

interface ShopItem {
  id: string;
  name: string;
  brand?: string;
  description: string;
  price: number;
  image?: string;
  icon?: string;
  category: MainCategory;
  fishingType?: FishingType | 'all';
  baitGroup?: BaitGroup;
  baitSubgroup?: NaturalBaitSubgroup | ArtificialBaitSubgroup;
  details?: Record<string, string>;
  specs?: { label: string; value: string }[];
}

const MAIN_CATEGORIES = [
  { id: 'rods' as MainCategory, name: 'Varas', icon: 'rod' },
  { id: 'reels' as MainCategory, name: 'Molinetes', icon: 'reel' },
  { id: 'lines' as MainCategory, name: 'Linhas', icon: 'line' },
  { id: 'floats' as MainCategory, name: 'Boias', icon: 'float' },
  { id: 'terminal' as MainCategory, name: 'Anzóis', icon: 'hook' },
  { id: 'baits' as MainCategory, name: 'Iscas', icon: 'bait' },
  { id: 'stringers' as MainCategory, name: 'Fieiras', icon: 'stringer' },
];

const FISHING_TYPE_FILTERS = [
  { id: 'all' as const, name: 'Todos', color: 'bg-slate-500' },
  { id: 'float' as FishingType, name: 'Pesca de Boia', color: 'bg-red-500' },
  { id: 'baitcasting' as FishingType, name: 'Carretilha', color: 'bg-blue-500' },
  { id: 'bottom' as FishingType, name: 'Pesca de Fundo', color: 'bg-amber-600' },
];

function extractBrandAndName(fullName: string): { brand: string; name: string } {
  if (fullName.includes(' - ')) {
    const [brand, ...rest] = fullName.split(' - ');
    return { brand, name: rest.join(' - ') };
  }
  return { brand: '', name: fullName };
}

function lbToKg(lb: number): string {
  return (lb * 0.453592).toFixed(1);
}

function ftToM(ft: number): string {
  return (ft * 0.3048).toFixed(2);
}

function buildShopItems(): ShopItem[] {
  const items: ShopItem[] = [];

  FISHING_RODS.forEach(rod => {
    const { brand, name } = extractBrandAndName(rod.name);
    items.push({
      id: rod.id,
      name: name,
      brand: brand || 'Genérica',
      description: rod.description,
      price: rod.price,
      category: 'rods',
      fishingType: rod.fishingType,
      details: {
        'Poder': getPowerName(rod.power),
        'Ação': getActionName(rod.action),
        'Comprimento': `${ftToM(rod.lengthFt)}m`,
        'Linha máx.': `${lbToKg(rod.maxLineWeightLb)}kg`
      },
      specs: [
        { label: 'Ação', value: getActionName(rod.action) },
        { label: 'Teste', value: `${lbToKg(rod.maxLineWeightLb)}kg` },
        { label: 'Comp.', value: `${ftToM(rod.lengthFt)}m` }
      ]
    });
  });

  REELS.forEach(reel => {
    const { brand, name } = extractBrandAndName(reel.name);
    items.push({
      id: reel.id,
      name: name,
      brand: brand || 'Genérica',
      description: reel.description,
      price: reel.price,
      category: 'reels',
      fishingType: reel.type === 'baitcasting' ? 'baitcasting' : 'float',
      details: {
        'Tipo': reel.type === 'baitcasting' ? 'Carretilha' : 'Molinete',
        'Relação': reel.gearRatio,
        'Drag máx.': `${lbToKg(reel.maxDragLb)}kg`,
        'Rolamentos': `${reel.ballBearings}BB`
      },
      specs: [
        { label: 'Tipo', value: reel.type === 'baitcasting' ? 'LP' : 'Spin' },
        { label: 'Relação', value: reel.gearRatio },
        { label: 'Drag', value: `${lbToKg(reel.maxDragLb)}kg` }
      ]
    });
  });

  FISHING_LINES.forEach(line => {
    const { brand, name } = extractBrandAndName(line.name);
    items.push({
      id: line.id,
      name: name,
      brand: brand || 'Genérica',
      description: line.description,
      price: line.price,
      category: 'lines',
      fishingType: 'all',
      details: {
        'Tipo': line.type === 'mono' ? 'Monofilamento' : line.type === 'braided' ? 'Multifilamento' : 'Fluorocarbono',
        'Resistência': `${lbToKg(line.testWeightLb)}kg`,
        'Diâmetro': `${line.diameterMm}mm`,
        'Comprimento': `${line.lengthM}m`
      },
      specs: [
        { label: 'Tipo', value: line.type === 'mono' ? 'Mono' : line.type === 'braided' ? 'Multi' : 'Fluoro' },
        { label: 'Teste', value: `${lbToKg(line.testWeightLb)}kg` },
        { label: 'Comp.', value: `${line.lengthM}m` }
      ]
    });
  });

  HOOKS.forEach(hook => {
    const hookImageKey = hook.image || hook.id;
    items.push({
      id: hook.id,
      name: hook.name,
      brand: 'Anzol',
      description: `Anzol tamanho ${hook.size > 0 ? '#' + hook.size : Math.abs(hook.size) + '/0'}. Suporta até ${hook.maxFishWeightKg}kg.`,
      price: hook.price,
      image: HOOK_IMAGES[hookImageKey] || HOOK_IMAGES['hook_4'],
      category: 'terminal',
      fishingType: 'all',
      details: {
        'Tipo': 'Anzol Simples',
        'Tamanho': hook.size > 0 ? `#${hook.size}` : `${Math.abs(hook.size)}/0`,
        'Peso máx.': `${hook.maxFishWeightKg}kg`,
        'Quantidade': `x${hook.quantity}`
      },
      specs: [
        { label: 'Tam.', value: hook.size > 0 ? `#${hook.size}` : `${Math.abs(hook.size)}/0` },
        { label: 'Máx.', value: `${hook.maxFishWeightKg}kg` }
      ]
    });
  });

  TREBLE_HOOKS.forEach(hook => {
    items.push({
      id: hook.id,
      name: hook.name,
      brand: 'Garateia',
      description: `Garateia (anzol triplo) tamanho ${hook.size > 0 ? '#' + hook.size : Math.abs(hook.size) + '/0'}. Ideal para iscas artificiais.`,
      price: hook.price,
      category: 'terminal',
      fishingType: 'baitcasting',
      details: {
        'Tipo': 'Garateia',
        'Tamanho': hook.size > 0 ? `#${hook.size}` : `${Math.abs(hook.size)}/0`,
        'Peso máx.': `${hook.maxFishWeightKg}kg`,
        'Quantidade': `x${hook.quantity}`
      },
      specs: [
        { label: 'Tam.', value: hook.size > 0 ? `#${hook.size}` : `${Math.abs(hook.size)}/0` },
        { label: 'Máx.', value: `${hook.maxFishWeightKg}kg` }
      ]
    });
  });

  FLOATS.forEach(float => {
    items.push({
      id: float.id,
      name: float.name,
      brand: 'Boia',
      description: float.description,
      price: float.price,
      category: 'floats',
      fishingType: 'float',
      details: {
        'Flutuação': `${float.buoyancyG}g`,
        'Sensibilidade': float.sensitivity === 'high' ? 'Alta' : float.sensitivity === 'medium' ? 'Média' : 'Baixa'
      },
      specs: [
        { label: 'Flut.', value: `${float.buoyancyG}g` },
        { label: 'Sens.', value: float.sensitivity === 'high' ? 'Alta' : float.sensitivity === 'medium' ? 'Média' : 'Baixa' }
      ]
    });
  });

  SINKERS.forEach(sinker => {
    items.push({
      id: sinker.id,
      name: sinker.name,
      brand: 'Chumbo',
      description: sinker.description,
      price: sinker.price,
      category: 'terminal',
      fishingType: 'bottom',
      details: {
        'Peso': `${sinker.weightG}g`,
        'Quantidade': `x${sinker.quantity}`
      },
      specs: [
        { label: 'Peso', value: `${sinker.weightG}g` },
        { label: 'Qtd.', value: `x${sinker.quantity}` }
      ]
    });
  });

  NATURAL_BAITS.forEach(bait => {
    const subgroupName = bait.category === 'general' ? 'Geral' : 'Carnívoro';
    items.push({
      id: bait.id,
      name: bait.name,
      brand: subgroupName,
      description: bait.description,
      price: bait.price * 5,
      icon: bait.icon,
      category: 'baits',
      fishingType: 'all',
      baitGroup: 'natural',
      baitSubgroup: bait.category,
      details: { 
        'Tipo': 'Natural', 
        'Categoria': subgroupName,
        'Quantidade': 'x5' 
      },
      specs: [
        { label: 'Cat.', value: subgroupName },
        { label: 'Qtd.', value: 'x5' }
      ]
    });
  });

  ARTIFICIAL_LURES.forEach(lure => {
    const { brand, name } = extractBrandAndName(lure.name);
    const depthName = lure.depth === 'surface' ? 'Superfície' : lure.depth === 'midwater' ? 'Meia Água' : 'Fundo';
    items.push({
      id: lure.id,
      name: name,
      brand: brand || depthName,
      description: lure.description,
      price: lure.price,
      icon: lure.icon,
      category: 'baits',
      fishingType: 'baitcasting',
      baitGroup: 'artificial',
      baitSubgroup: lure.depth,
      details: {
        'Tipo': lure.type.charAt(0).toUpperCase() + lure.type.slice(1),
        'Peso': `${lure.weightG}g`,
        'Tamanho': `${lure.sizeCm}cm`,
        'Profundidade': depthName
      },
      specs: [
        { label: 'Peso', value: `${lure.weightG}g` },
        { label: 'Prof.', value: depthName.substring(0, 4) }
      ]
    });
  });

  STRINGERS.forEach(stringer => {
    items.push({
      id: stringer.id,
      name: stringer.name,
      brand: 'Fieira',
      description: stringer.description,
      price: stringer.price,
      icon: stringer.icon,
      category: 'stringers',
      fishingType: 'all',
      details: {
        'Capacidade': `${stringer.maxCount} peixes`,
        'Peso máx.': `${stringer.maxWeightKg}kg`
      },
      specs: [
        { label: 'Cap.', value: `${stringer.maxCount}` },
        { label: 'Peso', value: `${stringer.maxWeightKg}kg` }
      ]
    });
  });

  return items;
}

const ALL_ITEMS = buildShopItems();

function CategoryIcon({ type, className }: { type: string; className?: string }) {
  const baseClass = cn("w-5 h-5", className);
  switch (type) {
    case 'rod':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={baseClass}>
          <path d="M3 21L21 3M5 19l2-2M8 16l2-2M11 13l2-2M14 10l2-2" />
        </svg>
      );
    case 'reel':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={baseClass}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 4v3M12 17v3M4 12h3M17 12h3" />
        </svg>
      );
    case 'line':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={baseClass}>
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2" />
          <path d="M12 2v20" />
        </svg>
      );
    case 'float':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={baseClass}>
          <ellipse cx="12" cy="8" rx="4" ry="6" />
          <rect x="11" y="14" width="2" height="8" />
        </svg>
      );
    case 'hook':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={baseClass}>
          <path d="M12 2v8" />
          <path d="M12 10c0 0 0 4 4 6c2 1 3 3 3 5c0 2-2 3-4 3s-4-1-4-4" />
          <circle cx="12" cy="2" r="1" fill="currentColor" />
        </svg>
      );
    case 'bait':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={baseClass}>
          <path d="M4 12c2-2 4-1 6 0s4 2 6 0s4-1 6 0" />
          <path d="M4 8c2-2 4-1 6 0s4 2 6 0s4-1 6 0" />
          <path d="M4 16c2-2 4-1 6 0s4 2 6 0s4-1 6 0" />
        </svg>
      );
    case 'stringer':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={baseClass}>
          <path d="M12 2v20" />
          <path d="M8 6c0 1.5 1.8 3 4 3s4-1.5 4-3" />
          <path d="M8 12c0 1.5 1.8 3 4 3s4-1.5 4-3" />
          <path d="M8 18c0 1.5 1.8 3 4 3s4-1.5 4-3" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Shop() {
  const { coins, addCoins, ownedEquipment, addOwnedEquipment } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<MainCategory>('rods');
  const [selectedFishingType, setSelectedFishingType] = useState<FishingType | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [selectedBaitGroup, setSelectedBaitGroup] = useState<BaitGroup | 'all'>('all');
  const [selectedBaitSubgroup, setSelectedBaitSubgroup] = useState<string>('all');

  const filteredItems = ALL_ITEMS.filter(item => {
    if (item.category !== selectedCategory) return false;
    
    if (selectedCategory === 'baits') {
      if (selectedBaitGroup !== 'all' && item.baitGroup !== selectedBaitGroup) return false;
      if (selectedBaitSubgroup !== 'all' && item.baitSubgroup !== selectedBaitSubgroup) return false;
    } else {
      if (selectedFishingType !== 'all' && item.fishingType !== 'all' && item.fishingType !== selectedFishingType) return false;
    }
    return true;
  });

  const getFishingTypeColor = (type: FishingType | 'all' | undefined) => {
    switch (type) {
      case 'float': return 'bg-red-500';
      case 'baitcasting': return 'bg-blue-500';
      case 'bottom': return 'bg-amber-600';
      default: return 'bg-slate-500';
    }
  };

  const getCategoryName = (cat: MainCategory) => {
    return MAIN_CATEGORIES.find(c => c.id === cat)?.name || cat;
  };

  const isOwned = (item: ShopItem) => {
    switch (item.category) {
      case 'rods': return ownedEquipment.rods.includes(item.id);
      case 'reels': return ownedEquipment.reels.includes(item.id);
      case 'lines': return ownedEquipment.lines.includes(item.id);
      case 'floats': return ownedEquipment.floats.includes(item.id);
      case 'terminal': 
        return ownedEquipment.hooks.includes(item.id) || ownedEquipment.sinkers.includes(item.id);
      case 'baits': return ownedEquipment.lures.includes(item.id);
      case 'stringers': return ownedEquipment.stringers.includes(item.id);
      default: return false;
    }
  };

  const handleBuy = (item: ShopItem) => {
    if (coins < item.price || isOwned(item)) return;
    
    addCoins(-item.price);
    
    switch (item.category) {
      case 'rods':
        addOwnedEquipment('rods', item.id);
        break;
      case 'reels':
        addOwnedEquipment('reels', item.id);
        break;
      case 'lines':
        addOwnedEquipment('lines', item.id);
        break;
      case 'floats':
        addOwnedEquipment('floats', item.id);
        break;
      case 'terminal':
        if (item.id.startsWith('hook') || item.id.startsWith('treble')) {
          addOwnedEquipment('hooks', item.id);
        } else {
          addOwnedEquipment('sinkers', item.id);
        }
        break;
      case 'baits':
        addOwnedEquipment('lures', item.id);
        break;
      case 'stringers':
        addOwnedEquipment('stringers', item.id);
        break;
    }
    
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950/90 via-slate-900 to-slate-950 flex flex-col overflow-auto">
      <header className="backdrop-blur-xl bg-black/40 border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-5">
          <Link href="/">
            <motion.button 
              className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl transition-all border border-white/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </Link>
          <div>
            <h1 className="text-2xl text-white font-bold tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-emerald-400" />
              Loja de Equipamentos
            </h1>
            <p className="text-white/50 text-sm">Encontre o equipamento perfeito para sua pescaria</p>
          </div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-5 py-2.5 rounded-xl font-bold text-lg flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <span className="text-lg">🪱</span>
          </div>
          <span data-testid="text-coins" className="tabular-nums">{coins.toLocaleString()}</span>
        </div>
      </header>

      <nav className="backdrop-blur-xl bg-black/20 border-b border-white/10 px-6 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MAIN_CATEGORIES.map(cat => (
            <motion.button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap flex items-center gap-2.5 transition-all border",
                selectedCategory === cat.id 
                  ? "bg-emerald-500/30 text-emerald-300 border-emerald-500/50" 
                  : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-testid={`tab-${cat.id}`}
            >
              <CategoryIcon type={cat.icon} className={selectedCategory === cat.id ? "text-emerald-300" : "text-white/50"} />
              <span>{cat.name}</span>
            </motion.button>
          ))}
        </div>
      </nav>

      <div className="flex flex-1 min-h-0">
        <aside className="w-56 backdrop-blur-xl bg-black/30 border-r border-white/10 p-4 flex flex-col gap-4 sticky top-32 h-fit max-h-[calc(100vh-130px)] overflow-y-auto">
          {selectedCategory === 'baits' ? (
            <>
              <div>
                <div className="text-xs text-white/40 uppercase font-bold mb-3 flex items-center gap-2 tracking-wider">
                  <Filter className="w-3.5 h-3.5" />
                  Tipo de Isca
                </div>
                <div className="space-y-1">
                  <motion.button
                    onClick={() => { setSelectedBaitGroup('all'); setSelectedBaitSubgroup('all'); }}
                    className={cn(
                      "w-full px-3 py-2.5 rounded-lg text-sm text-left flex items-center gap-3 transition-all",
                      selectedBaitGroup === 'all' 
                        ? "bg-white/10 text-white border border-white/20" 
                        : "text-white/50 hover:bg-white/5 hover:text-white/80"
                    )}
                    whileHover={{ x: 2 }}
                    data-testid="filter-bait-all"
                  >
                    <div className="w-3 h-3 rounded-full bg-slate-500" />
                    <span>Todas</span>
                  </motion.button>
                  <motion.button
                    onClick={() => { setSelectedBaitGroup('natural'); setSelectedBaitSubgroup('all'); }}
                    className={cn(
                      "w-full px-3 py-2.5 rounded-lg text-sm text-left flex items-center gap-3 transition-all",
                      selectedBaitGroup === 'natural' 
                        ? "bg-white/10 text-white border border-white/20" 
                        : "text-white/50 hover:bg-white/5 hover:text-white/80"
                    )}
                    whileHover={{ x: 2 }}
                    data-testid="filter-bait-natural"
                  >
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>🪱 Naturais</span>
                  </motion.button>
                  <motion.button
                    onClick={() => { setSelectedBaitGroup('artificial'); setSelectedBaitSubgroup('all'); }}
                    className={cn(
                      "w-full px-3 py-2.5 rounded-lg text-sm text-left flex items-center gap-3 transition-all",
                      selectedBaitGroup === 'artificial' 
                        ? "bg-white/10 text-white border border-white/20" 
                        : "text-white/50 hover:bg-white/5 hover:text-white/80"
                    )}
                    whileHover={{ x: 2 }}
                    data-testid="filter-bait-artificial"
                  >
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span>🎣 Artificiais</span>
                  </motion.button>
                </div>
              </div>

              {selectedBaitGroup === 'natural' && (
                <div className="border-t border-white/10 pt-4">
                  <div className="text-xs text-white/40 uppercase font-bold mb-3 tracking-wider">
                    Categoria
                  </div>
                  <div className="space-y-1">
                    <motion.button
                      onClick={() => setSelectedBaitSubgroup('all')}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg text-sm text-left flex items-center gap-2 transition-all",
                        selectedBaitSubgroup === 'all' 
                          ? "bg-green-500/20 text-green-300 border border-green-500/30" 
                          : "text-white/50 hover:bg-white/5"
                      )}
                      data-testid="filter-natural-all"
                    >
                      <span>Todas</span>
                    </motion.button>
                    <motion.button
                      onClick={() => setSelectedBaitSubgroup('general')}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg text-sm text-left flex items-center gap-2 transition-all",
                        selectedBaitSubgroup === 'general' 
                          ? "bg-green-500/20 text-green-300 border border-green-500/30" 
                          : "text-white/50 hover:bg-white/5"
                      )}
                      data-testid="filter-natural-general"
                    >
                      <span>🍞 Gerais</span>
                    </motion.button>
                    <motion.button
                      onClick={() => setSelectedBaitSubgroup('carnivore')}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg text-sm text-left flex items-center gap-2 transition-all",
                        selectedBaitSubgroup === 'carnivore' 
                          ? "bg-green-500/20 text-green-300 border border-green-500/30" 
                          : "text-white/50 hover:bg-white/5"
                      )}
                      data-testid="filter-natural-carnivore"
                    >
                      <span>🥩 Para Carnívoros</span>
                    </motion.button>
                  </div>
                </div>
              )}

              {selectedBaitGroup === 'artificial' && (
                <div className="border-t border-white/10 pt-4">
                  <div className="text-xs text-white/40 uppercase font-bold mb-3 tracking-wider">
                    Profundidade
                  </div>
                  <div className="space-y-1">
                    <motion.button
                      onClick={() => setSelectedBaitSubgroup('all')}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg text-sm text-left flex items-center gap-2 transition-all",
                        selectedBaitSubgroup === 'all' 
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                          : "text-white/50 hover:bg-white/5"
                      )}
                      data-testid="filter-artificial-all"
                    >
                      <span>Todas</span>
                    </motion.button>
                    <motion.button
                      onClick={() => setSelectedBaitSubgroup('surface')}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg text-sm text-left flex items-center gap-2 transition-all",
                        selectedBaitSubgroup === 'surface' 
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                          : "text-white/50 hover:bg-white/5"
                      )}
                      data-testid="filter-artificial-surface"
                    >
                      <span>💥 Superfície</span>
                    </motion.button>
                    <motion.button
                      onClick={() => setSelectedBaitSubgroup('midwater')}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg text-sm text-left flex items-center gap-2 transition-all",
                        selectedBaitSubgroup === 'midwater' 
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                          : "text-white/50 hover:bg-white/5"
                      )}
                      data-testid="filter-artificial-midwater"
                    >
                      <span>🐠 Meia Água</span>
                    </motion.button>
                    <motion.button
                      onClick={() => setSelectedBaitSubgroup('deep')}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg text-sm text-left flex items-center gap-2 transition-all",
                        selectedBaitSubgroup === 'deep' 
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                          : "text-white/50 hover:bg-white/5"
                      )}
                      data-testid="filter-artificial-deep"
                    >
                      <span>🔻 Fundo</span>
                    </motion.button>
                  </div>
                </div>
              )}

              <div className="border-t border-white/10 pt-4">
                <div className="text-xs text-white/40 uppercase font-bold mb-3 tracking-wider">
                  Info
                </div>
                <div className="space-y-2 text-xs text-white/50">
                  <p>🪱 <strong className="text-green-400">Naturais:</strong> Boia e Fundo</p>
                  <p>🎣 <strong className="text-purple-400">Artificiais:</strong> Carretilha</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="text-xs text-white/40 uppercase font-bold mb-3 flex items-center gap-2 tracking-wider">
                  <Filter className="w-3.5 h-3.5" />
                  Tipo de Pesca
                </div>
                <div className="space-y-1">
                  {FISHING_TYPE_FILTERS.map(filter => (
                    <motion.button
                      key={filter.id}
                      onClick={() => setSelectedFishingType(filter.id)}
                      className={cn(
                        "w-full px-3 py-2.5 rounded-lg text-sm text-left flex items-center gap-3 transition-all",
                        selectedFishingType === filter.id 
                          ? "bg-white/10 text-white border border-white/20" 
                          : "text-white/50 hover:bg-white/5 hover:text-white/80"
                      )}
                      whileHover={{ x: 2 }}
                      data-testid={`filter-${filter.id}`}
                    >
                      <div className={cn("w-3 h-3 rounded-full", filter.color)} />
                      <span>{filter.name}</span>
                      {selectedFishingType === filter.id && (
                        <ChevronRight className="w-4 h-4 ml-auto text-white/40" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="text-xs text-white/40 uppercase font-bold mb-3 tracking-wider">
                  Legenda
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-xs text-white/50">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span>Pesca de Boia</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-white/50">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Carretilha</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-white/50">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                    <span>Pesca de Fundo</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-white/50">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                    <span>Universal</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </aside>

        <main className="flex-1 p-6 overflow-y-auto pb-20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">{getCategoryName(selectedCategory)}</h2>
            <div className="text-white/40 text-sm">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'itens'}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => setSelectedItem(item)}
                  className="group relative backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 overflow-hidden cursor-pointer hover:border-emerald-500/50 hover:bg-white/10 transition-all"
                  data-testid={`item-${item.id}`}
                >
                  <div className="absolute top-2 left-2 z-10">
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full shadow-lg",
                      getFishingTypeColor(item.fishingType)
                    )} />
                  </div>
                  
                  <button 
                    className="absolute top-2 right-2 z-10 w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>

                  {item.price === 0 && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg">
                      GRÁTIS
                    </div>
                  )}

                  <div className="h-28 bg-black/20 flex items-center justify-center p-4">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-contain brightness-0 invert drop-shadow-lg" />
                    ) : item.icon ? (
                      <div className="text-5xl drop-shadow-lg">
                        {item.icon}
                      </div>
                    ) : (
                      <div className="text-4xl opacity-40 grayscale">
                        {item.category === 'rods' && '🎣'}
                        {item.category === 'reels' && '⚙️'}
                        {item.category === 'lines' && '🧵'}
                        {item.category === 'floats' && '🔴'}
                        {item.category === 'terminal' && '🪝'}
                        {item.category === 'baits' && '🪱'}
                        {item.category === 'stringers' && '🪢'}
                      </div>
                    )}
                  </div>

                  {item.specs && item.specs.length > 0 && (
                    <div className="px-3 py-2 bg-black/20 border-t border-white/5 grid grid-cols-3 gap-1">
                      {item.specs.slice(0, 3).map((spec, i) => (
                        <div key={i} className="text-center">
                          <div className="text-[10px] text-white/40 uppercase">{spec.label}</div>
                          <div className="text-xs text-white/70 font-medium">{spec.value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-3 pt-2 border-t border-white/5">
                    {item.brand && (
                      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">{item.brand}</div>
                    )}
                    <h3 className="text-white text-sm font-semibold truncate group-hover:text-emerald-400 transition-colors leading-tight">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-yellow-400 text-sm font-bold flex items-center gap-1">
                        {item.price > 0 ? (
                          <>$ {item.price.toLocaleString()}</>
                        ) : (
                          <span className="text-emerald-400 text-xs">Inicial</span>
                        )}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-16 text-white/40">
              <div className="text-5xl mb-4 opacity-50">🔍</div>
              <p className="text-lg">Nenhum item encontrado com os filtros selecionados.</p>
            </div>
          )}
        </main>

        <AnimatePresence>
          {selectedItem && (
            <motion.aside
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="w-80 backdrop-blur-xl bg-black/40 border-l border-white/10 p-5 overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  {selectedItem.brand && (
                    <div className="text-xs text-white/40 uppercase tracking-wider mb-1">{selectedItem.brand}</div>
                  )}
                  <h3 className="text-white font-bold text-xl leading-tight">{selectedItem.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="text-white/40 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-black/30 rounded-xl h-44 flex items-center justify-center mb-5 border border-white/10">
                {selectedItem.image ? (
                  <img src={selectedItem.image} alt={selectedItem.name} className="w-28 h-28 object-contain brightness-0 invert drop-shadow-xl" />
                ) : (
                  <div className="text-7xl opacity-30">
                    {selectedItem.category === 'rods' && '🎣'}
                    {selectedItem.category === 'reels' && '⚙️'}
                    {selectedItem.category === 'lines' && '🧵'}
                    {selectedItem.category === 'floats' && '🔴'}
                    {selectedItem.category === 'terminal' && '🪝'}
                    {selectedItem.category === 'baits' && '🎣'}
                    {selectedItem.category === 'stringers' && '🪢'}
                  </div>
                )}
              </div>

              {selectedItem.fishingType && selectedItem.fishingType !== 'all' && (
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white mb-4",
                  getFishingTypeColor(selectedItem.fishingType)
                )}>
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                  {selectedItem.fishingType === 'float' && 'Pesca de Boia'}
                  {selectedItem.fishingType === 'baitcasting' && 'Carretilha'}
                  {selectedItem.fishingType === 'bottom' && 'Pesca de Fundo'}
                </div>
              )}

              {selectedItem.details && (
                <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
                  <div className="text-xs text-white/40 uppercase font-bold mb-3 tracking-wider">Especificações</div>
                  <div className="space-y-2.5">
                    {Object.entries(selectedItem.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-white/50">{key}</span>
                        <span className="text-white font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-white/50 text-sm mb-5 leading-relaxed">
                {selectedItem.description}
              </p>

              <div className="border-t border-white/10 pt-5 mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/50 text-sm">Preço</span>
                  <span className="text-yellow-400 font-bold text-2xl flex items-center gap-1.5">
                    {selectedItem.price > 0 ? (
                      <>$ {selectedItem.price.toLocaleString()}</>
                    ) : (
                      <span className="text-emerald-400 text-lg">Grátis</span>
                    )}
                  </span>
                </div>

                <motion.button
                  className={cn(
                    "w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2.5 transition-all",
                    isOwned(selectedItem)
                      ? "bg-slate-600 cursor-not-allowed opacity-50"
                      : coins >= selectedItem.price 
                        ? "bg-emerald-600 hover:bg-emerald-500" 
                        : "bg-white/10 cursor-not-allowed opacity-50"
                  )}
                  whileHover={!isOwned(selectedItem) && coins >= selectedItem.price ? { scale: 1.02 } : {}}
                  whileTap={!isOwned(selectedItem) && coins >= selectedItem.price ? { scale: 0.98 } : {}}
                  disabled={isOwned(selectedItem) || coins < selectedItem.price}
                  onClick={() => handleBuy(selectedItem)}
                  data-testid="button-buy"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {isOwned(selectedItem) ? 'Já possui' : coins >= selectedItem.price ? 'Comprar' : 'Saldo insuficiente'}
                </motion.button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
