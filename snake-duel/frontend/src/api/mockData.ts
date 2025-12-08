import { User, LeaderboardEntry, ActivePlayer, GameMode } from '@/types/game';

// Mock users database
export const mockUsers: Map<string, User & { password: string }> = new Map([
  ['user1', {
    id: 'user1',
    username: 'SnakeMaster',
    email: 'snakemaster@example.com',
    password: 'password123',
    createdAt: '2024-01-15T10:30:00Z',
  }],
  ['user2', {
    id: 'user2',
    username: 'RetroGamer',
    email: 'retrogamer@example.com',
    password: 'password123',
    createdAt: '2024-02-20T14:45:00Z',
  }],
]);

// Mock leaderboard data
export const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', username: 'NeonViper', score: 2450, mode: 'walls', createdAt: '2024-12-01T08:00:00Z' },
  { id: '2', username: 'PixelSnake', score: 2100, mode: 'pass-through', createdAt: '2024-12-02T12:30:00Z' },
  { id: '3', username: 'ArcadeKing', score: 1890, mode: 'walls', createdAt: '2024-12-03T15:45:00Z' },
  { id: '4', username: 'RetroGamer', score: 1750, mode: 'pass-through', createdAt: '2024-12-04T09:20:00Z' },
  { id: '5', username: 'SnakeMaster', score: 1620, mode: 'walls', createdAt: '2024-12-05T18:10:00Z' },
  { id: '6', username: 'GameWizard', score: 1500, mode: 'pass-through', createdAt: '2024-12-06T11:00:00Z' },
  { id: '7', username: 'NightCrawler', score: 1350, mode: 'walls', createdAt: '2024-12-06T14:30:00Z' },
  { id: '8', username: 'ByteRunner', score: 1200, mode: 'pass-through', createdAt: '2024-12-07T16:45:00Z' },
  { id: '9', username: 'GlitchHunter', score: 1050, mode: 'walls', createdAt: '2024-12-07T19:00:00Z' },
  { id: '10', username: 'CyberSerpent', score: 900, mode: 'pass-through', createdAt: '2024-12-07T21:15:00Z' },
];

// Initial positions for mock active players
const generateInitialSnake = (startX: number, startY: number) => [
  { x: startX, y: startY },
  { x: startX - 1, y: startY },
  { x: startX - 2, y: startY },
];

export const mockActivePlayers: ActivePlayer[] = [
  {
    id: 'player1',
    username: 'LiveGamer42',
    score: 320,
    mode: 'walls',
    snake: generateInitialSnake(10, 10),
    food: { x: 15, y: 8 },
    direction: 'RIGHT',
    status: 'playing',
  },
  {
    id: 'player2',
    username: 'StreamSnake',
    score: 180,
    mode: 'pass-through',
    snake: generateInitialSnake(8, 12),
    food: { x: 12, y: 5 },
    direction: 'UP',
    status: 'playing',
  },
  {
    id: 'player3',
    username: 'ProSlither',
    score: 540,
    mode: 'walls',
    snake: generateInitialSnake(5, 8),
    food: { x: 18, y: 15 },
    direction: 'DOWN',
    status: 'playing',
  },
];

// Helper to generate random food position
export const generateRandomFood = (gridSize: number, snake: { x: number; y: number }[]) => {
  let newFood: { x: number; y: number };
  do {
    newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
  return newFood;
};
