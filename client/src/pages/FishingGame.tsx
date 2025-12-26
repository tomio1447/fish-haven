import { useState, useEffect, useRef } from "react";
import { Link, useRoute } from "wouter";
import { useGame } from "@/context/GameContext";
import { FISH_SPECIES, LOCATIONS, spawnFish, getRankColor, getRankBgColor, type FishRank, type FishWithImage, type LocationWithImage } from "@/lib/fishData";
import { ArrowLeft, RefreshCw, Backpack, Star, Fish, Zap } from "lucide-react";
import { WoodCard } from "@/components/ui/wood-card";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

import pondBg from '@assets/generated_images/abandoned_pond_with_wildlife.png';
import creekBg from '@assets/generated_images/narrow_creek_fishing_spot.png';
import creekVideo from '@assets/generated_videos/static_creek_water_flowing.mp4';
import riverBg from '@assets/generated_images/river_bank_fishing_spot.png';

import { BAIT_IMAGES, getBaitImage } from "@/lib/baitAssets";
import { isSetupCompatible, getFishingTypeName } from "@shared/equipment";
import { 
  calculateBaseFishPressure, 
  calculateGearMitigation, 
  calculateFightProbability,
  calculateHitEffectiveness,
  getRodPowerMultiplier
} from "@/lib/tensionEngine";

const bgMap: Record<string, string> = {
  pond: pondBg,
  creek: creekBg,
  river: riverBg
};

type GameState = 'IDLE' | 'CASTING' | 'WAITING' | 'NIBBLING' | 'BITING' | 'REELING' | 'CAUGHT' | 'LOST' | 'MENU';

const FishingFloat = ({ gameState, isNibbling }: { gameState: GameState; isNibbling: boolean }) => {
  const getFloatAnimation = () => {
    if (gameState === 'BITING') {
      return { y: 25, scale: 0.9 };
    }
    if (gameState === 'NIBBLING' || isNibbling) {
      return { y: [0, 5, -2, 4, 0], scale: 1 };
    }
    return { y: [0, -3, 0], scale: 1 };
  };

  const getFloatTransition = () => {
    if (gameState === 'BITING') {
      return { duration: 0.35, ease: "easeIn" as const };
    }
    if (gameState === 'NIBBLING' || isNibbling) {
      return { duration: 0.6, repeat: Infinity, ease: "easeInOut" as const };
    }
    return { duration: 2, repeat: Infinity, ease: "easeInOut" as const };
  };

  return (
    <motion.div
      className="relative"
      initial={{ y: 0, opacity: 0 }}
      animate={{ 
        ...getFloatAnimation(),
        opacity: 1
      }}
      exit={{ opacity: 0, y: 30 }}
      transition={getFloatTransition()}
    >
      <svg width="32" height="56" viewBox="0 0 32 56" className="drop-shadow-lg -translate-x-1/2 -translate-y-1/2">
        <ellipse cx="16" cy="14" rx="10" ry="12" fill="#FF3B30" stroke="#CC2920" strokeWidth="1.5" />
        <ellipse cx="16" cy="10" rx="6" ry="4" fill="#FF6B5B" opacity="0.5" />
        <ellipse cx="16" cy="32" rx="10" ry="12" fill="#FAFAFA" stroke="#E0E0E0" strokeWidth="1.5" />
        <ellipse cx="16" cy="28" rx="6" ry="4" fill="#FFFFFF" opacity="0.7" />
        <line x1="16" y1="44" x2="16" y2="56" stroke="#666" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="22" r="2" fill="#333" />
      </svg>
      {(gameState === 'NIBBLING' || isNibbling) && (
        <motion.div
          className="absolute -top-2 left-1/2 -translate-x-1/2 text-sm font-bold text-yellow-300 drop-shadow-lg"
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1, 0.9] }}
          transition={{ duration: 0.4, repeat: Infinity }}
        >
          ?
        </motion.div>
      )}
    </motion.div>
  );
};

interface SwimmingFish {
  id: string;
  species: FishWithImage;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  nextDirectionChange: number;
}

