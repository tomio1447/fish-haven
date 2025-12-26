export type DietType = 'omnivore' | 'carnivore' | 'herbivore';
export type ActivityPeriod = 'diurnal' | 'nocturnal' | 'both';
export type FeedingDepth = 'surface' | 'midwater' | 'deep';

export interface Fish {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  dietType: DietType;
  activityPeriod: ActivityPeriod;
  feedingDepth: FeedingDepth[];
  locations: string[];
  preferredBaits: string[];
  activeHours?: [number, number];
  price: number;
  pricePerKg: number;
  fightStrength: number;
  aggression: number;
  maxRankByHookSize?: Record<number, FishRank>;
  locationSizeLimit?: Record<string, number>;
  image?: string;
  stats: {
    minLength: number;
    maxLength: number;
    minWeight: number;
    maxWeight: number;
    maleMultiplier: number;
    femaleMultiplier: number;
  };
}

export type NaturalBaitCategory = 'general' | 'carnivore';

export interface NaturalBait {
  id: string;
  name: string;
  description: string;
  category: NaturalBaitCategory;
  targetDiet: DietType[];
  baitSize: number;
  price: number;
  icon: string;
  minHookSize: number;
  maxHookSize: number;
}

export const NATURAL_BAITS: NaturalBait[] = [
  {
    id: 'bread_ball',
    name: 'Bolinha de Pão',
    description: 'Isca básica para iniciantes. Cabe até anzol #2. Onívoros e herbívoros.',
    category: 'general',
    targetDiet: ['omnivore', 'herbivore'],
    baitSize: 2,
    price: 0,
    icon: '🍞',
    minHookSize: 10,
    maxHookSize: 2
  },
  {
    id: 'bread',
    name: 'Massa de Pão',
    description: 'Atrai peixes onívoros e herbívoros. Anzol #8 a #4.',
    category: 'general',
    targetDiet: ['omnivore', 'herbivore'],
    baitSize: 3,
    price: 2,
    icon: '🥖',
    minHookSize: 8,
    maxHookSize: 4
  },
  {
    id: 'cheese_ball',
    name: 'Bolinha de Queijo',
    description: 'Massa de queijo aromática. Anzol #8 a #4.',
    category: 'general',
    targetDiet: ['omnivore', 'herbivore'],
    baitSize: 3,
    price: 4,
    icon: '🧀',
    minHookSize: 8,
    maxHookSize: 4
  },
  {
    id: 'worm',
    name: 'Minhoca',
    description: 'Isca versátil. Anzol #6 a #1.',
    category: 'general',
    targetDiet: ['omnivore', 'carnivore'],
    baitSize: 4,
    price: 5,
    icon: '🪱',
    minHookSize: 6,
    maxHookSize: 1
  },
  {
    id: 'corn',
    name: 'Milho',
    description: 'Excelente para tilápias. Anzol #10 a #6.',
    category: 'general',
    targetDiet: ['herbivore', 'omnivore'],
    baitSize: 2,
    price: 3,
    icon: '🌽',
    minHookSize: 10,
    maxHookSize: 6
  },
  {
    id: 'sausage',
    name: 'Salsicha',
    description: 'Atrai carnívoros como traíras. Anzol #4 a 1/0.',
    category: 'carnivore',
    targetDiet: ['carnivore'],
    baitSize: 5,
    price: 6,
    icon: '🌭',
    minHookSize: 4,
    maxHookSize: 0
  },
  {
    id: 'banana',
    name: 'Cortes de Banana',
    description: 'Isca excelente para carpas. Anzol #6 a #2.',
    category: 'general',
    targetDiet: ['herbivore', 'omnivore'],
    baitSize: 5,
    price: 4,
    icon: '🍌',
    minHookSize: 6,
    maxHookSize: 2
  },
  {
    id: 'liver',
    name: 'Fígado de Boi',
    description: 'Excelente para bagres. Anzol #2 a 2/0.',
    category: 'carnivore',
    targetDiet: ['carnivore'],
    baitSize: 6,
    price: 8,
    icon: '🥩',
    minHookSize: 2,
    maxHookSize: -1
  },
  {
    id: 'fish_cut',
    name: 'Corte de Peixe',
    description: 'Irresistível para grandes predadores. Anzol #1 a 4/0.',
    category: 'carnivore',
    targetDiet: ['carnivore'],
    baitSize: 7,
    price: 10,
    icon: '🐟',
    minHookSize: 1,
    maxHookSize: -3
  },
  {
    id: 'shrimp',
    name: 'Camarão',
    description: 'Atrai carnívoros de maior porte. Anzol #4 a 1/0.',
    category: 'carnivore',
    targetDiet: ['carnivore', 'omnivore'],
    baitSize: 5,
    price: 12,
    icon: '🦐',
    minHookSize: 4,
    maxHookSize: 0
  }
];

