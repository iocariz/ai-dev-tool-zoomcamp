import React, { useEffect, useState, useCallback, useMemo } from "react";

// Sound effects using Web Audio API
const playSound = (type) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === "eat") {
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === "gameOver") {
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
      oscillator.type = "sawtooth";
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  } catch (e) {
    // Silent fail if audio context not supported
  }
};

const BOARD_SIZE = 20;            // 20x20 grid
const CELL_SIZE = 18;
const INITIAL_SNAKE = [
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
];
const INITIAL_DIRECTION = { x: 1, y: 0 }; // moving right

const DIFFICULTY_SPEEDS = {
  easy: 180,
  medium: 120,
  hard: 70,
};

const DIFFICULTY_OBSTACLES = {
  easy: 0,
  medium: 5,
  hard: 10,
};

const createInitialSnake = () => INITIAL_SNAKE.map(segment => ({ ...segment }));

function getRandomFood(snake, obstacles = []) {
  while (true) {
    const x = Math.floor(Math.random() * BOARD_SIZE);
    const y = Math.floor(Math.random() * BOARD_SIZE);
    const onSnake = snake.some(seg => seg.x === x && seg.y === y);
    const onObstacle = obstacles.some(obs => obs.x === x && obs.y === y);
    if (!onSnake && !onObstacle) return { x, y };
  }
}

function generateObstacles(count, snake) {
  const obstacles = [];
  while (obstacles.length < count) {
    const x = Math.floor(Math.random() * BOARD_SIZE);
    const y = Math.floor(Math.random() * BOARD_SIZE);
    const onSnake = snake.some(seg => seg.x === x && seg.y === y);
    const duplicate = obstacles.some(obs => obs.x === x && obs.y === y);
    // Don't place obstacles too close to snake's starting position
    const tooClose = Math.abs(x - 8) < 3 && Math.abs(y - 10) < 3;
    if (!onSnake && !duplicate && !tooClose) {
      obstacles.push({ x, y });
    }
  }
  return obstacles;
}

