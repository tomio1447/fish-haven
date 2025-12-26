import { Link } from "wouter";
import { ArrowLeft, DollarSign, Star, Clock, Package, Fish } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { FISH_SPECIES, type FishWithImage } from "@/lib/fishData";
import { motion } from "framer-motion";
import natureBgVideo from '@assets/generated_videos/peaceful_lake_nature_scene.mp4';

export default function Inventory() {
  const { 
    inventory, sellFish, coins, sellAllFish, 
    featuredFish, isFeaturedFish, getInventoryWeight, inventoryLimits,
    makeTrophy
  } = useGame();

  const featuredFishDetails = featuredFish.fishIds.map(id => 
    FISH_SPECIES.find((f: FishWithImage) => f.id === id)
  ).filter(Boolean) as FishWithImage[];

  const timeRemaining = Math.max(0, featuredFish.expiresAt - Date.now());
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  const inventoryWithDetails = inventory.map((item, originalIndex) => {
    const fish = FISH_SPECIES.find((f: FishWithImage) => f.id === item.fishId);
    const pricePerKg = fish?.pricePerKg || 10;
    const basePrice = Math.max(1, Math.round(pricePerKg * item.weight));
    const isFeatured = isFeaturedFish(item.fishId);
    const bonusPrice = isFeatured ? Math.round(basePrice * 1.2) : basePrice;
    return { ...item, ...fish, basePrice, bonusPrice, isFeatured, originalIndex };
  }).reverse();

  const totalValue = inventoryWithDetails.reduce((sum, item) => sum + item.bonusPrice, 0);
  const currentWeight = getInventoryWeight();

  return (
    <div className="min-h-screen flex relative overflow-hidden" data-testid="inventory-page">
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
        className="relative z-10 w-[320px] min-h-screen backdrop-blur-xl bg-black/40 border-r border-white/10 flex flex-col"
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
                <Fish className="w-6 h-6" /> Cesto de Pesca
              </h1>
              <div className="flex items-center gap-3 text-xs text-white/50 mt-1">
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {inventory.length}/{inventoryLimits.maxCount}
                </span>
                <span>•</span>
                <span>{currentWeight.toFixed(2)}/{inventoryLimits.maxWeight}kg</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Minhocoins</span>
            <span className="text-white font-semibold" data-testid="text-coins">{coins} 🪱</span>
          </div>
        </div>

        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-emerald-400" />
            <span className="text-white/80 text-sm font-medium">Peixes em Destaque</span>
            <span className="text-emerald-400 text-xs ml-auto flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {hoursRemaining}h {minutesRemaining}m
            </span>
          </div>
          <div className="space-y-2">
            {featuredFishDetails.map((fish) => (
              <div 
                key={fish.id}
                className="bg-white/10 rounded-lg p-2 flex items-center gap-2 border border-emerald-500/30"
              >
                <img src={fish.image} alt={fish.name} className="w-8 h-8 object-contain rounded" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{fish.name}</div>
                  <div className="text-xs text-emerald-400">+20% valor</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {inventory.length > 0 && (
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-white/50 uppercase">Valor Total</div>
                <div className="text-xl font-display text-emerald-400">+{totalValue} 🪱</div>
              </div>
              <motion.button 
                onClick={sellAllFish}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg border-b-2 border-emerald-800 active:border-b-0 active:translate-y-0.5 shadow-lg flex items-center gap-2 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-testid="button-sell-all"
              >
                <DollarSign className="w-4 h-4" />
                Vender Tudo
              </motion.button>
            </div>
          </div>
        )}

        <div className="p-2 text-center border-t border-white/10 mt-auto">
          <p className="text-white/30 text-xs">Arraste para a direita →</p>
        </div>
      </motion.aside>

      <main className="flex-1 relative z-10 p-6 overflow-y-auto">
        {inventory.length === 0 ? (
          <motion.div 
            className="h-full flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-8xl mb-6">🕸️</div>
            <h2 className="text-3xl font-display text-white mb-2">Cesto Vazio</h2>
            <p className="text-white/50 mb-6">Nenhum peixe capturado ainda</p>
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
            {inventoryWithDetails.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                whileHover={{ scale: 1.02 }}
                className={`backdrop-blur-md rounded-xl p-4 border ${
                  item.isFeatured 
                    ? 'bg-emerald-900/40 border-emerald-500/50' 
                    : 'bg-white/10 border-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 relative shrink-0">
                    <motion.div 
                      className={`w-full h-full rounded-lg flex items-center justify-center overflow-hidden border ${
                        item.isFeatured ? 'bg-emerald-800/50 border-emerald-500/50' : 'bg-white/10 border-white/20'
                      }`}
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    </motion.div>
                    {item.isFeatured && (
                      <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                        +20%
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-white truncate flex items-center gap-2">
                        {item.name}
                        {item.rank && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                            item.rank === 'S' ? 'bg-yellow-500 text-yellow-900' :
                            item.rank === 'A' ? 'bg-purple-500 text-white' :
                            item.rank === 'B' ? 'bg-blue-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>{item.rank}</span>
                        )}
                      </h3>
                    </div>
                    <p className="text-sm text-white/50">{item.weight.toFixed(2)} kg • {item.length?.toFixed(1) || '??'} cm</p>
                    <p className="text-xs text-white/30 mt-1">{new Date(item.date).toLocaleDateString()}</p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      {item.isFeatured ? (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-900/50 px-2 py-1 rounded flex items-center gap-1">
                          <Star className="w-3 h-3" /> {item.bonusPrice} 🪱
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-white/60 bg-white/10 px-2 py-1 rounded">
                          {item.basePrice} 🪱
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                  <motion.button 
                    onClick={() => sellFish(item.originalIndex, item.bonusPrice)}
                    className="flex-1 bg-emerald-600/80 hover:bg-emerald-500 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid={`button-sell-fish-${idx}`}
                  >
                    <DollarSign className="w-4 h-4" /> Vender
                  </motion.button>
                  <motion.button 
                    onClick={() => makeTrophy(item.originalIndex)}
                    className="flex-1 bg-amber-600/80 hover:bg-amber-500 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid={`button-trophy-fish-${idx}`}
                  >
                    🏆 Troféu
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
