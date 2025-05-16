import React, { useEffect, useRef, useState } from 'react';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  GRAVITY,
  JUMP_VELOCITY,
  PLATFORM_COUNT,
  PLATFORM_HEIGHT,
  PLATFORM_WIDTH,
  PLAYER_SIZE
} from '../constants/constants';
import type { Platform } from '../types';

const leftKeys = ['ArrowLeft', 'a', 'A', 'ф', 'Ф'];
const rightKeys = ['ArrowRight', 'd', 'D', 'в', 'В'];


export const DoodleJump: React.FC = () => {
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_SIZE / 2);
  const [playerY, setPlayerY] = useState(GAME_HEIGHT - PLAYER_SIZE - 200);
  const [velocityY, setVelocityY] = useState(0);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [movingLeft, setMovingLeft] = useState(false);
  const [movingRight, setMovingRight] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('highScore') || '0');
  });
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const maxHeightRef = useRef(Infinity);
  const gameRef = useRef<HTMLDivElement>(null);

  const handleRestart = () => {
    window.location.reload();
  };

  // Инициализация платформ
  useEffect(() => {
    const initialPlatforms: Platform[] = [];
    const gap = GAME_HEIGHT / PLATFORM_COUNT;
    for (let i = 0; i < PLATFORM_COUNT; i++) {
      initialPlatforms.push({
        x: Math.random() * (GAME_WIDTH - PLATFORM_WIDTH),
        y: i * gap,
      });
    }
    setPlatforms(initialPlatforms);
  }, []);

  // Управление игроком влево/вправо


  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const key = e.key;
      if (leftKeys.includes(key)) setMovingLeft(true);
      if (rightKeys.includes(key)) setMovingRight(true);
    }

    function handleKeyUp(e: KeyboardEvent) {
      const key = e.key;
      if (leftKeys.includes(key)) setMovingLeft(false);
      if (rightKeys.includes(key)) setMovingRight(false);
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Начать заново при нажатии любой кнопки
  useEffect(() => {
    if (!isGameOver) return;

    function handleAnyKey() {
      handleRestart();
    }

    window.addEventListener('keydown', handleAnyKey);
    return () => window.removeEventListener('keydown', handleAnyKey);
  }, [isGameOver]);

  // Основной цикл игры
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
        setVelocityY((v) => v + GRAVITY);

        // Столкновение с платформами
        platforms.forEach((p) => {
          if (
            newY + PLAYER_SIZE >= p.y &&
            newY + PLAYER_SIZE <= p.y + PLATFORM_HEIGHT &&
            playerX + PLAYER_SIZE > p.x &&
            playerX < p.x + PLATFORM_WIDTH &&
            velocityY > 0
          ) {
            setVelocityY(JUMP_VELOCITY);
          }
        });

        // Скролл платформ
        if (newY < GAME_HEIGHT / 2) {
          const diff = (GAME_HEIGHT / 2) - newY;
          setPlatforms((oldPlatforms) =>
            oldPlatforms.map((p) => {
              let newPy = p.y + diff;
              if (newPy > GAME_HEIGHT) {
                newPy = 0;
                return { x: Math.random() * (GAME_WIDTH - PLATFORM_WIDTH), y: newPy };
              }
              return { ...p, y: newPy };
            })
          );
          newY = GAME_HEIGHT / 2;
        }

        if (newY > GAME_HEIGHT) {
          setIsGameOver(true);

          setHighScore((prevHighScore) => {
            const newHighScore = Math.max(prevHighScore, score);
            localStorage.setItem('highScore', newHighScore.toString());
            return newHighScore;
          });

          return y;
        }
        if (maxHeightRef.current === Infinity) {
          maxHeightRef.current = newY;
        } else if (newY < maxHeightRef.current) {
          setScore((prev) => prev + Math.floor(maxHeightRef.current - newY));
          maxHeightRef.current = newY;
        }

        return newY;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [velocityY, platforms, playerX, score, movingLeft, movingRight]);

  return (
    <div
      ref={gameRef}
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
      {/* Игрок */}
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
          style={{
            width: '100%',
            height: '100%',
            userSelect: 'none',
            pointerEvents: 'none',
            display: 'block',
          }}
          draggable={false}
        />
      </div>

      {/* Платформы */}
      {platforms.map((p, i) => (
        <img
          key={i}
          src="/platform.png"
          alt="platform"
          style={{
            position: 'absolute',
            width: PLATFORM_WIDTH,
            height: PLATFORM_HEIGHT,
            // border: '1px solid black',
            left: p.x,
            top: p.y,
            borderRadius: 5,
            zIndex: 2,
            objectFit: 'cover',
          }}
        />
      ))}

      {/* Счет */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          fontWeight: 'bold',
          zIndex: 50
        }}>
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
              backgroundColor: 'rgba(255, 255, 255)',
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
              style={{
                marginTop: 10,
                padding: '10px 20px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
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
