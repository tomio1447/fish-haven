import React from 'react';
import BaitImage from '@components/BaitImage';

interface Props {
  bait: { id: string; name: string; price: number; description?: string; };
  onBuy: (id: string) => void;
}

export default function BaitCard({ bait, onBuy }: Props) {
  return (
    <div className="border rounded p-3 flex flex-col items-center">
      <BaitImage id={bait.id} alt={bait.name} className="w-20 h-20 object-contain" />
      <div className="mt-2 font-medium">{bait.name}</div>
      <div className="text-sm text-gray-600">{bait.description}</div>
      <div className="mt-2 flex items-center justify-between w-full">
        <div className="font-semibold">{bait.price} ?</div>
        <button onClick={() => onBuy(bait.id)} className="btn-primary">Comprar</button>
      </div>
    </div>
  );
}