import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authApi, leaderboardApi, watchApi } from '@/api';
import { mockUsers, mockLeaderboard } from '@/api/mockData';

describe('API Module', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('authApi', () => {
    describe('login', () => {
      it('should return user on valid credentials', async () => {
        const result = await authApi.login('snakemaster@example.com', 'password123');
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data?.username).toBe('SnakeMaster');
      });

      it('should return error on invalid credentials', async () => {
        const result = await authApi.login('wrong@email.com', 'wrongpassword');
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid email or password');
        expect(result.data).toBeNull();
      });
    });

    describe('signup', () => {
      it('should create new user successfully', async () => {
        const result = await authApi.signup('NewPlayer', 'newplayer@test.com', 'password');
        
        expect(result.success).toBe(true);
        expect(result.data?.username).toBe('NewPlayer');
        expect(result.data?.email).toBe('newplayer@test.com');
      });

      it('should reject duplicate email', async () => {
        const result = await authApi.signup('Test', 'snakemaster@example.com', 'password');
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Email already registered');
      });

      it('should reject duplicate username', async () => {
        const result = await authApi.signup('SnakeMaster', 'unique@test.com', 'password');
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Username already taken');
      });
    });

    describe('logout', () => {
      it('should clear session', async () => {
        await authApi.login('snakemaster@example.com', 'password123');
        const logoutResult = await authApi.logout();
        
        expect(logoutResult.success).toBe(true);
        
        const userResult = await authApi.getCurrentUser();
        expect(userResult.success).toBe(false);
      });
    });

    describe('getCurrentUser', () => {
      it('should return user if logged in', async () => {
        await authApi.login('snakemaster@example.com', 'password123');
        const result = await authApi.getCurrentUser();
        
        expect(result.success).toBe(true);
        expect(result.data?.username).toBe('SnakeMaster');
      });

      it('should return error if not logged in', async () => {
        const result = await authApi.getCurrentUser();
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Not authenticated');
      });
    });
  });

  describe('leaderboardApi', () => {
    describe('getLeaderboard', () => {
      it('should return all entries when no filter', async () => {
        const result = await leaderboardApi.getLeaderboard();
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.length).toBeGreaterThan(0);
      });

      it('should filter by mode', async () => {
        const result = await leaderboardApi.getLeaderboard('walls');
        
        expect(result.success).toBe(true);
        expect(result.data?.every(e => e.mode === 'walls')).toBe(true);
      });

      it('should return entries sorted by score descending', async () => {
        const result = await leaderboardApi.getLeaderboard();
        
        expect(result.success).toBe(true);
        const scores = result.data!.map(e => e.score);
        const sortedScores = [...scores].sort((a, b) => b - a);
        expect(scores).toEqual(sortedScores);
      });
    });

    describe('submitScore', () => {
      it('should add new entry to leaderboard', async () => {
        const initialResult = await leaderboardApi.getLeaderboard();
        const initialCount = initialResult.data!.length;
        
        const result = await leaderboardApi.submitScore('TestPlayer', 999, 'walls');
        
        expect(result.success).toBe(true);
        expect(result.data?.username).toBe('TestPlayer');
        expect(result.data?.score).toBe(999);
        
        const afterResult = await leaderboardApi.getLeaderboard();
        expect(afterResult.data!.length).toBe(initialCount + 1);
      });
    });
  });

  describe('watchApi', () => {
    describe('getActivePlayers', () => {
      it('should return list of active players', async () => {
        const result = await watchApi.getActivePlayers();
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.length).toBeGreaterThan(0);
      });

      it('should return players with required properties', async () => {
        const result = await watchApi.getActivePlayers();
        
        const player = result.data![0];
        expect(player).toHaveProperty('id');
        expect(player).toHaveProperty('username');
        expect(player).toHaveProperty('score');
        expect(player).toHaveProperty('snake');
        expect(player).toHaveProperty('food');
        expect(player).toHaveProperty('direction');
        expect(player).toHaveProperty('mode');
      });
    });

    describe('getPlayerById', () => {
      it('should return player by id', async () => {
        const result = await watchApi.getPlayerById('player1');
        
        expect(result.success).toBe(true);
        expect(result.data?.id).toBe('player1');
      });

      it('should return error for invalid id', async () => {
        const result = await watchApi.getPlayerById('invalid-id');
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Player not found');
      });
    });

    describe('subscribeToPlayer', () => {
      it('should call callback periodically', async () => {
        const callback = vi.fn();
        const unsubscribe = watchApi.subscribeToPlayer('player1', callback);
        
        // Wait for a few ticks
        await new Promise(resolve => setTimeout(resolve, 400));
        
        unsubscribe();
        expect(callback).toHaveBeenCalled();
      });
    });

    describe('simulateTick', () => {
      it('should update player positions', async () => {
        const before = await watchApi.getActivePlayers();
        const initialHead = before.data![0].snake[0];
        
        // Simulate multiple ticks
        for (let i = 0; i < 5; i++) {
          watchApi.simulateTick();
        }
        
        const after = await watchApi.getActivePlayers();
        const newHead = after.data![0].snake[0];
        
        // Position should have changed (unless random reset)
        expect(newHead.x !== initialHead.x || newHead.y !== initialHead.y).toBe(true);
      });
    });
  });
});
