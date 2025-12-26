import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Fish, Rod, RODS, FISH_SPECIES, type FishRank } from '@/lib/fishData';
import { 
  FishingRod, FishingLine, Hook, FloatBobber, Reel, Sinker, ArtificialLure, Stringer,
  FISHING_RODS, FISHING_LINES, HOOKS, FLOATS, REELS, SINKERS, ARTIFICIAL_LURES, STRINGERS
} from '@shared/equipment';

interface CatchRecord {
  id?: number;
  fishId: string;
  weight: number;
  length: number;
  rank: string;
  locationId: string;
  date: number;
}

export interface TrophyRecord {
  id: number;
  fishId: string;
  weight: number;
  length: number;
  rank: string;
  locationId: string;
  caughtAt: number;
  createdAt: number;
}

export type BaitType = 'bread' | 'worm' | 'lure';

interface MasteryRecord {
  fishId: string;
  count: number;
  maxWeight: number;
  maxLength: number;
  stars: number;
  sRankCount: number;
  bestRank: FishRank;
}

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export interface EquippedSetup {
  rod?: FishingRod;
  line?: FishingLine;
  reel?: Reel;
  hook?: Hook;
  float?: FloatBobber;
  sinker?: Sinker;
  lure?: ArtificialLure;
  bait?: string;
}

export interface EquipmentPreset {
  id: number;
  name: string;
  setup: EquippedSetup;
}

export interface OwnedEquipment {
  rods: string[];
  lines: string[];
  reels: string[];
  hooks: string[];
  floats: string[];
  sinkers: string[];
  lures: string[];
  stringers: string[];
}

const DEFAULT_OWNED_EQUIPMENT: OwnedEquipment = {
  rods: ['wooden_rod'],
  lines: ['mono_008'],
  reels: [],
  hooks: ['hook_1'],
  floats: ['float_small'],
  sinkers: [],
  lures: [],
  stringers: ['stringer_traditional']
};

const MAX_PRESETS = 4;
const MAX_INVENTORY_COUNT = 20;
const MAX_INVENTORY_WEIGHT = 5;
const FEATURED_FISH_DURATION = 3 * 60 * 60 * 1000;

interface FeaturedFishData {
  fishIds: string[];
  expiresAt: number;
}

const generateFeaturedFish = (): FeaturedFishData => {
  const allFishIds = FISH_SPECIES.map(f => f.id);
  const shuffled = [...allFishIds].sort(() => Math.random() - 0.5);
  return {
    fishIds: shuffled.slice(0, 3),
    expiresAt: Date.now() + FEATURED_FISH_DURATION
  };
};

