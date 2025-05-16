import { useState } from 'react';
import { GAME_WIDTH, MOVE_SPEED, PLAYER_SIZE } from '../constants/constants';
import type { Direction } from '../types/types';

export function usePlayerMovement() {
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_SIZE / 2);
  const [direction, setDirection] = useState<Direction>('right');

  const move = (left: boolean, right: boolean) => {
    setPlayerX(prevX => {
      let newX = prevX;
      if (left) {
        newX -= MOVE_SPEED;
        setDirection('left');
      }
      if (right) {
        newX += MOVE_SPEED;
        setDirection('right');
      }

      if (newX + PLAYER_SIZE < 0) return GAME_WIDTH;
      if (newX > GAME_WIDTH) return -PLAYER_SIZE;
      return newX;
    });
  };

  return { playerX, setPlayerX, direction, move };
}
