import React from 'react';
import { getBaitImage } from '@lib/baitAssets';
import type { Bait } from '@shared/fishData';
import '../styles/bait.css';

export default function BaitItem({ bait }: { bait: Bait }) {
  return (
    <div className="bait-card flex items-center gap-3">
      <img src={getBaitImage(bait.id)} alt={bait.name} className="bait-icon" />
      <div className="flex-1">
        <div className="font-semibold">{bait.name}</div>
        <div className="text-sm text-gray-400">{bait.description}</div>
      </div>
      <div className="text-right">{bait.price}</div>
    </div>
  );
}