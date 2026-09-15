import { create } from 'zustand';

// Memory only: a page reload always restores the real date.
export const useDebugDateStore = create<{
  date: string;
  setDate: (date: string) => void;
}>((set) => ({
  date: '',
  setDate: (date) => set({ date }),
}));