export interface Bait {
  id: string;
  name: string;
  description: string;
  targetDiet: DietType[];
  baitSize: number;
  price: number;
  isReusable: boolean;
}

export const BAITS: Bait[] = NATURAL_BAITS.map(nb => ({
  id: nb.id,
  name: nb.name,
  description: nb.description,
  targetDiet: nb.targetDiet,
  baitSize: nb.baitSize,
  price: nb.price,
  isReusable: false
}));

export type FishRank = 'C' | 'B' | 'A' | 'S';
export type FishSex = 'male' | 'female';

export interface SpawnedFish {
  species: Fish;
  sex: FishSex;
  length: number;
  weight: number;
  rank: FishRank;
  percentile: number;
}

export interface Rod {
  id: string;
  name: string;
  description: string;
  power: number;
  range: number;
  price: number;
}

export const RODS: Rod[] = [
  {
    id: 'bamboo',
    name: 'Vara de Bambu',
    description: 'Simples e confiável.',
    power: 1,
    range: 15,
    price: 0
  },
  {
    id: 'fiber',
    name: 'Vara de Fibra',
    description: 'Mais flexível e resistente.',
    power: 1.5,
    range: 25,
    price: 500
  },
  {
    id: 'carbon',
    name: 'Vara de Carbono Pro',
    description: 'Leve e extremamente forte.',
    power: 2.5,
    range: 40,
    price: 1500
  }
];

