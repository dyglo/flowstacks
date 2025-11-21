'use client';

import { create } from 'zustand';
import { toast } from 'sonner';

const MAX_COMPARE = 3;

interface CompareStore {
  compareIds: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
}

export const useCompare = create<CompareStore>((set, get) => ({
  compareIds: [],

  toggleCompare: (id: string) => {
    const { compareIds } = get();

    if (compareIds.includes(id)) {
      set({ compareIds: compareIds.filter((toolId) => toolId !== id) });
      return;
    }

    if (compareIds.length >= MAX_COMPARE) {
      toast.error(`You can only compare up to ${MAX_COMPARE} tools at once`);
      return;
    }

    set({ compareIds: [...compareIds, id] });
  },

  clearCompare: () => {
    set({ compareIds: [] });
  },

  isInCompare: (id: string) => {
    return get().compareIds.includes(id);
  },
}));
