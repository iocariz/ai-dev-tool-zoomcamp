import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api';

// Mock the API module
vi.mock('@/api', () => ({
  authApi: {
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset the store
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should set user and isAuthenticated on successful login', async () => {
      const mockUser = { id: '1', username: 'test', email: 'test@test.com', createdAt: '2024-01-01' };
      vi.mocked(authApi.login).mockResolvedValue({
        data: mockUser,
        error: null,
        success: true,
      });

      const result = await useAuthStore.getState().login('test@test.com', 'password');

      expect(result).toBe(true);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().error).toBeNull();
    });

    it('should set error on failed login', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        data: null,
        error: 'Invalid credentials',
        success: false,
      });

      const result = await useAuthStore.getState().login('test@test.com', 'wrong');

      expect(result).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().error).toBe('Invalid credentials');
    });
  });

  describe('signup', () => {
    it('should set user on successful signup', async () => {
      const mockUser = { id: '2', username: 'newuser', email: 'new@test.com', createdAt: '2024-01-01' };
      vi.mocked(authApi.signup).mockResolvedValue({
        data: mockUser,
        error: null,
        success: true,
      });

      const result = await useAuthStore.getState().signup('newuser', 'new@test.com', 'password');

      expect(result).toBe(true);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('should set error when email is taken', async () => {
      vi.mocked(authApi.signup).mockResolvedValue({
        data: null,
        error: 'Email already registered',
        success: false,
      });

      const result = await useAuthStore.getState().signup('user', 'taken@test.com', 'password');

      expect(result).toBe(false);
      expect(useAuthStore.getState().error).toBe('Email already registered');
    });
  });

  describe('logout', () => {
    it('should clear user and isAuthenticated', async () => {
      useAuthStore.setState({
        user: { id: '1', username: 'test', email: 'test@test.com', createdAt: '2024-01-01' },
        isAuthenticated: true,
      });

      vi.mocked(authApi.logout).mockResolvedValue({
        data: null,
        error: null,
        success: true,
      });

      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('checkAuth', () => {
    it('should restore user from session', async () => {
      const mockUser = { id: '1', username: 'test', email: 'test@test.com', createdAt: '2024-01-01' };
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        data: mockUser,
        error: null,
        success: true,
      });

      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('should not authenticate if no session', async () => {
      vi.mocked(authApi.getCurrentUser).mockResolvedValue({
        data: null,
        error: 'Not authenticated',
        success: false,
      });

      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear the error', () => {
      useAuthStore.setState({ error: 'Some error' });
      useAuthStore.getState().clearError();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
