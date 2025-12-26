export type FishingType = 'float' | 'baitcasting' | 'bottom';
export type LineType = 'mono' | 'braided' | 'fluorocarbon';

export interface FishingTypeInfo {
  id: FishingType;
  name: string;
  description: string;
  requiredMastery: number;
  targetDepths: ('surface' | 'midwater' | 'deep')[];
}

export const FISHING_TYPES: FishingTypeInfo[] = [
  {
    id: 'float',
    name: 'Pesca de Boia',
    description: 'Pesca tradicional com boia. Ideal para peixes de superfície e meia água.',
    requiredMastery: 0,
    targetDepths: ['surface', 'midwater']
  },
  {
    id: 'baitcasting',
    name: 'Pesca de Carretilha',
    description: 'Pesca esportiva com iscas artificiais. Para predadores de superfície.',
    requiredMastery: 3,
    targetDepths: ['surface']
  },
  {
    id: 'bottom',
    name: 'Pesca de Fundo',
    description: 'Pesca com chumbo no fundo. Para peixes que se alimentam no substrato.',
    requiredMastery: 3,
    targetDepths: ['deep']
  }
];

export interface FishingRod {
  id: string;
  name: string;
  description: string;
  fishingType: FishingType;
  power: 'ultralight' | 'light' | 'medium' | 'heavy' | 'extra-heavy';
  action: 'slow' | 'moderate' | 'fast' | 'extra-fast';
  lengthFt: number;
  maxLineWeightLb: number;
  maxLureWeightOz: number;
  durability: number;
  maxDurability: number;
  price: number;
  compatibleLineIds?: string[]; // If set, only these lines can be used with this rod
}

export interface FishingLine {
  id: string;
  name: string;
  description: string;
  type: LineType;
  testWeightLb: number;
  diameterMm: number;
  lengthM: number;
  durability: number;
  maxDurability: number;
  price: number;
}

export interface Hook {
  id: string;
  name: string;
  size: number;
  minBaitSize: number;
  maxBaitSize: number;
  maxFishWeightKg: number;
  price: number;
  quantity: number;
  image?: string;
}

export interface TrebleHook {
  id: string;
  name: string;
  size: number;
  maxFishWeightKg: number;
  price: number;
  quantity: number;
}

export interface FloatBobber {
  id: string;
  name: string;
  description: string;
  buoyancyG: number;
  sensitivity: 'low' | 'medium' | 'high';
  price: number;
}

export interface Reel {
  id: string;
  name: string;
  description: string;
  type: 'spinning' | 'baitcasting';
  gearRatio: string;
  maxDragLb: number;
  lineCapacityMono: string;
  lineCapacityBraid: string;
  ballBearings: number;
  durability: number;
  maxDurability: number;
  price: number;
}

export type ArtificialLureDepth = 'surface' | 'midwater' | 'deep';

export interface ArtificialLure {
  id: string;
  name: string;
  description: string;
  type: 'popper' | 'crankbait' | 'spinnerbait' | 'jig' | 'shad' | 'swimbait' | 'minnow' | 'spoon';
  depth: ArtificialLureDepth;
  weightG: number;
  sizeCm: number;
  targetDiet: ('carnivore')[];
  targetLocations: string[];
  price: number;
  durability: number;
  maxDurability: number;
  icon: string;
}

export interface Sinker {
  id: string;
  name: string;
  description: string;
  weightG: number;
  price: number;
  quantity: number;
}

export interface Stringer {
  id: string;
  name: string;
  description: string;
  maxCount: number;
  maxWeightKg: number;
  price: number;
  icon: string;
}

export const STRINGERS: Stringer[] = [
  {
    id: 'stringer_traditional',
    name: 'Fieira Tradicional',
    description: 'Fieira básica de corda. Permite guardar até 20 exemplares ou 5kg de peixe.',
    maxCount: 20,
    maxWeightKg: 5,
    price: 0,
    icon: '🪢'
  },
  {
    id: 'stringer_reinforced',
    name: 'Fieira Reforçada',
    description: 'Fieira de corda reforçada. Permite guardar até 30 exemplares ou 8kg de peixe.',
    maxCount: 30,
    maxWeightKg: 8,
    price: 3000,
    icon: '🪢'
  }
];

