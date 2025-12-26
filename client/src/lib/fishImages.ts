import tilapiaImg from '@assets/image_1765546808194.png';
import trairaImg from '@assets/image_1765547187750.png';
import tucunareImg from '@assets/stock_images/peacock_bass_tucunar_34b6b6a0.jpg';
import caraImg from '@assets/cara_fish.png';

export const FISH_IMAGES: Record<string, string> = {
  tilapia: tilapiaImg,
  traira: trairaImg,
  bass: tucunareImg,
  cara: caraImg,
};

export function getFishImage(fishId: string): string {
  return FISH_IMAGES[fishId] || tilapiaImg;
}
