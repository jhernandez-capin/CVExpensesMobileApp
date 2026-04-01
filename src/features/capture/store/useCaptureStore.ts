import { create } from 'zustand';

export interface CaptureData {
  uri: string;
  type: 'image' | 'pdf';
  name: string;
}

interface CaptureState {
  currentCapture: CaptureData | null;
  setCapture: (data: CaptureData | null) => void;
  clearCapture: () => void;
}

export const useCaptureStore = create<CaptureState>((set) => ({
  currentCapture: null,
  setCapture: (data) => set({ currentCapture: data }),
  clearCapture: () => set({ currentCapture: null }),
}));