export const FISHING_RODS: FishingRod[] = [
  {
    id: 'wooden_rod',
    name: 'Vara de Madeira',
    description: 'Vara rústica feita de galho. Suporta até 0,5kg. Aceita apenas linha 0,08mm.',
    fishingType: 'float',
    power: 'ultralight',
    action: 'slow',
    lengthFt: 5,
    maxLineWeightLb: 1.1,
    maxLureWeightOz: 0.25,
    durability: 500,
    maxDurability: 500,
    price: 0,
    compatibleLineIds: ['mono_008']
  },
  {
    id: 'bamboo_float',
    name: 'Vara de Bambu',
    description: 'Vara simples e tradicional para pesca de boia. Ideal para iniciantes.',
    fishingType: 'float',
    power: 'light',
    action: 'slow',
    lengthFt: 6,
    maxLineWeightLb: 6,
    maxLureWeightOz: 0.5,
    durability: 1000,
    maxDurability: 1000,
    price: 150
  },
  {
    id: 'fiber_float',
    name: 'Vara de Fibra para Boia',
    description: 'Vara flexível e resistente para pesca de boia em águas calmas.',
    fishingType: 'float',
    power: 'medium',
    action: 'moderate',
    lengthFt: 7,
    maxLineWeightLb: 10,
    maxLureWeightOz: 1,
    durability: 2000,
    maxDurability: 2000,
    price: 300
  },
  {
    id: 'kama_telescopica',
    name: 'Kama - Telescópica Confort 5m',
    description: 'Vara telescópica de 5 metros com empunhadura em EVA. Prática e portátil.',
    fishingType: 'float',
    power: 'medium',
    action: 'moderate',
    lengthFt: 16.4,
    maxLineWeightLb: 12,
    maxLureWeightOz: 1.5,
    durability: 2500,
    maxDurability: 2500,
    price: 189
  },
  {
    id: 'telestick_tl16',
    name: 'TeleStick - TL16',
    description: 'Vara telescópica longa de 6 metros. Alcance superior para pesqueiros grandes.',
    fishingType: 'float',
    power: 'medium',
    action: 'slow',
    lengthFt: 19.7,
    maxLineWeightLb: 14,
    maxLureWeightOz: 2,
    durability: 3000,
    maxDurability: 3000,
    price: 279
  },
  {
    id: 'corona_s60l',
    name: 'Corona - S60L',
    description: 'Vara intermediária em fibra de vidro. Boa resistência e flexibilidade.',
    fishingType: 'float',
    power: 'light',
    action: 'moderate',
    lengthFt: 6,
    maxLineWeightLb: 8,
    maxLureWeightOz: 0.75,
    durability: 1800,
    maxDurability: 1800,
    price: 149
  },
  {
    id: 'carbon_baitcast',
    name: 'Vara de Carbono para Carretilha',
    description: 'Vara profissional de carbono para pesca com carretilha. Leve e poderosa.',
    fishingType: 'baitcasting',
    power: 'heavy',
    action: 'fast',
    lengthFt: 6.5,
    maxLineWeightLb: 20,
    maxLureWeightOz: 2,
    durability: 5000,
    maxDurability: 5000,
    price: 1200
  },
  {
    id: 'pro_baitcast',
    name: 'Vara Pro Predador',
    description: 'Vara premium para grandes predadores. Ação rápida para fisgadas precisas.',
    fishingType: 'baitcasting',
    power: 'extra-heavy',
    action: 'extra-fast',
    lengthFt: 7,
    maxLineWeightLb: 30,
    maxLureWeightOz: 3,
    durability: 8000,
    maxDurability: 8000,
    price: 2500
  },
  {
    id: 'bottom_basic',
    name: 'Vara de Fundo Básica',
    description: 'Vara resistente para pesca de fundo. Aguenta peixes pesados.',
    fishingType: 'bottom',
    power: 'heavy',
    action: 'slow',
    lengthFt: 7,
    maxLineWeightLb: 15,
    maxLureWeightOz: 2,
    durability: 3000,
    maxDurability: 3000,
    price: 400
  },
  {
    id: 'bottom_pro',
    name: 'Vara de Fundo Profissional',
    description: 'Vara profissional para pesca de fundo em águas profundas.',
    fishingType: 'bottom',
    power: 'extra-heavy',
    action: 'moderate',
    lengthFt: 8,
    maxLineWeightLb: 25,
    maxLureWeightOz: 4,
    durability: 6000,
    maxDurability: 6000,
    price: 900
  },
  {
    id: 'predador_fundo',
    name: 'Predador - Vara Fundo 2.4m',
    description: 'Vara pesada para pesca de fundo. Estrutura reforçada para peixes grandes.',
    fishingType: 'bottom',
    power: 'heavy',
    action: 'moderate',
    lengthFt: 7.9,
    maxLineWeightLb: 20,
    maxLureWeightOz: 3,
    durability: 4000,
    maxDurability: 4000,
    price: 329
  },
  {
    id: 'kama_pesqueiro_pro',
    name: 'Kama - Pesqueiro Pro',
    description: 'Vara profissional para pesqueiros. Carbono de alta modulação e passadores SiC.',
    fishingType: 'bottom',
    power: 'extra-heavy',
    action: 'fast',
    lengthFt: 8.5,
    maxLineWeightLb: 30,
    maxLureWeightOz: 5,
    durability: 7000,
    maxDurability: 7000,
    price: 749
  }
];

