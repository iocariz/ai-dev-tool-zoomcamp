import { create } from 'zustand';
import { User } from '@/types/game';
import { authApi } from '@/api';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    const response = await authApi.login(email, password);
    
    if (response.success && response.data) {
      set({ user: response.data, isAuthenticated: true, isLoading: false });
      return true;
    }
    
    set({ error: response.error, isLoading: false });
    return false;
  },

  signup: async (username: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    const response = await authApi.signup(username, email, password);
    
    if (response.success && response.data) {
      set({ user: response.data, isAuthenticated: true, isLoading: false });
      return true;
    }
    
    set({ error: response.error, isLoading: false });
    return false;
  },

  logout: async () => {
    set({ isLoading: true });
    await authApi.logout();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    
    const response = await authApi.getCurrentUser();
    
    if (response.success && response.data) {
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
