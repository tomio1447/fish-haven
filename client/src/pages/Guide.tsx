import { Link } from "wouter";
import { ArrowLeft, Star, Lock, Scale, Clock, Fish as FishIcon, MapPin, Utensils } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { FISH_SPECIES, LOCATIONS } from "@/lib/fishData";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import natureBgVideo from '@assets/generated_videos/peaceful_lake_nature_scene.mp4';

const LOCATION_TABS = [
  { id: 'all', name: 'Todos' },
  { id: 'pond', name: 'Lagoa' },
  { id: 'creek', name: 'Córrego' },
  { id: 'river', name: 'Rio' },
];

function FishCard({ fish, record, index, onSelect }: { 
  fish: typeof FISH_SPECIES[0], 
  record: { count: number; maxWeight: number; stars: number; sRankCount: number } | undefined, 
  index: number,
  onSelect: () => void
}) {
  const isDiscovered = !!record && record.count > 0;
  const stars = record?.stars || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      onClick={onSelect}
      className="cursor-pointer group"
      data-testid={`fish-card-${fish.id}`}
    >
      <div className={cn(
        "relative backdrop-blur-xl rounded-xl overflow-hidden border transition-all duration-300",
        isDiscovered 
          ? "bg-white/10 border-white/20 hover:border-white/40 hover:bg-white/15" 
          : "bg-black/30 border-white/10 hover:border-white/20"
      )}>
        <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-sky-900/50 to-blue-900/50">
          <img 
            src={fish.image} 
            alt={fish.name}
            className={cn(
              "w-full h-full object-contain p-2 transition-all duration-300",
              "group-hover:scale-105"
            )}
          />
          {!isDiscovered && (
            <div className="absolute top-2 right-2">
              <div className="bg-black/50 rounded-full p-1">
                <Lock className="w-4 h-4 text-white/60" />
              </div>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-2 flex gap-0.5 justify-center bg-gradient-to-t from-black/60 to-transparent">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < stars ? "text-yellow-400 fill-yellow-400" : "text-white/30"
                )} 
              />
            ))}
          </div>
        </div>
        
        <div className="p-3">
          <h3 className="font-display text-center truncate text-white" data-testid={`fish-name-${fish.id}`}>
            {fish.name}
          </h3>
          <p className="text-xs text-white/40 italic text-center truncate mt-0.5">
            {fish.scientificName}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function FishDetailModal({ fish, record, onClose }: { 
  fish: typeof FISH_SPECIES[0], 
  record: { count: number; maxWeight: number; stars: number; sRankCount: number } | undefined,
  onClose: () => void
}) {
  const catchCount = record?.count || 0;
  const stars = record?.stars || 0;

  const getActivityLabel = (activity: string) => {
    switch (activity) {
      case 'diurnal': return 'Diurno';
      case 'nocturnal': return 'Noturno';
      case 'both': return 'Dia e Noite';
      default: return activity;
    }
  };

  const getDepthLabel = (depth: string) => {
    switch (depth) {
      case 'surface': return 'Superfície';
      case 'midwater': return 'Meia Água';
      case 'deep': return 'Fundo';
      default: return depth;
    }
  };

  const getDietLabel = (diet: string) => {
    switch (diet) {
      case 'omnivore': return 'Onívoro';
      case 'herbivore': return 'Herbívoro';
      case 'carnivore': return 'Carnívoro';
      default: return diet;
    }
  };

  const infoItems = [
    { 
      icon: Scale, 
      label: 'Peso', 
      value: `${fish.stats.minWeight}-${fish.stats.maxWeight} kg`,
      unlockAt: 3,
      color: 'text-blue-400'
    },
    { 
      icon: FishIcon, 
      label: 'Tamanho', 
      value: `${fish.stats.minLength}-${fish.stats.maxLength} cm`,
      unlockAt: 3,
      color: 'text-cyan-400'
    },
    { 
      icon: Utensils, 
      label: 'Dieta', 
      value: getDietLabel(fish.dietType),
      unlockAt: 5,
      color: 'text-green-400'
    },
    { 
      icon: Clock, 
      label: 'Atividade', 
      value: getActivityLabel(fish.activityPeriod),
      unlockAt: 5,
      color: 'text-amber-400'
    },
    { 
      icon: MapPin, 
      label: 'Profundidade', 
      value: fish.feedingDepth.map(d => getDepthLabel(d)).join(', '),
      unlockAt: 7,
      color: 'text-purple-400'
    },
  ];

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <motion.div 
        className="relative w-full max-w-lg backdrop-blur-xl bg-black/60 border border-white/20 rounded-2xl overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-video relative bg-gradient-to-br from-sky-900/80 to-blue-900/80">
          <img 
            src={fish.image} 
            alt={fish.name}
            className="w-full h-full object-contain p-4"
          />
          <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-1 justify-center bg-gradient-to-t from-black/80 to-transparent">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i}
                className={cn(
                  "w-6 h-6",
                  i < stars ? "text-yellow-400 fill-yellow-400" : "text-white/30"
                )} 
              />
            ))}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-display text-white">{fish.name}</h2>
            <p className="text-white/50 italic text-sm">{fish.scientificName}</p>
          </div>

          {catchCount > 0 && (
            <p className="text-white/70 text-sm italic text-center border-t border-b border-white/10 py-3">
              "{fish.description}"
            </p>
          )}

          <div className="space-y-2">
            {infoItems.map((item, i) => {
              const isUnlocked = catchCount >= item.unlockAt;
              return (
                <div 
                  key={i}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-all",
                    isUnlocked ? "bg-white/10" : "bg-white/5"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isUnlocked ? item.color : "text-white/30")} />
                  <span className="text-white/60 text-sm flex-1">{item.label}</span>
                  {isUnlocked ? (
                    <span className="text-white font-medium">{item.value}</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-white/30" />
                      <span className="text-white/30 text-sm">Capture {item.unlockAt}x</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {catchCount >= 10 && (
            <div className="bg-white/10 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Locais</span>
              </div>
              <p className="text-white/80 text-sm">
                {fish.locations.map(loc => LOCATIONS.find(l => l.id === loc)?.name || loc).join(', ')}
              </p>
            </div>
          )}

          {catchCount > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div className="text-center">
                <div className="text-white/50 text-xs uppercase">Capturas</div>
                <div className="text-white font-display text-xl">{catchCount}</div>
              </div>
              <div className="text-center">
                <div className="text-white/50 text-xs uppercase">Recorde</div>
                <div className="text-white font-display text-xl">{record?.maxWeight.toFixed(2)} kg</div>
              </div>
            </div>
          )}

          {catchCount === 0 && (
            <div className="text-center text-white/40 py-4">
              <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Capture este peixe para desbloquear informações</p>
            </div>
          )}
        </div>

        <button 
          onClick={onClose}
          className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function Guide() {
  const { mastery } = useGame();
  const [selectedFish, setSelectedFish] = useState<typeof FISH_SPECIES[0] | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const FISH_PER_PAGE = 8;

  const discoveredCount = Object.values(mastery).filter(m => m.count > 0).length;
  const totalCount = FISH_SPECIES.length;

  const filteredFish = activeTab === 'all' 
    ? FISH_SPECIES 
    : FISH_SPECIES.filter(fish => fish.locations.includes(activeTab));

  const totalPages = Math.ceil(filteredFish.length / FISH_PER_PAGE);
  const startIndex = (currentPage - 1) * FISH_PER_PAGE;
  const paginatedFish = filteredFish.slice(startIndex, startIndex + FISH_PER_PAGE);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-50"
        >
          <source src={natureBgVideo} type="video/mp4" />
        </video>
      </div>

      <div className="relative z-10 p-4 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/">
            <motion.button 
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl text-white font-display">Guia de Peixes</h1>
            <p className="text-white/50 text-sm">{discoveredCount}/{totalCount} descobertos</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 pt-3 pb-2">
        <div className="max-w-4xl mx-auto flex gap-2 overflow-x-auto">
          {LOCATION_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                activeTab === tab.id
                  ? "bg-white/20 text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
              )}
              data-testid={`tab-${tab.id}`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div 
        className="relative z-10 flex-1 overflow-y-auto p-4 guide-scrollbar"
        style={{ 
          scrollbarWidth: 'thin', 
          scrollbarColor: 'rgba(255,255,255,0.3) rgba(0,0,0,0.3)'
        }}
      >
        <style>{`
          .guide-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .guide-scrollbar::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.3);
            border-radius: 4px;
          }
          .guide-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.3);
            border-radius: 4px;
          }
          .guide-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.5);
          }
        `}</style>
        
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {paginatedFish.map((fish, index) => (
            <FishCard 
              key={fish.id}
              fish={fish}
              record={mastery[fish.id]}
              index={index}
              onSelect={() => setSelectedFish(fish)}
            />
          ))}
        </div>

        {filteredFish.length === 0 && (
          <div className="text-center text-white/50 py-12">
            <FishIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum peixe nesta localização</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="max-w-4xl mx-auto flex justify-center items-center gap-2 mt-6 pb-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "w-10 h-10 rounded-lg font-medium text-sm transition-all",
                  currentPage === page
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
                )}
                data-testid={`page-${page}`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedFish && (
        <FishDetailModal 
          fish={selectedFish}
          record={mastery[selectedFish.id]}
          onClose={() => setSelectedFish(null)}
        />
      )}
    </div>
  );
}