export const FISHING_LINES: FishingLine[] = [
  {
    id: 'mono_008',
    name: 'Linha Nylon 0,08mm',
    description: 'Linha ultra-fina. Suporta até 1,3kg. Limitado a anzol até #3. Vem 5 unidades.',
    type: 'mono',
    testWeightLb: 2.9,
    diameterMm: 0.08,
    lengthM: 50,
    durability: 200,
    maxDurability: 200,
    price: 0
  },
  {
    id: 'mono_012',
    name: 'Linha Mono 0,12mm',
    description: 'Linha fina para pesca de boia. Ideal para peixes pequenos como lambaris.',
    type: 'mono',
    testWeightLb: 3,
    diameterMm: 0.12,
    lengthM: 100,
    durability: 300,
    maxDurability: 300,
    price: 10
  },
  {
    id: 'mono_light',
    name: 'Linha Mono 0,20mm',
    description: 'Linha monofilamento leve para peixes pequenos.',
    type: 'mono',
    testWeightLb: 6,
    diameterMm: 0.20,
    lengthM: 100,
    durability: 500,
    maxDurability: 500,
    price: 15
  },
  {
    id: 'mono_medium',
    name: 'Linha Mono 12lb',
    description: 'Linha monofilamento versátil para peixes médios.',
    type: 'mono',
    testWeightLb: 12,
    diameterMm: 0.30,
    lengthM: 100,
    durability: 800,
    maxDurability: 800,
    price: 25
  },
  {
    id: 'braid_medium',
    name: 'Multifilamento 20lb',
    description: 'Linha multifilamento forte e sensível. Ideal para carretilha.',
    type: 'braided',
    testWeightLb: 20,
    diameterMm: 0.15,
    lengthM: 150,
    durability: 1500,
    maxDurability: 1500,
    price: 80
  },
  {
    id: 'braid_heavy',
    name: 'Multifilamento 40lb',
    description: 'Linha multifilamento pesada para grandes predadores.',
    type: 'braided',
    testWeightLb: 40,
    diameterMm: 0.25,
    lengthM: 150,
    durability: 2500,
    maxDurability: 2500,
    price: 150
  }
];

