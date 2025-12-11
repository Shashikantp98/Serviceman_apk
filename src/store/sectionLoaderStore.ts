import { create } from "zustand";

interface SectionLoaderState {
  loadingStates: { [key: string]: boolean };
  setLoading: (section: string, loading: boolean) => void;
  isLoading: (section: string) => boolean;
  resetAll: () => void;
}

export const useSectionLoaderStore = create<SectionLoaderState>((set, get) => ({
  loadingStates: {},

  setLoading: (section: string, loading: boolean) => {
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [section]: loading,
      },
    }));
    console.debug(`[SectionLoader] ${section}: ${loading}`);
  },

  isLoading: (section: string) => {
    return get().loadingStates[section] ?? false;
  },

  resetAll: () => {
    set({ loadingStates: {} });
    console.debug("[SectionLoader] All sections reset");
  },
}));