interface GameContextType {
  coins: number;
  addCoins: (amount: number) => void;
  inventory: CatchRecord[];
  mastery: Record<string, MasteryRecord>;
  trophies: TrophyRecord[];
  addCatch: (fish: Fish, weight: number, length: number, rank: FishRank, locationId: string) => boolean;
  sellFish: (index: number, price: number) => void;
  sellAllFish: () => void;
  makeTrophy: (index: number) => void;
  removeTrophy: (trophyId: number) => void;
  unlockedMaps: string[];
  selectedBait: BaitType;
  setSelectedBait: (bait: BaitType) => void;
  ownedBaits: Record<BaitType, number>;
  equippedRodId: string;
  setEquippedRodId: (id: string) => void;
  getEquippedRod: () => Rod;
  gameMinutes: number;
  gameDay: number;
  getGameHour: () => number;
  getFormattedTime: () => string;
  getTimeOfDay: () => TimeOfDay;
  isFishActive: (fish: Fish) => boolean;
  getTotalMastery: () => number;
  equippedSetup: EquippedSetup;
  setEquippedSetup: (setup: EquippedSetup) => void;
  ownedEquipment: OwnedEquipment;
  addOwnedEquipment: (type: keyof OwnedEquipment, id: string) => void;
  presets: EquipmentPreset[];
  activePresetId: number;
  setActivePresetId: (id: number) => void;
  updatePreset: (id: number, setup: EquippedSetup) => void;
  renamePreset: (id: number, name: string) => void;
  featuredFish: FeaturedFishData;
  isFeaturedFish: (fishId: string) => boolean;
  getInventoryWeight: () => number;
  canAddToInventory: (weight: number) => boolean;
  inventoryLimits: { maxCount: number; maxWeight: number };
  equippedStringerId: string;
  setEquippedStringerId: (id: string) => void;
  getEquippedStringer: () => Stringer | undefined;
  currentLocation: string;
  travelTo: (locationId: string, cost: number) => boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const GAME_SPEED_MULTIPLIER = 12;

const getDefaultSetup = (): EquippedSetup => {
  const rod = FISHING_RODS.find(r => r.id === 'wooden_rod');
  const line = FISHING_LINES.find(l => l.id === 'mono_008');
  const hook = HOOKS.find(h => h.id === 'hook_1');
  const float = FLOATS.find(f => f.id === 'float_small');
  return { rod, line, hook, float };
};

const createDefaultPresets = (): EquipmentPreset[] => {
  return [
    { id: 1, name: 'Montagem 1', setup: getDefaultSetup() },
    { id: 2, name: 'Montagem 2', setup: {} },
    { id: 3, name: 'Montagem 3', setup: {} },
    { id: 4, name: 'Montagem 4', setup: {} },
  ];
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [coins, setCoins] = useState(10000);
  const [inventory, setInventory] = useState<CatchRecord[]>([]);
  const [mastery, setMastery] = useState<Record<string, MasteryRecord>>({});
  const [trophies, setTrophies] = useState<TrophyRecord[]>([]);
  const [featuredFish, setFeaturedFish] = useState<FeaturedFishData>(generateFeaturedFish);
  const [unlockedMaps, setUnlockedMaps] = useState<string[]>(['pond', 'creek', 'river']);
  
  const [selectedBait, setSelectedBait] = useState<BaitType>('bread');
  const [ownedBaits, setOwnedBaits] = useState<Record<BaitType, number>>({
    bread: 20,
    worm: 10,
    lure: 1 
  });
  
  const [equippedRodId, setEquippedRodId] = useState<string>('bamboo');

  const [gameMinutes, setGameMinutes] = useState(480);
  const [gameDay, setGameDay] = useState(1);
  const timeAnchorRef = useRef<number>(Date.now());

  const [ownedEquipment, setOwnedEquipment] = useState<OwnedEquipment>(DEFAULT_OWNED_EQUIPMENT);
  const [presets, setPresets] = useState<EquipmentPreset[]>(createDefaultPresets);
  const [activePresetId, setActivePresetId] = useState(1);
  const [equippedStringerId, setEquippedStringerId] = useState<string>('stringer_traditional');
  const [currentLocation, setCurrentLocation] = useState<string>('creek');

  const getEquippedStringer = () => STRINGERS.find(s => s.id === equippedStringerId);
  
  const inventoryLimits = {
    maxCount: getEquippedStringer()?.maxCount || MAX_INVENTORY_COUNT,
    maxWeight: getEquippedStringer()?.maxWeightKg || MAX_INVENTORY_WEIGHT
  };

  const equippedSetup = presets.find(p => p.id === activePresetId)?.setup || {};

  const setEquippedSetup = (setup: EquippedSetup) => {
    setPresets(prev => prev.map(p => 
      p.id === activePresetId ? { ...p, setup } : p
    ));
  };

  const updatePreset = (id: number, setup: EquippedSetup) => {
    setPresets(prev => prev.map(p => 
      p.id === id ? { ...p, setup } : p
    ));
  };

  const renamePreset = (id: number, name: string) => {
    setPresets(prev => prev.map(p => 
      p.id === id ? { ...p, name } : p
    ));
  };

  const serializeSetup = (setup: EquippedSetup) => ({
    rod: setup.rod?.id,
    line: setup.line?.id,
    reel: setup.reel?.id,
    hook: setup.hook?.id,
    float: setup.float?.id,
    sinker: setup.sinker?.id,
    lure: setup.lure?.id,
  });

  const deserializeSetup = (ids: any): EquippedSetup => {
    const setup: EquippedSetup = {};
    if (ids?.rod) setup.rod = FISHING_RODS.find(r => r.id === ids.rod);
    if (ids?.line) setup.line = FISHING_LINES.find(l => l.id === ids.line);
    if (ids?.reel) setup.reel = REELS.find(r => r.id === ids.reel);
    if (ids?.hook) setup.hook = HOOKS.find(h => h.id === ids.hook);
    if (ids?.float) setup.float = FLOATS.find(f => f.id === ids.float);
    if (ids?.sinker) setup.sinker = SINKERS.find(s => s.id === ids.sinker);
    if (ids?.lure) setup.lure = ARTIFICIAL_LURES.find(l => l.id === ids.lure);
    return setup;
  };

  useEffect(() => {
    const saved = localStorage.getItem('reel-legend-save-v7');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCoins(parsed.coins || 0);
        setInventory(parsed.inventory || []);
        setMastery(parsed.mastery || {});
        setTrophies(parsed.trophies || []);
        if (parsed.featuredFish && parsed.featuredFish.expiresAt > Date.now()) {
          setFeaturedFish(parsed.featuredFish);
        } else {
          setFeaturedFish(generateFeaturedFish());
        }
        setOwnedBaits(parsed.ownedBaits || { bread: 20, worm: 10, lure: 1 });
        setEquippedRodId(parsed.equippedRodId || 'bamboo');
        const savedEquipment = parsed.ownedEquipment || {};
        setOwnedEquipment({
          ...DEFAULT_OWNED_EQUIPMENT,
          ...savedEquipment,
          stringers: savedEquipment.stringers?.length ? savedEquipment.stringers : DEFAULT_OWNED_EQUIPMENT.stringers
        });
        setEquippedStringerId(parsed.equippedStringerId || 'stringer_traditional');
        setCurrentLocation(parsed.currentLocation || 'creek');
        
        if (parsed.presets) {
          const loadedPresets = parsed.presets.map((p: any) => ({
            id: p.id,
            name: p.name,
            setup: deserializeSetup(p.setupIds)
          }));
          setPresets(loadedPresets);
        }
        
        if (parsed.activePresetId) {
          setActivePresetId(parsed.activePresetId);
        }
        
        if (parsed.gameMinutes !== undefined && parsed.gameDay !== undefined && parsed.timeAnchor) {
          const elapsedRealMs = Date.now() - parsed.timeAnchor;
          const elapsedGameMinutes = Math.floor((elapsedRealMs / 1000 / 60) * GAME_SPEED_MULTIPLIER);
          let newMinutes = parsed.gameMinutes + elapsedGameMinutes;
          let newDay = parsed.gameDay;
          
          while (newMinutes >= 1440) {
            newMinutes -= 1440;
            newDay++;
          }
          
          setGameMinutes(newMinutes);
          setGameDay(newDay);
        }
        
        timeAnchorRef.current = Date.now();
      } catch (e) {
        console.error("Failed to load save", e);
      }
    }
  }, []);

  useEffect(() => {
    const serializedPresets = presets.map(p => ({
      id: p.id,
      name: p.name,
      setupIds: serializeSetup(p.setup)
    }));
    
    localStorage.setItem('reel-legend-save-v7', JSON.stringify({ 
      coins, inventory, mastery, trophies, featuredFish, ownedBaits, equippedRodId, ownedEquipment,
      presets: serializedPresets, activePresetId,
      gameMinutes, gameDay, timeAnchor: timeAnchorRef.current,
      equippedStringerId, currentLocation
    }));
  }, [coins, inventory, mastery, trophies, featuredFish, ownedBaits, equippedRodId, ownedEquipment, presets, activePresetId, gameMinutes, gameDay, equippedStringerId, currentLocation]);

  useEffect(() => {
    const checkFeaturedFish = () => {
      if (Date.now() >= featuredFish.expiresAt) {
        setFeaturedFish(generateFeaturedFish());
      }
    };
    
    const interval = setInterval(checkFeaturedFish, 60000);
    return () => clearInterval(interval);
  }, [featuredFish.expiresAt]);

  const isFeaturedFish = useCallback((fishId: string): boolean => {
    return featuredFish.fishIds.includes(fishId);
  }, [featuredFish.fishIds]);

  const getInventoryWeight = useCallback((): number => {
    return inventory.reduce((sum, item) => sum + item.weight, 0);
  }, [inventory]);

  const canAddToInventory = useCallback((weight: number): boolean => {
    if (inventory.length >= MAX_INVENTORY_COUNT) return false;
    if (getInventoryWeight() + weight > MAX_INVENTORY_WEIGHT) return false;
    return true;
  }, [inventory.length, getInventoryWeight]);

  const travelTo = useCallback((locationId: string, cost: number): boolean => {
    if (locationId === currentLocation) return true;
    if (cost > 0 && coins < cost) return false;
    if (cost > 0) setCoins(prev => prev - cost);
    setCurrentLocation(locationId);
    return true;
  }, [currentLocation, coins]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedRealMs = now - timeAnchorRef.current;
      const elapsedGameMinutes = Math.floor((elapsedRealMs / 1000 / 60) * GAME_SPEED_MULTIPLIER);
      
      if (elapsedGameMinutes >= 1) {
        timeAnchorRef.current = now;
        
        setGameMinutes(prev => {
          let newMinutes = prev + elapsedGameMinutes;
          
          if (newMinutes >= 1440) {
            const daysToAdd = Math.floor(newMinutes / 1440);
            newMinutes = newMinutes % 1440;
            setGameDay(d => d + daysToAdd);
          }
          
          return newMinutes;
        });
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const getGameHour = useCallback(() => {
    return Math.floor(gameMinutes / 60);
  }, [gameMinutes]);

  const getFormattedTime = useCallback(() => {
    const hours = Math.floor(gameMinutes / 60);
    const mins = gameMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }, [gameMinutes]);

  const getTimeOfDay = useCallback((): TimeOfDay => {
    const hour = getGameHour();
    if (hour >= 5 && hour < 8) return 'dawn';
    if (hour >= 8 && hour < 17) return 'day';
    if (hour >= 17 && hour < 20) return 'dusk';
    return 'night';
  }, [getGameHour]);

  const isFishActive = useCallback((fish: Fish): boolean => {
    if (!fish.activeHours) return true;
    
    const [start, end] = fish.activeHours;
    const hour = getGameHour();
    
    if (start < end) {
      return hour >= start && hour < end;
    } else {
      return hour >= start || hour < end;
    }
  }, [getGameHour]);

  const rankOrder: Record<FishRank, number> = { 'C': 0, 'B': 1, 'A': 2, 'S': 3 };

  const addCatch = (fish: Fish, weight: number, length: number, rank: FishRank, locationId: string): boolean => {
    setMastery(prev => {
      const current = prev[fish.id] || { 
        fishId: fish.id, 
        count: 0, 
        maxWeight: 0, 
        maxLength: 0, 
        stars: 0, 
        sRankCount: 0, 
        bestRank: 'C' as FishRank 
      };
      
      const newCount = current.count + 1;
      const newMaxWeight = Math.max(current.maxWeight, weight);
      const newMaxLength = Math.max(current.maxLength, length);
      const newSRankCount = current.sRankCount + (rank === 'S' ? 1 : 0);
      const newBestRank = rankOrder[rank] > rankOrder[current.bestRank] ? rank : current.bestRank;
      
      let stars = 0;
      if (newCount >= 1) stars = 1;
      if (newCount >= 5 || newSRankCount >= 1) stars = 2;
      if (newCount >= 15 || newSRankCount >= 3) stars = 3;
      if (newCount >= 30 || newSRankCount >= 5) stars = 4;
      if (newSRankCount >= 10) stars = 5;

      return {
        ...prev,
        [fish.id]: {
          fishId: fish.id,
          count: newCount,
          maxWeight: newMaxWeight,
          maxLength: newMaxLength,
          stars,
          sRankCount: newSRankCount,
          bestRank: newBestRank
        }
      };
    });

    if (selectedBait !== 'lure') {
      setOwnedBaits(prev => ({
        ...prev,
        [selectedBait]: Math.max(0, prev[selectedBait] - 1)
      }));
    }

    const currentWeight = inventory.reduce((sum, item) => sum + item.weight, 0);
    if (inventory.length >= MAX_INVENTORY_COUNT || currentWeight + weight > MAX_INVENTORY_WEIGHT) {
      return false;
    }

    setInventory(prev => [...prev, { 
      fishId: fish.id, 
      weight, 
      length,
      rank,
      locationId,
      date: Date.now() 
    }]);

    return true;
  };

  const addCoins = (amount: number) => {
    setCoins(prev => prev + amount);
  };

  const sellFish = (index: number, price: number) => {
    setInventory(prev => prev.filter((_, i) => i !== index));
    setCoins(prev => prev + price);
  };

  const sellAllFish = () => {
    const totalValue = inventory.reduce((sum, catchRecord) => {
      const fish = FISH_SPECIES.find((f: Fish) => f.id === catchRecord.fishId);
      const pricePerKg = fish?.pricePerKg || 10;
      const basePrice = Math.round(pricePerKg * catchRecord.weight);
      const isFeatured = featuredFish.fishIds.includes(catchRecord.fishId);
      const finalPrice = isFeatured ? Math.round(basePrice * 1.2) : basePrice;
      return sum + Math.max(1, finalPrice);
    }, 0);
    
    setInventory([]);
    setCoins(prev => prev + totalValue);
  };

  const makeTrophy = (index: number) => {
    const catchRecord = inventory[index];
    if (!catchRecord) return;
    
    const newTrophy: TrophyRecord = {
      id: Date.now(),
      fishId: catchRecord.fishId,
      weight: catchRecord.weight,
      length: catchRecord.length,
      rank: catchRecord.rank,
      locationId: catchRecord.locationId,
      caughtAt: catchRecord.date,
      createdAt: Date.now()
    };
    
    setTrophies(prev => [...prev, newTrophy]);
    setInventory(prev => prev.filter((_, i) => i !== index));
  };

  const removeTrophy = (trophyId: number) => {
    setTrophies(prev => prev.filter(t => t.id !== trophyId));
  };

  const getEquippedRod = () => {
    return RODS.find(r => r.id === equippedRodId) || RODS[0];
  };

  const getTotalMastery = () => {
    return Object.values(mastery).reduce((total, m) => total + m.stars, 0);
  };

  const addOwnedEquipment = (type: keyof OwnedEquipment, id: string) => {
    setOwnedEquipment(prev => ({
      ...prev,
      [type]: prev[type].includes(id) ? prev[type] : [...prev[type], id]
    }));
  };

  return (
    <GameContext.Provider value={{ 
      coins, addCoins, inventory, mastery, trophies,
      addCatch, sellFish, sellAllFish, makeTrophy, removeTrophy, unlockedMaps,
      selectedBait, setSelectedBait, ownedBaits,
      equippedRodId, setEquippedRodId, getEquippedRod,
      gameMinutes, gameDay, getGameHour, getFormattedTime, getTimeOfDay, isFishActive,
      getTotalMastery,
      equippedSetup, setEquippedSetup,
      ownedEquipment, addOwnedEquipment,
      presets, activePresetId, setActivePresetId, updatePreset, renamePreset,
      featuredFish, isFeaturedFish, getInventoryWeight, canAddToInventory,
      inventoryLimits,
      equippedStringerId, setEquippedStringerId, getEquippedStringer,
      currentLocation, travelTo
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
