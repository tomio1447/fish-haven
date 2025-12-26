import { useState, useEffect } from "react";
import { Maximize, ArrowUpRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FullscreenPrompt() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('fullscreen-prompt-seen');
    if (!hasSeenPrompt && !document.fullscreenElement) {
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('fullscreen-prompt-seen', 'true');
  };

  const handleActivate = async () => {
    try {
      await document.documentElement.requestFullscreen();
      handleClose();
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
          
          <motion.div 
            className="relative w-full max-w-md backdrop-blur-xl bg-black/80 border border-white/20 rounded-2xl overflow-hidden p-6"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <button 
              onClick={handleClose}
              className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                <Maximize className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-display text-white">Bem-vindo ao Pesca Brasil!</h2>
              
              <p className="text-white/70">
                Para uma melhor experiência, recomendamos jogar em <strong className="text-white">tela cheia</strong>.
              </p>

              <div className="flex flex-col gap-3 pt-2">
                <motion.button
                  onClick={handleActivate}
                  className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Maximize className="w-5 h-5" />
                  Ativar Tela Cheia
                </motion.button>
                
                <button
                  onClick={handleClose}
                  className="text-white/50 hover:text-white/70 text-sm transition-colors"
                >
                  Continuar sem tela cheia
                </button>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-white/50 text-sm flex items-center justify-center gap-1">
                  Você também pode ativar depois clicando no 
                  <span className="inline-flex items-center gap-1 text-white bg-white/20 px-2 py-0.5 rounded">
                    <Maximize className="w-3 h-3" />
                  </span>
                  no canto superior direito
                  <ArrowUpRight className="w-4 h-4 text-white/70" />
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="fixed top-3 right-3 z-[101]"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
          >
            <div className="absolute inset-0 bg-yellow-400/50 rounded-lg blur-md" />
            <div className="relative bg-yellow-400/30 border-2 border-yellow-400 rounded-lg p-2">
              <Maximize className="w-5 h-5 text-yellow-400" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
