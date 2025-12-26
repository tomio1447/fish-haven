import type { FishingRod, FishingLine, Reel } from '@shared/equipment';
import type { Fish } from '@shared/fishData';

export interface TensionConfig {
  fishWeight: number;
  fishAggression: number;
  fishFightStrength: number;
  rodPower: number;
  lineTestWeight: number;
  reelDrag: number;
  isPulling: boolean;
  isStunned: boolean;
  isFighting: boolean;
  deltaTime: number;
}

export interface TensionResult {
  tension: number;
  tensionDelta: number;
  lineBreakRisk: number;
  fishEscapeRisk: number;
  effectivePullPower: number;
  baseFishPressure: number;
}

const POWER_MULTIPLIER: Record<string, number> = {
  'ultralight': 0.5,
  'light': 0.75,
  'medium': 1.0,
  'heavy': 1.3,
  'extra-heavy': 1.6
};

export function getRodPowerMultiplier(power: string): number {
  return POWER_MULTIPLIER[power] || 1.0;
}

export function calculateBaseFishPressure(
  fishWeight: number,
  fishAggression: number,
  fishFightStrength: number
): number {
  const weightFactor = Math.sqrt(fishWeight);
  const aggressionFactor = 1 + (fishAggression / 10) * 0.5;
  const strengthFactor = 1 + (fishFightStrength / 10) * 0.8;
  
  return weightFactor * aggressionFactor * strengthFactor;
}

export function calculateGearMitigation(
  rodPower: number,
  lineTestWeight: number,
  reelDrag: number
): number {
  const rodFactor = rodPower * 0.4;
  const lineFactor = (lineTestWeight / 20) * 0.3;
  const reelFactor = (reelDrag / 15) * 0.3;
  
  return Math.max(0.5, Math.min(2.0, rodFactor + lineFactor + reelFactor));
}

export function calculateTensionDelta(config: TensionConfig): TensionResult {
  const {
    fishWeight,
    fishAggression,
    fishFightStrength,
    rodPower,
    lineTestWeight,
    reelDrag,
    isPulling,
    isStunned,
    isFighting,
    deltaTime
  } = config;

  const baseFishPressure = calculateBaseFishPressure(
    fishWeight,
    fishAggression,
    fishFightStrength
  );

  const gearMitigation = calculateGearMitigation(
    rodPower,
    lineTestWeight,
    reelDrag
  );

  const effectiveFishPressure = baseFishPressure / gearMitigation;

  let tensionDelta = 0;
  
  const pullPower = 12 * rodPower;
  const relaxRate = 18 + (fishWeight * 0.5);
  
  if (isPulling) {
    tensionDelta += pullPower * deltaTime;
    
    if (!isStunned && isFighting) {
      const fightIntensity = Math.min(2.5, 1 + (fishAggression / 10));
      tensionDelta += effectiveFishPressure * fightIntensity * deltaTime;
    }
  } else {
    tensionDelta -= relaxRate * deltaTime;
    
    if (!isStunned && isFighting) {
      tensionDelta += effectiveFishPressure * 0.5 * deltaTime;
    }
  }

  const lineBreakThreshold = lineTestWeight * 0.453592;
  const lineBreakRisk = Math.max(0, (fishWeight - lineBreakThreshold * 0.7) / (lineBreakThreshold * 0.3));
  
  const fishEscapeRisk = 1 - Math.min(1, (fishFightStrength / 10) * 0.3 + 0.5);
  
  return {
    tension: 0,
    tensionDelta,
    lineBreakRisk: Math.min(1, Math.max(0, lineBreakRisk)),
    fishEscapeRisk,
    effectivePullPower: pullPower,
    baseFishPressure
  };
}

export function calculateFightProbability(
  fishAggression: number,
  fishFightStrength: number,
  currentTension: number,
  isPulling: boolean
): number {
  const baseChance = (fishAggression / 10) * 0.4;
  
  const tensionModifier = currentTension > 50 
    ? (currentTension - 50) / 100 
    : 0;
  
  const pullModifier = isPulling ? 0.2 : -0.1;
  
  const strengthModifier = (fishFightStrength / 10) * 0.2;
  
  return Math.min(0.9, Math.max(0.05, baseChance + tensionModifier + pullModifier + strengthModifier));
}

export function calculateHitEffectiveness(
  hitPower: number,
  fishWeight: number,
  fishFightStrength: number,
  rodPower: number
): { stunDuration: number; wasEffective: boolean } {
  const effectiveness = (hitPower / 100) * rodPower;
  const fishResistance = Math.sqrt(fishWeight) * (fishFightStrength / 10);
  const stunRatio = effectiveness / Math.max(0.5, fishResistance);
  const stunDuration = Math.min(3000, Math.max(500, stunRatio * 1500));
  const wasEffective = stunRatio > 0.5;
  
  return { stunDuration, wasEffective };
}

export function calculateReelSpeed(
  currentTension: number,
  fishDistance: number,
  fishWeight: number,
  gearRatio: number,
  isPulling: boolean,
  isStunned: boolean
): number {
  if (!isPulling) return 0;
  if (currentTension > 90) return 0;
  
  const tensionPenalty = currentTension > 70 
    ? 1 - ((currentTension - 70) / 30) * 0.8
    : 1;
  
  const stunBonus = isStunned ? 1.5 : 1;
  
  const weightPenalty = Math.max(0.3, 1 - (fishWeight / 50) * 0.5);
  
  const baseSpeed = gearRatio * 10;
  
  return baseSpeed * tensionPenalty * stunBonus * weightPenalty;
}

export function shouldLineBrake(
  currentTension: number,
  sustainedHighTensionMs: number,
  fishWeight: number,
  lineTestWeight: number
): boolean {
  const lineStrengthKg = lineTestWeight * 0.453592;
  const overloadRatio = fishWeight / lineStrengthKg;
  
  if (currentTension >= 100) {
    return true;
  }
  
  if (currentTension >= 85 && overloadRatio > 0.8) {
    const breakChance = (currentTension - 85) / 15 * overloadRatio;
    if (sustainedHighTensionMs > 2000 && Math.random() < breakChance * 0.1) {
      return true;
    }
  }
  
  return false;
}

export function shouldFishEscape(
  currentTension: number,
  sustainedLowTensionMs: number,
  fishAggression: number
): boolean {
  if (currentTension >= 10) return false;
  
  const escapeThreshold = 3000 - (fishAggression * 100);
  
  if (sustainedLowTensionMs > Math.max(1500, escapeThreshold)) {
    const escapeChance = (sustainedLowTensionMs - escapeThreshold) / 2000;
    return Math.random() < Math.min(0.5, escapeChance);
  }
  
  return false;
}
