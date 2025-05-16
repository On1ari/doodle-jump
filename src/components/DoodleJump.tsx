import React, { useRef, useState, useCallback } from 'react';
import { GAME_HEIGHT, GAME_WIDTH, GRAVITY, JUMP_VELOCITY } from '../constants/constants';
import { useInput } from '../hooks/useInput';
import { usePlayerMovement } from '../hooks/usePlayerMovement';
import { useGameLoop } from '../hooks/useGameLoop';
import { generatePlatforms, isColliding } from '../utils/utils';
import Player from './Player';
import Platform from './Platform';

const DoodleJump: React.FC = () => {
  const [playerY, setPlayerY] = useState(GAME_HEIGHT - 200);
  const [velocityY, setVelocityY] = useState(0);
  const [platforms, setPlatforms] = useState(generatePlatforms());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore') || '0'));
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const maxHeightRef = useRef(Infinity);
  const playerWorldYRef = useRef(playerY);

  const { movingLeft, movingRight } = useInput(isStarted);
  const { playerX, direction, move, setPlayerX } = usePlayerMovement();

  const scrollWorld = (diff: number) => {
    setPlatforms((old) =>
      old.map((p) => {
        let newY = p.y + diff;
        if (newY > GAME_HEIGHT) {
          newY = 0;
          return { x: Math.random() * (GAME_WIDTH - 60), y: newY };
        }
        return { ...p, y: newY };
      })
    );
  };



  const update = useCallback(() => {
    move(movingLeft, movingRight);

    setPlayerY(prevY => {
      const newY = prevY + velocityY;
      playerWorldYRef.current += velocityY;
      setVelocityY(v => v + GRAVITY);

      for (const p of platforms) {
        if (isColliding(playerX, newY, velocityY, p, 60, 60, 20)) {
          setVelocityY(JUMP_VELOCITY);
          break;
        }
      }

      if (newY < GAME_HEIGHT / 2) {
        scrollWorld(GAME_HEIGHT / 2 - newY);
        return GAME_HEIGHT / 2;
      }

      if (newY > GAME_HEIGHT) {
        setIsGameOver(true);
        const newHigh = Math.max(score, highScore);
        setHighScore(newHigh);
        localStorage.setItem('highScore', newHigh.toString());
        return prevY;
      }

      if (maxHeightRef.current === Infinity) {
        maxHeightRef.current = playerWorldYRef.current;
      } else if (playerWorldYRef.current < maxHeightRef.current) {
        const diff = maxHeightRef.current - playerWorldYRef.current;
        if (diff >= 1) {
          setScore(s => s + Math.floor(diff));
          maxHeightRef.current = playerWorldYRef.current;
        }
      }

      return newY;
    });
  }, [velocityY, movingLeft, movingRight, playerX, platforms, move, score, highScore]);

  useGameLoop(update, isStarted && !isGameOver);

  const handleRestart = () => {
    setPlayerX(GAME_WIDTH / 2 - 30);
    setPlayerY(GAME_HEIGHT - 200);
    setVelocityY(0);
    setScore(0);
    setIsGameOver(false);
    setPlatforms(generatePlatforms());
    maxHeightRef.current = Infinity;
    setIsStarted(true);
  };

  return (
    <div style={{
      position: 'relative',
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      margin: '20px auto',
      background: 'url("/doodlejumpbg.png")',
      border: '2px solid black',
      overflow: 'hidden'
    }}>
      {!isStarted && !isGameOver && (
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          border: '2px solid black',
          padding: 20,
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}>
          <h2>Doodle Jump</h2>
          <button onClick={() => setIsStarted(true)}>Начать игру</button>
          <p>Рекорд: {highScore}</p>
        </div>
      )}

      {isStarted && <Player x={playerX} y={playerY} direction={direction} />}
      {isStarted && platforms.map((p, i) => <Platform key={i} platform={p} />)}

      {isStarted && (
        <div style={{ position: 'absolute', top: 10, left: 10, fontWeight: 'bold' }}>
          Score: {score}
        </div>
      )}

      {isGameOver && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'white',
          zIndex: 999
        }}>
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: 20,
            border: '2px solid black',
            borderRadius: 10,
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
          >
            <h2>Игра окончена</h2>
            <p>Счёт: {score}</p>
            <p>Рекорд: {highScore}</p>
            <button onClick={handleRestart}>Сыграть снова</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoodleJump;
