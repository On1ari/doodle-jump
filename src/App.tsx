import React, { useEffect, useRef, useState } from 'react';

const GRAVITY = 0.4;
const JUMP_VELOCITY = -10;
const PLATFORM_WIDTH = 85;
const PLATFORM_HEIGHT = 15;
const PLAYER_SIZE = 40;
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const PLATFORM_COUNT = 5;

type Platform = {
  x: number;
  y: number;
};

export const App: React.FC = () => {
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_SIZE / 2);
  const [playerY, setPlayerY] = useState(GAME_HEIGHT - PLAYER_SIZE - 200);
  const [velocityY, setVelocityY] = useState(0);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [score, setScore] = useState(0);
  const gameRef = useRef<HTMLDivElement>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  // const [movingLeft, setMovingLeft] = useState(false);
  // const [movingRight, setMovingRight] = useState(false);

  const handleRestart = () => {
    window.location.reload(); // можно и вручную сбросить состояния
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

  // Управление игроком стрелками влево/вправо

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        setPlayerX((x) => Math.max(0, x - 20));
      }
      if (e.key === 'ArrowRight') {
        setPlayerX((x) => Math.min(GAME_WIDTH - PLAYER_SIZE, x + 20));
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Основной цикл игры
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerY((y) => {
        let newY = y + velocityY;
        setVelocityY((v) => v + GRAVITY);

        // Если игрок падает на платформу, прыгаем
        platforms.forEach((p) => {
          if (
            newY + PLAYER_SIZE >= p.y &&
            newY + PLAYER_SIZE <= p.y + PLATFORM_HEIGHT &&
            playerX + PLAYER_SIZE > p.x &&
            playerX < p.x + PLATFORM_WIDTH &&
            velocityY > 0
          ) {
            setVelocityY(JUMP_VELOCITY);
            setScore((s) => s + 1);
          }
        });

        // Скроллим платформы вниз, когда игрок поднимается
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

        // Проверка падения вниз - игра заканчивается
        if (newY > GAME_HEIGHT) {
          setIsGameOver(true);
          return y;
        }

        return newY;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [velocityY, platforms, playerX, score]);

  return (
    <div
      ref={gameRef}
      style={{
        position: 'relative',
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        border: '2px solid black',
        margin: '20px auto',
        background: 'lightblue',
        overflow: 'hidden',
      }}
    >
      {/* Игрок */}
      <div
        style={{
          position: 'absolute',
          width: PLAYER_SIZE,
          height: PLAYER_SIZE,
          backgroundColor: 'green',
          borderRadius: '50%',
          left: playerX,
          top: playerY,
          transition: 'left 0.1s',
          zIndex: 2,
        }}
      />

      {/* Платформы */}
      {platforms.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: PLATFORM_WIDTH,
            height: PLATFORM_HEIGHT,
            backgroundColor: 'brown',
            left: p.x,
            top: p.y,
            borderRadius: 5,
            zIndex: 1,
          }}
        />
      ))}

      {/* Счет */}
      <div style={{ position: 'absolute', top: 10, left: 10, fontWeight: 'bold' }}>
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
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
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


export default App