export const HOOKS: Hook[] = [
  { id: 'hook_12', name: 'Anzol #12', size: 12, minBaitSize: 1, maxBaitSize: 1, maxFishWeightKg: 0.15, price: 1, quantity: 10, image: 'hook_12' },
  { id: 'hook_10', name: 'Anzol #10', size: 10, minBaitSize: 1, maxBaitSize: 2, maxFishWeightKg: 0.3, price: 1, quantity: 10, image: 'hook_12' },
  { id: 'hook_8', name: 'Anzol #8', size: 8, minBaitSize: 2, maxBaitSize: 3, maxFishWeightKg: 0.5, price: 1, quantity: 10, image: 'hook_8' },
  { id: 'hook_6', name: 'Anzol #6', size: 6, minBaitSize: 3, maxBaitSize: 4, maxFishWeightKg: 1.0, price: 2, quantity: 10, image: 'hook_8' },
  { id: 'hook_4', name: 'Anzol #4', size: 4, minBaitSize: 4, maxBaitSize: 5, maxFishWeightKg: 2.0, price: 2, quantity: 10, image: 'hook_4' },
  { id: 'hook_3', name: 'Anzol #3', size: 3, minBaitSize: 5, maxBaitSize: 6, maxFishWeightKg: 2.5, price: 2, quantity: 10, image: 'hook_4' },
  { id: 'hook_2', name: 'Anzol #2', size: 2, minBaitSize: 5, maxBaitSize: 6, maxFishWeightKg: 3.0, price: 3, quantity: 10, image: 'hook_4' },
  { id: 'hook_1', name: 'Anzol #1', size: 1, minBaitSize: 6, maxBaitSize: 7, maxFishWeightKg: 4.0, price: 0, quantity: 5, image: 'hook_1' },
  { id: 'hook_1_0', name: 'Anzol 1/0', size: 0, minBaitSize: 7, maxBaitSize: 8, maxFishWeightKg: 6.0, price: 4, quantity: 10, image: 'hook_1' },
  { id: 'hook_2_0', name: 'Anzol 2/0', size: -1, minBaitSize: 8, maxBaitSize: 9, maxFishWeightKg: 8.0, price: 5, quantity: 10, image: 'hook_2_0' },
  { id: 'hook_3_0', name: 'Anzol 3/0', size: -2, minBaitSize: 9, maxBaitSize: 10, maxFishWeightKg: 10.0, price: 6, quantity: 10, image: 'hook_2_0' },
  { id: 'hook_4_0', name: 'Anzol 4/0', size: -3, minBaitSize: 10, maxBaitSize: 12, maxFishWeightKg: 15.0, price: 8, quantity: 10, image: 'hook_4_0' }
];

export const TREBLE_HOOKS: TrebleHook[] = [
  { id: 'treble_6', name: 'Garateia #6', size: 6, maxFishWeightKg: 2.0, price: 8, quantity: 5 },
  { id: 'treble_4', name: 'Garateia #4', size: 4, maxFishWeightKg: 4.0, price: 10, quantity: 5 },
  { id: 'treble_2', name: 'Garateia #2', size: 2, maxFishWeightKg: 6.0, price: 12, quantity: 5 },
  { id: 'treble_1', name: 'Garateia #1', size: 1, maxFishWeightKg: 8.0, price: 15, quantity: 5 },
  { id: 'treble_1_0', name: 'Garateia 1/0', size: 0, maxFishWeightKg: 12.0, price: 18, quantity: 5 },
  { id: 'treble_2_0', name: 'Garateia 2/0', size: -1, maxFishWeightKg: 15.0, price: 22, quantity: 5 }
];

export const FLOATS: FloatBobber[] = [
  {
    id: 'float_small',
    name: 'Boia Pequena',
    description: 'Boia leve para peixes pequenos. Suporta até anzol #2. Alta sensibilidade.',
    buoyancyG: 2,
    sensitivity: 'high',
    price: 0
  },
  {
    id: 'float_medium',
    name: 'Boia Média',
    description: 'Boia versátil para a maioria das pescarias.',
    buoyancyG: 5,
    sensitivity: 'medium',
    price: 10
  },
  {
    id: 'float_large',
    name: 'Boia Grande',
    description: 'Boia robusta para iscas pesadas e águas agitadas.',
    buoyancyG: 10,
    sensitivity: 'low',
    price: 15
  }
];

