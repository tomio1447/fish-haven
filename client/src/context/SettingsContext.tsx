import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'pt' | 'en' | 'es' | 'ja';

interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  ambientSound: boolean;
  setAmbientSound: (enabled: boolean) => void;
  radioEnabled: boolean;
  setRadioEnabled: (enabled: boolean) => void;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  pt: {
    'settings.title': 'Configurações',
    'settings.language': 'Idioma',
    'settings.ambient': 'Som Ambiente',
    'settings.radio': 'Rádio de Pilha',
    'settings.coming_soon': 'EM BREVE',
    'settings.close': 'Fechar',
    'menu.start_fishing': 'Iniciar Pescaria',
    'menu.inventory': 'Inventário',
    'menu.shop': 'Loja',
    'menu.fish_basket': 'Cesto de Pesca',
    'menu.trophy_room': 'Sala de Troféus',
    'menu.fish_guide': 'Guia de Peixes',
    'home.welcome': 'Bem-vindo, Pescador',
    'home.subtitle': 'Explore rios, lagoas e córregos do Brasil e capture as maiores espécies nativas.',
    'home.minhocoins': 'Minhocoins',
    'home.mastery': 'Maestria',
    'lang.pt': 'Português',
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.ja': '日本語',
  },
  en: {
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.ambient': 'Ambient Sound',
    'settings.radio': 'Transistor Radio',
    'settings.coming_soon': 'COMING SOON',
    'settings.close': 'Close',
    'menu.start_fishing': 'Start Fishing',
    'menu.inventory': 'Inventory',
    'menu.shop': 'Shop',
    'menu.fish_basket': 'Fish Basket',
    'menu.trophy_room': 'Trophy Room',
    'menu.fish_guide': 'Fish Guide',
    'home.welcome': 'Welcome, Fisherman',
    'home.subtitle': 'Explore rivers, ponds and creeks of Brazil and catch the biggest native species.',
    'home.minhocoins': 'Minhocoins',
    'home.mastery': 'Mastery',
    'lang.pt': 'Português',
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.ja': '日本語',
  },
  es: {
    'settings.title': 'Configuración',
    'settings.language': 'Idioma',
    'settings.ambient': 'Sonido Ambiental',
    'settings.radio': 'Radio de Pilas',
    'settings.coming_soon': 'PRÓXIMAMENTE',
    'settings.close': 'Cerrar',
    'menu.start_fishing': 'Iniciar Pesca',
    'menu.inventory': 'Inventario',
    'menu.shop': 'Tienda',
    'menu.fish_basket': 'Cesta de Pesca',
    'menu.trophy_room': 'Sala de Trofeos',
    'menu.fish_guide': 'Guía de Peces',
    'home.welcome': 'Bienvenido, Pescador',
    'home.subtitle': 'Explora ríos, lagunas y arroyos de Brasil y captura las mayores especies nativas.',
    'home.minhocoins': 'Minhocoins',
    'home.mastery': 'Maestría',
    'lang.pt': 'Português',
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.ja': '日本語',
  },
  ja: {
    'settings.title': '設定',
    'settings.language': '言語',
    'settings.ambient': '環境音',
    'settings.radio': 'ラジオ',
    'settings.coming_soon': '近日公開',
    'settings.close': '閉じる',
    'menu.start_fishing': '釣りを始める',
    'menu.inventory': 'インベントリ',
    'menu.shop': 'ショップ',
    'menu.fish_basket': '魚籠',
    'menu.trophy_room': 'トロフィールーム',
    'menu.fish_guide': '魚図鑑',
    'home.welcome': 'ようこそ、釣り人',
    'home.subtitle': 'ブラジルの川、池、小川を探検し、最大の在来種を捕まえましょう。',
    'home.minhocoins': 'ミンホコイン',
    'home.mastery': 'マスタリー',
    'lang.pt': 'Português',
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.ja': '日本語',
  }
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt');
  const [ambientSound, setAmbientSound] = useState(false);
  const [radioEnabled, setRadioEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pesca-brasil-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.language) setLanguageState(parsed.language);
        if (parsed.ambientSound !== undefined) setAmbientSound(parsed.ambientSound);
        if (parsed.radioEnabled !== undefined) setRadioEnabled(parsed.radioEnabled);
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pesca-brasil-settings', JSON.stringify({
      language,
      ambientSound,
      radioEnabled
    }));
  }, [language, ambientSound, radioEnabled]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['pt'][key] || key;
  };

  return (
    <SettingsContext.Provider value={{
      language,
      setLanguage,
      ambientSound,
      setAmbientSound,
      radioEnabled,
      setRadioEnabled,
      t
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
