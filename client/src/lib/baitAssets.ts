import breadImg from '@assets/stock_images/bread_dough_ball_fis_61a9e248.jpg';
import wormImg from '@assets/stock_images/earthworm_fishing_ba_691bfbaa.jpg';
import lureImg from '@assets/stock_images/fishing_lure_artific_df68ee90.jpg';
import shrimpImg from '@assets/stock_images/raw_shrimp_fishing_b_79de9d9a.jpg';
import cornImg from '@assets/stock_images/corn_kernels_fishing_b6e30b30.jpg';

export const BAIT_IMAGES: Record<string, string> = {
  bread: breadImg,
  worm: wormImg,
  lure: lureImg,
  shrimp: shrimpImg,
  corn: cornImg,
};

export function getBaitImage(baitId: string): string {
  return BAIT_IMAGES[baitId] || breadImg;
}
