// src/store/loaderStore.ts
import { create } from "zustand";

interface LoaderState {
  loading: boolean;
  setLoading: (state: boolean) => void;
  activeRequests: number;
  increaseRequests: () => void;
  decreaseRequests: () => void;
}

export const useLoaderStore = create<LoaderState>((set, get) => ({
  loading: false,
  activeRequests: 0,

  setLoading: (state) => set({ loading: state }),

  increaseRequests: () => {
    const count = get().activeRequests + 1;
    set({ activeRequests: count, loading: true });
  },

  decreaseRequests: () => {
    const count = Math.max(0, get().activeRequests - 1);
    set({ activeRequests: count, loading: count > 0 });
  },
}));
