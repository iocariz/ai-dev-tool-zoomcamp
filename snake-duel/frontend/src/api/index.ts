import { User, LeaderboardEntry, ActivePlayer, ApiResponse as AppApiResponse, GameMode } from '@/types/game';
import { AuthService, LeaderboardService, OpenAPI } from '@/client';
import { mockActivePlayers, generateRandomFood } from './mockData';

// Configure Base URL
OpenAPI.BASE = 'http://localhost:3000';

// Helper to handle client errors and fallback to app response format
const handleApiError = (error: any): AppApiResponse<any> => {
  console.error(error);
  const message = error.body?.error || error.message || 'An error occurred';
  return { success: false, error: message, data: null };
};

// ============ AUTH API ============

export const authApi = {
  async login(email: string, password: string): Promise<AppApiResponse<User>> {
    try {
      // The generated client returns the response body directly for 2xx
      const response = await AuthService.postAuthLogin({ email, password });

      if (response.success && response.data) {
        // Save token (user.id for now, as implemented in backend mock auth)
        OpenAPI.TOKEN = response.data.id;
        sessionStorage.setItem('snake_token', response.data.id);

        // Cast to App User type (ensure compatibility)
        return { success: true, data: response.data as unknown as User, error: null };
      }
      return { success: false, error: response.error || 'Login failed', data: null };
    } catch (error) {
      return handleApiError(error);
    }
  },

  async signup(username: string, email: string, password: string): Promise<AppApiResponse<User>> {
    try {
      const response = await AuthService.postAuthSignup({ username, email, password });

      if (response.success && response.data) {
        OpenAPI.TOKEN = response.data.id;
        sessionStorage.setItem('snake_token', response.data.id);
        return { success: true, data: response.data as unknown as User, error: null };
      }
      return { success: false, error: response.error || 'Signup failed', data: null };
    } catch (error) {
      return handleApiError(error);
    }
  },

  async logout(): Promise<AppApiResponse<null>> {
    try {
      await AuthService.postAuthLogout();
      OpenAPI.TOKEN = undefined;
      sessionStorage.removeItem('snake_token');
      return { success: true, data: null, error: null };
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getCurrentUser(): Promise<AppApiResponse<User>> {
    try {
      const token = sessionStorage.getItem('snake_token');
      if (!token) {
        return { success: false, error: 'Not authenticated', data: null };
      }
      OpenAPI.TOKEN = token;

      const response = await AuthService.getAuthMe();
      if (response.success && response.data) {
        return { success: true, data: response.data as unknown as User, error: null };
      }
      return { success: false, error: response.error || 'Session invalid', data: null };
    } catch (error) {
      // If 401, clear session
      if ((error as any).status === 401) {
        sessionStorage.removeItem('snake_token');
      }
      return handleApiError(error);
    }
  },
};

// ============ LEADERBOARD API ============

export const leaderboardApi = {
  async getLeaderboard(mode?: GameMode): Promise<AppApiResponse<LeaderboardEntry[]>> {
    try {
      const response = await LeaderboardService.getLeaderboard(mode);
      if (response.success) {
        return { success: true, data: (response.data || []) as unknown as LeaderboardEntry[], error: null };
      }
      return { success: false, error: response.error || 'Failed to fetch leaderboard', data: null };
    } catch (error) {
      return handleApiError(error);
    }
  },

  async submitScore(username: string, score: number, mode: GameMode): Promise<AppApiResponse<LeaderboardEntry>> {
    try {
      const response = await LeaderboardService.postLeaderboard({ score, mode, username });
      if (response.success && response.data) {
        return { success: true, data: response.data as unknown as LeaderboardEntry, error: null };
      }
      return { success: false, error: response.error || 'Submission failed', data: null };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// ============ WATCH API (Live Players) ============
// Kept simulated for now as backend doesn't broadcast game state

// Store for simulated active players
let activePlayersState = JSON.parse(JSON.stringify(mockActivePlayers)) as ActivePlayer[];

// Simulate player movements
const simulatePlayerMove = (player: ActivePlayer): ActivePlayer => {
  const gridSize = 20;
  const head = player.snake[0];
  let newHead = { ...head };

  // Random direction change (10% chance)
  if (Math.random() < 0.1) {
    const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'] as const;
    const currentIdx = directions.indexOf(player.direction as typeof directions[number]);
    const validDirections = directions.filter((_, idx) => Math.abs(idx - currentIdx) !== 2);
    player.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
  }

  // Move based on direction
  switch (player.direction) {
    case 'UP':
      newHead.y = player.mode === 'pass-through'
        ? (head.y - 1 + gridSize) % gridSize
        : head.y - 1;
      break;
    case 'DOWN':
      newHead.y = player.mode === 'pass-through'
        ? (head.y + 1) % gridSize
        : head.y + 1;
      break;
    case 'LEFT':
      newHead.x = player.mode === 'pass-through'
        ? (head.x - 1 + gridSize) % gridSize
        : head.x - 1;
      break;
    case 'RIGHT':
      newHead.x = player.mode === 'pass-through'
        ? (head.x + 1) % gridSize
        : head.x + 1;
      break;
  }

  // Check wall collision in walls mode
  if (player.mode === 'walls' && (newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize)) {
    // Reset player
    return {
      ...player,
      snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
      score: 0,
      food: generateRandomFood(gridSize, []),
      direction: 'RIGHT',
    };
  }

  // Check self collision
  if (player.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
    // Reset player
    return {
      ...player,
      snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
      score: 0,
      food: generateRandomFood(gridSize, []),
      direction: 'RIGHT',
    };
  }

  const newSnake = [newHead, ...player.snake];

  // Check food collision
  if (newHead.x === player.food.x && newHead.y === player.food.y) {
    return {
      ...player,
      snake: newSnake,
      score: player.score + 10,
      food: generateRandomFood(gridSize, newSnake),
    };
  }

  newSnake.pop();
  return { ...player, snake: newSnake };
};

export const watchApi = {
  async getActivePlayers(): Promise<AppApiResponse<ActivePlayer[]>> {
    // Simulation delay
    await new Promise(resolve => setTimeout(resolve, 200));
    return { data: activePlayersState, error: null, success: true };
  },

  async getPlayerById(playerId: string): Promise<AppApiResponse<ActivePlayer>> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const player = activePlayersState.find(p => p.id === playerId);
    if (!player) {
      return { data: null, error: 'Player not found', success: false };
    }

    return { data: player, error: null, success: true };
  },

  // Call this to simulate game ticks for active players
  simulateTick(): void {
    activePlayersState = activePlayersState.map(simulatePlayerMove);
  },

  // Subscribe to player updates (returns unsubscribe function)
  subscribeToPlayer(playerId: string, callback: (player: ActivePlayer) => void): () => void {
    const intervalId = setInterval(() => {
      const player = activePlayersState.find(p => p.id === playerId);
      if (player) {
        callback(player);
      }
    }, 150);

    return () => clearInterval(intervalId);
  },
};

// Start simulation
setInterval(() => {
  watchApi.simulateTick();
}, 150);
