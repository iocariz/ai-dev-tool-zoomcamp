import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/stores/gameStore';

describe('Game Store', () => {
  beforeEach(() => {
    // Reset the store before each test
    useGameStore.setState({
      snake: [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ],
      food: { x: 15, y: 10 },
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      score: 0,
      highScore: 0,
      status: 'idle',
      mode: 'walls',
      speed: 150,
      gridSize: 20,
    });
  });

  describe('setDirection', () => {
    it('should change direction when game is playing', () => {
      const store = useGameStore.getState();
      store.startGame();
      store.setDirection('UP');
      expect(useGameStore.getState().nextDirection).toBe('UP');
    });

    it('should not change to opposite direction', () => {
      const store = useGameStore.getState();
      store.startGame();
      store.setDirection('LEFT'); // Opposite of RIGHT
      expect(useGameStore.getState().nextDirection).toBe('RIGHT');
    });

    it('should not change direction when game is not playing', () => {
      const store = useGameStore.getState();
      store.setDirection('UP');
      expect(useGameStore.getState().nextDirection).toBe('RIGHT');
    });
  });

  describe('setMode', () => {
    it('should change game mode', () => {
      const store = useGameStore.getState();
      store.setMode('pass-through');
      expect(useGameStore.getState().mode).toBe('pass-through');
    });
  });

  describe('startGame', () => {
    it('should set status to playing', () => {
      const store = useGameStore.getState();
      store.startGame();
      expect(useGameStore.getState().status).toBe('playing');
    });

    it('should reset score to 0', () => {
      useGameStore.setState({ score: 100 });
      const store = useGameStore.getState();
      store.startGame();
      expect(useGameStore.getState().score).toBe(0);
    });

    it('should reset snake to initial position', () => {
      const store = useGameStore.getState();
      store.startGame();
      const state = useGameStore.getState();
      expect(state.snake).toHaveLength(3);
      expect(state.snake[0]).toEqual({ x: 10, y: 10 });
    });
  });

  describe('pauseGame', () => {
    it('should pause when playing', () => {
      const store = useGameStore.getState();
      store.startGame();
      store.pauseGame();
      expect(useGameStore.getState().status).toBe('paused');
    });

    it('should not pause when not playing', () => {
      const store = useGameStore.getState();
      store.pauseGame();
      expect(useGameStore.getState().status).toBe('idle');
    });
  });

  describe('resumeGame', () => {
    it('should resume when paused', () => {
      const store = useGameStore.getState();
      store.startGame();
      store.pauseGame();
      store.resumeGame();
      expect(useGameStore.getState().status).toBe('playing');
    });
  });

  describe('resetGame', () => {
    it('should reset to idle state', () => {
      const store = useGameStore.getState();
      store.startGame();
      useGameStore.setState({ score: 100 });
      store.resetGame();
      
      const state = useGameStore.getState();
      expect(state.status).toBe('idle');
      expect(state.score).toBe(0);
      expect(state.direction).toBe('RIGHT');
    });
  });

  describe('tick', () => {
    it('should move snake in current direction', () => {
      const store = useGameStore.getState();
      store.startGame();
      
      const initialHead = useGameStore.getState().snake[0];
      store.tick();
      
      const newHead = useGameStore.getState().snake[0];
      expect(newHead.x).toBe(initialHead.x + 1);
      expect(newHead.y).toBe(initialHead.y);
    });

    it('should not tick when game is not playing', () => {
      const store = useGameStore.getState();
      const initialSnake = [...useGameStore.getState().snake];
      store.tick();
      expect(useGameStore.getState().snake).toEqual(initialSnake);
    });

    it('should cause game over when hitting wall in walls mode', () => {
      useGameStore.setState({
        snake: [
          { x: 19, y: 10 },
          { x: 18, y: 10 },
          { x: 17, y: 10 },
        ],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        status: 'playing',
        mode: 'walls',
      });
      
      const store = useGameStore.getState();
      store.tick();
      
      expect(useGameStore.getState().status).toBe('game-over');
    });

    it('should wrap around in pass-through mode', () => {
      useGameStore.setState({
        snake: [
          { x: 19, y: 10 },
          { x: 18, y: 10 },
          { x: 17, y: 10 },
        ],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        status: 'playing',
        mode: 'pass-through',
      });
      
      const store = useGameStore.getState();
      store.tick();
      
      const state = useGameStore.getState();
      expect(state.status).toBe('playing');
      expect(state.snake[0].x).toBe(0);
    });

    it('should cause game over when snake collides with itself', () => {
      useGameStore.setState({
        snake: [
          { x: 10, y: 10 },
          { x: 11, y: 10 },
          { x: 11, y: 9 },
          { x: 10, y: 9 },
          { x: 9, y: 9 },
          { x: 9, y: 10 },
        ],
        direction: 'LEFT',
        nextDirection: 'LEFT',
        status: 'playing',
        mode: 'walls',
      });
      
      const store = useGameStore.getState();
      store.tick();
      
      expect(useGameStore.getState().status).toBe('game-over');
    });

    it('should increase score when eating food', () => {
      useGameStore.setState({
        snake: [
          { x: 10, y: 10 },
          { x: 9, y: 10 },
          { x: 8, y: 10 },
        ],
        food: { x: 11, y: 10 },
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        status: 'playing',
        mode: 'walls',
        score: 0,
      });
      
      const store = useGameStore.getState();
      store.tick();
      
      expect(useGameStore.getState().score).toBe(10);
    });

    it('should grow snake when eating food', () => {
      useGameStore.setState({
        snake: [
          { x: 10, y: 10 },
          { x: 9, y: 10 },
          { x: 8, y: 10 },
        ],
        food: { x: 11, y: 10 },
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        status: 'playing',
        mode: 'walls',
      });
      
      const store = useGameStore.getState();
      store.tick();
      
      expect(useGameStore.getState().snake).toHaveLength(4);
    });
  });
});
