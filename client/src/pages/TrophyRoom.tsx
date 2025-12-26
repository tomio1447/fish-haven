import { Link } from "wouter";
import { ArrowLeft, Trash2, Trophy } from "lucide-react";
import { useGame, TrophyRecord } from "@/context/GameContext";
import { FISH_SPECIES, LOCATIONS, type FishWithImage } from "@/lib/fishData";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import natureBgVideo from '@assets/generated_videos/peaceful_lake_nature_scene.mp4';

const getRankColor = (rank: string) => {
  switch (rank) {
    case 'S': return 'bg-yellow-500 text-yellow-900 border-yellow-600';
    case 'A': return 'bg-purple-500 text-white border-purple-600';
    case 'B': return 'bg-blue-500 text-white border-blue-600';
    default: return 'bg-gray-500 text-white border-gray-600';
  }
};

export default function TrophyRoom() {
  const { trophies, removeTrophy, coins } = useGame();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const trophiesWithDetails = trophies.map(trophy => {
    const fish = FISH_SPECIES.find((f: FishWithImage) => f.id === trophy.fishId);
    const location = LOCATIONS.find(l => l.id === trophy.locationId);
    return { 
      ...trophy, 
      fish,
      locationName: location?.name || trophy.locationId
    };
  }).sort((a, b) => b.createdAt - a.createdAt);

  const handleDelete = (trophyId: number) => {
    if (confirmDelete === trophyId) {
      removeTrophy(trophyId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(trophyId);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden" data-testid="trophy-room-page">
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={natureBgVideo} type="video/mp4" />
        </video>
      </div>

      <motion.aside 
        className="relative z-10 w-[280px] min-h-screen backdrop-blur-xl bg-black/40 border-r border-white/10 flex flex-col"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Link href="/">
              <motion.button 
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-2xl font-display text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" /> Troféus
              </h1>
              <p className="text-white/50 text-xs">{trophies.length} troféu{trophies.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Minhocoins</span>
            <span className="text-white font-semibold" data-testid="text-coins">{coins} 🪱</span>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="space-y-2">
            <div className="text-white/40 text-xs uppercase tracking-wider mb-3">Rankings</div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-yellow-900 font-bold text-xs">S</span>
              <span className="text-white/70">Lendário</span>
              <span className="text-white/40 ml-auto">{trophies.filter(t => t.rank === 'S').length}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">A</span>
              <span className="text-white/70">Excepcional</span>
              <span className="text-white/40 ml-auto">{trophies.filter(t => t.rank === 'A').length}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">B</span>
              <span className="text-white/70">Bom</span>
              <span className="text-white/40 ml-auto">{trophies.filter(t => t.rank === 'B').length}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold text-xs">C</span>
              <span className="text-white/70">Comum</span>
              <span className="text-white/40 ml-auto">{trophies.filter(t => t.rank === 'C').length}</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <p className="text-white/30 text-xs text-center">Arraste para a direita →</p>
        </div>
      </motion.aside>

      <main className="flex-1 relative z-10 p-6 overflow-y-auto">
        {trophies.length === 0 ? (
          <motion.div 
            className="h-full flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-8xl mb-6">🏆</div>
            <h2 className="text-3xl font-display text-white mb-2">Sala de Troféus Vazia</h2>
            <p className="text-white/50 mb-6">Capture peixes especiais e transforme-os em troféus</p>
            <Link href="/map">
              <motion.button
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🎣 Ir Pescar
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {trophiesWithDetails.map((trophy, idx) => (
                <motion.div
                  key={trophy.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="relative"
                  layout
                >
                  <div className="backdrop-blur-md bg-amber-900/40 rounded-xl p-4 border border-amber-500/30 shadow-xl">
                    <div className="absolute -top-3 -right-3 z-10">
                      <motion.div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 shadow-lg ${getRankColor(trophy.rank)}`}
                        animate={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {trophy.rank}
                      </motion.div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-20 h-20 relative shrink-0">
                        <motion.div 
                          className="w-full h-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-lg flex items-center justify-center border border-amber-500/30 shadow-inner overflow-hidden"
                          animate={{ rotateY: [-5, 5, -5] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                          {trophy.fish && (
                            <img 
                              src={trophy.fish.image} 
                              alt={trophy.fish.name} 
                              className="w-full h-full object-cover"
                            />
                          )}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
                            animate={{ x: ['-150%', '150%'] }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                          />
                        </motion.div>
                        <div className="absolute -bottom-1 -left-1 text-xl">🏆</div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-lg truncate">
                          {trophy.fish?.name || 'Peixe Desconhecido'}
                        </h3>
                        <p className="text-white/40 text-xs italic mb-2">
                          {trophy.fish?.scientificName || ''}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-black/20 rounded px-2 py-1">
                            <span className="text-white/40 text-xs">Peso</span>
                            <div className="text-white font-bold">{trophy.weight.toFixed(2)} kg</div>
                          </div>
                          <div className="bg-black/20 rounded px-2 py-1">
                            <span className="text-white/40 text-xs">Tamanho</span>
                            <div className="text-white font-bold">{trophy.length.toFixed(1)} cm</div>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs text-white/40">
                          <span>📍 {trophy.locationName}</span>
                          <span>{new Date(trophy.caughtAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      onClick={() => handleDelete(trophy.id)}
                      className={`absolute bottom-2 right-2 p-2 rounded-lg transition-colors ${
                        confirmDelete === trophy.id 
                          ? 'bg-red-600 text-white' 
                          : 'text-white/30 hover:text-red-400 hover:bg-black/20'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={confirmDelete === trophy.id ? 'Confirmar remoção' : 'Remover troféu'}
                      data-testid={`button-delete-trophy-${trophy.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
