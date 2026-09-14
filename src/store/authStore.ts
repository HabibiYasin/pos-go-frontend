import { create } from 'zustand';
import type { User } from '../types';
import { clearTabToken } from '../services/tabSession';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    clearTabToken();
    set({ user: null, isAuthenticated: false });
  },
}));
