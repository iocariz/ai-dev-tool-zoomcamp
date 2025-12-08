import { describe, it, expect } from 'vitest';
import { Direction, Position, GameMode } from '@/types/game';

// Pure game logic functions for testing
export const getNextPosition = (
  head: Position,
  direction: Direction,
  gridSize: number,
  mode: GameMode
): Position => {
  let newHead = { ...head };

  switch (direction) {
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

  if (mode === 'pass-through') {
    newHead.x = (newHead.x + gridSize) % gridSize;
    newHead.y = (newHead.y + gridSize) % gridSize;
  }

  return newHead;
};

export const isWallCollision = (
  position: Position,
  gridSize: number,
  mode: GameMode
): boolean => {
  if (mode === 'pass-through') return false;
  return (
    position.x < 0 ||
    position.x >= gridSize ||
    position.y < 0 ||
    position.y >= gridSize
  );
};

export const isSelfCollision = (
  head: Position,
  snake: Position[]
): boolean => {
  return snake.some(segment => segment.x === head.x && segment.y === head.y);
};

export const isFoodCollision = (
  head: Position,
  food: Position
): boolean => {
  return head.x === food.x && head.y === food.y;
};

export const isOppositeDirection = (
  dir1: Direction,
  dir2: Direction
): boolean => {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  return opposites[dir1] === dir2;
};

describe('Game Logic', () => {
  describe('getNextPosition', () => {
    it('should move up correctly', () => {
      const result = getNextPosition({ x: 10, y: 10 }, 'UP', 20, 'walls');
      expect(result).toEqual({ x: 10, y: 9 });
    });

    it('should move down correctly', () => {
      const result = getNextPosition({ x: 10, y: 10 }, 'DOWN', 20, 'walls');
      expect(result).toEqual({ x: 10, y: 11 });
    });

    it('should move left correctly', () => {
      const result = getNextPosition({ x: 10, y: 10 }, 'LEFT', 20, 'walls');
      expect(result).toEqual({ x: 9, y: 10 });
    });

    it('should move right correctly', () => {
      const result = getNextPosition({ x: 10, y: 10 }, 'RIGHT', 20, 'walls');
      expect(result).toEqual({ x: 11, y: 10 });
    });

    it('should wrap around at top edge in pass-through mode', () => {
      const result = getNextPosition({ x: 10, y: 0 }, 'UP', 20, 'pass-through');
      expect(result).toEqual({ x: 10, y: 19 });
    });

    it('should wrap around at bottom edge in pass-through mode', () => {
      const result = getNextPosition({ x: 10, y: 19 }, 'DOWN', 20, 'pass-through');
      expect(result).toEqual({ x: 10, y: 0 });
    });

    it('should wrap around at left edge in pass-through mode', () => {
      const result = getNextPosition({ x: 0, y: 10 }, 'LEFT', 20, 'pass-through');
      expect(result).toEqual({ x: 19, y: 10 });
    });

    it('should wrap around at right edge in pass-through mode', () => {
      const result = getNextPosition({ x: 19, y: 10 }, 'RIGHT', 20, 'pass-through');
      expect(result).toEqual({ x: 0, y: 10 });
    });

    it('should not wrap in walls mode', () => {
      const result = getNextPosition({ x: 19, y: 10 }, 'RIGHT', 20, 'walls');
      expect(result).toEqual({ x: 20, y: 10 });
    });
  });

  describe('isWallCollision', () => {
    it('should detect collision at left wall', () => {
      expect(isWallCollision({ x: -1, y: 10 }, 20, 'walls')).toBe(true);
    });

    it('should detect collision at right wall', () => {
      expect(isWallCollision({ x: 20, y: 10 }, 20, 'walls')).toBe(true);
    });

    it('should detect collision at top wall', () => {
      expect(isWallCollision({ x: 10, y: -1 }, 20, 'walls')).toBe(true);
    });

    it('should detect collision at bottom wall', () => {
      expect(isWallCollision({ x: 10, y: 20 }, 20, 'walls')).toBe(true);
    });

    it('should not detect collision inside grid', () => {
      expect(isWallCollision({ x: 10, y: 10 }, 20, 'walls')).toBe(false);
    });

    it('should not detect collision at edges', () => {
      expect(isWallCollision({ x: 0, y: 0 }, 20, 'walls')).toBe(false);
      expect(isWallCollision({ x: 19, y: 19 }, 20, 'walls')).toBe(false);
    });

    it('should never detect collision in pass-through mode', () => {
      expect(isWallCollision({ x: -1, y: 10 }, 20, 'pass-through')).toBe(false);
      expect(isWallCollision({ x: 20, y: 10 }, 20, 'pass-through')).toBe(false);
    });
  });

  describe('isSelfCollision', () => {
    it('should detect collision with body segment', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 11, y: 10 },
        { x: 12, y: 10 },
      ];
      expect(isSelfCollision({ x: 11, y: 10 }, snake)).toBe(true);
    });

    it('should not detect collision with empty snake', () => {
      expect(isSelfCollision({ x: 10, y: 10 }, [])).toBe(false);
    });

    it('should not detect collision when no overlap', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 11, y: 10 },
        { x: 12, y: 10 },
      ];
      expect(isSelfCollision({ x: 5, y: 5 }, snake)).toBe(false);
    });
  });

  describe('isFoodCollision', () => {
    it('should detect when head is on food', () => {
      expect(isFoodCollision({ x: 10, y: 10 }, { x: 10, y: 10 })).toBe(true);
    });

    it('should not detect when head is not on food', () => {
      expect(isFoodCollision({ x: 10, y: 10 }, { x: 5, y: 5 })).toBe(false);
    });
  });

  describe('isOppositeDirection', () => {
    it('should identify UP and DOWN as opposite', () => {
      expect(isOppositeDirection('UP', 'DOWN')).toBe(true);
      expect(isOppositeDirection('DOWN', 'UP')).toBe(true);
    });

    it('should identify LEFT and RIGHT as opposite', () => {
      expect(isOppositeDirection('LEFT', 'RIGHT')).toBe(true);
      expect(isOppositeDirection('RIGHT', 'LEFT')).toBe(true);
    });

    it('should not identify non-opposite directions', () => {
      expect(isOppositeDirection('UP', 'LEFT')).toBe(false);
      expect(isOppositeDirection('UP', 'RIGHT')).toBe(false);
      expect(isOppositeDirection('DOWN', 'LEFT')).toBe(false);
      expect(isOppositeDirection('DOWN', 'RIGHT')).toBe(false);
    });

    it('should not identify same direction as opposite', () => {
      expect(isOppositeDirection('UP', 'UP')).toBe(false);
      expect(isOppositeDirection('DOWN', 'DOWN')).toBe(false);
      expect(isOppositeDirection('LEFT', 'LEFT')).toBe(false);
      expect(isOppositeDirection('RIGHT', 'RIGHT')).toBe(false);
    });
  });
});
