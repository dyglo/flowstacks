'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface StackStore {
  selectedToolIds: string[];
  addTool: (id: string) => void;
  removeTool: (id: string) => void;
  toggleTool: (id: string) => void;
  clearStack: () => void;
  setStack: (ids: string[]) => void;
  isInStack: (id: string) => boolean;
}

const StackContext = createContext<StackStore | undefined>(undefined);

const STORAGE_KEY = 'flowstacks-my-stack';

export function StackProvider({ children }: { children: ReactNode }) {
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSelectedToolIds(parsed);
        }
      } catch (error) {
        console.error('Failed to parse stored stack:', error);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedToolIds));
    }
  }, [selectedToolIds, isHydrated]);

  const addTool = (id: string) => {
    setSelectedToolIds((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };

  const removeTool = (id: string) => {
    setSelectedToolIds((prev) => prev.filter((toolId) => toolId !== id));
  };

  const toggleTool = (id: string) => {
    setSelectedToolIds((prev) =>
      prev.includes(id) ? prev.filter((toolId) => toolId !== id) : [...prev, id]
    );
  };

  const clearStack = () => {
    setSelectedToolIds([]);
  };

  const setStack = (ids: string[]) => {
    setSelectedToolIds(ids);
  };

  const isInStack = (id: string) => {
    return selectedToolIds.includes(id);
  };

  return (
    <StackContext.Provider
      value={{
        selectedToolIds,
        addTool,
        removeTool,
        toggleTool,
        clearStack,
        setStack,
        isInStack,
      }}
    >
      {children}
    </StackContext.Provider>
  );
}

export function useStack() {
  const context = useContext(StackContext);
  if (context === undefined) {
    throw new Error('useStack must be used within a StackProvider');
  }
  return context;
}
