import { useState, useEffect } from "react";
import { Maximize, Minimize } from "lucide-react";
import { motion } from "framer-motion";

export function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  return (
    <motion.button
      onClick={toggleFullscreen}
      className="fixed top-3 right-3 z-50 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white p-2 rounded-lg border border-white/20 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      data-testid="button-fullscreen"
      title={isFullscreen ? "Sair do modo tela cheia" : "Modo tela cheia"}
    >
      {isFullscreen ? (
        <Minimize className="w-5 h-5" />
      ) : (
        <Maximize className="w-5 h-5" />
      )}
    </motion.button>
  );
}