export const FISH_SPECIES: Fish[] = [
  {
    id: 'lambari',
    name: 'Lambari',
    scientificName: 'Astyanax spp.',
    description: 'Peixe pequeno e ágil, muito comum em riachos brasileiros. Excelente para iniciantes.',
    dietType: 'omnivore',
    activityPeriod: 'diurnal',
    feedingDepth: ['surface', 'midwater'],
    locations: ['creek'],
    fightStrength: 2,
    aggression: 8,
    price: 5,
    pricePerKg: 50,
    preferredBaits: ['bread', 'corn', 'worm'],
    activeHours: [6, 18],
    stats: {
      minLength: 5,
      maxLength: 15,
      minWeight: 0.01,
      maxWeight: 0.1,
      maleMultiplier: 1.1,
      femaleMultiplier: 0.95
    }
  },
  {
    id: 'tilapia',
    name: 'Tilápia-do-Nilo',
    scientificName: 'Oreochromis niloticus',
    description: 'Peixe resistente e comum em todo o Brasil. Machos são significativamente maiores.',
    dietType: 'omnivore',
    activityPeriod: 'diurnal',
    feedingDepth: ['midwater', 'deep'],
    locations: ['pond', 'river'],
    fightStrength: 3,
    aggression: 4,
    price: 15,
    pricePerKg: 12,
    preferredBaits: ['bread', 'worm', 'corn'],
    activeHours: [6, 20],
    stats: {
      minLength: 15,
      maxLength: 60,
      minWeight: 0.3,
      maxWeight: 5.0,
      maleMultiplier: 1.3,
      femaleMultiplier: 0.8
    }
  },
  {
    id: 'tilapia_saint_peter',
    name: 'Tilápia Saint Peter',
    scientificName: 'Oreochromis sp.',
    description: 'Variante rosada e rara da tilápia. Muito valorizada pela carne saborosa e aparência exótica.',
    dietType: 'omnivore',
    activityPeriod: 'diurnal',
    feedingDepth: ['midwater', 'deep'],
    locations: ['pond', 'river'],
    fightStrength: 4,
    aggression: 3,
    price: 45,
    pricePerKg: 35,
    preferredBaits: ['bread', 'worm', 'corn'],
    activeHours: [8, 16],
    image: '/attached_assets/image_1765559137844.png',
    stats: {
      minLength: 18,
      maxLength: 55,
      minWeight: 0.4,
      maxWeight: 4.5,
      maleMultiplier: 1.25,
      femaleMultiplier: 0.85
    }
  },
  {
    id: 'traira',
    name: 'Traíra',
    scientificName: 'Hoplias malabaricus',
    description: 'Predador voraz com dentes afiados. Ataca iscas de superfície agressivamente.',
    dietType: 'carnivore',
    activityPeriod: 'nocturnal',
    feedingDepth: ['surface', 'midwater', 'deep'],
    locations: ['pond', 'river'],
    fightStrength: 7,
    aggression: 9,
    price: 45,
    pricePerKg: 18,
    preferredBaits: ['fish_cut', 'sausage', 'liver', 'shrimp'],
    activeHours: [18, 6],
    stats: {
      minLength: 20,
      maxLength: 65,
      minWeight: 0.5,
      maxWeight: 4.0,
      maleMultiplier: 1.0,
      femaleMultiplier: 1.0
    }
  },
  {
    id: 'cara',
    name: 'Cará',
    scientificName: 'Geophagus brasiliensis',
    description: 'Ciclídeo nativo colorido e territorial. Machos desenvolvem cores vibrantes.',
    dietType: 'omnivore',
    activityPeriod: 'diurnal',
    feedingDepth: ['deep'],
    locations: ['pond', 'creek', 'river'],
    fightStrength: 4,
    aggression: 5,
    price: 25,
    pricePerKg: 35,
    preferredBaits: ['bread', 'worm', 'corn'],
    stats: {
      minLength: 8,
      maxLength: 25,
      minWeight: 0.1,
      maxWeight: 0.8,
      maleMultiplier: 1.4,
      femaleMultiplier: 0.7
    }
  },
  {
    id: 'tucunare',
    name: 'Tucunaré Açu',
    scientificName: 'Cichla temensis',
    description: 'O maior e mais cobiçado tucunaré brasileiro. Machos desenvolvem protuberância característica na cabeça e coloração vibrante amarelo-dourada com listras negras.',
    dietType: 'carnivore',
    activityPeriod: 'diurnal',
    feedingDepth: ['surface', 'midwater'],
    locations: ['river'],
    fightStrength: 10,
    aggression: 10,
    price: 150,
    pricePerKg: 30,
    preferredBaits: ['lure', 'shrimp'],
    activeHours: [5, 10],
    stats: {
      minLength: 40,
      maxLength: 110,
      minWeight: 2.0,
      maxWeight: 14.0,
      maleMultiplier: 1.3,
      femaleMultiplier: 0.85
    }
  },
  {
    id: 'carpa',
    name: 'Carpa Comum',
    scientificName: 'Cyprinus carpio',
    description: 'Peixe grande e resistente introduzido da Europa. Luta longa e cansativa.',
    dietType: 'omnivore',
    activityPeriod: 'both',
    feedingDepth: ['deep'],
    locations: ['pond', 'river'],
    fightStrength: 8,
    aggression: 2,
    price: 80,
    pricePerKg: 15,
    preferredBaits: ['bread', 'corn', 'worm', 'banana'],
    stats: {
      minLength: 25,
      maxLength: 90,
      minWeight: 1.0,
      maxWeight: 20.0,
      maleMultiplier: 1.0,
      femaleMultiplier: 1.1
    }
  },
  {
    id: 'cascudo',
    name: 'Cascudo',
    scientificName: 'Hypostomus plecostomus',
    description: 'Peixe de fundo com corpo coberto por placas ósseas. No córrego atinge até 10cm, mas na beira do rio pode crescer muito mais. Difícil de capturar, só morde no fundo com anzol pequeno.',
    dietType: 'herbivore',
    activityPeriod: 'nocturnal',
    feedingDepth: ['deep'],
    locations: ['creek', 'river'],
    fightStrength: 4,
    aggression: 1,
    price: 15,
    pricePerKg: 35,
    preferredBaits: ['bread'],
    maxRankByHookSize: { 0: 'B', 1: 'C', 2: 'C' },
    stats: {
      minLength: 5,
      maxLength: 45,
      minWeight: 0.03,
      maxWeight: 1.5,
      maleMultiplier: 1.0,
      femaleMultiplier: 1.1
    },
    locationSizeLimit: { creek: 10 }
  },
  {
    id: 'mandi',
    name: 'Mandi',
    scientificName: 'Pimelodus spp.',
    description: 'Bagre pequeno e ativo à noite. Possui barbilhões sensíveis para localizar presas no fundo.',
    dietType: 'carnivore',
    activityPeriod: 'nocturnal',
    feedingDepth: ['deep', 'midwater'],
    locations: ['creek'],
    fightStrength: 3,
    aggression: 6,
    price: 20,
    pricePerKg: 80,
    preferredBaits: ['worm', 'liver', 'sausage', 'fish_cut'],
    activeHours: [19, 5],
    stats: {
      minLength: 5,
      maxLength: 12,
      minWeight: 0.02,
      maxWeight: 0.08,
      maleMultiplier: 1.05,
      femaleMultiplier: 0.95
    }
  },
  {
    id: 'carpa_capim',
    name: 'Carpa-Capim',
    scientificName: 'Ctenopharyngodon idella',
    description: 'Grande peixe herbívoro introduzido da Ásia. Captura rara e muito cobiçada por pescadores.',
    dietType: 'herbivore',
    activityPeriod: 'diurnal',
    feedingDepth: ['midwater', 'deep'],
    locations: ['river'],
    fightStrength: 9,
    aggression: 1,
    price: 150,
    pricePerKg: 20,
    preferredBaits: ['corn', 'bread', 'cheese_ball', 'banana'],
    activeHours: [8, 16],
    stats: {
      minLength: 40,
      maxLength: 120,
      minWeight: 3.0,
      maxWeight: 35.0,
      maleMultiplier: 1.0,
      femaleMultiplier: 1.15
    }
  }
];

