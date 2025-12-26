import React from 'react';
import { getBaitImage } from '@lib/baitAssets';

export default function BaitImage({ id, alt, className }: { id: string; alt?: string; className?: string }) {
  const src = getBaitImage(id);
  return <img src={src} alt={alt || id} className={className || 'bait-icon'} />;
}

// Compat wrapper (sem JSX) — usado por imports que esperam uma função getBaitImage
import { getBaitImage as getBaitAssetImage } from './baitAssets';

export function getBaitImage(baitId: string): string {
  return getBaitAssetImage(baitId);
}

export default getBaitImage;