function SnakeGame() {
  const initialObstacles = useMemo(
    () => generateObstacles(DIFFICULTY_OBSTACLES["medium"], INITIAL_SNAKE),
    []
  );

  const [snake, setSnake] = useState(createInitialSnake);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [difficulty, setDifficulty] = useState("medium");
  const [obstacles, setObstacles] = useState(initialObstacles);
  const [food, setFood] = useState(() =>
    getRandomFood(createInitialSnake(), initialObstacles)
  );
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [wrapWalls, setWrapWalls] = useState(false);
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem("snake_highscore")) || 0
  );

  const resetGame = useCallback((nextDifficulty = difficulty, shouldStart = true) => {
    const freshSnake = createInitialSnake();
    const freshObstacles = generateObstacles(DIFFICULTY_OBSTACLES[nextDifficulty], freshSnake);
    setSnake(freshSnake);
    setDirection(INITIAL_DIRECTION);
    setObstacles(freshObstacles);
    setFood(getRandomFood(freshSnake, freshObstacles));
    setIsRunning(shouldStart);
    setGameOver(false);
    setScore(0);
  }, [difficulty]);

  const handleDirectionChange = useCallback((newDir) => {
    setDirection(prev => {
      if (prev.x + newDir.x === 0 && prev.y + newDir.y === 0) {
        return prev; // ignore opposite direction
      }
      return newDir;
    });
    if (!isRunning && !gameOver) {
      setIsRunning(true);
    }
  }, [isRunning, gameOver]);

  const triggerGameOver = useCallback(() => {
    setGameOver(true);
    setIsRunning(false);
    if (soundEnabled) playSound("gameOver");
    setHighScore(prev => {
      const newHS = Math.max(prev, score);
      localStorage.setItem("snake_highscore", String(newHS));
      return newHS;
    });
  }, [soundEnabled, score]);

  // Handle keyboard input
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isRunning && !gameOver && (e.key === " " || e.key === "Enter")) {
        setIsRunning(true);
        return;
      }

      if (gameOver && (e.key === " " || e.key === "Enter")) {
        resetGame();
        return;
      }

      let newDir = null;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          newDir = { x: 0, y: -1 };
          break;
        case "ArrowDown":
        case "s":
        case "S":
          newDir = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          newDir = { x: -1, y: 0 };
          break;
        case "ArrowRight":
        case "d":
        case "D":
          newDir = { x: 1, y: 0 };
          break;
        case " ":
          // Pause / resume
          if (!gameOver) setIsRunning(r => !r);
          break;
        default:
          break;
      }

      // Prevent reversing directly into itself
      if (newDir) {
        setDirection(prev => {
          if (prev.x + newDir.x === 0 && prev.y + newDir.y === 0) {
            return prev; // ignore opposite direction
          }
          return newDir;
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, gameOver, resetGame]);

  // Game loop
  useEffect(() => {
    if (!isRunning || gameOver) return;

    const id = setInterval(() => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const nextX = head.x + direction.x;
        const nextY = head.y + direction.y;

        const newHead = wrapWalls
          ? {
              x: (nextX + BOARD_SIZE) % BOARD_SIZE,
              y: (nextY + BOARD_SIZE) % BOARD_SIZE,
            }
          : { x: nextX, y: nextY };

        // Check wall collision if wrapping is off
        if (!wrapWalls) {
          const hitsWall =
            newHead.x < 0 ||
            newHead.x >= BOARD_SIZE ||
            newHead.y < 0 ||
            newHead.y >= BOARD_SIZE;
          if (hitsWall) {
            triggerGameOver();
            return prevSnake;
          }
        }

        // Check self-collision
        const hitsSelf = prevSnake.some(
          seg => seg.x === newHead.x && seg.y === newHead.y
        );
        if (hitsSelf) {
          triggerGameOver();
          return prevSnake;
        }

        // Check obstacle collision
        const hitsObstacle = obstacles.some(
          obs => obs.x === newHead.x && obs.y === newHead.y
        );
        if (hitsObstacle) {
          triggerGameOver();
          return prevSnake;
        }

        // Move
        let newSnake;
        const eatsFood = newHead.x === food.x && newHead.y === food.y;

        if (eatsFood) {
          newSnake = [newHead, ...prevSnake]; // grow
          setFood(getRandomFood(newSnake, obstacles));
          setScore(s => s + 1);
          if (soundEnabled) playSound("eat");
        } else {
          newSnake = [newHead, ...prevSnake.slice(1)]; // normal move
        }

        return newSnake;
      });
    }, DIFFICULTY_SPEEDS[difficulty]);

    return () => clearInterval(id);
  }, [direction, isRunning, gameOver, food, difficulty, soundEnabled, obstacles, triggerGameOver, wrapWalls]);

  // Render grid
  const cells = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const isSnake = snake.some(seg => seg.x === x && seg.y === y);
      const isHead = snake[0].x === x && snake[0].y === y;
      const isFood = food.x === x && food.y === y;
      const isObstacle = obstacles.some(obs => obs.x === x && obs.y === y);
      cells.push(
        <div
          key={`${x}-${y}`}
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            boxSizing: "border-box",
            border: "1px solid #0f172a",
            backgroundColor: isHead
              ? "#67e8f9"
              : isSnake
              ? "#22d3ee"
              : isFood
              ? "#f472b6"
              : isObstacle
              ? "#8b5cf6"
              : "#0b1120",
          }}
        />
      );
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(80% 60% at 50% 0%, rgba(59, 130, 246, 0.18), transparent), radial-gradient(70% 50% at 30% 10%, rgba(236, 72, 153, 0.15), transparent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#e5e7eb",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          padding: "1.5rem",
          borderRadius: "1.5rem",
          background: "linear-gradient(135deg, rgba(17,24,39,0.95), rgba(5,7,15,0.95))",
          boxShadow: "0 20px 60px rgba(0,0,0,0.65), 0 0 20px rgba(59,130,246,0.3)",
          border: "1px solid rgba(59,130,246,0.35)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h1
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#67e8f9",
              margin: 0,
            }}
          >
            Snake
          </h1>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setWrapWalls(prev => !prev)}
              style={{
                padding: "0.45rem 0.9rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                border: wrapWalls ? "2px solid #3b82f6" : "1px solid #374151",
                backgroundColor: wrapWalls ? "rgba(59, 130, 246, 0.25)" : "rgba(31, 41, 55, 0.6)",
                color: wrapWalls ? "#60a5fa" : "#cbd5e1",
                borderRadius: "0.5rem",
                cursor: "pointer",
                transition: "all 0.2s",
                textShadow: wrapWalls ? "0 0 6px rgba(96,165,250,0.6)" : "none",
              }}
              title="Pass-through walls"
            >
              {wrapWalls ? "Pass-through On" : "Pass-through Off"}
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                padding: "0.4rem 0.6rem",
                fontSize: "1rem",
                border: "1px solid #374151",
                backgroundColor: "rgba(31, 41, 55, 0.6)",
                color: soundEnabled ? "#22c55e" : "#6b7280",
                borderRadius: "0.5rem",
                cursor: "pointer",
                transition: "all 0.2s",
                textShadow: soundEnabled ? "0 0 8px rgba(34,197,94,0.6)" : "none",
              }}
              title={soundEnabled ? "Sound On" : "Sound Off"}
            >
              {soundEnabled ? "🔊" : "🔇"}
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.75rem",
            fontSize: "0.85rem",
          }}
        >
          <div>
            <span style={{ opacity: 0.7 }}>Score: </span>
            <strong>{score}</strong>
          </div>
          <div>
            <span style={{ opacity: 0.7 }}>Best: </span>
            <strong>{highScore}</strong>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "0.75rem",
            justifyContent: "center",
          }}
        >
          {["easy", "medium", "hard"].map((level) => (
            <button
              key={level}
              onClick={() => {
                setDifficulty(level);
                resetGame(level, isRunning || gameOver);
              }}
              disabled={isRunning && !gameOver}
              style={{
                padding: "0.4rem 0.8rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                border: difficulty === level ? "2px solid #f472b6" : "1px solid #374151",
                backgroundColor: difficulty === level ? "rgba(244, 114, 182, 0.25)" : "rgba(31, 41, 55, 0.5)",
                color: difficulty === level ? "#f472b6" : "#cbd5e1",
                borderRadius: "0.5rem",
                cursor: isRunning && !gameOver ? "not-allowed" : "pointer",
                opacity: isRunning && !gameOver ? 0.5 : 1,
                transition: "all 0.2s",
                textShadow: difficulty === level ? "0 0 10px rgba(244, 114, 182, 0.45)" : "none",
              }}
            >
              {level}
            </button>
          ))}
        </div>

        <div
          style={{
            width: BOARD_SIZE * CELL_SIZE,
            height: BOARD_SIZE * CELL_SIZE,
            display: "grid",
            gridTemplateColumns: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`,
            backgroundColor: "#050816",
            borderRadius: "0.75rem",
            overflow: "hidden",
            border: "1px solid rgba(59,130,246,0.35)",
            boxShadow: "0 0 30px rgba(59,130,246,0.2)",
          }}
        >
          {cells}
        </div>

        <div
          style={{
            marginTop: "0.75rem",
            fontSize: "0.75rem",
            textAlign: "center",
            opacity: 0.7,
            lineHeight: 1.5,
          }}
        >
          {gameOver ? (
            <>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Game Over</div>
              <div>Press <strong>Enter</strong> or <strong>Space</strong> to restart</div>
              <div>Pass-through {wrapWalls ? "ON (wrap edges)" : "OFF (walls end the run)"}</div>
            </>
          ) : !isRunning ? (
            <>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Paused</div>
              <div>Press <strong>Enter</strong> or <strong>Space</strong> to start</div>
              <div>Pass-through {wrapWalls ? "ON (wrap edges)" : "OFF (walls end the run)"}</div>
            </>
          ) : (
            <>
              <div>Use <strong>WASD</strong> or <strong>Arrow keys</strong> to move</div>
              <div>Press <strong>Space</strong> to pause</div>
              <div>Pass-through {wrapWalls ? "ON (wrap edges)" : "OFF (hit a wall to lose)"}</div>
            </>
          )}
        </div>

        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          <button
            onClick={() => handleDirectionChange({ x: 0, y: -1 })}
            style={{
              width: "3rem",
              height: "3rem",
              fontSize: "1.2rem",
              border: "1px solid rgba(59,130,246,0.5)",
              backgroundColor: "rgba(17, 24, 39, 0.9)",
              color: "#67e8f9",
              borderRadius: "0.6rem",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 0 12px rgba(59,130,246,0.35)",
            }}
            onMouseDown={(e) => e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.35)"}
            onMouseUp={(e) => e.currentTarget.style.backgroundColor = "rgba(17, 24, 39, 0.9)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(17, 24, 39, 0.9)"}
          >
            ▲
          </button>
          <div style={{ display: "flex", gap: "0.3rem" }}>
            <button
              onClick={() => handleDirectionChange({ x: -1, y: 0 })}
              style={{
                width: "3rem",
                height: "3rem",
                fontSize: "1.2rem",
                border: "1px solid rgba(59,130,246,0.5)",
                backgroundColor: "rgba(17, 24, 39, 0.9)",
                color: "#67e8f9",
                borderRadius: "0.6rem",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 0 12px rgba(59,130,246,0.35)",
              }}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.35)"}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = "rgba(17, 24, 39, 0.9)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(17, 24, 39, 0.9)"}
            >
              ◀
            </button>
            <button
              onClick={() => handleDirectionChange({ x: 0, y: 1 })}
              style={{
                width: "3rem",
                height: "3rem",
                fontSize: "1.2rem",
                border: "1px solid rgba(59,130,246,0.5)",
                backgroundColor: "rgba(17, 24, 39, 0.9)",
                color: "#67e8f9",
                borderRadius: "0.6rem",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 0 12px rgba(59,130,246,0.35)",
              }}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.35)"}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = "rgba(17, 24, 39, 0.9)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(17, 24, 39, 0.9)"}
            >
              ▼
            </button>
            <button
              onClick={() => handleDirectionChange({ x: 1, y: 0 })}
              style={{
                width: "3rem",
                height: "3rem",
                fontSize: "1.2rem",
                border: "1px solid rgba(59,130,246,0.5)",
                backgroundColor: "rgba(17, 24, 39, 0.9)",
                color: "#67e8f9",
                borderRadius: "0.6rem",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 0 12px rgba(59,130,246,0.35)",
              }}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.35)"}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = "rgba(17, 24, 39, 0.9)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(17, 24, 39, 0.9)"}
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SnakeGame;
