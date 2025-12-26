import lambariImg from '@assets/image_1765547155519.png';
import tilapiaImg from '@assets/image_1765546808194.png';
import trairaImg from '@assets/image_1765547187750.png';
import tucunareImg from '@assets/tucunare_acu.png';
import caraImg from '@assets/cara_fish.png';
import carpaImg from '@assets/image_1765546923283.png';
import mandiImg from '@assets/mandi_fish.png';
import carpaCapimImg from '@assets/carpa_capim.png';
import cascudoImg from '@assets/cascudo_fish.png';
import saintPeterImg from '@assets/image_1765557400186.png';

export type { Fish, Rod, FishRank, FishSex, SpawnedFish, DietType, Bait, ActivityPeriod, FeedingDepth, Location, NaturalBait, NaturalBaitCategory, BrazilState } from '@shared/fishData';
export { RODS, FISH_SPECIES as FISH_SPECIES_DATA, LOCATIONS as LOCATIONS_DATA, BAITS, NATURAL_BAITS, spawnFish, calculateRank, getRankColor, getRankBgColor, getDietName, getDietIcon, getActivityPeriodName, getActivityPeriodIcon, getFeedingDepthName, getFeedingDepthIcon, getFishByLocation, BRAZIL_STATES, getLocationsByState, getStateById } from '@shared/fishData';
import { Fish } from '@shared/fishData';

export interface FishWithImage extends Fish {
  image: string;
}

const FISH_IMAGES: Record<string, string> = {
  lambari: lambariImg,
  tilapia: tilapiaImg,
  traira: trairaImg,
  cara: caraImg,
  tucunare: tucunareImg,
  carpa: carpaImg,
  cascudo: cascudoImg,
  mandi: mandiImg,
  carpa_capim: carpaCapimImg,
  tilapia_saint_peter: saintPeterImg,
};

import { FISH_SPECIES as FISH_DATA } from '@shared/fishData';

export const FISH_SPECIES: FishWithImage[] = FISH_DATA.map(fish => ({
  ...fish,
  image: FISH_IMAGES[fish.id] || tilapiaImg
}));

import { LOCATIONS as LOC_DATA } from '@shared/fishData';

import pondBg from '@assets/stock_images/calm_farm_pond_with__3bcba557.jpg';
import creekBg from '@assets/stock_images/small_forest_stream__9c6d0a07.jpg';
import riverBg from '@assets/stock_images/wide_river_fishing_s_2ad549a1.jpg';

const LOCATION_IMAGES: Record<string, string> = {
  pond: pondBg,
  creek: creekBg,
  river: riverBg
};

export interface LocationWithImage {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  depths: ('surface' | 'midwater' | 'deep')[];
  image: string;
  stateId: string;
  region: string;
  mapPosition: { x: number; y: number };
  allowedFishingTypes?: ('float' | 'baitcasting' | 'bottom')[];
  travelCost: number;
}

export const LOCATIONS: LocationWithImage[] = LOC_DATA.map(loc => ({
  ...loc,
  image: LOCATION_IMAGES[loc.id] || pondBg
}));