export const REELS: Reel[] = [
  {
    id: 'spinning_basic',
    name: 'Molinete Básico',
    description: 'Molinete simples para iniciantes.',
    type: 'spinning',
    gearRatio: '5.2:1',
    maxDragLb: 8,
    lineCapacityMono: '6lb/100m',
    lineCapacityBraid: '10lb/150m',
    ballBearings: 3,
    durability: 1000,
    maxDurability: 1000,
    price: 100
  },
  {
    id: 'express_starter',
    name: 'Express - Molinete Starter',
    description: 'Molinete econômico para iniciantes. Leve e fácil de usar.',
    type: 'spinning',
    gearRatio: '5.0:1',
    maxDragLb: 6,
    lineCapacityMono: '6lb/80m',
    lineCapacityBraid: '8lb/100m',
    ballBearings: 2,
    durability: 800,
    maxDurability: 800,
    price: 59
  },
  {
    id: 'syberia_energy3000',
    name: 'Syberia - Energy 3000',
    description: 'Molinete intermediário com corpo em grafite. Arrasto suave e recolhimento estável.',
    type: 'spinning',
    gearRatio: '5.5:1',
    maxDragLb: 10,
    lineCapacityMono: '10lb/120m',
    lineCapacityBraid: '15lb/180m',
    ballBearings: 5,
    durability: 1500,
    maxDurability: 1500,
    price: 189
  },
  {
    id: 'trident_ttech4000',
    name: 'Trident - T-Tech 4000',
    description: 'Molinete profissional com 7 rolamentos blindados. Sistema anti-reverso instantâneo.',
    type: 'spinning',
    gearRatio: '5.8:1',
    maxDragLb: 14,
    lineCapacityMono: '12lb/150m',
    lineCapacityBraid: '20lb/200m',
    ballBearings: 7,
    durability: 2500,
    maxDurability: 2500,
    price: 349
  },
  {
    id: 'baitcast_basic',
    name: 'Carretilha Básica',
    description: 'Carretilha de perfil baixo para iniciantes.',
    type: 'baitcasting',
    gearRatio: '6.3:1',
    maxDragLb: 12,
    lineCapacityMono: '12lb/120m',
    lineCapacityBraid: '20lb/150m',
    ballBearings: 4,
    durability: 1500,
    maxDurability: 1500,
    price: 250
  },
  {
    id: 'baitcast_pro',
    name: 'Carretilha Pro',
    description: 'Carretilha profissional com sistema de freio magnético.',
    type: 'baitcasting',
    gearRatio: '7.1:1',
    maxDragLb: 18,
    lineCapacityMono: '14lb/140m',
    lineCapacityBraid: '30lb/200m',
    ballBearings: 7,
    durability: 3000,
    maxDurability: 3000,
    price: 600
  },
  {
    id: 'baitcast_optima',
    name: 'Carretilha Optima',
    description: 'Carretilha de perfil baixo com excelente relação custo-benefício. Ideal para arremessos longos.',
    type: 'baitcasting',
    gearRatio: '6.2:1',
    maxDragLb: 9,
    lineCapacityMono: '10lb/100m',
    lineCapacityBraid: '15lb/120m',
    ballBearings: 4,
    durability: 1200,
    maxDurability: 1200,
    price: 199
  },
  {
    id: 'baitcast_energy',
    name: 'Carretilha Energy',
    description: 'Carretilha versátil com arrasto suave. Sistema de freio centrífugo para controle preciso.',
    type: 'baitcasting',
    gearRatio: '6.2:1',
    maxDragLb: 10,
    lineCapacityMono: '12lb/110m',
    lineCapacityBraid: '20lb/140m',
    ballBearings: 5,
    durability: 1800,
    maxDurability: 1800,
    price: 389
  },
  {
    id: 'baitcast_winner',
    name: 'Carretilha Winner LP',
    description: 'Carretilha de alto desempenho com 7kg de arrasto. Corpo em alumínio e rolamentos blindados.',
    type: 'baitcasting',
    gearRatio: '6.3:1',
    maxDragLb: 15,
    lineCapacityMono: '14lb/130m',
    lineCapacityBraid: '25lb/170m',
    ballBearings: 6,
    durability: 2500,
    maxDurability: 2500,
    price: 459
  }
];

export const SINKERS: Sinker[] = [
  {
    id: 'sinker_20g',
    name: 'Chumbo 20g',
    description: 'Chumbo básico para pesca de fundo. Ideal para águas calmas.',
    weightG: 20,
    price: 3,
    quantity: 5
  },
  {
    id: 'sinker_40g',
    name: 'Chumbo 40g',
    description: 'Chumbo médio para águas com leve correnteza.',
    weightG: 40,
    price: 5,
    quantity: 5
  },
  {
    id: 'sinker_60g',
    name: 'Chumbo 60g',
    description: 'Chumbo pesado para rios com correnteza forte.',
    weightG: 60,
    price: 8,
    quantity: 5
  }
];

