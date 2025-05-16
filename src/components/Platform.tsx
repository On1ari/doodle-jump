import React from 'react';
import { PLATFORM_WIDTH, PLATFORM_HEIGHT } from '../constants/constants';
import type { Platform as PlatformType } from '../types/types';

interface Props {
  platform: PlatformType;
}

const Platform: React.FC<Props> = ({ platform }) => (
  <img
    src="/platform.png"
    alt="platform"
    style={{
      position: 'absolute',
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
      left: platform.x,
      top: platform.y,
      borderRadius: 5,
      zIndex: 2,
      objectFit: 'cover',
    }}
  />
);

export default Platform;