export interface BrazilState {
  id: string;
  name: string;
  code: string;
  region: string;
  mapPosition: { x: number; y: number };
  unlocked: boolean;
  description: string;
}

export const BRAZIL_STATES: BrazilState[] = [
  {
    id: 'sc',
    name: 'Santa Catarina',
    code: 'SC',
    region: 'Sul',
    mapPosition: { x: 72, y: 85 },
    unlocked: true,
    description: 'Estado do sul do Brasil com rios, lagos e represas excelentes para pesca esportiva.'
  },
  {
    id: 'pr',
    name: 'Paraná',
    code: 'PR',
    region: 'Sul',
    mapPosition: { x: 68, y: 78 },
    unlocked: false,
    description: 'Lar do Rio Paraná e grandes represas como Itaipu. Peixes troféu aguardam.'
  },
  {
    id: 'sp',
    name: 'São Paulo',
    code: 'SP',
    region: 'Sudeste',
    mapPosition: { x: 75, y: 72 },
    unlocked: false,
    description: 'Represas do Tietê e divisa com MS oferecem pesca de classe mundial.'
  },
  {
    id: 'ms',
    name: 'Mato Grosso do Sul',
    code: 'MS',
    region: 'Centro-Oeste',
    mapPosition: { x: 60, y: 65 },
    unlocked: false,
    description: 'Pantanal e rios como Paraguai e Miranda. Paraíso da pesca brasileira.'
  },
  {
    id: 'am',
    name: 'Amazonas',
    code: 'AM',
    region: 'Norte',
    mapPosition: { x: 55, y: 30 },
    unlocked: false,
    description: 'A maior bacia hidrográfica do mundo. Tucunarés gigantes e peixes lendários.'
  }
];

export interface Location {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  depths: FeedingDepth[];
  stateId: string;
  region: string;
  mapPosition: { x: number; y: number };
  allowedFishingTypes?: ('float' | 'baitcasting' | 'bottom')[];
  travelCost: number;
}

export const LOCATIONS: Location[] = [
  {
    id: 'creek',
    name: 'Córrego Estreito',
    description: 'Riacho de águas cristalinas cercado por mata atlântica. Ideal para iniciantes.',
    difficulty: 'easy',
    depths: ['surface', 'midwater'],
    stateId: 'sc',
    region: 'Serra Catarinense',
    mapPosition: { x: 30, y: 25 },
    allowedFishingTypes: ['float'],
    travelCost: 0
  },
  {
    id: 'pond',
    name: 'Lagoa do Peri',
    description: 'Maior lagoa de água doce da ilha de Florianópolis. Tilápias e carpas abundantes.',
    difficulty: 'easy',
    depths: ['surface', 'midwater', 'deep'],
    stateId: 'sc',
    region: 'Florianópolis',
    mapPosition: { x: 85, y: 60 },
    travelCost: 300
  },
  {
    id: 'river',
    name: 'Rio Itajaí-Açu',
    description: 'Um dos maiores rios de Santa Catarina. Correnteza forte e peixes troféu.',
    difficulty: 'hard',
    depths: ['surface', 'midwater', 'deep'],
    stateId: 'sc',
    region: 'Vale do Itajaí',
    mapPosition: { x: 70, y: 40 },
    travelCost: 800
  }
];

export function getLocationsByState(stateId: string): Location[] {
  return LOCATIONS.filter(loc => loc.stateId === stateId);
}

