export type { 
  FishingType, 
  LineType, 
  FishingRod, 
  FishingLine, 
  Hook, 
  FloatBobber, 
  Reel, 
  ArtificialLure,
  Sinker,
  FishingTypeInfo,
  EquipmentSetup 
} from '@shared/equipment';

export { 
  FISHING_RODS, 
  FISHING_LINES, 
  HOOKS, 
  FLOATS, 
  REELS, 
  ARTIFICIAL_LURES,
  SINKERS,
  FISHING_TYPES,
  calculateMaxFishWeight,
  calculateTensionLimit,
  isSetupCompatible,
  getHookForBaitSize,
  getPowerName,
  getActionName,
  getFishingTypeName
} from '@shared/equipment';
