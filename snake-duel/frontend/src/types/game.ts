export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameMode = 'walls' | 'pass-through';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'game-over';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  highScore: number;
  status: GameStatus;
  mode: GameMode;
  speed: number;
  gridSize: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  mode: GameMode;
  createdAt: string;
}

export interface ActivePlayer {
  id: string;
  username: string;
  score: number;
  mode: GameMode;
  snake: Position[];
  food: Position;
  direction: Direction;
  status: GameStatus;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}
