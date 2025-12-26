import { Link } from "wouter";
import { ArrowLeft, AlertCircle, CheckCircle2, X, Settings, Edit2 } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  FISHING_RODS, 
  FISHING_LINES, 
  HOOKS, 
  FLOATS, 
  REELS, 
  SINKERS, 
  ARTIFICIAL_LURES,
  STRINGERS,
  isSetupCompatible,
  getPowerName,
  getActionName,
  getFishingTypeName,
  type FishingRod,
  type FishingLine,
  type Hook,
  type FloatBobber,
  type Reel,
  type Sinker,
  type ArtificialLure,
  type FishingType
} from "@shared/equipment";
import { NATURAL_BAITS as SHARED_NATURAL_BAITS } from "@shared/fishData";

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

function lbToKg(lb: number): string {
  return (lb * 0.453592).toFixed(1);
}

type SlotType = 'rod' | 'reel' | 'line' | 'hook' | 'float' | 'sinker' | 'lure' | 'bait';

interface EquipmentSlot {
  id: SlotType;
  name: string;
  icon: string;
  required: boolean;
  forTypes: FishingType[];
}


const EQUIPMENT_SLOTS: EquipmentSlot[] = [
  { id: 'rod', name: 'Vara', icon: '🎣', required: true, forTypes: ['float', 'baitcasting', 'bottom'] },
  { id: 'reel', name: 'Molinete', icon: '⚙️', required: false, forTypes: ['baitcasting', 'bottom'] },
  { id: 'line', name: 'Linha', icon: '🧵', required: true, forTypes: ['float', 'baitcasting', 'bottom'] },
  { id: 'hook', name: 'Anzol', icon: '🪝', required: false, forTypes: ['float', 'bottom'] },
  { id: 'float', name: 'Boia', icon: '🔴', required: false, forTypes: ['float'] },
  { id: 'sinker', name: 'Chumbo', icon: '⚓', required: false, forTypes: ['bottom'] },
  { id: 'bait', name: 'Isca Natural', icon: '🪱', required: false, forTypes: ['float', 'bottom'] },
  { id: 'lure', name: 'Isca Artificial', icon: '🎯', required: false, forTypes: ['baitcasting'] },
];

