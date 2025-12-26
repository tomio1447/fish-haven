import React from 'react';
import { getBaitImage } from './baitAssets';

type Props = {
  id: string;
  alt?: string;
  className?: string;
};

export default function BaitImage({ id, alt, className }: Props) {
  const src = getBaitImage(id);

  return (
    <img
      src={src}
      alt={alt ?? id}
      className={className ?? 'bait-icon'}
    />
  );
}
