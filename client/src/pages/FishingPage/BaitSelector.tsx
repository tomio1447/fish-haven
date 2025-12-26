import React from 'react';
import BaitImage from '@components/BaitImage';
import { NATURAL_BAITS_WITH_IMAGES } from '@lib/fishData'; // ou usar NATURAL_BAITS + getBaitImage

export default function BaitSelector({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {NATURAL_BAITS_WITH_IMAGES.map(b => (
        <button key={b.id} onClick={() => onSelect(b.id)} className="flex flex-col items-center p-2">
          <img src={b.image} alt={b.name} className="w-12 h-12 object-contain" />
          <span className="text-xs mt-1">{b.name}</span>
        </button>
      ))}
    </div>
  );
}