export default function FishingGame() {
  const [match, params] = useRoute("/fish/:locationId");
  const { addCatch, sellFish, makeTrophy, addCoins, inventory, selectedBait, setSelectedBait, ownedBaits, mastery, getEquippedRod, isFishActive, getTimeOfDay, getFormattedTime, coins, getTotalMastery, presets, activePresetId, setActivePresetId, equippedSetup, featuredFish, isFeaturedFish, getInventoryWeight, inventoryLimits, canAddToInventory } = useGame();
  const locationId = params?.locationId || 'pond';
  
  const rod = getEquippedRod();

  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [tension, setTension] = useState(0);
  const [lineTension, setLineTension] = useState(0); // Line stress (0-100)
  const [rodTension, setRodTension] = useState(0);   // Rod load (0-100)
  const [fishDistance, setFishDistance] = useState(rod.range);
  const [maxDistance, setMaxDistance] = useState(rod.range);
  
  const [currentFish, setCurrentFish] = useState<any>(null);
  const [fishWeight, setFishWeight] = useState(0);
  const [fishSize, setFishSize] = useState(0);
  const [fishRank, setFishRank] = useState<FishRank>('C');
  const [catchTime, setCatchTime] = useState('');
  
  const [isFighting, setIsFighting] = useState(false);
  const [slackTime, setSlackTime] = useState(0);

  const [showBaitMenu, setShowBaitMenu] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const [isTouchPulling, setIsTouchPulling] = useState(false);
  const [energy, setEnergy] = useState(100);
  const [castingPhase, setCastingPhase] = useState<'idle' | 'windup' | 'cast' | 'line' | 'splash'>('idle');
  const [showSplash, setShowSplash] = useState(false);
  const [isNibbling, setIsNibbling] = useState(false);
  const [hitCharge, setHitCharge] = useState(0);
  const [isStunned, setIsStunned] = useState(false);
  const [stunTimeLeft, setStunTimeLeft] = useState(0);

  const [castPosition, setCastPosition] = useState<{ x: number; y: number }>({ x: 50, y: 55 });
  const [isDraggingTarget, setIsDraggingTarget] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  const swimmingFishRef = useRef<SwimmingFish[]>([]);
  const fishCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const attractedFishRef = useRef<SwimmingFish | null>(null);

  const shouldShowToolbar = gameState === 'IDLE' || gameState === 'CAUGHT' || gameState === 'LOST';
  const shouldShowFloat = gameState === 'WAITING' || gameState === 'NIBBLING' || gameState === 'BITING';

  const requestRef = useRef<number>(0);

  const getBaitAttractionRadius = (bait: string): number => {
    switch (bait) {
      case 'worm': return 80;
      case 'bread': return 60;
      case 'lure': return 40;
      default: return 50;
    }
  };

  const spawnSwimmingFish = () => {
    const availableFish = FISH_SPECIES.filter(f => f.locations.includes(locationId));
    const fishCount = 5 + Math.floor(Math.random() * 6);
    const newFish: SwimmingFish[] = [];
    
    for (let i = 0; i < fishCount; i++) {
      const species = availableFish[Math.floor(Math.random() * availableFish.length)];
      const speed = (species.aggression / 10) * 0.5;
      const angle = Math.random() * Math.PI * 2;
      
      newFish.push({
        id: `fish-${i}-${Date.now()}`,
        species,
        x: 10 + Math.random() * 80,
        y: 30 + Math.random() * 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: species.stats.maxWeight * 2 + 10,
        nextDirectionChange: Date.now() + 2000 + Math.random() * 3000
      });
    }
    
    swimmingFishRef.current = newFish;
  };

  useEffect(() => {
    spawnSwimmingFish();
  }, [locationId]);
  
  const bgImage = bgMap[locationId] || pondBg;
  const location = LOCATIONS.find(l => l.id === locationId) as LocationWithImage | undefined;

  // Check if the current fishing type is allowed at this location
  const currentFishingType = equippedSetup.rod?.fishingType;
  const allowedFishingTypes = location?.allowedFishingTypes;
  const isFishingTypeAllowed = !allowedFishingTypes || !currentFishingType || allowedFishingTypes.includes(currentFishingType);
  
  // Get required fishing type name for error message
  const getRequiredFishingTypeMessage = (): string => {
    if (!allowedFishingTypes || allowedFishingTypes.length === 0) return '';
    const typeNames = allowedFishingTypes.map(t => getFishingTypeName(t));
    if (typeNames.length === 1) return `Este local requer ${typeNames[0]}`;
    return `Este local permite apenas: ${typeNames.join(', ')}`;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        setShowBaitMenu(false);
        setShowPresetMenu(false);
        if (gameState === 'WAITING' || gameState === 'NIBBLING' || gameState === 'BITING') {
          setGameState('IDLE');
        }
      }
      
      if (e.code === 'Space') {
        e.preventDefault();
        if (!spacePressed) setSpacePressed(true);
        
        if (gameState === 'IDLE' && isFishingTypeAllowed) castLine();
        if (gameState === 'BITING') hookFish();
        // CAUGHT popup requires clicking a button, not space
        if (gameState === 'LOST') setGameState('IDLE');
      }
      
      if (gameState === 'IDLE') {
        const moveStep = 3;
        switch (e.code) {
          case 'ArrowUp':
            e.preventDefault();
            setCastPosition(prev => ({ ...prev, y: Math.max(30, prev.y - moveStep) }));
            break;
          case 'ArrowDown':
            e.preventDefault();
            setCastPosition(prev => ({ ...prev, y: Math.min(80, prev.y + moveStep) }));
            break;
          case 'ArrowLeft':
            e.preventDefault();
            setCastPosition(prev => ({ ...prev, x: Math.max(10, prev.x - moveStep) }));
            break;
          case 'ArrowRight':
            e.preventDefault();
            setCastPosition(prev => ({ ...prev, x: Math.min(90, prev.x + moveStep) }));
            break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, spacePressed, isFishingTypeAllowed]);

  // TEST MODE: Set to true for instant bites every 5 seconds
  const TEST_MODE = true;
  const TEST_BITE_INTERVAL = 5000; // 5 seconds
  const testBiteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gameStateRef = useRef(gameState);
  
  // Keep ref in sync with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const checkFishAttraction = () => {
    if (gameStateRef.current !== 'WAITING') return;
    
    // TEST MODE: Force bite after 5 seconds
    if (TEST_MODE) {
      if (!testBiteTimerRef.current) {
        testBiteTimerRef.current = setTimeout(() => {
          testBiteTimerRef.current = null;
          if (gameStateRef.current === 'WAITING') {
            setGameState('BITING');
            setTimeout(() => {
              setGameState(prev => prev === 'BITING' ? 'IDLE' : prev);
              attractedFishRef.current = null;
            }, 3000); // 3 second window to hook
          }
        }, TEST_BITE_INTERVAL);
      }
      fishCheckTimeoutRef.current = setTimeout(checkFishAttraction, 250);
      return;
    }
    
    // ORIGINAL LOGIC (preserved for when TEST_MODE is false)
    const attractionRadius = getBaitAttractionRadius(selectedBait);
    const attractionRadiusPercent = attractionRadius / 10;
    
    const now = Date.now();
    swimmingFishRef.current = swimmingFishRef.current.map(fish => {
      const speed = (fish.species.aggression / 10) * 0.5;
      
      if (now >= fish.nextDirectionChange) {
        const angle = Math.random() * Math.PI * 2;
        return {
          ...fish,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          nextDirectionChange: now + 2000 + Math.random() * 3000
        };
      }
      
      let newX = fish.x + fish.vx;
      let newY = fish.y + fish.vy;
      let newVx = fish.vx;
      let newVy = fish.vy;
      
      if (newX < 10 || newX > 90) {
        newVx = -newVx;
        newX = Math.max(10, Math.min(90, newX));
      }
      if (newY < 30 || newY > 80) {
        newVy = -newVy;
        newY = Math.max(30, Math.min(80, newY));
      }
      
      return { ...fish, x: newX, y: newY, vx: newVx, vy: newVy };
    });
    
    for (const fish of swimmingFishRef.current) {
      const dx = fish.x - castPosition.x;
      const dy = fish.y - castPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= attractionRadiusPercent) {
        const prefersBait = fish.species.preferredBaits.includes(selectedBait);
        const biteChance = prefersBait ? 0.85 : 0.5;
        
        if (Math.random() < biteChance) {
          attractedFishRef.current = fish;
          
          const hasNibbling = Math.random() > 0.4;
          if (hasNibbling) {
            setGameState('NIBBLING');
            setIsNibbling(true);
            const nibbleDelay = 400 + Math.random() * 600;
            setTimeout(() => {
              setIsNibbling(false);
              setGameState('BITING');
              setTimeout(() => {
                setGameState(prev => prev === 'BITING' ? 'IDLE' : prev);
                attractedFishRef.current = null;
              }, 1500);
            }, nibbleDelay);
          } else {
            setGameState('BITING');
            setTimeout(() => {
              setGameState(prev => prev === 'BITING' ? 'IDLE' : prev);
              attractedFishRef.current = null;
            }, 1500);
          }
          return;
        }
      }
    }
    
    fishCheckTimeoutRef.current = setTimeout(checkFishAttraction, 250);
  };

  const castLine = () => {
    // Check fishing type restriction
    if (!isFishingTypeAllowed) {
      return; // Blocked - UI shows the message
    }
    
    if (ownedBaits[selectedBait] <= 0 && selectedBait !== 'lure') {
      alert("Você está sem iscas! Compre mais na loja.");
      return;
    }
    if (energy < 5) {
      alert("Sem energia! Descanse um pouco.");
      return;
    }
    
    if (fishCheckTimeoutRef.current) {
      clearTimeout(fishCheckTimeoutRef.current);
      fishCheckTimeoutRef.current = null;
    }
    attractedFishRef.current = null;
    
    setEnergy(prev => Math.max(0, prev - 5));
    setGameState('CASTING');
    setMaxDistance(rod.range);
    setFishDistance(rod.range); 
    setTension(0);
    setShowSplash(false);
    
    setCastingPhase('windup');
    setTimeout(() => {
      setCastingPhase('cast');
      setTimeout(() => {
        setCastingPhase('line');
        setTimeout(() => {
          setCastingPhase('splash');
          setShowSplash(true);
          setTimeout(() => {
            setShowSplash(false);
            setCastingPhase('idle');
            setGameState('WAITING');
            setIsNibbling(false);
            
            setTimeout(() => {
              checkFishAttraction();
            }, 1000);
          }, 400);
        }, 400);
      }, 300);
    }, 300);
  };

  const hookFish = () => {
    if (gameState !== 'BITING') return;
    
    if (fishCheckTimeoutRef.current) {
      clearTimeout(fishCheckTimeoutRef.current);
      fishCheckTimeoutRef.current = null;
    }
    
    let selectedSpecies;
    
    if (attractedFishRef.current) {
      selectedSpecies = attractedFishRef.current.species;
      
      swimmingFishRef.current = swimmingFishRef.current.filter(
        f => f.id !== attractedFishRef.current!.id
      );
      attractedFishRef.current = null;
    } else {
      const availableFish = FISH_SPECIES.filter(f => f.locations.includes(locationId));
      
      const fishChances = availableFish.map(fish => {
        let baseChance = 12;
        
        if (fish.price <= 20) baseChance = 18;
        else if (fish.price <= 50) baseChance = 14;
        else if (fish.price <= 100) baseChance = 8;
        else baseChance = 4;
        
        const aggressionBonus = Math.floor(fish.aggression / 3);
        baseChance += aggressionBonus;
        
        if (fish.preferredBaits.includes(selectedBait)) {
          baseChance += 5;
        }
        
        if (isFishActive(fish)) {
          baseChance += 5;
        } else {
          baseChance = Math.max(2, baseChance - 2);
        }
        
        return { fish, chance: Math.min(20, Math.max(2, baseChance)) };
      });
      
      const roll = Math.floor(Math.random() * 20) + 1;
      
      let successfulFish = fishChances.filter(fc => roll <= fc.chance);
      
      if (successfulFish.length === 0) {
        successfulFish = [fishChances.reduce((a, b) => a.chance > b.chance ? a : b)];
      }
      
      const selectedFishData = successfulFish.reduce((a, b) => a.chance < b.chance ? a : b);
      selectedSpecies = selectedFishData.fish;
    }
    
    const spawned = spawnFish(selectedSpecies, locationId);
    
    // Apply maxRankByHookSize restriction
    let finalRank = spawned.rank;
    const equippedHookSize = equippedSetup.hook?.size;
    
    if (selectedSpecies.maxRankByHookSize && equippedHookSize !== undefined) {
      const maxRankForHook = selectedSpecies.maxRankByHookSize[equippedHookSize];
      if (maxRankForHook) {
        // Rank order: S > A > B > C
        const rankOrder: FishRank[] = ['C', 'B', 'A', 'S'];
        const spawnedRankIndex = rankOrder.indexOf(spawned.rank);
        const maxRankIndex = rankOrder.indexOf(maxRankForHook);
        
        if (spawnedRankIndex > maxRankIndex) {
          finalRank = maxRankForHook;
        }
      }
    }
    
    const fishWithImage = FISH_SPECIES.find(f => f.id === selectedSpecies.id) || selectedSpecies;
    
    setCurrentFish(fishWithImage);
    setFishWeight(spawned.weight);
    setFishSize(Math.round(spawned.length));
    setFishRank(finalRank);
    setGameState('REELING');
    setTension(50); // Start in middle of safe zone
    setSlackTime(0);
    setIsFighting(true);
    // Reset HIT system
    setHitCharge(0);
    setIsStunned(false);
    setStunTimeLeft(0);
    hitChargeRef.current = 0;
    stunTimerRef.current = 0;
    highTensionTimerRef.current = 0;
    slackTimerRef.current = 0;
  };

  const handlePullButton = () => {
    if (gameState === 'IDLE') castLine();
    else if (gameState === 'LOST') setGameState('IDLE');
    // CAUGHT popup requires clicking a specific button (Guardar/Vender)
  };

  const handleHookAttempt = () => {
    if (gameState === 'NIBBLING') {
      setGameState('LOST');
      setCurrentFish(null);
      attractedFishRef.current = null;
    } else if (gameState === 'BITING') {
      hookFish();
    }
  };

  // Refs for real-time game state (avoids stale closure issues)
  const tensionRef = useRef(tension);
  const fishDistanceRef = useRef(fishDistance);
  const spacePressedRef = useRef(spacePressed);
  const isTouchPullingRef = useRef(isTouchPulling);
  const isFightingRef = useRef(isFighting);
  const lastFrameRef = useRef(performance.now());
  const highTensionTimerRef = useRef(0);
  const slackTimerRef = useRef(0);
  const hitChargeRef = useRef(0);
  const stunTimerRef = useRef(0);

  // Keep refs in sync
  useEffect(() => { tensionRef.current = tension; }, [tension]);
  useEffect(() => { fishDistanceRef.current = fishDistance; }, [fishDistance]);
  useEffect(() => { spacePressedRef.current = spacePressed; }, [spacePressed]);
  useEffect(() => { isTouchPullingRef.current = isTouchPulling; }, [isTouchPulling]);
  useEffect(() => { isFightingRef.current = isFighting; }, [isFighting]);
  useEffect(() => { hitChargeRef.current = hitCharge; }, [hitCharge]);

  const handleHitTrigger = () => {
    if (hitChargeRef.current >= 100 && gameStateRef.current === 'REELING') {
      const hitPower = hitChargeRef.current;
      const currentFishWeight = fishWeight || 1;
      const fishFightStrength = currentFish?.fightStrength || 5;
      const rodPowerMod = rod.power || 1;
      
      // Calculate stun effectiveness based on fish weight and equipment
      const { stunDuration, wasEffective } = calculateHitEffectiveness(
        hitPower,
        currentFishWeight,
        fishFightStrength,
        rodPowerMod
      );
      
      hitChargeRef.current = 0;
      setHitCharge(0);
      
      // Stun duration in seconds (convert from ms)
      const stunSeconds = stunDuration / 1000;
      stunTimerRef.current = stunSeconds;
      setIsStunned(true);
      setStunTimeLeft(stunSeconds);
      setIsFighting(false);
    }
  };

  const updateGame = () => {
    const now = performance.now();
    const delta = Math.min((now - lastFrameRef.current) / 1000, 0.1); // Cap at 100ms
    lastFrameRef.current = now;

    if (gameStateRef.current === 'REELING') {
      const difficulty = currentFish?.fightStrength || 5;
      const aggression = currentFish?.aggression || 5;
      
      // Handle stun timer
      if (stunTimerRef.current > 0) {
        stunTimerRef.current -= delta;
        setStunTimeLeft(Math.max(0, stunTimerRef.current));
        if (stunTimerRef.current <= 0) {
          setIsStunned(false);
          stunTimerRef.current = 0;
        }
      }
      
      const isCurrentlyStunned = stunTimerRef.current > 0;
      
      // Dynamic fight probability based on fish stats and tension
      const fightProb = calculateFightProbability(
        aggression,
        difficulty,
        tensionRef.current,
        spacePressedRef.current || isTouchPullingRef.current
      );
      
      // More aggressive/stronger fish fight more often
      if (!isCurrentlyStunned && Math.random() < fightProb * delta * 2) {
        setIsFighting(prev => !prev);
      }

      // TENSION MECHANICS - WEIGHT-BASED SYSTEM
      // Heavier fish = harder to control tension
      // Better equipment = easier to mitigate fish pressure
      // Aggressive fish = more erratic tension spikes
      
      const SAFE_LOW = 35;
      const SAFE_HIGH = 65;
      const DANGER_HIGH = 85;
      const SLACK_LOW = 20;
      
      const currentTension = tensionRef.current;
      const isPulling = spacePressedRef.current || isTouchPullingRef.current;
      const fighting = isCurrentlyStunned ? false : isFightingRef.current;
      
      // Calculate fish pressure based on weight, aggression and fight strength
      const currentFishWeight = fishWeight || 1;
      const baseFishPressure = calculateBaseFishPressure(
        currentFishWeight,
        aggression,
        difficulty
      );
      
      // Calculate gear mitigation (rod power, line strength, reel drag)
      const lineTestWeight = equippedSetup?.line?.testWeightLb || 10;
      const reelDrag = equippedSetup?.reel?.maxDragLb || 8;
      const rodPowerMod = rod.power || 1;
      
      const gearMitigation = calculateGearMitigation(
        rodPowerMod,
        lineTestWeight,
        reelDrag
      );
      
      // Effective fish pressure after gear mitigation
      const effectiveFishPressure = baseFishPressure / gearMitigation;
      
      let tensionDelta = 0;
      
      // Pull power scales with rod power and inversely with fish weight
      const weightPenalty = Math.max(0.5, 1 - (currentFishWeight / 30) * 0.3);
      const pullPower = 12 * rod.power * weightPenalty;
      
      // Relaxation rate increases with heavier fish (harder to maintain slack)
      const relaxRate = 18 + (currentFishWeight * 0.8);
      
      if (isPulling) {
        tensionDelta += pullPower * delta;
        
        // Fighting fish adds extra pressure when pulling
        if (fighting) {
          const fightIntensity = 1 + (aggression / 10) * 1.5;
          tensionDelta += effectiveFishPressure * fightIntensity * delta;
        }
      } else {
        tensionDelta -= relaxRate * delta;
        
        // Fighting fish still adds some pressure even when not pulling
        if (fighting) {
          tensionDelta += effectiveFishPressure * 0.4 * delta;
        }
      }
      
      // Apply tension change
      const newTension = Math.max(0, Math.min(100, currentTension + tensionDelta));
      tensionRef.current = newTension;
      setTension(newTension);
      
      // Calculate LINE tension (fish weight vs line test strength)
      // Line tension increases when pulling and fish is heavy relative to line capacity
      const fishWeightLb = currentFishWeight * 2.205; // kg to lb
      const lineCapacity = lineTestWeight;
      const lineLoadRatio = fishWeightLb / lineCapacity;
      const lineStress = Math.min(100, Math.max(0, 
        isPulling 
          ? (newTension * 0.4 + lineLoadRatio * 60) // Pulling increases line stress
          : (newTension * 0.3 + lineLoadRatio * 30) // Slack reduces stress
      ));
      setLineTension(lineStress);
      
      // Calculate ROD tension (fish weight vs rod power capacity)
      // Rod tension based on current bend and fish resistance
      const rodCapacityLb = equippedSetup?.rod?.maxLineWeightLb || 6;
      const rodLoadRatio = fishWeightLb / rodCapacityLb;
      const rodStress = Math.min(100, Math.max(0,
        isPulling
          ? (newTension * 0.5 + rodLoadRatio * 50) // Pulling bends rod more
          : (newTension * 0.2 + rodLoadRatio * 20) // Relaxed rod has less stress
      ));
      setRodTension(rodStress);

      // DISTANCE MECHANICS - LINE REELS AUTOMATICALLY IN SAFE ZONE
      const currentDistance = fishDistanceRef.current;
      let distanceDelta = 0;
      
      // In safe zone = automatic reeling!
      if (newTension >= SAFE_LOW && newTension <= SAFE_HIGH) {
        distanceDelta = -0.6 * rod.power * delta;
        
        // Charge HIT bar faster in safe zone
        const newCharge = Math.min(100, hitChargeRef.current + 15 * delta);
        hitChargeRef.current = newCharge;
        setHitCharge(newCharge);
      }
      // Too high tension - can't reel
      else if (newTension > DANGER_HIGH) {
        distanceDelta = 0;
        // Still charge HIT bar but slower
        const newCharge = Math.min(100, hitChargeRef.current + 5 * delta);
        hitChargeRef.current = newCharge;
        setHitCharge(newCharge);
      }
      // Slack - fish swims away
      else if (newTension < SLACK_LOW) {
        distanceDelta = 0.4 * difficulty * delta;
      }
      // Between slack and safe zone - slow reeling
      else if (newTension >= SLACK_LOW && newTension < SAFE_LOW) {
        distanceDelta = -0.2 * rod.power * delta;
        const newCharge = Math.min(100, hitChargeRef.current + 8 * delta);
        hitChargeRef.current = newCharge;
        setHitCharge(newCharge);
      }
      // Between safe zone and danger - slow reeling
      else if (newTension > SAFE_HIGH && newTension <= DANGER_HIGH) {
        distanceDelta = -0.3 * rod.power * delta;
        const newCharge = Math.min(100, hitChargeRef.current + 8 * delta);
        hitChargeRef.current = newCharge;
        setHitCharge(newCharge);
      }
      
      // Fish fighting pulls away (not when stunned)
      if (fighting && !isCurrentlyStunned) {
        distanceDelta += 0.25 * (difficulty / 5) * delta;
      }
      
      const newDistance = Math.max(0, Math.min(maxDistance * 1.5, currentDistance + distanceDelta));
      fishDistanceRef.current = newDistance;
      setFishDistance(newDistance);

      // HIGH TENSION TIMER - line breaks after sustained high tension
      if (newTension > 90) {
        highTensionTimerRef.current += delta;
        if (highTensionTimerRef.current > 2) { // 2 seconds to break
          setGameState('LOST');
          return;
        }
      } else {
        highTensionTimerRef.current = Math.max(0, highTensionTimerRef.current - delta * 2);
      }

      // SLACK TIMER - fish escapes after sustained slack
      if (newTension < SLACK_LOW) {
        slackTimerRef.current += delta;
        if (slackTimerRef.current > 4) { // 4 seconds of slack
          setGameState('LOST');
          return;
        }
      } else {
        slackTimerRef.current = Math.max(0, slackTimerRef.current - delta);
      }

      // WIN/LOSE CONDITIONS
      if (newDistance <= 0.3) {
        setCatchTime(getFormattedTime());
        setGameState('CAUGHT');
      } else if (newDistance >= maxDistance * 1.5) {
        setGameState('LOST');
      }
    }
    requestRef.current = requestAnimationFrame(updateGame);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [gameState, spacePressed, currentFish, rod, isFighting]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => Math.min(100, prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (fishCheckTimeoutRef.current) {
        clearTimeout(fishCheckTimeoutRef.current);
      }
    };
  }, []);

  const timeOfDay = getTimeOfDay();
  
  const getDayNightOverlay = () => {
    switch (timeOfDay) {
      case 'dawn':
        return 'bg-gradient-to-b from-orange-400/20 via-transparent to-transparent';
      case 'day':
        return 'bg-transparent';
      case 'dusk':
        return 'bg-gradient-to-b from-orange-500/30 via-purple-500/10 to-transparent';
      case 'night':
        return 'bg-gradient-to-b from-blue-900/50 via-blue-900/30 to-blue-900/20';
      default:
        return '';
    }
  };

  const getDayNightFilter = () => {
    switch (timeOfDay) {
      case 'dawn':
        return 'brightness(0.95) saturate(1.1)';
      case 'day':
        return 'brightness(1) saturate(1)';
      case 'dusk':
        return 'brightness(0.85) saturate(0.9) sepia(0.1)';
      case 'night':
        return 'brightness(0.5) saturate(0.7) contrast(1.1)';
      default:
        return '';
    }
  };

  const getRodBend = () => {
    if (gameState !== 'REELING') return 0;
    return Math.min(45, tension * 0.45);
  };

  const getFishPosition = () => {
    const progress = 1 - (fishDistance / rod.range);
    return Math.max(0, Math.min(100, progress * 100));
  };

  const getTensionColor = () => {
    if (tension < 30) return 'from-green-400 to-green-500';
    if (tension < 60) return 'from-green-400 via-yellow-400 to-yellow-500';
    if (tension < 85) return 'from-yellow-400 via-orange-400 to-orange-500';
    return 'from-orange-500 via-red-500 to-red-600';
  };

  const getCreekFilter = () => {
    switch (timeOfDay) {
      case 'dawn':
        return 'brightness(0.95)';
      case 'day':
        return 'brightness(1)';
      case 'dusk':
        return 'brightness(0.85)';
      case 'night':
        return 'brightness(0.5) contrast(1.1)';
      default:
        return '';
    }
  };

  const updateCastPositionFromEvent = (clientX: number, clientY: number) => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setCastPosition({
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(30, Math.min(80, y))
    });
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'IDLE') return;
    e.preventDefault();
    setIsDraggingTarget(true);
    if ('touches' in e) {
      updateCastPositionFromEvent(e.touches[0].clientX, e.touches[0].clientY);
    } else {
      updateCastPositionFromEvent(e.clientX, e.clientY);
    }
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingTarget || gameState !== 'IDLE') return;
    e.preventDefault();
    if ('touches' in e) {
      updateCastPositionFromEvent(e.touches[0].clientX, e.touches[0].clientY);
    } else {
      updateCastPositionFromEvent(e.clientX, e.clientY);
    }
  };

  const handleDragEnd = () => {
    setIsDraggingTarget(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden select-none font-body">
      {locationId === 'creek' ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-all duration-[5000ms]"
          style={{ filter: getCreekFilter() }}
        >
          <source src={creekVideo} type="video/mp4" />
        </video>
      ) : (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-[5000ms]"
          style={{ 
            backgroundImage: `url(${bgImage})`,
            filter: getDayNightFilter()
          }}
        />
      )}
      
      <div className={cn(
        "absolute inset-0 transition-all duration-[5000ms] pointer-events-none",
        getDayNightOverlay()
      )} />

      {/* Drag Area for Target - only active in IDLE */}
      {gameState === 'IDLE' && (
        <div
          ref={gameAreaRef}
          className="absolute inset-0 z-10 cursor-crosshair"
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          data-testid="drag-area"
        />
      )}


      {/* TOP LEFT HUD */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2" data-testid="hud-left">
        {/* Energy Bar */}
        <div className="flex items-center gap-2">
          <div className="w-40 h-5 bg-gray-800/80 rounded-sm border border-gray-600 overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
              style={{ width: `${energy}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
              {Math.round(energy)}/100
            </span>
          </div>
          <Zap className="w-4 h-4 text-green-400" />
        </div>

        {/* Coins and Mastery */}
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1 bg-amber-900/80 px-2 py-1 rounded border border-amber-700">
            <span className="text-sm">🪱</span>
            <span className="text-sm font-bold text-yellow-300" data-testid="text-coins">{coins}</span>
          </div>
          <div className="flex items-center gap-1 bg-purple-900/80 px-2 py-1 rounded border border-purple-700">
            <Star className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-bold text-purple-300" data-testid="text-mastery">Maestria: {getTotalMastery()}</span>
          </div>
        </div>

        {/* Timer */}
        <div className="bg-red-800/90 px-3 py-1 rounded border border-red-600 mt-1">
          <span className="text-sm font-mono font-bold text-white" data-testid="text-time">
            {getFormattedTime()}
          </span>
        </div>

        {/* Back Button */}
        <Link href="/map">
          <button 
            className="mt-2 bg-amber-800/90 hover:bg-amber-700 p-2 rounded border-2 border-amber-600 transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 text-amber-200" />
          </button>
        </Link>
      </div>

      {/* TOP CENTER - Location Badge */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20" data-testid="location-badge">
        <div className="relative">
          <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 px-6 py-2 rounded-sm border-2 border-amber-500 shadow-lg">
            <span className="text-white font-bold text-lg drop-shadow" data-testid="text-location">
              {location?.name || 'Fishing Spot'}
            </span>
          </div>
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[12px] border-t-transparent border-r-[12px] border-r-amber-800 border-b-[12px] border-b-transparent" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[12px] border-t-transparent border-l-[12px] border-l-amber-800 border-b-[12px] border-b-transparent" />
        </div>
      </div>

      {/* TOP RIGHT - Shop Button (only when line not in water) */}
      {(gameState === 'IDLE' || gameState === 'CAUGHT' || gameState === 'LOST') && (
        <div className="absolute top-3 right-3 z-20" data-testid="hud-right">
          <Link href="/shop">
            <motion.button 
              className="bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 px-4 py-2 rounded-lg border-2 border-emerald-400 shadow-lg flex items-center gap-2 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-testid="button-shop"
            >
              <span className="text-xl">🛒</span>
              <span className="text-white font-bold text-sm">Loja</span>
            </motion.button>
          </Link>
        </div>
      )}

      {/* CENTER FISHING AREA */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        
        {/* Casting Animation */}
        {gameState === 'CASTING' && (
          <div className="absolute inset-0">
            {/* Animated Fishing Rod during casting */}
            <motion.div 
              className="absolute bottom-32 left-1/4 origin-bottom-left"
              animate={{
                rotate: castingPhase === 'windup' ? -60 : 
                        castingPhase === 'cast' ? 15 : 
                        castingPhase === 'line' || castingPhase === 'splash' ? -30 : -30
              }}
              transition={{ 
                duration: castingPhase === 'windup' ? 0.3 : 0.25,
                ease: castingPhase === 'cast' ? [0.25, 0.46, 0.45, 0.94] : "easeOut"
              }}
            >
              <svg width="200" height="300" className="overflow-visible">
                <motion.path
                  d={`M 0 300 Q 50 150 180 50`}
                  stroke="#8B4513"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  animate={{
                    d: castingPhase === 'windup' ? 'M 0 300 Q 30 180 160 80' :
                       castingPhase === 'cast' ? 'M 0 300 Q 80 100 200 20' :
                       'M 0 300 Q 50 150 180 50'
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.path
                  d={`M 0 300 Q 50 150 180 50`}
                  stroke="#A0522D"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  animate={{
                    d: castingPhase === 'windup' ? 'M 0 300 Q 30 180 160 80' :
                       castingPhase === 'cast' ? 'M 0 300 Q 80 100 200 20' :
                       'M 0 300 Q 50 150 180 50'
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.circle 
                  cx="180" 
                  cy="50" 
                  r="6" 
                  fill="#CD853F" 
                  stroke="#8B4513" 
                  strokeWidth="2"
                  animate={{
                    cx: castingPhase === 'windup' ? 160 : castingPhase === 'cast' ? 200 : 180,
                    cy: castingPhase === 'windup' ? 80 : castingPhase === 'cast' ? 20 : 50
                  }}
                  transition={{ duration: 0.2 }}
                />
              </svg>
            </motion.div>

            {/* Flying line/bait projectile */}
            {(castingPhase === 'line' || castingPhase === 'splash') && (
              <motion.div
                className="absolute"
                initial={{ left: '30%', bottom: '50%', opacity: 1, scale: 1 }}
                animate={{ 
                  left: '55%', 
                  bottom: '35%',
                  opacity: castingPhase === 'splash' ? 0 : 1,
                  scale: castingPhase === 'splash' ? 0.3 : 1
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <motion.div
                  className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg"
                  animate={{ rotate: [0, 360, 720] }}
                  transition={{ duration: 0.4, ease: "linear" }}
                />
                <motion.div
                  className="absolute top-1/2 right-full w-8 h-0.5 bg-white/40"
                  style={{ transformOrigin: 'right center' }}
                />
              </motion.div>
            )}

            {/* Fishing line trail during casting */}
            {(castingPhase === 'cast' || castingPhase === 'line') && (
              <svg className="absolute inset-0 w-full h-full overflow-visible">
                <motion.path
                  d="M 25% 68% Q 40% 50% 55% 65%"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1.5"
                  fill="none"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </svg>
            )}

            {/* Casting text indicator */}
            <motion.div
              className="absolute top-1/3 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <span className="text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {castingPhase === 'windup' && '🎣 Preparando...'}
                {castingPhase === 'cast' && '💨 Arremessando!'}
                {castingPhase === 'line' && '🌊 Lançando...'}
                {castingPhase === 'splash' && '💦 Splash!'}
              </span>
            </motion.div>
          </div>
        )}

        {/* Splash Effect */}
        <AnimatePresence>
          {showSplash && (
            <motion.div
              className="absolute left-1/2 bottom-[35%] -translate-x-1/2"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Central splash */}
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-300/80"
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Ripple rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-400/60"
                  initial={{ width: 10, height: 10, opacity: 0.8 }}
                  animate={{ 
                    width: 80 + i * 40, 
                    height: 40 + i * 20, 
                    opacity: 0 
                  }}
                  transition={{ duration: 0.5 + i * 0.1, delay: i * 0.1, ease: "easeOut" }}
                />
              ))}
              
              {/* Water droplets */}
              {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const distance = 30 + Math.random() * 20;
                return (
                  <motion.div
                    key={i}
                    className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-cyan-300"
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ 
                      x: Math.cos(angle) * distance,
                      y: Math.sin(angle) * distance - 20,
                      opacity: 0,
                      scale: 0.3
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fishing Rod Visual */}
        {(gameState === 'WAITING' || gameState === 'BITING' || gameState === 'REELING') && (
          <div className="absolute bottom-32 left-1/4 origin-bottom-left">
            <svg 
              width="200" 
              height="300" 
              className="overflow-visible"
              style={{ transform: `rotate(${-30 + getRodBend()}deg)` }}
            >
              <path
                d={`M 0 300 Q ${50 + getRodBend()} ${150 - getRodBend() * 2} 180 ${50 + getRodBend()}`}
                stroke="#8B4513"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d={`M 0 300 Q ${50 + getRodBend()} ${150 - getRodBend() * 2} 180 ${50 + getRodBend()}`}
                stroke="#A0522D"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="180" cy={50 + getRodBend()} r="6" fill="#CD853F" stroke="#8B4513" strokeWidth="2" />
              {gameState === 'REELING' && (
                <line
                  x1="180"
                  y1={50 + getRodBend()}
                  x2="180"
                  y2={150 + getRodBend()}
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth={tension > 80 ? 2 : 1}
                  className={cn(tension > 80 && "animate-pulse")}
                />
              )}
            </svg>
          </div>
        )}

        {/* Fishing UI Panel (when reeling) */}
        {gameState === 'REELING' && currentFish && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl pointer-events-auto">
            <div className="flex items-stretch gap-3">
              
              {/* LEFT: Line Tension Vertical Bar */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-cyan-300 mb-1">LINHA</span>
                <div className="relative w-5 h-32 bg-gray-900/80 rounded-lg border border-cyan-600/50 overflow-hidden">
                  <div 
                    className={cn(
                      "absolute bottom-0 w-full transition-all duration-100",
                      lineTension > 85 ? "bg-gradient-to-t from-red-500 to-red-400 animate-pulse" :
                      lineTension > 65 ? "bg-gradient-to-t from-orange-500 to-yellow-400" :
                      lineTension > 35 ? "bg-gradient-to-t from-cyan-500 to-cyan-400" :
                      "bg-gradient-to-t from-cyan-600 to-cyan-500"
                    )}
                    style={{ height: `${Math.min(100, lineTension)}%` }}
                  />
                  {/* Safe zone markers */}
                  <div className="absolute left-0 right-0 bottom-[35%] h-0.5 bg-green-400/60" />
                  <div className="absolute left-0 right-0 bottom-[65%] h-0.5 bg-green-400/60" />
                  <div className="absolute left-0 right-0 bottom-[85%] h-0.5 bg-red-400/60" />
                </div>
                <span className="text-[8px] font-bold text-white/70 mt-1">{Math.round(lineTension)}%</span>
              </div>
              
              {/* CENTER: Main Panel */}
              <div className="flex-1 bg-black/70 backdrop-blur-md rounded-xl border border-white/20 p-3 space-y-2">
              
              {/* Fish Distance Track */}
              <div className="relative h-10 bg-blue-900/50 rounded-lg border border-blue-400/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-400/20 to-blue-500/20" />
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20" />
                
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: `${getFishPosition()}%` }}
                  animate={{ 
                    y: isFighting ? [-4, 4, -4] : [-1, 1, -1],
                    rotate: isFighting ? [-10, 10, -10] : [0, 0, 0]
                  }}
                  transition={{ duration: isFighting ? 0.3 : 1, repeat: Infinity }}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                    isFighting ? "bg-red-500/80" : "bg-blue-500/80"
                  )}>
                    <Fish className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
                
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-green-400 text-lg">🎣</div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/70 font-bold bg-black/50 px-2 py-0.5 rounded">
                  {fishDistance.toFixed(1)}m
                </div>
              </div>

              {/* Tension Bar */}
              <div>
                <div className="relative h-5 bg-gray-900/80 rounded-full border border-gray-600 overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-100 bg-gradient-to-r",
                      getTensionColor()
                    )}
                    style={{ width: `${Math.min(100, tension)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className={cn(
                      "text-[10px] font-bold drop-shadow-lg",
                      tension > 85 ? "text-red-100 animate-pulse" : 
                      tension < 10 ? "text-yellow-100 animate-pulse" : "text-white"
                    )}>
                      {tension > 85 ? "⚠️ ROMPENDO!" : 
                       tension < 10 ? "⚠️ FROUXA!" : 
                       `Tensão ${Math.round(tension)}%`}
                    </span>
                  </div>
                  {/* Zone markers */}
                  <div className="absolute top-0 left-[35%] w-0.5 h-full bg-green-400/50" />
                  <div className="absolute top-0 left-[65%] w-0.5 h-full bg-green-400/50" />
                  <div className="absolute top-0 left-[85%] w-0.5 h-full bg-red-400/50" />
                </div>
                
                {/* Status Messages */}
                {isStunned && (
                  <div className="text-center mt-1">
                    <span className="text-cyan-400 text-xs font-bold animate-pulse">💫 ATORDOADO! ({Math.ceil(stunTimeLeft)}s)</span>
                  </div>
                )}
                {!isStunned && isFighting && tension > 70 && (
                  <div className="text-center mt-1">
                    <span className="text-red-400 text-xs font-bold animate-pulse">🐟 LUTANDO! SOLTE!</span>
                  </div>
                )}
              </div>

              {/* HIT Bar & Buttons Row */}
              <div className="flex items-center gap-2">
                {/* PUXAR Button */}
                <motion.button
                  onMouseDown={() => setIsTouchPulling(true)}
                  onMouseUp={() => setIsTouchPulling(false)}
                  onMouseLeave={() => setIsTouchPulling(false)}
                  onTouchStart={() => setIsTouchPulling(true)}
                  onTouchEnd={() => setIsTouchPulling(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg font-bold text-sm transition-all select-none",
                    isTouchPulling || spacePressed
                      ? "bg-gradient-to-b from-green-400 to-green-600 border-2 border-green-300 text-white shadow-lg shadow-green-500/50"
                      : "bg-gradient-to-b from-green-600 to-green-800 border-2 border-green-500 text-white"
                  )}
                  whileTap={{ scale: 0.95 }}
                  data-testid="button-pull"
                >
                  PUXAR
                </motion.button>

                {/* HIT Bar */}
                <div className="flex-1 h-4 bg-gray-900/80 rounded-full border border-orange-600 overflow-hidden">
                  <motion.div 
                    className={cn(
                      "h-full transition-all duration-100",
                      hitCharge >= 100 
                        ? "bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 animate-pulse" 
                        : "bg-gradient-to-r from-orange-600 to-orange-400"
                    )}
                    style={{ width: `${hitCharge}%` }}
                  />
                </div>
                
                {/* HIT Button */}
                <motion.button
                  onClick={handleHitTrigger}
                  disabled={hitCharge < 100}
                  className={cn(
                    "px-4 py-3 rounded-lg font-bold text-sm transition-all",
                    hitCharge >= 100
                      ? "bg-gradient-to-b from-orange-500 to-orange-700 border-2 border-orange-400 text-white shadow-lg shadow-orange-500/50 animate-pulse cursor-pointer"
                      : "bg-gray-700 border-2 border-gray-600 text-gray-400 cursor-not-allowed"
                  )}
                  whileTap={hitCharge >= 100 ? { scale: 0.9 } : {}}
                  data-testid="button-hit"
                >
                  HIT!
                </motion.button>
              </div>
              
              <div className="text-center text-[10px] text-white/50">
                {hitCharge >= 100 ? "🔥 HIT pronto! Atordoe o peixe!" : "Segure PUXAR ou ESPAÇO • Mantenha na zona verde"}
              </div>
              </div>
              
              {/* RIGHT: Rod Tension Vertical Bar */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-amber-300 mb-1">VARA</span>
                <div className="relative w-5 h-32 bg-gray-900/80 rounded-lg border border-amber-600/50 overflow-hidden">
                  <div 
                    className={cn(
                      "absolute bottom-0 w-full transition-all duration-100",
                      rodTension > 85 ? "bg-gradient-to-t from-red-500 to-red-400 animate-pulse" :
                      rodTension > 65 ? "bg-gradient-to-t from-orange-500 to-yellow-400" :
                      rodTension > 35 ? "bg-gradient-to-t from-amber-500 to-amber-400" :
                      "bg-gradient-to-t from-amber-600 to-amber-500"
                    )}
                    style={{ height: `${Math.min(100, rodTension)}%` }}
                  />
                  {/* Safe zone markers */}
                  <div className="absolute left-0 right-0 bottom-[35%] h-0.5 bg-green-400/60" />
                  <div className="absolute left-0 right-0 bottom-[65%] h-0.5 bg-green-400/60" />
                  <div className="absolute left-0 right-0 bottom-[85%] h-0.5 bg-red-400/60" />
                </div>
                <span className="text-[8px] font-bold text-white/70 mt-1">{Math.round(rodTension)}%</span>
              </div>
              
            </div>
          </div>
        )}

        {/* Cast Target Marker - visible in IDLE */}
        {gameState === 'IDLE' && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: `${castPosition.x}%`,
              top: `${castPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-dashed border-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              </div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-3 bg-yellow-400" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-3 bg-yellow-400" />
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-3 h-1 bg-yellow-400" />
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-1 bg-yellow-400" />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-yellow-300 font-bold drop-shadow">
              Arraste ou ↑↓←→
            </div>
          </motion.div>
        )}

        {/* Idle Instructions */}
        {gameState === 'IDLE' && !showBaitMenu && isFishingTypeAllowed && (
          <div className="absolute bottom-48 left-1/2 -translate-x-1/2 text-white text-xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-pulse text-center">
            <div>Arraste na tela ou use ↑↓←→</div>
            <div className="text-lg mt-1">Pressione [ESPAÇO] ou toque para lançar</div>
          </div>
        )}

        {/* Fishing Type Restriction Warning */}
        {gameState === 'IDLE' && !isFishingTypeAllowed && (
          <motion.div 
            className="absolute bottom-48 left-1/2 -translate-x-1/2 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="bg-red-900/90 border-2 border-red-500 rounded-lg px-6 py-4 shadow-xl">
              <div className="text-red-300 text-lg font-bold mb-2">⚠️ Equipamento Incompatível</div>
              <div className="text-red-200 text-sm mb-3">{getRequiredFishingTypeMessage()}</div>
              <div className="text-yellow-300 text-xs">
                Seu equipamento: <span className="font-bold">{currentFishingType ? getFishingTypeName(currentFishingType) : 'Nenhum'}</span>
              </div>
              <Link href="/equipment">
                <button className="mt-3 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded text-sm transition-colors">
                  Ir para Oficina
                </button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Bait Attraction Area - visible when bobber is in water */}
        <AnimatePresence>
          {(gameState === 'WAITING' || gameState === 'NIBBLING' || gameState === 'BITING') && (
            <motion.div
              className="absolute pointer-events-none"
              style={{
                left: `${castPosition.x}%`,
                top: `${castPosition.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="rounded-full border-2 border-blue-400/50 bg-blue-400/20"
                style={{
                  width: getBaitAttractionRadius(selectedBait) * 2,
                  height: getBaitAttractionRadius(selectedBait) * 2,
                  transform: 'translate(-50%, -50%)',
                  marginLeft: '50%',
                  marginTop: '50%'
                }}
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fishing Float - positioned at cast position */}
        <AnimatePresence>
          {shouldShowFloat && (
            <motion.div
              className="absolute pointer-events-none"
              style={{
                left: `${castPosition.x}%`,
                top: `${castPosition.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.3 }}
            >
              <FishingFloat gameState={gameState} isNibbling={isNibbling} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bite Alert */}
        {gameState === 'BITING' && (
          <motion.div 
            className="absolute top-1/3 left-1/2 -translate-x-1/2"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          >
            <div className="bg-red-600/90 px-6 py-3 rounded-lg border-4 border-yellow-400 shadow-2xl">
              <span className="text-4xl font-bold text-yellow-300 drop-shadow">! ! ! FISGOU ! ! !</span>
            </div>
          </motion.div>
        )}

        {/* Nibbling Alert */}
        {gameState === 'NIBBLING' && (
          <motion.div 
            className="absolute top-1/3 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0.7, 1, 0.7], y: 0 }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <div className="bg-yellow-600/80 px-5 py-2 rounded-lg border-2 border-yellow-300 shadow-xl">
              <span className="text-2xl font-bold text-yellow-100 drop-shadow">...mordiscando...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* RIGHT SIDE - Pull Button */}
      <AnimatePresence>
        {shouldShowToolbar && (
          <motion.div 
            className="absolute right-4 bottom-1/3 z-20 pointer-events-auto" 
            data-testid="pull-button-container"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              onClick={handlePullButton}
              onMouseDown={() => setSpacePressed(true)}
              onMouseUp={() => setSpacePressed(false)}
              onMouseLeave={() => setSpacePressed(false)}
              onTouchStart={() => setSpacePressed(true)}
              onTouchEnd={() => setSpacePressed(false)}
              disabled={gameState === 'IDLE' && !isFishingTypeAllowed}
              className={cn(
                "relative w-24 h-24 rounded-lg transition-all duration-100",
                gameState === 'IDLE' && !isFishingTypeAllowed 
                  ? "bg-gradient-to-b from-gray-500 to-gray-700 border-4 border-gray-400 cursor-not-allowed opacity-60"
                  : cn(
                      "bg-gradient-to-b from-amber-600 to-amber-800",
                      "border-4 border-amber-500",
                      "shadow-[0_6px_0_#8B4513,0_8px_8px_rgba(0,0,0,0.4)]",
                      spacePressed && "translate-y-1 shadow-[0_2px_0_#8B4513,0_4px_4px_rgba(0,0,0,0.4)]",
                      "hover:from-amber-500 hover:to-amber-700",
                      "active:translate-y-1 active:shadow-[0_2px_0_#8B4513]"
                    )
              )}
              whileTap={gameState === 'IDLE' && !isFishingTypeAllowed ? {} : { scale: 0.95 }}
              data-testid="button-pull"
            >
              <div className={cn(
                "absolute inset-1 rounded border-2",
                gameState === 'IDLE' && !isFishingTypeAllowed ? "border-gray-400/50" : "border-amber-400/50"
              )} />
              <span className={cn(
                "font-bold text-lg drop-shadow",
                gameState === 'IDLE' && !isFishingTypeAllowed ? "text-gray-300" : "text-amber-100"
              )}>
                {gameState === 'IDLE' ? (isFishingTypeAllowed ? 'Pescar' : '🚫') : 'OK'}
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RECOLHER and FISGAR Buttons - appears when line is in water */}
      <AnimatePresence>
        {(gameState === 'WAITING' || gameState === 'NIBBLING' || gameState === 'BITING') && (
          <motion.div 
            className="absolute right-4 bottom-1/3 z-20 pointer-events-auto flex flex-col gap-3" 
            data-testid="reel-in-button-container"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* FISGAR Button - Hook attempt */}
            <motion.button
              onClick={handleHookAttempt}
              onContextMenu={(e) => {
                e.preventDefault();
                handleHookAttempt();
              }}
              className={cn(
                "relative w-24 h-24 rounded-lg transition-all duration-100",
                gameState === 'BITING' 
                  ? "bg-gradient-to-b from-green-500 to-green-700 border-4 border-green-400 shadow-[0_6px_0_#166534,0_8px_8px_rgba(0,0,0,0.4)] animate-pulse"
                  : gameState === 'NIBBLING'
                    ? "bg-gradient-to-b from-yellow-500 to-yellow-700 border-4 border-yellow-400 shadow-[0_6px_0_#a16207,0_8px_8px_rgba(0,0,0,0.4)]"
                    : "bg-gradient-to-b from-red-700 to-red-900 border-4 border-red-600 shadow-[0_6px_0_#7f1d1d,0_8px_8px_rgba(0,0,0,0.4)] opacity-50",
                "hover:opacity-100",
                "active:translate-y-1 active:shadow-[0_2px_0_#166534]"
              )}
              whileTap={{ scale: 0.95 }}
              data-testid="button-hook"
            >
              <div className={cn(
                "absolute inset-1 rounded border-2",
                gameState === 'BITING' ? "border-green-300/50" : gameState === 'NIBBLING' ? "border-yellow-300/50" : "border-red-400/50"
              )} />
              <span className="font-bold text-sm drop-shadow text-white">
                FISGAR
              </span>
              <span className="text-[10px] text-white/70 block mt-1">
                {gameState === 'BITING' ? '🎣 AGORA!' : gameState === 'NIBBLING' ? '⚠️ Espere...' : ''}
              </span>
            </motion.button>

            {/* RECOLHER Button */}
            <motion.button
              onClick={() => setGameState('IDLE')}
              className={cn(
                "relative w-24 h-24 rounded-lg transition-all duration-100",
                "bg-gradient-to-b from-gray-600 to-gray-800",
                "border-4 border-gray-500",
                "shadow-[0_6px_0_#4a5568,0_8px_8px_rgba(0,0,0,0.4)]",
                "hover:from-gray-500 hover:to-gray-700",
                "active:translate-y-1 active:shadow-[0_2px_0_#4a5568]"
              )}
              whileTap={{ scale: 0.95 }}
              data-testid="button-reel-in"
            >
              <div className="absolute inset-1 rounded border-2 border-gray-400/50" />
              <span className="font-bold text-sm drop-shadow text-gray-100">
                RECOLHER
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM TOOLBAR */}
      <AnimatePresence>
        {shouldShowToolbar && (
          <motion.div 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto" 
            data-testid="bottom-toolbar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-1 bg-gradient-to-b from-amber-700 to-amber-900 p-2 rounded-lg border-4 border-amber-600 shadow-2xl">
              {/* Rod Slot - Preset Selector */}
              <button
                onClick={() => setShowPresetMenu(!showPresetMenu)}
                className={cn(
                  "w-16 h-16 bg-amber-950/80 rounded border-2 flex flex-col items-center justify-center relative group",
                  showPresetMenu ? "border-green-400" : "border-amber-500 hover:border-amber-400"
                )}
                title={equippedSetup.rod?.name || 'Sem vara'}
                data-testid="button-preset-select"
              >
                <div className="text-xl">🎣</div>
                <span className="text-[9px] text-amber-200 font-bold mt-0.5">Varas</span>
                <span className="absolute top-0.5 right-0.5 bg-black/70 text-white text-[8px] px-1 rounded font-bold">
                  {activePresetId}
                </span>
              </button>

              {/* Bait Slot */}
              <button
                onClick={() => setShowBaitMenu(!showBaitMenu)}
                className={cn(
                  "w-16 h-16 bg-amber-950/80 rounded border-2 flex flex-col items-center justify-center relative group",
                  showBaitMenu ? "border-green-400" : "border-amber-500 hover:border-amber-400"
                )}
                data-testid="button-bait-select"
              >
                <img 
                  src={getBaitImage(selectedBait)}
                  className="w-8 h-8 object-contain rounded"
                  alt="bait"
                />
                <span className="text-[9px] text-amber-200 font-bold mt-0.5">Iscas</span>
                <span className="absolute top-0.5 right-0.5 bg-black/70 text-white text-[8px] px-1 rounded">
                  {selectedBait === 'lure' ? '∞' : ownedBaits[selectedBait]}
                </span>
              </button>

              {/* Fish Basket / Creel */}
              <button 
                onClick={() => setShowInventoryModal(true)}
                className="w-16 h-16 bg-amber-950/80 rounded border-2 border-amber-500 flex flex-col items-center justify-center hover:border-amber-400 cursor-pointer relative"
                data-testid="button-fish-basket"
              >
                <div className="text-xl">🧺</div>
                <span className="text-[9px] text-amber-200 font-bold mt-0.5">Cesto</span>
                {inventory.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-blue-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {inventory.length}
                  </span>
                )}
              </button>

              {/* Inventory */}
              <Link href="/inventory">
                <button 
                  className="w-16 h-16 bg-amber-950/80 rounded border-2 border-amber-500 flex flex-col items-center justify-center hover:border-amber-400 cursor-pointer"
                  data-testid="button-inventory"
                >
                  <div className="text-xl">🎒</div>
                  <span className="text-[9px] text-amber-200 font-bold mt-0.5">Inventário</span>
                </button>
              </Link>
              
              {/* Map Selection */}
              <button 
                onClick={() => setShowMapModal(true)}
                className="w-16 h-16 bg-amber-950/80 rounded border-2 border-amber-500 flex flex-col items-center justify-center hover:border-amber-400 cursor-pointer"
                data-testid="button-map-select"
              >
                <div className="text-xl">🗺️</div>
                <span className="text-[9px] text-amber-200 font-bold mt-0.5">Mapa</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bait Selection Menu */}
      <AnimatePresence>
        {showBaitMenu && shouldShowToolbar && (
          <>
            <motion.div 
              className="absolute inset-0 z-20 pointer-events-auto"
              onClick={() => setShowBaitMenu(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 bg-amber-900/95 backdrop-blur rounded-lg shadow-xl p-3 border-2 border-amber-600 flex gap-2 pointer-events-auto max-h-[60vh] overflow-y-auto"
              data-testid="bait-menu"
              onWheel={(e) => e.stopPropagation()}
            >
            <button 
              onClick={() => { setSelectedBait('bread'); setShowBaitMenu(false); }}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                selectedBait === 'bread' ? "bg-green-600/50 ring-2 ring-green-400" : "hover:bg-amber-800"
              )}
              data-testid="button-select-bread"
            >
              <img src={getBaitImage('bread')} className="w-12 h-12 object-contain rounded" alt="bread" />
              <span className="text-xs text-amber-200 font-bold">Massa</span>
              <span className="text-[10px] text-amber-400">x{ownedBaits['bread']}</span>
            </button>
            <button 
              onClick={() => { setSelectedBait('worm'); setShowBaitMenu(false); }}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                selectedBait === 'worm' ? "bg-green-600/50 ring-2 ring-green-400" : "hover:bg-amber-800"
              )}
              data-testid="button-select-worm"
            >
              <img src={getBaitImage('worm')} className="w-12 h-12 object-contain rounded" alt="worm" />
              <span className="text-xs text-amber-200 font-bold">Minhoca</span>
              <span className="text-[10px] text-amber-400">x{ownedBaits['worm']}</span>
            </button>
            <button 
              onClick={() => { setSelectedBait('lure'); setShowBaitMenu(false); }}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                selectedBait === 'lure' ? "bg-green-600/50 ring-2 ring-green-400" : "hover:bg-amber-800"
              )}
              data-testid="button-select-lure"
            >
              <img src={getBaitImage('lure')} className="w-12 h-12 object-contain rounded" alt="lure" />
              <span className="text-xs text-amber-200 font-bold">Artificial</span>
              <span className="text-[10px] text-amber-400">∞</span>
            </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Preset Selection Menu */}
      <AnimatePresence>
        {showPresetMenu && shouldShowToolbar && (
          <>
            <motion.div 
              className="absolute inset-0 z-20 pointer-events-auto"
              onClick={() => setShowPresetMenu(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 bg-amber-900/95 backdrop-blur rounded-lg shadow-xl p-3 border-2 border-amber-600 pointer-events-auto max-h-[60vh] overflow-y-auto"
              data-testid="preset-menu"
              onWheel={(e) => e.stopPropagation()}
            >
            <div className="text-amber-200 font-bold text-sm mb-2 text-center">Trocar Montagem</div>
            <div className="flex gap-2">
              {presets.map((preset) => {
                const isActive = preset.id === activePresetId;
                const hasRod = !!preset.setup.rod;
                const hasLine = !!preset.setup.line;
                const validation = (hasRod && hasLine) ? isSetupCompatible({
                  rod: preset.setup.rod!,
                  line: preset.setup.line!,
                  reel: preset.setup.reel,
                  hook: preset.setup.hook,
                  float: preset.setup.float,
                  sinker: preset.setup.sinker,
                  lure: preset.setup.lure
                }) : { valid: false, errors: [] };
                
                return (
                  <button 
                    key={preset.id}
                    onClick={() => { 
                      if (validation.valid) {
                        setActivePresetId(preset.id); 
                        setShowPresetMenu(false); 
                      }
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[70px]",
                      isActive && "bg-green-600/50 ring-2 ring-green-400",
                      !isActive && validation.valid && "hover:bg-amber-800 cursor-pointer",
                      !validation.valid && !isActive && "opacity-40 cursor-not-allowed"
                    )}
                    disabled={!validation.valid}
                    data-testid={`button-preset-${preset.id}`}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center text-2xl",
                      validation.valid ? "bg-green-500/30" : "bg-gray-600/30"
                    )}>
                      {validation.valid ? '🎣' : '❌'}
                    </div>
                    <span className="text-xs text-amber-200 font-bold truncate max-w-[60px]">{preset.name}</span>
                    {hasRod && (
                      <span className={cn(
                        "text-[9px] px-1 rounded",
                        preset.setup.rod?.fishingType === 'float' && "bg-red-500/30 text-red-300",
                        preset.setup.rod?.fishingType === 'baitcasting' && "bg-blue-500/30 text-blue-300",
                        preset.setup.rod?.fishingType === 'bottom' && "bg-amber-500/30 text-amber-300"
                      )}>
                        {preset.setup.rod?.fishingType === 'float' ? 'Boia' : 
                         preset.setup.rod?.fishingType === 'baitcasting' ? 'Carret.' : 'Fundo'}
                      </span>
                    )}
                    {!hasRod && (
                      <span className="text-[9px] text-gray-400">Vazio</span>
                    )}
                  </button>
                );
              })}
            </div>
            <Link href="/equipment">
              <button className="w-full mt-2 text-xs text-amber-300 hover:text-amber-100 py-1">
                Ir para Oficina →
              </button>
            </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Result Screens */}
      <AnimatePresence>
        {gameState === 'CAUGHT' && currentFish && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto"
          >
            <WoodCard className="w-full max-w-md bg-gradient-to-br from-yellow-50 to-orange-100 p-8 text-center space-y-4 relative overflow-visible">
              
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1">
                {[...Array(5)].map((_, i) => {
                    const stars = mastery[currentFish.id]?.stars || 0;
                    return (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.1 * i, type: "spring", stiffness: 200 }}
                        >
                          <Star 
                            className={cn(
                                "w-8 h-8 drop-shadow-md transition-colors", 
                                i < stars ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"
                            )} 
                          />
                        </motion.div>
                    )
                })}
              </div>

              <motion.div
                className={cn(
                  "absolute -top-3 -right-3 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-white",
                  getRankBgColor(fishRank)
                )}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                {fishRank}
              </motion.div>

              <h2 className="text-4xl text-wood-dark mb-2 font-display mt-4">Bela Pesca!</h2>
              
              <div className="relative w-72 h-72 mx-auto my-6" style={{ perspective: '1000px' }}>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-sky-300 via-cyan-200 to-blue-400 rounded-full blur-2xl opacity-60"
                  animate={{ 
                    scale: [1, 1.15, 1],
                    opacity: [0.5, 0.7, 0.5]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/60 rounded-full"
                    style={{
                      left: `${20 + i * 12}%`,
                      bottom: '10%'
                    }}
                    animate={{
                      y: [-10, -80, -10],
                      x: [0, (i % 2 === 0 ? 10 : -10), 0],
                      opacity: [0, 0.8, 0],
                      scale: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 2 + i * 0.3,
                      repeat: Infinity,
                      delay: i * 0.4,
                      ease: "easeOut"
                    }}
                  />
                ))}

                <motion.div
                  className="relative z-10 w-full h-full"
                  animate={{
                    rotateY: [-5, 5, -5],
                    rotateX: [2, -2, 2],
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <img 
                    src={currentFish.image} 
                    alt={currentFish.name} 
                    className="w-full h-full object-cover rounded-2xl shadow-2xl"
                    style={{ 
                      filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.3))',
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent rounded-2xl"
                    animate={{ 
                      x: ['-100%', '200%'],
                      opacity: [0, 0.5, 0]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      repeatDelay: 1.5,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>

                <motion.div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-gradient-to-t from-sky-400/40 to-transparent rounded-full blur-md"
                  animate={{
                    scaleX: [1, 1.1, 1],
                    opacity: [0.4, 0.6, 0.4]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-wood-dark" data-testid="text-fish-name">{currentFish.name}</h3>
                <p className="text-wood/60 text-xs italic">{currentFish.scientificName}</p>
                <p className="text-wood/80 text-sm italic mb-2">"{currentFish.description}"</p>
                
                <motion.p 
                  className={cn("text-sm font-semibold", getRankColor(fishRank))}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {fishRank === 'S' && '✨ Espécime lendário!'}
                  {fishRank === 'A' && '⭐ Exemplar excepcional!'}
                  {fishRank === 'B' && '👍 Bom tamanho!'}
                  {fishRank === 'C' && '🐟 Tamanho comum'}
                </motion.p>

                <div className="grid grid-cols-2 gap-2 mt-4">
                    <motion.div 
                      className="bg-blue-100 p-2 rounded-lg" 
                      data-testid="stat-size"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.05, rotateZ: -1 }}
                    >
                      <div className="text-xs text-blue-600 uppercase font-bold">Tamanho</div>
                      <div className="text-lg font-bold text-blue-800">{fishSize} cm</div>
                    </motion.div>
                    <motion.div 
                      className="bg-green-100 p-2 rounded-lg" 
                      data-testid="stat-weight"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.05, rotateZ: 1 }}
                    >
                      <div className="text-xs text-green-600 uppercase font-bold">Peso</div>
                      <div className="text-lg font-bold text-green-800">{fishWeight} kg</div>
                    </motion.div>
                    <motion.div 
                      className="bg-amber-100 p-2 rounded-lg" 
                      data-testid="stat-bait"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.05, rotateZ: -1 }}
                    >
                      <div className="text-xs text-amber-600 uppercase font-bold">Isca</div>
                      <div className="text-sm font-bold text-amber-800">
                        {selectedBait === 'bread' ? 'Massa de Pão' : selectedBait === 'worm' ? 'Minhoca' : 'Isca Artificial'}
                      </div>
                    </motion.div>
                    <motion.div 
                      className="bg-yellow-100 p-2 rounded-lg" 
                      data-testid="stat-value"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      whileHover={{ scale: 1.05, rotateZ: 1 }}
                    >
                      <div className="text-xs text-yellow-600 uppercase font-bold">Valor</div>
                      <div className="text-lg font-bold text-yellow-800">{currentFish.price} 🪱</div>
                    </motion.div>
                </div>

                <div className="flex justify-between items-center mt-3 px-2 text-xs text-wood/60" data-testid="catch-details">
                    <span>📍 {LOCATIONS.find(l => l.id === locationId)?.name || locationId}</span>
                    <span>🕐 {catchTime}</span>
                </div>

              </div>

              <div className="mt-6 flex gap-3">
                <motion.button 
                  onClick={() => {
                    if (currentFish) {
                      const rankMultiplier = fishRank === 'S' ? 2 : fishRank === 'A' ? 1.5 : fishRank === 'B' ? 1.2 : 1;
                      const sellPrice = Math.round(currentFish.price * rankMultiplier * (fishWeight / ((currentFish.minWeight + currentFish.maxWeight) / 2)));
                      addCoins(sellPrice);
                    }
                    setGameState('IDLE');
                  }}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-white font-display text-lg py-3 rounded-xl border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1 shadow-lg flex items-center justify-center gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  data-testid="button-sell-fish"
                >
                  <span className="text-2xl">🪱</span> Vender
                </motion.button>
                <motion.button 
                  onClick={() => {
                    if (currentFish) {
                      const added = addCatch(currentFish, fishWeight, fishSize, fishRank, locationId);
                      if (!added) {
                        alert('Cesto cheio! Venda alguns peixes para guardar mais.');
                      }
                    }
                    setGameState('IDLE');
                  }}
                  disabled={!canAddToInventory(fishWeight)}
                  className={`flex-1 font-display text-lg py-3 rounded-xl border-b-4 active:border-b-0 active:translate-y-1 shadow-lg flex items-center justify-center gap-2 ${
                    canAddToInventory(fishWeight) 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-800' 
                      : 'bg-gray-500 text-gray-300 border-gray-700 cursor-not-allowed'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={canAddToInventory(fishWeight) ? { scale: 1.03 } : {}}
                  whileTap={canAddToInventory(fishWeight) ? { scale: 0.97 } : {}}
                  data-testid="button-keep-fish"
                >
                  <span className="text-2xl">🎣</span> {canAddToInventory(fishWeight) ? 'Guardar' : 'Cesto Cheio'}
                </motion.button>
              </div>
              
              <p className="text-xs text-wood/50 mt-2">
                {canAddToInventory(fishWeight) 
                  ? '💡 Venda no Mercado (Cesto) para ganhar bônus em peixes em destaque!'
                  : '⚠️ Limite: 20 peixes ou 5kg. Venda peixes para liberar espaço.'}
              </p>
            </WoodCard>
          </motion.div>
        )}

        {gameState === 'LOST' && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto"
          >
            <div className="bg-white rounded-xl p-8 text-center max-w-sm mx-4 shadow-2xl border-4 border-red-100">
              <div className="text-6xl mb-4">💨</div>
              <h2 className="text-3xl font-display text-slate-800 mb-2">Escapou!</h2>
              <p className="text-slate-500 mb-6">A linha arrebentou ou o peixe fugiu.</p>
              <button 
                onClick={() => setGameState('IDLE')}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-8 rounded-full flex items-center gap-2 mx-auto"
                data-testid="button-try-again"
              >
                <RefreshCw className="w-5 h-5" /> Tentar Novamente
              </button>
            </div>
          </motion.div>
        )}

        {/* Inventory Modal */}
        {showInventoryModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={() => setShowInventoryModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-amber-900/95 backdrop-blur rounded-xl p-6 max-w-md w-full mx-4 border-4 border-amber-600 shadow-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-amber-200 flex items-center gap-2">
                    <span className="text-3xl">🧺</span> Cesto de Pesca
                  </h2>
                  <div className="text-amber-400/70 text-sm mt-1">
                    {inventory.length}/{inventoryLimits.maxCount} peixes • {getInventoryWeight().toFixed(2)}/{inventoryLimits.maxWeight}kg
                  </div>
                </div>
                <button 
                  onClick={() => setShowInventoryModal(false)}
                  className="text-amber-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              {featuredFish.fishIds.length > 0 && (
                <div className="mb-4 p-3 bg-green-900/50 rounded-lg border border-green-600/50">
                  <div className="text-green-300 text-xs font-bold uppercase mb-2 flex items-center gap-1">
                    ⭐ Em Destaque no Mercado (+20%)
                  </div>
                  <div className="flex gap-2">
                    {featuredFish.fishIds.slice(0, 3).map(fishId => {
                      const fish = FISH_SPECIES.find((f: FishWithImage) => f.id === fishId);
                      return fish ? (
                        <div key={fishId} className="flex items-center gap-1 bg-green-800/50 px-2 py-1 rounded text-xs text-green-200">
                          <img src={fish.image} alt={fish.name} className="w-5 h-5 object-contain" />
                          <span className="truncate max-w-[60px]">{fish.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              
              {inventory.length === 0 ? (
                <div className="text-center py-8 text-amber-300/60">
                  <div className="text-5xl mb-3">🐟</div>
                  <p>Nenhum peixe no cesto ainda.</p>
                  <p className="text-sm mt-1">Pesque e guarde para vender depois!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {inventory.slice(0, 10).map((catchRecord, index) => {
                    const fishData = FISH_SPECIES.find((f: FishWithImage) => f.id === catchRecord.fishId);
                    if (!fishData) return null;
                    const rankMultiplier = catchRecord.rank === 'S' ? 2 : catchRecord.rank === 'A' ? 1.5 : catchRecord.rank === 'B' ? 1.2 : 1;
                    const fishPrice = Math.round(fishData.pricePerKg * catchRecord.weight * rankMultiplier);
                    return (
                      <div key={index} className="bg-amber-800/50 rounded-lg p-3 border border-amber-600/50">
                        <div className="flex items-center gap-3">
                          <img src={fishData.image} alt={fishData.name} className="w-10 h-10 object-contain" />
                          <div className="flex-1">
                            <div className="text-amber-100 font-bold flex items-center gap-2">
                              {fishData.name}
                              <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                                catchRecord.rank === 'S' ? 'bg-yellow-500 text-yellow-900' :
                                catchRecord.rank === 'A' ? 'bg-purple-500 text-white' :
                                catchRecord.rank === 'B' ? 'bg-blue-500 text-white' :
                                'bg-gray-500 text-white'
                              }`}>{catchRecord.rank}</span>
                            </div>
                            <div className="text-amber-300/70 text-sm">
                              {catchRecord.weight?.toFixed(2)}kg • {catchRecord.length?.toFixed(1)}cm
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sellFish(index, fishPrice);
                            }}
                            className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1"
                          >
                            🪱 {fishPrice}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              makeTrophy(index);
                            }}
                            className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1"
                          >
                            🏆 Troféu
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {inventory.length > 10 && (
                    <p className="text-amber-400 text-center text-sm">+{inventory.length - 10} mais peixes...</p>
                  )}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-amber-600/50">
                <Link href="/inventory">
                  <button className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg">
                    Ver Inventário Completo
                  </button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Map/Exit Modal */}
        {showMapModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={() => setShowMapModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-amber-900/95 backdrop-blur rounded-xl p-6 max-w-sm w-full mx-4 border-4 border-amber-600 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-amber-200 flex items-center gap-2">
                  <span className="text-3xl">🗺️</span> Menu
                </h2>
                <button 
                  onClick={() => setShowMapModal(false)}
                  className="text-amber-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setShowMapModal(false)}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <span className="text-xl">🎣</span> Continuar Pescando
                </button>
                
                <Link href="/map">
                  <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                    <span className="text-xl">🗺️</span> Trocar de Local
                  </button>
                </Link>
                
                <Link href="/equipment">
                  <button className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                    <span className="text-xl">🔧</span> Oficina
                  </button>
                </Link>
                
                <Link href="/shop">
                  <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                    <span className="text-xl">🛒</span> Loja
                  </button>
                </Link>
                
                <div className="pt-2 border-t border-amber-600/50">
                  <Link href="/">
                    <button className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                      <span className="text-xl">🏠</span> Menu Principal
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