export const ARTIFICIAL_LURES: ArtificialLure[] = [
  // SUPERFÍCIE
  {
    id: 'popper_small',
    name: 'Popper Pequeno',
    description: 'Isca de superfície que produz estouros na água. Irresistível para predadores.',
    type: 'popper',
    depth: 'surface',
    weightG: 7,
    sizeCm: 6,
    targetDiet: ['carnivore'],
    targetLocations: ['pond', 'river'],
    price: 35,
    durability: 50,
    maxDurability: 50,
    icon: '💥'
  },
  {
    id: 'popper_medium',
    name: 'Popper Médio',
    description: 'Popper clássico para traíras e tucunarés. Trabalho de superfície.',
    type: 'popper',
    depth: 'surface',
    weightG: 14,
    sizeCm: 9,
    targetDiet: ['carnivore'],
    targetLocations: ['pond', 'river'],
    price: 55,
    durability: 80,
    maxDurability: 80,
    icon: '💥'
  },
  {
    id: 'popper_large',
    name: 'Popper Grande',
    description: 'Popper grande para troféus. Barulho alto que atrai predadores de longe.',
    type: 'popper',
    depth: 'surface',
    weightG: 25,
    sizeCm: 12,
    targetDiet: ['carnivore'],
    targetLocations: ['river'],
    price: 85,
    durability: 100,
    maxDurability: 100,
    icon: '💥'
  },
  {
    id: 'floating_minnow',
    name: 'Peixinho Flutuante',
    description: 'Imita peixe ferido na superfície. Movimentos erráticos atraem predadores.',
    type: 'minnow',
    depth: 'surface',
    weightG: 8,
    sizeCm: 7,
    targetDiet: ['carnivore'],
    targetLocations: ['pond', 'river', 'creek'],
    price: 40,
    durability: 60,
    maxDurability: 60,
    icon: '🐟'
  },
  // MEIA ÁGUA
  {
    id: 'swimbait_small',
    name: 'Swimbait Pequeno',
    description: 'Peixe articulado que nada de forma realista. Ideal para meia água.',
    type: 'swimbait',
    depth: 'midwater',
    weightG: 12,
    sizeCm: 8,
    targetDiet: ['carnivore'],
    targetLocations: ['pond', 'river'],
    price: 45,
    durability: 70,
    maxDurability: 70,
    icon: '🐠'
  },
  {
    id: 'swimbait_medium',
    name: 'Swimbait Médio',
    description: 'Nado realista em meia água. Perfeito para tucunarés.',
    type: 'swimbait',
    depth: 'midwater',
    weightG: 20,
    sizeCm: 12,
    targetDiet: ['carnivore'],
    targetLocations: ['pond', 'river'],
    price: 65,
    durability: 90,
    maxDurability: 90,
    icon: '🐠'
  },
  {
    id: 'crankbait',
    name: 'Crankbait',
    description: 'Isca de barbela que mergulha ao recolher. Vibração intensa.',
    type: 'crankbait',
    depth: 'midwater',
    weightG: 15,
    sizeCm: 7,
    targetDiet: ['carnivore'],
    targetLocations: ['pond', 'river', 'creek'],
    price: 50,
    durability: 75,
    maxDurability: 75,
    icon: '🔵'
  },
  {
    id: 'spinnerbait',
    name: 'Spinnerbait',
    description: 'Lâminas giratórias criam flash e vibração. Versátil para meia água.',
    type: 'spinnerbait',
    depth: 'midwater',
    weightG: 14,
    sizeCm: 10,
    targetDiet: ['carnivore'],
    targetLocations: ['pond', 'river'],
    price: 55,
    durability: 80,
    maxDurability: 80,
    icon: '✨'
  },
  // FUNDO
  {
    id: 'shad_small',
    name: 'Shad Pequeno',
    description: 'Isca de silicone para trabalho de fundo. Cauda vibrante.',
    type: 'shad',
    depth: 'deep',
    weightG: 10,
    sizeCm: 7,
    targetDiet: ['carnivore'],
    targetLocations: ['pond', 'river', 'creek'],
    price: 25,
    durability: 40,
    maxDurability: 40,
    icon: '🔻'
  },
  {
    id: 'shad_medium',
    name: 'Shad Médio',
    description: 'Shad versátil para fundo. Excelente para traíras e tucunarés.',
    type: 'shad',
    depth: 'deep',
    weightG: 18,
    sizeCm: 10,
    targetDiet: ['carnivore'],
    targetLocations: ['pond', 'river'],
    price: 35,
    durability: 55,
    maxDurability: 55,
    icon: '🔻'
  },
  {
    id: 'shad_large',
    name: 'Shad Grande',
    description: 'Shad robusto para grandes predadores de fundo.',
    type: 'shad',
    depth: 'deep',
    weightG: 28,
    sizeCm: 14,
    targetDiet: ['carnivore'],
    targetLocations: ['river'],
    price: 50,
    durability: 70,
    maxDurability: 70,
    icon: '🔻'
  },
  {
    id: 'jig_head',
    name: 'Jig Head',
    description: 'Cabeça de chumbo com anzol exposto. Trabalho vertical no fundo.',
    type: 'jig',
    depth: 'deep',
    weightG: 14,
    sizeCm: 5,
    targetDiet: ['carnivore'],
    targetLocations: ['pond', 'river', 'creek'],
    price: 20,
    durability: 100,
    maxDurability: 100,
    icon: '⚫'
  },
  {
    id: 'spoon',
    name: 'Colher',
    description: 'Isca metálica clássica. Brilho e vibração irresistíveis no fundo.',
    type: 'spoon',
    depth: 'deep',
    weightG: 20,
    sizeCm: 6,
    targetDiet: ['carnivore'],
    targetLocations: ['pond', 'river'],
    price: 30,
    durability: 120,
    maxDurability: 120,
    icon: '🥄'
  }
];

