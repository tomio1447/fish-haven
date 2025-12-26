import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, MapPin, Fish, Waves, X, Navigation, ChevronRight } from "lucide-react";
import { LOCATIONS, FISH_SPECIES, LocationWithImage, BRAZIL_STATES, getLocationsByState, getStateById, BrazilState } from "@/lib/fishData";
import { useGame } from "@/context/GameContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import brazilMap from '@assets/generated_images/brazil_satellite_map_view.png';
import { useToast } from "@/hooks/use-toast";

function getFishForLocation(locationId: string) {
  return FISH_SPECIES.filter(fish => fish.locations.includes(locationId));
}

function getDifficultyInfo(difficulty: 'easy' | 'medium' | 'hard') {
  switch (difficulty) {
    case 'easy': return { label: 'Fácil', color: 'from-green-500 to-green-600', stars: 1 };
    case 'medium': return { label: 'Médio', color: 'from-yellow-500 to-yellow-600', stars: 2 };
    case 'hard': return { label: 'Difícil', color: 'from-red-500 to-red-600', stars: 3 };
  }
}

function getDepthLabel(depth: string) {
  switch (depth) {
    case 'surface': return 'Superfície';
    case 'midwater': return 'Meia Água';
    case 'deep': return 'Fundo';
    default: return depth;
  }
}

function getLocationIcon(id: string) {
  switch (id) {
    case 'pond': return '🏞️';
    case 'creek': return '🌊';
    case 'river': return '🏔️';
    default: return '📍';
  }
}

