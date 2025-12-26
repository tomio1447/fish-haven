import { Link } from "wouter";
import { Map, Fish, ShoppingBag, BookOpen, Play, Settings, ChevronRight, Backpack, Trophy, X } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useSettings, type Language } from "@/context/SettingsContext";
import { GameClock } from "@/components/GameClock";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import natureBgVideo from '@assets/generated_videos/peaceful_lake_nature_scene.mp4';

const LANGUAGE_OPTIONS: { id: Language; flag: string; name: string }[] = [
  { id: 'pt', flag: '🇧🇷', name: 'Português' },
  { id: 'en', flag: '🇺🇸', name: 'English' },
  { id: 'es', flag: '🇪🇸', name: 'Español' },
  { id: 'ja', flag: '🇯🇵', name: '日本語' },
];

export default function Home() {
  const { coins, getTotalMastery } = useGame();
  const { language, setLanguage, t } = useSettings();
  const [showSettings, setShowSettings] = useState(false);

  const menuItems = [
    { href: '/map', icon: Play, labelKey: 'menu.start_fishing', primary: true },
    { href: '/equipment', icon: Backpack, labelKey: 'menu.inventory' },
    { href: '/shop', icon: ShoppingBag, labelKey: 'menu.shop' },
    { href: '/inventory', icon: Fish, labelKey: 'menu.fish_basket' },
    { href: '/trophies', icon: Trophy, labelKey: 'menu.trophy_room' },
    { href: '/guide', icon: BookOpen, labelKey: 'menu.fish_guide' },
  ];

  return (
    <div className="min-h-screen flex relative overflow-hidden" data-testid="home-page">
      {/* Video Background */}
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

      {/* Clock HUD */}
      <div className="absolute top-4 right-4 z-20">
        <GameClock />
      </div>

      {/* Left Sidebar Menu */}
      <motion.aside 
        className="relative z-10 w-[272px] min-h-screen backdrop-blur-xl bg-black/40 border-r border-white/10 flex flex-col"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo/Title Section */}
        <div className="p-6 border-b border-white/10">
          <motion.h1 
            className="text-3xl font-display text-white tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Pesca Brasil
          </motion.h1>
          <p className="text-sm text-white/50 mt-1">Águas do Brasil</p>
        </div>

        {/* Stats Section */}
        <div className="p-4 border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">{t('home.minhocoins')}</span>
            <span className="text-white font-semibold" data-testid="text-coins">{coins} 🪱</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">{t('home.mastery')}</span>
            <span className="text-white font-semibold" data-testid="text-mastery">{getTotalMastery()} ⭐</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item, index) => (
            <Link href={item.href} key={item.href}>
              <motion.button
                className={cn(
                  "w-full group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left",
                  item.primary 
                    ? "bg-white/10 hover:bg-white/20 text-white" 
                    : "hover:bg-white/10 text-white/70 hover:text-white"
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index + 0.3 }}
                whileHover={{ x: 4 }}
                data-testid={`button-${item.labelKey.replace('menu.', '')}`}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  item.primary ? "text-white" : "text-white/50 group-hover:text-white/80"
                )} />
                <span className="flex-1 font-medium text-sm">{t(item.labelKey)}</span>
                <ChevronRight className={cn(
                  "w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity",
                  item.primary ? "text-white/60" : "text-white/40"
                )} />
              </motion.button>
            </Link>
          ))}
        </nav>

        {/* Footer with Settings Button */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <p className="text-white/30 text-xs">v1.4.0</p>
          <motion.button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-testid="button-settings"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-display text-white drop-shadow-lg mb-4">
            {t('home.welcome')}
          </h2>
          <p className="text-white/60 text-lg max-w-md mx-auto">
            {t('home.subtitle')}
          </p>
        </motion.div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowSettings(false)}
            />
            <motion.div
              className="relative w-full max-w-md mx-4 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border border-white/20 shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {t('settings.title')}
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  data-testid="button-close-settings"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Ambient Sound - Coming Soon */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 opacity-60">
                  <div>
                    <div className="font-medium text-white">🔊 {t('settings.ambient')}</div>
                    <div className="text-xs text-yellow-400 mt-1">{t('settings.coming_soon')}</div>
                  </div>
                  <div className="w-12 h-6 bg-gray-700 rounded-full relative">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-gray-500 rounded-full" />
                  </div>
                </div>

                {/* Radio - Coming Soon */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 opacity-60">
                  <div>
                    <div className="font-medium text-white">📻 {t('settings.radio')}</div>
                    <div className="text-xs text-yellow-400 mt-1">{t('settings.coming_soon')}</div>
                  </div>
                  <div className="w-12 h-6 bg-gray-700 rounded-full relative">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-gray-500 rounded-full" />
                  </div>
                </div>

                {/* Language Selection */}
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="font-medium text-white mb-3">🌐 {t('settings.language')}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setLanguage(lang.id)}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg border transition-all",
                          language === lang.id
                            ? "bg-emerald-600/30 border-emerald-500 text-white"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                        data-testid={`button-lang-${lang.id}`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-sm font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-black/20">
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition-colors"
                  data-testid="button-close-settings-footer"
                >
                  {t('settings.close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
