import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Direction } from '@/types/game';

interface GameBoardProps {
  readonly?: boolean;
  snake?: { x: number; y: number }[];
  food?: { x: number; y: number };
  gridSize?: number;
}

const GameBoard = ({ readonly = false, snake: externalSnake, food: externalFood, gridSize: externalGridSize }: GameBoardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastTickRef = useRef<number>(0);

  const {
    snake: internalSnake,
    food: internalFood,
    direction,
    status,
    speed,
    gridSize: internalGridSize,
    setDirection,
    tick,
  } = useGameStore();

  const snake = externalSnake || internalSnake;
  const food = externalFood || internalFood;
  const gridSize = externalGridSize || internalGridSize;

  const CELL_SIZE = 20;
  const CANVAS_SIZE = gridSize * CELL_SIZE;

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (readonly) return;
    
    const keyDirections: Record<string, Direction> = {
      ArrowUp: 'UP',
      ArrowDown: 'DOWN',
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
      w: 'UP',
      s: 'DOWN',
      a: 'LEFT',
      d: 'RIGHT',
      W: 'UP',
      S: 'DOWN',
      A: 'LEFT',
      D: 'RIGHT',
    };

    const direction = keyDirections[e.key];
    if (direction) {
      e.preventDefault();
      setDirection(direction);
    }
  }, [setDirection, readonly]);

  useEffect(() => {
    if (!readonly) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, readonly]);

  // Game loop
  useEffect(() => {
    if (readonly) return;
    
    const gameLoop = (timestamp: number) => {
      if (status === 'playing') {
        if (timestamp - lastTickRef.current >= speed) {
          tick();
          lastTickRef.current = timestamp;
        }
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [status, speed, tick, readonly]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'hsl(220, 20%, 8%)';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid
    ctx.strokeStyle = 'hsl(220, 20%, 15%)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw food with glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'hsl(0, 100%, 60%)';
    ctx.fillStyle = 'hsl(0, 100%, 60%)';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw snake
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      
      // Glow effect for head
      if (isHead) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'hsl(145, 100%, 50%)';
      }

      // Gradient from head to tail
      const brightness = 100 - (index / snake.length) * 40;
      ctx.fillStyle = `hsl(145, 100%, ${brightness}%)`;
      
      const padding = isHead ? 1 : 2;
      ctx.fillRect(
        segment.x * CELL_SIZE + padding,
        segment.y * CELL_SIZE + padding,
        CELL_SIZE - padding * 2,
        CELL_SIZE - padding * 2
      );

      // Draw eyes on head
      if (isHead) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'hsl(220, 20%, 6%)';
        
        const eyeSize = 3;
        const eyeOffset = 5;
        
        let eye1X, eye1Y, eye2X, eye2Y;
        
        switch (direction) {
          case 'UP':
            eye1X = segment.x * CELL_SIZE + eyeOffset;
            eye1Y = segment.y * CELL_SIZE + eyeOffset;
            eye2X = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            eye2Y = segment.y * CELL_SIZE + eyeOffset;
            break;
          case 'DOWN':
            eye1X = segment.x * CELL_SIZE + eyeOffset;
            eye1Y = segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            eye2X = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            eye2Y = segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            break;
          case 'LEFT':
            eye1X = segment.x * CELL_SIZE + eyeOffset;
            eye1Y = segment.y * CELL_SIZE + eyeOffset;
            eye2X = segment.x * CELL_SIZE + eyeOffset;
            eye2Y = segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            break;
          case 'RIGHT':
          default:
            eye1X = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            eye1Y = segment.y * CELL_SIZE + eyeOffset;
            eye2X = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            eye2Y = segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            break;
        }
        
        ctx.fillRect(eye1X, eye1Y, eyeSize, eyeSize);
        ctx.fillRect(eye2X, eye2Y, eyeSize, eyeSize);
      }
      
      ctx.shadowBlur = 0;
    });
  }, [snake, food, direction, gridSize, CANVAS_SIZE]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="border-2 border-primary/30 rounded-lg box-glow-primary"
      />
    </div>
  );
};

export default GameBoard;