export default function Equipment() {
  const { 
    equippedSetup, setEquippedSetup, ownedEquipment,
    presets, activePresetId, setActivePresetId, renamePreset,
    equippedStringerId, setEquippedStringerId, getEquippedStringer, inventoryLimits
  } = useGame();
  const [selectedSlot, setSelectedSlot] = useState<SlotType | null>(null);
  const [editingPresetId, setEditingPresetId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [itemPage, setItemPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const currentFishingType: FishingType | null = equippedSetup.rod?.fishingType || null;

  const getAvailableItems = (slotType: SlotType) => {
    switch (slotType) {
      case 'rod': return FISHING_RODS.filter(r => ownedEquipment.rods.includes(r.id));
      case 'reel': return REELS.filter(r => ownedEquipment.reels.includes(r.id));
      case 'line': {
        let lines = FISHING_LINES.filter(l => ownedEquipment.lines.includes(l.id));
        // Filter by rod compatibility if rod has specific line restrictions
        if (equippedSetup.rod?.compatibleLineIds) {
          lines = lines.filter(l => equippedSetup.rod!.compatibleLineIds!.includes(l.id));
        }
        return lines;
      }
      case 'hook': return HOOKS.filter(h => ownedEquipment.hooks.includes(h.id));
      case 'float': return FLOATS.filter(f => ownedEquipment.floats.includes(f.id));
      case 'sinker': return SINKERS.filter(s => ownedEquipment.sinkers.includes(s.id));
      case 'lure': return ARTIFICIAL_LURES.filter(l => ownedEquipment.lures.includes(l.id));
      case 'bait': return SHARED_NATURAL_BAITS;
      default: return [];
    }
  };

  const isBaitCompatibleWithHook = (bait: typeof SHARED_NATURAL_BAITS[0]): boolean => {
    if (!equippedSetup.hook) return false;
    const hookSize = equippedSetup.hook.size;
    return hookSize <= bait.minHookSize && hookSize >= bait.maxHookSize;
  };

  const getHookRangeText = (bait: typeof SHARED_NATURAL_BAITS[0]): string => {
    const formatSize = (size: number) => {
      if (size <= 0) return `${Math.abs(size)}/0`;
      return `#${size}`;
    };
    return `${formatSize(bait.minHookSize)} a ${formatSize(bait.maxHookSize)}`;
  };

  const getEquippedItem = (slotType: SlotType) => {
    switch (slotType) {
      case 'rod': return equippedSetup.rod;
      case 'reel': return equippedSetup.reel;
      case 'line': return equippedSetup.line;
      case 'hook': return equippedSetup.hook;
      case 'float': return equippedSetup.float;
      case 'sinker': return equippedSetup.sinker;
      case 'lure': return equippedSetup.lure;
      case 'bait': return equippedSetup.bait ? SHARED_NATURAL_BAITS.find(b => b.id === equippedSetup.bait) : null;
      default: return null;
    }
  };

  const equipItem = (slotType: SlotType, item: any) => {
    const newSetup = { ...equippedSetup };
    
    if (slotType === 'rod') {
      const newRod = item as FishingRod;
      newSetup.rod = newRod;
      newSetup.reel = undefined;
      newSetup.hook = undefined;
      newSetup.float = undefined;
      newSetup.sinker = undefined;
      newSetup.lure = undefined;
      newSetup.bait = undefined;
      // Remove line if not compatible with new rod
      if (newRod.compatibleLineIds && newSetup.line) {
        if (!newRod.compatibleLineIds.includes(newSetup.line.id)) {
          newSetup.line = undefined;
        }
      }
    } else if (slotType === 'bait') {
      newSetup.bait = item.id;
    } else {
      (newSetup as any)[slotType] = item;
    }
    
    setEquippedSetup(newSetup);
    setSelectedSlot(null);
  };

  const unequipItem = (slotType: SlotType) => {
    const newSetup = { ...equippedSetup };
    (newSetup as any)[slotType] = undefined;
    setEquippedSetup(newSetup);
  };

  const isSlotAvailable = (slot: EquipmentSlot): boolean => {
    if (slot.id === 'rod' || slot.id === 'line') return true;
    if (!currentFishingType) return false;
    return slot.forTypes.includes(currentFishingType);
  };

  const isSlotRequired = (slot: EquipmentSlot): boolean => {
    if (!currentFishingType) return slot.required;
    
    switch (currentFishingType) {
      case 'float':
        return ['rod', 'line', 'hook', 'float'].includes(slot.id);
      case 'baitcasting':
        return ['rod', 'line', 'reel', 'lure'].includes(slot.id);
      case 'bottom':
        return ['rod', 'line', 'reel', 'hook', 'sinker'].includes(slot.id);
      default:
        return slot.required;
    }
  };

  const getSetupValidation = () => {
    if (!equippedSetup.rod || !equippedSetup.line) {
      return { valid: false, errors: ['Equipe uma vara e uma linha'] };
    }
    return isSetupCompatible({
      rod: equippedSetup.rod,
      line: equippedSetup.line,
      reel: equippedSetup.reel,
      hook: equippedSetup.hook,
      float: equippedSetup.float,
      sinker: equippedSetup.sinker,
      lure: equippedSetup.lure
    });
  };

  const validation = getSetupValidation();

  const startEditingPreset = (id: number, currentName: string) => {
    setEditingPresetId(id);
    setEditName(currentName);
  };

  const savePresetName = () => {
    if (editingPresetId && editName.trim()) {
      renamePreset(editingPresetId, editName.trim());
    }
    setEditingPresetId(null);
  };

  const getPresetStatus = (preset: typeof presets[0]) => {
    if (!preset.setup.rod || !preset.setup.line) return 'empty';
    const result = isSetupCompatible({
      rod: preset.setup.rod,
      line: preset.setup.line,
      reel: preset.setup.reel,
      hook: preset.setup.hook,
      float: preset.setup.float,
      sinker: preset.setup.sinker,
      lure: preset.setup.lure
    });
    return result.valid ? 'ready' : 'incomplete';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950/90 via-slate-900 to-slate-950 flex flex-col overflow-auto">
      <div className="backdrop-blur-xl bg-black/40 border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/">
            <motion.button 
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all border border-white/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </Link>
          <div>
            <h1 className="text-2xl text-white font-bold flex items-center gap-2">
              <Settings className="w-6 h-6 text-yellow-500" />
              Oficina
            </h1>
            <p className="text-white/50 text-sm">Monte suas varas de pesca</p>
          </div>
        </div>
        <div className="text-white/50 text-sm">
          {presets.filter(p => getPresetStatus(p) === 'ready').length}/4 montagens prontas
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="w-24 backdrop-blur-xl bg-black/30 border-r border-white/10 flex flex-col py-2 sticky top-16 h-fit max-h-[calc(100vh-64px)] overflow-y-auto">
          {presets.map((preset) => {
            const status = getPresetStatus(preset);
            const isActive = preset.id === activePresetId;

            return (
              <motion.button
                key={preset.id}
                onClick={() => setActivePresetId(preset.id)}
                className={cn(
                  "relative py-4 px-2 border-l-4 transition-all flex flex-col items-center gap-1",
                  isActive 
                    ? "bg-white/10 border-l-yellow-500" 
                    : "border-l-transparent hover:bg-white/5",
                  status === 'ready' && "border-l-green-500",
                  status === 'incomplete' && isActive && "border-l-orange-500"
                )}
                whileHover={{ x: 2 }}
                data-testid={`preset-tab-${preset.id}`}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-xl",
                  status === 'empty' && "bg-white/10 text-white/40",
                  status === 'incomplete' && "bg-orange-500/20 text-orange-400",
                  status === 'ready' && "bg-green-500/20 text-green-400"
                )}>
                  {status === 'empty' ? '➕' : status === 'ready' ? '✓' : '🎣'}
                </div>
                <span className="text-xs text-white/50 truncate w-full text-center">
                  {preset.id}
                </span>
                {status === 'ready' && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="flex-1 p-4 flex gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              {editingPresetId === activePresetId ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={savePresetName}
                    onKeyDown={(e) => e.key === 'Enter' && savePresetName()}
                    className="bg-white/10 border border-white/20 text-white px-3 py-1 rounded text-lg font-bold focus:outline-none focus:border-yellow-500"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl text-white font-bold">
                    {presets.find(p => p.id === activePresetId)?.name}
                  </h2>
                  <button
                    onClick={() => {
                      const preset = presets.find(p => p.id === activePresetId);
                      if (preset) startEditingPreset(preset.id, preset.name);
                    }}
                    className="text-white/40 hover:text-white/70"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {currentFishingType && (
                <div className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2",
                  currentFishingType === 'float' && "bg-red-500/20 text-red-400 border border-red-500/30",
                  currentFishingType === 'baitcasting' && "bg-blue-500/20 text-blue-400 border border-blue-500/30",
                  currentFishingType === 'bottom' && "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                )}>
                  {currentFishingType === 'float' && '🔴'}
                  {currentFishingType === 'baitcasting' && '🎯'}
                  {currentFishingType === 'bottom' && '⚓'}
                  {getFishingTypeName(currentFishingType)}
                </div>
              )}
            </div>

            <div className="backdrop-blur-xl bg-black/30 rounded-xl border border-white/10 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {EQUIPMENT_SLOTS.map(slot => {
                  const equipped = getEquippedItem(slot.id);
                  const isAvailable = isSlotAvailable(slot);
                  const isRequired = isSlotRequired(slot);
                  const isMissing = isRequired && !equipped;

                  return (
                    <motion.div
                      key={slot.id}
                      onClick={() => { if (isAvailable) { setSelectedSlot(slot.id); setItemPage(1); } }}
                      className={cn(
                        "relative p-4 rounded-xl cursor-pointer transition-all border-2",
                        !isAvailable && "opacity-30 cursor-not-allowed bg-black/20 border-white/5",
                        isAvailable && !equipped && "bg-white/5 border-white/10 hover:border-white/30",
                        isAvailable && equipped && "bg-white/10 border-green-500/50",
                        isMissing && "border-orange-500/50 bg-orange-500/10"
                      )}
                      whileHover={isAvailable ? { scale: 1.02 } : {}}
                      whileTap={isAvailable ? { scale: 0.98 } : {}}
                      data-testid={`slot-${slot.id}`}
                    >
                      {equipped && (
                        <button
                          onClick={(e) => { e.stopPropagation(); unequipItem(slot.id); }}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center z-10"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      )}

                      <div className="text-3xl mb-2">{slot.icon}</div>
                      <div className="text-xs text-white/40 uppercase font-bold tracking-wider mb-1">{slot.name}</div>
                      
                      {equipped ? (
                        <div className="text-white text-sm font-medium truncate">{equipped.name}</div>
                      ) : (
                        <div className={cn(
                          "text-sm",
                          isMissing ? "text-orange-400" : "text-white/30"
                        )}>
                          {isMissing ? "Necessário" : "Vazio"}
                        </div>
                      )}

                      {isRequired && (
                        <div className={cn(
                          "absolute bottom-2 right-2 w-2 h-2 rounded-full",
                          equipped ? "bg-green-500" : "bg-orange-500"
                        )} />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className={cn(
              "p-4 rounded-xl border-2",
              validation.valid 
                ? "bg-green-500/10 border-green-500/30" 
                : "bg-orange-500/10 border-orange-500/30"
            )}>
              <div className="flex items-center gap-3">
                {validation.valid ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                )}
                <div className="flex-1">
                  <div className={cn(
                    "font-bold",
                    validation.valid ? "text-green-400" : "text-orange-400"
                  )}>
                    {validation.valid ? "Montagem Pronta!" : "Montagem Incompleta"}
                  </div>
                  {!validation.valid && validation.errors.length > 0 && (
                    <ul className="text-sm text-orange-300/80 mt-1 space-y-0.5">
                      {validation.errors.map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                  )}
                </div>
                {validation.valid && (
                  <Link href="/map">
                    <motion.button
                      className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      data-testid="button-go-fishing"
                    >
                      Pescar 🎣
                    </motion.button>
                  </Link>
                )}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-black/30 rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold flex items-center gap-2">
                  🪢 Fieira Equipada
                </h3>
                <div className="text-white/50 text-sm">
                  Capacidade: {inventoryLimits.maxCount} peixes / {inventoryLimits.maxWeight}kg
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {STRINGERS.filter(s => ownedEquipment.stringers.includes(s.id)).map(stringer => {
                  const isEquipped = equippedStringerId === stringer.id;
                  
                  return (
                    <motion.div
                      key={stringer.id}
                      onClick={() => setEquippedStringerId(stringer.id)}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all",
                        isEquipped 
                          ? "bg-green-500/20 border-green-500/50" 
                          : "bg-white/5 border-white/10 hover:border-white/30"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      data-testid={`stringer-${stringer.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-white text-sm">{stringer.name}</div>
                        {isEquipped && (
                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                            Equipada
                          </span>
                        )}
                      </div>
                      <p className="text-white/40 text-xs mt-1">{stringer.description}</p>
                      <div className="flex gap-2 mt-2 text-xs">
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                          {stringer.maxCount} peixes
                        </span>
                        <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                          {stringer.maxWeightKg}kg
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              {ownedEquipment.stringers.length === 0 && (
                <div className="text-center py-4 text-white/40">
                  <p>Você não tem nenhuma fieira.</p>
                  <Link href="/shop">
                    <button className="mt-2 text-sm text-emerald-400 hover:text-emerald-300">
                      Comprar na Loja →
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {selectedSlot && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="w-80 backdrop-blur-xl bg-black/40 border border-white/10 rounded-xl overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
                  <h3 className="text-white font-bold text-lg">
                    {EQUIPMENT_SLOTS.find(s => s.id === selectedSlot)?.name}
                  </h3>
                  <button 
                    onClick={() => setSelectedSlot(null)}
                    className="text-white/40 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {(() => {
                      const allItems = getAvailableItems(selectedSlot);
                      const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
                      const startIndex = (itemPage - 1) * ITEMS_PER_PAGE;
                      const paginatedItems = allItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
                      
                      if (allItems.length === 0) {
                        return (
                          <div className="text-center py-8 text-white/40">
                            <div className="text-3xl mb-2">📦</div>
                            <p>Nenhum item disponível</p>
                            <Link href="/shop">
                              <button className="mt-2 text-sm text-emerald-400 hover:text-emerald-300">
                                Ir para a Loja →
                              </button>
                            </Link>
                          </div>
                        );
                      }
                      
                      return (
                        <>
                          {paginatedItems.map((item: any) => {
                            const isEquipped = getEquippedItem(selectedSlot)?.id === item.id;
                            const hookImage = selectedSlot === 'hook' ? HOOK_IMAGES[item.id] : null;

                            return (
                              <motion.div
                                key={item.id}
                                onClick={() => equipItem(selectedSlot, item)}
                                className={cn(
                                  "p-3 rounded-lg border cursor-pointer transition-all",
                                  isEquipped 
                                    ? "bg-green-500/20 border-green-500/50" 
                                    : "bg-white/5 border-white/10 hover:border-white/30"
                                )}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                data-testid={`item-${item.id}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {hookImage && (
                                      <img src={hookImage} alt={item.name} className="w-8 h-8 object-contain brightness-0 invert" />
                                    )}
                                    <div className="font-bold text-white text-sm">{item.name}</div>
                                  </div>
                                  {isEquipped && (
                                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                                      Equipado
                                    </span>
                                  )}
                                </div>
                                <p className="text-white/40 text-xs mt-1">{item.description}</p>
                                
                                {selectedSlot === 'rod' && (
                                  <div className="flex gap-2 mt-2 text-xs">
                                    <span className={cn(
                                      "px-2 py-0.5 rounded",
                                      item.fishingType === 'float' && "bg-red-500/20 text-red-400",
                                      item.fishingType === 'baitcasting' && "bg-blue-500/20 text-blue-400",
                                      item.fishingType === 'bottom' && "bg-amber-500/20 text-amber-400"
                                    )}>
                                      {getFishingTypeName(item.fishingType)}
                                    </span>
                                    <span className="bg-white/10 px-2 py-0.5 rounded text-white/70">
                                      {getPowerName(item.power)}
                                    </span>
                                  </div>
                                )}

                                {selectedSlot === 'line' && (
                                  <div className="flex gap-2 mt-2 text-xs">
                                    <span className="bg-white/10 px-2 py-0.5 rounded text-white/70">
                                      {item.diameterMm}mm
                                    </span>
                                    <span className="bg-white/10 px-2 py-0.5 rounded text-white/70">
                                      {lbToKg(item.testWeightLb)}kg
                                    </span>
                                  </div>
                                )}

                                {selectedSlot === 'hook' && (
                                  <div className="flex gap-2 mt-2 text-xs">
                                    <span className="bg-white/10 px-2 py-0.5 rounded text-white/70">
                                      Até {item.maxFishWeightKg}kg
                                    </span>
                                  </div>
                                )}

                                {selectedSlot === 'reel' && (
                                  <div className="flex gap-2 mt-2 text-xs">
                                    <span className="bg-white/10 px-2 py-0.5 rounded text-white/70">
                                      {item.gearRatio}
                                    </span>
                                    <span className="bg-white/10 px-2 py-0.5 rounded text-white/70">
                                      Drag {lbToKg(item.maxDragLb)}kg
                                    </span>
                                  </div>
                                )}

                                {selectedSlot === 'bait' && (
                                  <div className="flex gap-2 mt-2 text-xs flex-wrap">
                                    <span className="bg-white/10 px-2 py-0.5 rounded text-white/70">
                                      {item.icon}
                                    </span>
                                    <span className={cn(
                                      "px-2 py-0.5 rounded",
                                      isBaitCompatibleWithHook(item) 
                                        ? "bg-green-500/20 text-green-400" 
                                        : "bg-red-500/20 text-red-400"
                                    )}>
                                      Anzol {getHookRangeText(item)}
                                    </span>
                                    {!isBaitCompatibleWithHook(item) && (
                                      <span className="text-red-400 text-xs w-full mt-1">
                                        ⚠️ {!equippedSetup.hook ? 'Equipe um anzol primeiro' : 'Anzol fora do range'}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                          
                          {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 pt-3">
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                  key={page}
                                  onClick={() => setItemPage(page)}
                                  className={cn(
                                    "w-8 h-8 rounded-lg font-medium text-xs transition-all",
                                    itemPage === page
                                      ? "bg-white/20 text-white"
                                      : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
                                  )}
                                  data-testid={`item-page-${page}`}
                                >
                                  {page}
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
