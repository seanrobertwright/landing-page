import { create } from "zustand";

interface UIState {
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
}

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 500;
const DEFAULT_SIDEBAR_WIDTH = 280;

export const useUIStore = create<UIState>((set) => ({
  sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
  setSidebarWidth: (width: number) =>
    set({
      sidebarWidth: Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, width)),
    }),
}));

export { MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH, DEFAULT_SIDEBAR_WIDTH };
