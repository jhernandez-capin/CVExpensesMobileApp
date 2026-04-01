import { create } from 'zustand';
import { persist, StateStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { CaptureData } from '../../capture/store/useCaptureStore';

const storage = new MMKV({ id: 'sync-queue-storage' });

const zustandStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.delete(name),
};

export interface PendingSync {
  id: string;
  capture: CaptureData;
  addedAt: number;
}

interface SyncState {
  queue: PendingSync[];
  addToQueue: (capture: CaptureData) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      queue: [],
      addToQueue: (capture) => set((state) => ({
        queue: [...state.queue, { id: Math.random().toString(36).substring(7), capture, addedAt: Date.now() }]
      })),
      removeFromQueue: (id) => set((state) => ({
        queue: state.queue.filter((item) => item.id !== id)
      })),
      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: 'sync-queue',
      storage: zustandStorage,
    }
  )
);
