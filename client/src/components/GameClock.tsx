import { useGame, TimeOfDay } from '@/context/GameContext';
import { Moon, Sun, Sunrise, Sunset } from 'lucide-react';

const timeIcons: Record<TimeOfDay, React.ReactNode> = {
  dawn: <Sunrise className="w-4 h-4 text-orange-400" />,
  day: <Sun className="w-4 h-4 text-yellow-400" />,
  dusk: <Sunset className="w-4 h-4 text-orange-500" />,
  night: <Moon className="w-4 h-4 text-blue-300" />
};

const timeLabels: Record<TimeOfDay, string> = {
  dawn: 'Amanhecer',
  day: 'Dia',
  dusk: 'Entardecer',
  night: 'Noite'
};

export function GameClock() {
  const { getFormattedTime, gameDay, getTimeOfDay } = useGame();
  const timeOfDay = getTimeOfDay();
  
  return (
    <div 
      className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20"
      data-testid="game-clock"
    >
      <div className="flex items-center gap-1.5">
        {timeIcons[timeOfDay]}
        <span className="text-xs text-white/70" data-testid="text-time-of-day">
          {timeLabels[timeOfDay]}
        </span>
      </div>
      <div className="w-px h-4 bg-white/20" />
      <div className="flex flex-col items-end">
        <span 
          className="text-lg font-mono font-bold text-white"
          data-testid="text-game-time"
        >
          {getFormattedTime()}
        </span>
        <span 
          className="text-[10px] text-white/50"
          data-testid="text-game-day"
        >
          Dia {gameDay}
        </span>
      </div>
    </div>
  );
}