export default function MapSelect() {
  const { coins, currentLocation, travelTo } = useGame();
  const [selectedState, setSelectedState] = useState<BrazilState | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationWithImage | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleTravel = (location: LocationWithImage) => {
    const isCurrentLocation = currentLocation === location.id;
    const cost = isCurrentLocation ? 0 : location.travelCost;
    
    if (cost > 0 && coins < cost) {
      toast({
        title: "Moedas insuficientes",
        description: `Você precisa de ${cost} moedas para viajar para ${location.name}.`,
        variant: "destructive"
      });
      return;
    }
    
    const success = travelTo(location.id, cost);
    if (success) {
      if (cost > 0) {
        toast({
          title: "Viagem realizada!",
          description: `Você pagou ${cost} moedas para viajar para ${location.name}.`
        });
      }
      navigate(`/fish/${location.id}`);
    }
  };

  const getCurrentLocationInfo = () => {
    const loc = LOCATIONS.find(l => l.id === currentLocation);
    if (!loc) return { name: 'Desconhecido', state: null };
    const state = getStateById(loc.stateId);
    return { name: loc.name, state };
  };

  const currentInfo = getCurrentLocationInfo();
  const stateLocations = selectedState ? getLocationsByState(selectedState.id) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-emerald-200 to-sky-300 p-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/">
            <motion.button 
              className="bg-emerald-700 hover:bg-emerald-600 text-white p-3 rounded-full shadow-lg transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl text-emerald-900 drop-shadow-sm font-display">Mapa do Brasil</h1>
            <p className="text-emerald-700/70 text-sm">Selecione um estado para explorar os locais de pesca</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/90 backdrop-blur rounded-lg px-3 py-2 shadow flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-600" />
              <div className="text-xs">
                <span className="text-gray-500">{currentInfo.state?.code || '??'}</span>
                <span className="text-gray-400 mx-1">•</span>
                <span className="text-gray-600">{currentInfo.name}</span>
              </div>
            </div>
            <div className="bg-amber-100 rounded-lg px-3 py-2 shadow flex items-center gap-2" data-testid="text-coins-display">
              <span className="text-lg">🪙</span>
              <span className="font-bold text-amber-700">{coins}</span>
            </div>
          </div>
        </motion.div>

        <div className="relative bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl shadow-xl overflow-hidden border-4 border-cyan-600 mx-auto max-w-3xl">
          <img 
            src={brazilMap} 
            alt="Mapa do Brasil"
            className="w-full h-auto object-contain"
          />
          
          {BRAZIL_STATES.map((state, index) => {
            const isUnlocked = state.unlocked;
            const hasCurrentLocation = LOCATIONS.some(l => l.stateId === state.id && l.id === currentLocation);
            
            return (
              <motion.button
                key={state.id}
                className={cn(
                  "absolute w-14 h-14 -translate-x-1/2 -translate-y-1/2 rounded-full flex flex-col items-center justify-center text-xs font-bold shadow-lg border-4 cursor-pointer z-10",
                  isUnlocked 
                    ? hasCurrentLocation
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-600 border-white ring-4 ring-emerald-300 text-white"
                      : "bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300 text-amber-900 hover:scale-110" 
                    : "bg-gray-400 border-gray-300 opacity-60 text-gray-600"
                )}
                style={{ 
                  left: `${state.mapPosition.x}%`, 
                  top: `${state.mapPosition.y}%` 
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.15, type: "spring", stiffness: 200 }}
                whileHover={isUnlocked ? { scale: 1.15 } : {}}
                whileTap={isUnlocked ? { scale: 0.95 } : {}}
                onClick={() => isUnlocked && setSelectedState(state)}
                disabled={!isUnlocked}
                data-testid={`map-state-${state.id}`}
              >
                <span className="text-lg">{state.code}</span>
                {hasCurrentLocation && (
                  <motion.div 
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white shadow flex items-center justify-center"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    📍
                  </motion.div>
                )}
              </motion.button>
            );
          })}

          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
            <div className="text-xs font-bold text-gray-700 mb-2">Legenda</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Você está aqui</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Disponível</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span>Bloqueado</span>
              </div>
            </div>
          </div>

          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
            <div className="text-xs font-bold text-gray-700 mb-1">Estados</div>
            <div className="space-y-1 text-xs">
              {BRAZIL_STATES.map(state => (
                <div 
                  key={state.id} 
                  className={cn(
                    "flex items-center gap-2",
                    state.unlocked ? "cursor-pointer hover:text-emerald-600" : "opacity-50"
                  )}
                  onClick={() => state.unlocked && setSelectedState(state)}
                >
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    state.unlocked ? "bg-amber-500" : "bg-gray-400"
                  )} />
                  <span>{state.code} - {state.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* State Selection Modal */}
        <AnimatePresence>
          {selectedState && !selectedLocation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={() => setSelectedState(null)}
            >
              <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                data-testid={`popup-state-${selectedState.id}`}
              >
                <div className="relative h-32 bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-white/30">{selectedState.code}</div>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedState(null)}
                    className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 rounded-full p-2 transition-colors"
                    data-testid="button-close-state"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
                      <MapPin className="w-3 h-3" />
                      <span>Região {selectedState.region}</span>
                    </div>
                    <h3 className="text-2xl text-white font-display drop-shadow-lg">{selectedState.name}</h3>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <p className="text-gray-600 text-sm">{selectedState.description}</p>
                  
                  <div className="border-t pt-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Fish className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-bold text-gray-700">
                        Locais de Pesca ({stateLocations.length})
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {stateLocations.map(loc => {
                        const isHere = currentLocation === loc.id;
                        const fishCount = getFishForLocation(loc.id).length;
                        const diffInfo = getDifficultyInfo(loc.difficulty);
                        
                        return (
                          <motion.button
                            key={loc.id}
                            className={cn(
                              "w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all",
                              isHere 
                                ? "border-emerald-400 bg-emerald-50" 
                                : "border-gray-200 bg-gray-50 hover:border-amber-400 hover:bg-amber-50"
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedLocation(loc as LocationWithImage)}
                            data-testid={`location-card-${loc.id}`}
                          >
                            <div className="text-2xl">{getLocationIcon(loc.id)}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-800">{loc.name}</span>
                                {isHere && <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">Aqui</span>}
                              </div>
                              <div className="text-xs text-gray-500">{loc.region} • {fishCount} espécies</div>
                            </div>
                            <div className="text-right">
                              <div className={cn(
                                "text-xs font-bold px-2 py-1 rounded-full bg-gradient-to-r text-white",
                                diffInfo.color
                              )}>
                                {diffInfo.label}
                              </div>
                              {!isHere && loc.travelCost > 0 && (
                                <div className="text-xs text-amber-600 mt-1 flex items-center gap-1 justify-end">
                                  🪙 {loc.travelCost}
                                </div>
                              )}
                              {!isHere && loc.travelCost === 0 && (
                                <div className="text-xs text-green-600 mt-1">Grátis</div>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Location Detail Modal */}
        <AnimatePresence>
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={() => setSelectedLocation(null)}
            >
              <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                data-testid={`popup-${selectedLocation.id}`}
              >
                <div className="relative h-40 bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center">
                  <div className="text-6xl">{getLocationIcon(selectedLocation.id)}</div>
                  
                  <button 
                    onClick={() => setSelectedLocation(null)}
                    className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 rounded-full p-2 transition-colors"
                    data-testid="button-close-popup"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
                      <MapPin className="w-3 h-3" />
                      <span>{selectedLocation.region}, {getStateById(selectedLocation.stateId)?.name}</span>
                    </div>
                    <h3 className="text-2xl text-white font-display drop-shadow-lg">{selectedLocation.name}</h3>
                  </div>

                  <div className={cn(
                    "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r",
                    getDifficultyInfo(selectedLocation.difficulty).color
                  )}>
                    {getDifficultyInfo(selectedLocation.difficulty).label}
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <p className="text-gray-600 text-sm">{selectedLocation.description}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Waves className="w-4 h-4 text-blue-500" />
                    <span>Profundidades: {selectedLocation.depths.map(d => getDepthLabel(d)).join(' • ')}</span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Fish className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-bold text-gray-700">
                        Peixes Disponíveis ({getFishForLocation(selectedLocation.id).length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getFishForLocation(selectedLocation.id).map(fish => (
                        <div 
                          key={fish.id}
                          className="flex items-center gap-1.5 bg-gray-100 rounded-full px-2 py-1"
                          data-testid={`fish-badge-${fish.id}`}
                        >
                          <img 
                            src={fish.image} 
                            alt={fish.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-xs text-gray-700">{fish.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {(() => {
                    const isHere = currentLocation === selectedLocation.id;
                    const cost = isHere ? 0 : selectedLocation.travelCost;
                    const canAfford = coins >= cost;
                    
                    return (
                      <motion.button 
                        className={cn(
                          "w-full text-white text-center py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2",
                          canAfford 
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-600" 
                            : "bg-gray-400 cursor-not-allowed"
                        )}
                        whileHover={canAfford ? { scale: 1.03 } : {}}
                        whileTap={canAfford ? { scale: 0.97 } : {}}
                        onClick={() => handleTravel(selectedLocation)}
                        disabled={!canAfford}
                        data-testid={`button-fish-${selectedLocation.id}`}
                      >
                        {isHere ? (
                          <>
                            <Fish className="w-5 h-5" />
                            Pescar Aqui (Você está aqui)
                          </>
                        ) : cost === 0 ? (
                          <>
                            <Fish className="w-5 h-5" />
                            Pescar Aqui (Grátis)
                          </>
                        ) : (
                          <>
                            <Navigation className="w-5 h-5" />
                            Viajar ({cost} 🪙)
                          </>
                        )}
                      </motion.button>
                    );
                  })()}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
