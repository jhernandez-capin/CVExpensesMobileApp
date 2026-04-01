import { create } from 'zustand';
import { persist, StateStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { ExtractedData } from '../../processing/hooks/useProcessExpense';

// Inicializar instancia de MMKV
const storage = new MMKV({ id: 'expense-history-storage' });

// Adaptador de Zustand para MMKV
const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    // MMKV requiere string, boolean, number o Uint8Array. 
    // Zustand persist ya debería enviar un string serializado, pero forzamos seguridad.
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    return storage.set(name, stringValue);
  },
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return storage.delete(name);
  },
};

export interface HistoryItem extends ExtractedData {
  id: string;
  savedAt: number;
}

interface HistoryState {
  expenses: HistoryItem[];
  addExpense: (expense: ExtractedData) => void;
  updateExpense: (id: string, updates: Partial<HistoryItem>) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      expenses: [],
      addExpense: (expense) => set((state) => {
        const newItem: HistoryItem = {
          ...expense,
          id: Math.random().toString(36).substring(2, 9),
          savedAt: Date.now()
        };
        // Mantener solo los últimos 10 gastos
        return { expenses: [newItem, ...state.expenses].slice(0, 10) };
      }),
      updateExpense: (id, updates) => set((state) => ({
        expenses: state.expenses.map((e) => e.id === id ? { ...e, ...updates } : e)
      })),
      clearHistory: () => set({ expenses: [] }),
    }),
    {
      name: 'expense-history',
      storage: zustandStorage,
    }
  )
);
