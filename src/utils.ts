import type { Platform } from './types';
import { GAME_HEIGHT, GAME_WIDTH, PLATFORM_COUNT, PLATFORM_WIDTH } from './constants/constants';

export const generatePlatforms = (): Platform[] => {
  const platforms: Platform[] = [];
  const gap = GAME_HEIGHT / PLATFORM_COUNT;
  for (let i = 0; i < PLATFORM_COUNT; i++) {
    platforms.push({
      x: Math.random() * (GAME_WIDTH - PLATFORM_WIDTH),
      y: i * gap,
    });
  }
  return platforms;
};

export const isColliding = (
  playerX: number,
  playerY: number,
  velocityY: number,
  platform: Platform,
  playerSize: number,
  platformWidth: number,
  platformHeight: number
): boolean => {
  return (
    playerY + playerSize >= platform.y &&
    playerY + playerSize <= platform.y + platformHeight &&
    playerX + playerSize > platform.x &&
    playerX < platform.x + platformWidth &&
    velocityY > 0
  );
};