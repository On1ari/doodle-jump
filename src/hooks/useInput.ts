import { useEffect, useState } from 'react';

const leftKeys = ['ArrowLeft', 'a', 'A', 'ф', 'Ф'];
const rightKeys = ['ArrowRight', 'd', 'D', 'в', 'В'];

export function useInput(active: boolean) {
  const [movingLeft, setMovingLeft] = useState(false);
  const [movingRight, setMovingRight] = useState(false);

  useEffect(() => {
    if (!active) {
      setMovingLeft(false);
      setMovingRight(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (leftKeys.includes(e.key)) setMovingLeft(true);
      if (rightKeys.includes(e.key)) setMovingRight(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (leftKeys.includes(e.key)) setMovingLeft(false);
      if (rightKeys.includes(e.key)) setMovingRight(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      let gamma = event.gamma ?? 0;

      const orientationType = window.screen.orientation?.type || '';
      const orientationAngle = window.screen.orientation?.angle ?? window.orientation ?? 0;

      if (orientationType.includes('landscape') || orientationAngle === 90) {
        gamma = -gamma;
      }

      const threshold = 10;

      setMovingLeft(gamma < -threshold);
      setMovingRight(gamma > threshold);
    };

    const setupOrientationListener = () => {
      window.addEventListener('deviceorientation', handleOrientation, true);
    };

    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      'requestPermission' in DeviceOrientationEvent &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      DeviceOrientationEvent.requestPermission()
        .then((permissionState: unknown) => {
          if (permissionState === 'granted') {
            setupOrientationListener();
          }
        })
        .catch(console.error);
    } else {
      setupOrientationListener();
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [active]);

  return { movingLeft, movingRight };
}
