import { useEffect } from 'react';
import { TICK_RATE } from '../constants/constants';

export function useGameLoop(callback: () => void, isRunning: boolean) {
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(callback, TICK_RATE);
    return () => clearInterval(interval);
  }, [callback, isRunning]);
}