export interface EquipmentSetup {
  rod: FishingRod;
  line: FishingLine;
  reel?: Reel;
  hook?: Hook;
  float?: FloatBobber;
  lure?: ArtificialLure;
  sinker?: Sinker;
}

export function calculateMaxFishWeight(setup: EquipmentSetup): number {
  const rodMaxLb = setup.rod.maxLineWeightLb;
  const lineMaxLb = setup.line.testWeightLb;
  const reelMaxLb = setup.reel?.maxDragLb || Infinity;
  const hookMaxKg = setup.hook?.maxFishWeightKg || Infinity;
  
  const weakestLinkLb = Math.min(rodMaxLb, lineMaxLb, reelMaxLb);
  const weakestLinkKg = weakestLinkLb * 0.453592;
  
  return Math.min(weakestLinkKg, hookMaxKg);
}

export function calculateTensionLimit(setup: EquipmentSetup): number {
  const maxWeight = calculateMaxFishWeight(setup);
  return Math.round(maxWeight * 10);
}

export function isSetupCompatible(setup: EquipmentSetup): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (setup.rod.fishingType === 'baitcasting' && setup.reel?.type !== 'baitcasting') {
    errors.push('Vara de carretilha requer uma carretilha, não molinete');
  }
  
  if (setup.rod.fishingType === 'float' && setup.reel?.type === 'baitcasting') {
    errors.push('Vara de boia não é compatível com carretilha');
  }
  
  if (setup.line.testWeightLb > setup.rod.maxLineWeightLb) {
    errors.push('Linha muito pesada para esta vara');
  }
  
  if (setup.rod.fishingType === 'float' && !setup.float) {
    errors.push('Pesca de boia requer uma boia');
  }
  
  if (setup.rod.fishingType === 'float' && !setup.hook) {
    errors.push('Pesca de boia requer um anzol');
  }
  
  if (setup.rod.fishingType === 'baitcasting' && !setup.lure) {
    errors.push('Pesca de carretilha requer uma isca artificial');
  }
  
  if (setup.rod.fishingType === 'bottom' && !setup.reel) {
    errors.push('Pesca de fundo requer um molinete');
  }
  
  if (setup.rod.fishingType === 'bottom' && !setup.sinker) {
    errors.push('Pesca de fundo requer um chumbo');
  }
  
  if (setup.rod.fishingType === 'bottom' && !setup.hook) {
    errors.push('Pesca de fundo requer um anzol');
  }
  
  return { valid: errors.length === 0, errors };
}

export function getHookForBaitSize(baitSize: number): Hook | undefined {
  return HOOKS.find(h => baitSize >= h.minBaitSize && baitSize <= h.maxBaitSize);
}

export function getPowerName(power: FishingRod['power']): string {
  switch (power) {
    case 'ultralight': return 'Ultra Leve';
    case 'light': return 'Leve';
    case 'medium': return 'Médio';
    case 'heavy': return 'Pesado';
    case 'extra-heavy': return 'Extra Pesado';
  }
}

export function getActionName(action: FishingRod['action']): string {
  switch (action) {
    case 'slow': return 'Lenta';
    case 'moderate': return 'Moderada';
    case 'fast': return 'Rápida';
    case 'extra-fast': return 'Extra Rápida';
  }
}

export function getFishingTypeName(type: FishingType): string {
  switch (type) {
    case 'float': return 'Pesca de Boia';
    case 'baitcasting': return 'Pesca de Carretilha';
    case 'bottom': return 'Pesca de Fundo';
  }
}
