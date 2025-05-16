import React from 'react';
import { PLAYER_SIZE } from '../constants/constants';

interface Props {
  x: number;
  y: number;
  direction: 'left' | 'right';
}

const Player: React.FC<Props> = ({ x, y, direction }) => (
  <div
    style={{
      position: 'absolute',
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      left: x,
      top: y,
      zIndex: 100,
    }}
  >
    <img
      src={direction === 'left' ? '/doodler-left.png' : '/doodler-right.png'}
      alt="player"
      style={{ width: '100%', height: '100%', userSelect: 'none', pointerEvents: 'none' }}
      draggable={false}
    />
  </div>
);

export default Player;
