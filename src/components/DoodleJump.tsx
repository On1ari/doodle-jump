import React, { useEffect, useRef, useState } from 'react';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  GRAVITY,
  JUMP_VELOCITY,
  PLATFORM_HEIGHT,
  PLATFORM_WIDTH,
  PLAYER_SIZE,
  TICK_RATE,
} from '../constants/constants';
import type { Platform, Direction } from '../types';
import { generatePlatforms, isColliding } from '../utils';

const leftKeys = ['ArrowLeft', 'a', 'A', 'ф', 'Ф'];
const rightKeys = ['ArrowRight', 'd', 'D', 'в', 'В'];

const DoodleJump: React.FC = () => {
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_SIZE / 2);
  const [playerY, setPlayerY] = useState(GAME_HEIGHT - PLAYER_SIZE - 200);
  const [velocityY, setVelocityY] = useState(0);
  const [platforms, setPlatforms] = useState<Platform[]>(generatePlatforms());
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [movingLeft, setMovingLeft] = useState(false);
  const [movingRight, setMovingRight] = useState(false);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore') || '0'));
  const [direction, setDirection] = useState<Direction>('right');

  const maxHeightRef = useRef(Infinity);
  const playerWorldYRef = useRef(playerY);

  const handleRestart = () => {
    setPlayerX(GAME_WIDTH / 2 - PLAYER_SIZE / 2);
    setPlayerY(GAME_HEIGHT - PLAYER_SIZE - 200);
    setVelocityY(0);
    setPlatforms(generatePlatforms());
    setScore(0);
    setIsGameOver(false);
    maxHeightRef.current = Infinity;
  };

  useEffect(() => {
    const downHandler = (e: KeyboardEvent) => {
      if (leftKeys.includes(e.key)) setMovingLeft(true);
      if (rightKeys.includes(e.key)) setMovingRight(true);
    };
    const upHandler = (e: KeyboardEvent) => {
      if (leftKeys.includes(e.key)) setMovingLeft(false);
      if (rightKeys.includes(e.key)) setMovingRight(false);
    };
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, []);

  useEffect(() => {
    if (!isGameOver) return;
    const restartOnKey = () => handleRestart();
    window.addEventListener('keydown', restartOnKey);
    return () => window.removeEventListener('keydown', restartOnKey);
  }, [isGameOver]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerX((x) => {
        let newX = x;
        if (movingLeft) {
          newX = Math.max(0, x - 5);
          setDirection('left');
        }
        if (movingRight) {
          newX = Math.min(GAME_WIDTH - PLAYER_SIZE, x + 5);
          setDirection('right');
        }
        return newX;
      });

      setPlayerY((y) => {
        let newY = y + velocityY;
        playerWorldYRef.current += velocityY;
        setVelocityY((v) => v + GRAVITY);

        platforms.forEach((p) => {
          if (isColliding(playerX, newY, velocityY, p, PLAYER_SIZE, PLATFORM_WIDTH, PLATFORM_HEIGHT)) {
            setVelocityY(JUMP_VELOCITY);
          }
        });

        if (newY < GAME_HEIGHT / 2) {
          const diff = GAME_HEIGHT / 2 - newY;
          setPlatforms((old) =>
            old.map((p) => {
              let newY = p.y + diff;
              if (newY > GAME_HEIGHT) {
                newY = 0;
                return { x: Math.random() * (GAME_WIDTH - PLATFORM_WIDTH), y: newY };
              }
              return { ...p, y: newY };
            })
          );
          newY = GAME_HEIGHT / 2;
        }

        if (newY > GAME_HEIGHT) {
          setIsGameOver(true);
          setHighScore((prev) => {
            const hs = Math.max(prev, score);
            localStorage.setItem('highScore', hs.toString());
            return hs;
          });
          return y;
        }

        if (maxHeightRef.current === Infinity) {
          maxHeightRef.current = playerWorldYRef.current;
        } else if (playerWorldYRef.current < maxHeightRef.current) {
          setScore((prev) => prev + Math.floor(maxHeightRef.current - playerWorldYRef.current));
          maxHeightRef.current = playerWorldYRef.current;
        }

        return newY;
      });
    }, TICK_RATE);

    return () => clearInterval(interval);
  }, [velocityY, platforms, playerX, score, movingLeft, movingRight]);

  return (
    <div
      style={{
        position: 'relative',
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        border: '2px solid black',
        margin: '20px auto',
        background: `url("/doodlejumpbg.png")`,
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: PLAYER_SIZE,
          height: PLAYER_SIZE,
          left: playerX,
          top: playerY,
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

      {platforms.map((p, i) => (
        <img
          key={i}
          src="/platform.png"
          alt="platform"
          style={{
            position: 'absolute',
            width: PLATFORM_WIDTH,
            height: PLATFORM_HEIGHT,
            left: p.x,
            top: p.y,
            borderRadius: 5,
            zIndex: 2,
            objectFit: 'cover',
          }}
        />
      ))}

      <div style={{ position: 'absolute', top: 10, left: 10, fontWeight: 'bold', zIndex: 50 }}>
        Score: {score}
      </div>

      {isGameOver && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'white',
              zIndex: 999,
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              border: '2px solid black',
              padding: 20,
              textAlign: 'center',
              zIndex: 1000,
              borderRadius: 10,
            }}
          >
            <h2>Игра окончена</h2>
            <p>Ваш счёт: {score}</p>
            <p>Рекорд: {highScore}</p>
            <button
              onClick={handleRestart}
              style={{ marginTop: 10, padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Сыграть снова
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DoodleJump;