export function getStateById(stateId: string): BrazilState | undefined {
  return BRAZIL_STATES.find(s => s.id === stateId);
}

export function getFishByLocation(locationId: string): Fish[] {
  return FISH_SPECIES.filter(fish => fish.locations.includes(locationId));
}

export function calculateRank(percentile: number): FishRank {
  if (percentile >= 95) return 'S';
  if (percentile >= 80) return 'A';
  if (percentile >= 50) return 'B';
  return 'C';
}

export function spawnFish(species: Fish, locationId?: string): SpawnedFish {
  const sex: FishSex = Math.random() > 0.5 ? 'male' : 'female';
  const sexMultiplier = sex === 'male' ? species.stats.maleMultiplier : species.stats.femaleMultiplier;
  
  const basePercentile = Math.random();
  const cubedPercentile = Math.pow(basePercentile, 2);
  
  // Check if there's a location-specific size limit
  let effectiveMaxLength = species.stats.maxLength;
  let effectiveMaxWeight = species.stats.maxWeight;
  
  if (locationId && species.locationSizeLimit && species.locationSizeLimit[locationId]) {
    const sizeLimit = species.locationSizeLimit[locationId];
    effectiveMaxLength = Math.min(effectiveMaxLength, sizeLimit);
    // Calculate proportional weight limit
    const lengthRatio = sizeLimit / species.stats.maxLength;
    effectiveMaxWeight = species.stats.minWeight + (species.stats.maxWeight - species.stats.minWeight) * Math.pow(lengthRatio, 3);
  }
  
  const lengthRange = effectiveMaxLength - species.stats.minLength;
  const baseLength = species.stats.minLength + (lengthRange * cubedPercentile);
  const length = Math.round(baseLength * sexMultiplier * 10) / 10;
  
  const weightRange = effectiveMaxWeight - species.stats.minWeight;
  const baseWeight = species.stats.minWeight + (weightRange * cubedPercentile);
  const weight = Math.round(baseWeight * sexMultiplier * 100) / 100;
  
  const maxPossibleLength = species.stats.maxLength * Math.max(species.stats.maleMultiplier, species.stats.femaleMultiplier);
  const actualPercentile = Math.min(100, (length / maxPossibleLength) * 100);
  
  const rank = calculateRank(actualPercentile);
  
  return {
    species,
    sex,
    length,
    weight,
    rank,
    percentile: Math.round(actualPercentile)
  };
}

export function getRankColor(rank: FishRank): string {
  switch (rank) {
    case 'S': return 'text-amber-500';
    case 'A': return 'text-purple-500';
    case 'B': return 'text-blue-500';
    case 'C': return 'text-gray-500';
  }
}

export function getRankBgColor(rank: FishRank): string {
  switch (rank) {
    case 'S': return 'bg-gradient-to-r from-amber-400 to-yellow-500';
    case 'A': return 'bg-gradient-to-r from-purple-400 to-purple-600';
    case 'B': return 'bg-gradient-to-r from-blue-400 to-blue-600';
    case 'C': return 'bg-gradient-to-r from-gray-400 to-gray-600';
  }
}

export function getDietName(diet: DietType): string {
  switch (diet) {
    case 'omnivore': return 'Onívoro';
    case 'carnivore': return 'Carnívoro';
    case 'herbivore': return 'Herbívoro';
  }
}

export function getDietIcon(diet: DietType): string {
  switch (diet) {
    case 'omnivore': return '🍽️';
    case 'carnivore': return '🥩';
    case 'herbivore': return '🌿';
  }
}

export function getActivityPeriodName(period: ActivityPeriod): string {
  switch (period) {
    case 'diurnal': return 'Diurno';
    case 'nocturnal': return 'Noturno';
    case 'both': return 'Dia e Noite';
  }
}

export function getActivityPeriodIcon(period: ActivityPeriod): string {
  switch (period) {
    case 'diurnal': return '☀️';
    case 'nocturnal': return '🌙';
    case 'both': return '🌓';
  }
}

export function getFeedingDepthName(depth: FeedingDepth): string {
  switch (depth) {
    case 'surface': return 'Superfície';
    case 'midwater': return 'Meia Água';
    case 'deep': return 'Profundo';
  }
}

export function getFeedingDepthIcon(depth: FeedingDepth): string {
  switch (depth) {
    case 'surface': return '🌊';
    case 'midwater': return '🐟';
    case 'deep': return '⬇️';
  }
}
