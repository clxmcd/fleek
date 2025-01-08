"use client";

import React, { useState, useEffect, useCallback } from "react";

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 50;
const PIPE_GAP = 150;

type Bird = {
  x: number;
  y: number;
  velocity: number;
};

type Pipe = {
  x: number;
  height: number; // Height of the top pipe
};

const generatePipe = (): Pipe => {
  const height = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50;
  return { x: GAME_WIDTH, height };
};

const FlappyBird: React.FC = () => {
  const [bird, setBird] = useState<Bird>({ x: 50, y: 300, velocity: 0 });
  const [pipes, setPipes] = useState<Pipe[]>([generatePipe()]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const gravity = 0.5;
  const jumpVelocity = -10;

  const startGame = () => {
    setBird({ x: 50, y: 300, velocity: 0 });
    setPipes([generatePipe()]);
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  const handleJump = useCallback(() => {
    if (!gameStarted || gameOver) return;
    setBird((prev) => ({ ...prev, velocity: jumpVelocity }));
  }, [gameOver, gameStarted, jumpVelocity]);

  const updateGame = useCallback(() => {
    if (gameOver || !gameStarted) return;

    setBird((prev) => {
      const newY = prev.y + prev.velocity;
      const newVelocity = prev.velocity + gravity;

      // Game over if bird touches the ground or flies out of the top
      if (newY > GAME_HEIGHT - BIRD_SIZE || newY < 0) {
        setGameOver(true);
        return prev;
      }

      return { ...prev, y: newY, velocity: newVelocity };
    });

    setPipes((prevPipes) => {
      const updatedPipes = prevPipes.map((pipe) => ({
        ...pipe,
        x: pipe.x - 3, // Move pipes left
      }));

      // Remove pipes that are out of bounds
      if (updatedPipes[0].x + PIPE_WIDTH < 0) {
        updatedPipes.shift();
        setScore((prevScore) => prevScore + 1);
      }

      // Add new pipes
      if (updatedPipes.length < 2 && updatedPipes[updatedPipes.length - 1].x < GAME_WIDTH / 2) {
        updatedPipes.push(generatePipe());
      }

      // Check collision with pipes
      const birdRect = {
        left: bird.x,
        right: bird.x + BIRD_SIZE,
        top: bird.y,
        bottom: bird.y + BIRD_SIZE,
      };

      for (const pipe of updatedPipes) {
        const topPipeRect = {
          left: pipe.x,
          right: pipe.x + PIPE_WIDTH,
          top: 0,
          bottom: pipe.height,
        };

        const bottomPipeRect = {
          left: pipe.x,
          right: pipe.x + PIPE_WIDTH,
          top: pipe.height + PIPE_GAP,
          bottom: GAME_HEIGHT,
        };

        if (
          (birdRect.left < topPipeRect.right &&
            birdRect.right > topPipeRect.left &&
            birdRect.top < topPipeRect.bottom) ||
          (birdRect.left < bottomPipeRect.right &&
            birdRect.right > bottomPipeRect.left &&
            birdRect.bottom > bottomPipeRect.top)
        ) {
          setGameOver(true);
          return prevPipes;
        }
      }

      return updatedPipes;
    });
  }, [bird, gameStarted, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp") {
        handleJump();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleJump]);

  useEffect(() => {
    if (gameOver || !gameStarted) return;

    const interval = setInterval(updateGame, 20);
    return () => clearInterval(interval);
  }, [updateGame, gameOver, gameStarted]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#70c5ce",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <h1>Flappy Bird</h1>
      <div style={{ marginBottom: "20px" }}>
        <p>
          <strong>Controls:</strong>
        </p>
        <p>Space or Arrow Up: Jump</p>
      </div>
      <h2>Score: {score}</h2>
      {gameOver && <h3>Game Over ! Press &quot;Restart&quot; to play again.</h3>}
      {!gameStarted && <h3>Press &quot;Start&quot; to begin the game.</h3>}
      <div
        style={{
          position: "relative",
          width: `${GAME_WIDTH}px`,
          height: `${GAME_HEIGHT}px`,
          backgroundColor: "#d9f2e6",
          border: "2px solid #000",
          overflow: "hidden",
        }}
      >
        {/* Bird */}
        <div
          style={{
            position: "absolute",
            top: bird.y,
            left: bird.x,
            width: `${BIRD_SIZE}px`,
            height: `${BIRD_SIZE}px`,
            backgroundColor: "yellow",
            borderRadius: "50%",
          }}
        />

        {/* Pipes */}
        {pipes.map((pipe, index) => (
          <React.Fragment key={index}>
            {/* Top Pipe */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: pipe.x,
                width: `${PIPE_WIDTH}px`,
                height: `${pipe.height}px`,
                backgroundColor: "green",
              }}
            />
            {/* Bottom Pipe */}
            <div
              style={{
                position: "absolute",
                top: pipe.height + PIPE_GAP,
                left: pipe.x,
                width: `${PIPE_WIDTH}px`,
                height: `${GAME_HEIGHT - pipe.height - PIPE_GAP}px`,
                backgroundColor: "green",
              }}
            />
          </React.Fragment>
        ))}
      </div>
      <button
        onClick={startGame}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Start
      </button>
    </div>
  );
};

export default FlappyBird;
