import { create } from 'zustand';

type PanelId = 'share' | 'chat' | 'nav-dropdown' | null;

interface PanelStore {
  activePanel: PanelId;
  openPanel: (id: PanelId) => void;
  closePanel: (id: PanelId) => void;
  closeAll: () => void;
}

export const usePanelStore = create<PanelStore>((set) => ({
  activePanel: null,
  openPanel: (id) => set({ activePanel: id }),
  closePanel: (id) => set((state) => (state.activePanel === id ? { activePanel: null } : {})),
  closeAll: () => set({ activePanel: null }),
}));
