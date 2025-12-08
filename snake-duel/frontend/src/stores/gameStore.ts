import { create } from 'zustand';
import { GameState, Direction, Position, GameMode, GameStatus } from '@/types/game';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

const getInitialSnake = (): Position[] => [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

const generateFood = (snake: Position[]): Position => {
  let newFood: Position;
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
  return newFood;
};

const getOppositeDirection = (dir: Direction): Direction => {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  return opposites[dir];
};

interface GameStore extends GameState {
  setDirection: (direction: Direction) => void;
  setMode: (mode: GameMode) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  tick: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  snake: getInitialSnake(),
  food: generateFood(getInitialSnake()),
  direction: 'RIGHT',
  nextDirection: 'RIGHT',
  score: 0,
  highScore: parseInt(localStorage.getItem('snake_high_score') || '0'),
  status: 'idle',
  mode: 'walls',
  speed: INITIAL_SPEED,
  gridSize: GRID_SIZE,

  setDirection: (direction: Direction) => {
    const { direction: currentDirection, status } = get();
    
    if (status !== 'playing') return;
    if (direction === getOppositeDirection(currentDirection)) return;
    
    set({ nextDirection: direction });
  },

  setMode: (mode: GameMode) => {
    set({ mode });
  },

  startGame: () => {
    const snake = getInitialSnake();
    set({
      snake,
      food: generateFood(snake),
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      score: 0,
      status: 'playing',
      speed: INITIAL_SPEED,
    });
  },

  pauseGame: () => {
    const { status } = get();
    if (status === 'playing') {
      set({ status: 'paused' });
    }
  },

  resumeGame: () => {
    const { status } = get();
    if (status === 'paused') {
      set({ status: 'playing' });
    }
  },

  resetGame: () => {
    const snake = getInitialSnake();
    set({
      snake,
      food: generateFood(snake),
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      score: 0,
      status: 'idle',
      speed: INITIAL_SPEED,
    });
  },

  tick: () => {
    const { snake, food, nextDirection, score, highScore, mode, status } = get();
    
    if (status !== 'playing') return;

    const head = snake[0];
    let newHead: Position = { ...head };

    // Apply next direction
    set({ direction: nextDirection });

    // Calculate new head position
    switch (nextDirection) {
      case 'UP':
        newHead.y -= 1;
        break;
      case 'DOWN':
        newHead.y += 1;
        break;
      case 'LEFT':
        newHead.x -= 1;
        break;
      case 'RIGHT':
        newHead.x += 1;
        break;
    }

    // Handle wall collision based on mode
    if (mode === 'pass-through') {
      // Wrap around
      newHead.x = (newHead.x + GRID_SIZE) % GRID_SIZE;
      newHead.y = (newHead.y + GRID_SIZE) % GRID_SIZE;
    } else {
      // Check wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        const finalHighScore = Math.max(score, highScore);
        localStorage.setItem('snake_high_score', finalHighScore.toString());
        set({ status: 'game-over', highScore: finalHighScore });
        return;
      }
    }

    // Check self collision
    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      const finalHighScore = Math.max(score, highScore);
      localStorage.setItem('snake_high_score', finalHighScore.toString());
      set({ status: 'game-over', highScore: finalHighScore });
      return;
    }

    const newSnake = [newHead, ...snake];

    // Check food collision
    if (newHead.x === food.x && newHead.y === food.y) {
      const newScore = score + 10;
      const newHighScore = Math.max(newScore, highScore);
      const newSpeed = Math.max(50, INITIAL_SPEED - Math.floor(newScore / 50) * 10);
      
      localStorage.setItem('snake_high_score', newHighScore.toString());
      
      set({
        snake: newSnake,
        food: generateFood(newSnake),
        score: newScore,
        highScore: newHighScore,
        speed: newSpeed,
      });
    } else {
      newSnake.pop();
      set({ snake: newSnake });
    }
  },
}));
