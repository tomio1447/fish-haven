import React from 'react';
import BaitImage from '@components/BaitImage';

interface Props {
  bait: { id: string; name: string; description?: string; price?: number; /* ... */ };
}

export default function InventoryItem({ bait }: Props) {
  return (
    <div className="flex items-center gap-3 p-2">
      <BaitImage id={bait.id} alt={bait.name} className="w-10 h-10 object-contain" />
      <div className="flex-1">
        <div className="font-semibold">{bait.name}</div>
        {bait.description && <div className="text-sm text-gray-500">{bait.description}</div>}
      </div>
      <div className="text-sm text-gray-700">x{/* quantidade se houver */}</div>
    </div>
  );
}import React from 'react';
import BaitImage from '@components/BaitImage';

interface Props {
  bait: { id: string; name: string; description?: string; price?: number; /* ... */ };
}

export default function InventoryItem({ bait }: Props) {
  return (
    <div className="flex items-center gap-3 p-2">
      <BaitImage id={bait.id} alt={bait.name} className="w-10 h-10 object-contain" />
      <div className="flex-1">
        <div className="font-semibold">{bait.name}</div>
        {bait.description && <div className="text-sm text-gray-500">{bait.description}</div>}
      </div>
      <div className="text-sm text-gray-700">x{/* quantidade se houver */}</div>
    </div>
  );
}