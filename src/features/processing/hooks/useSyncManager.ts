import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useSyncStore } from '../store/useSyncStore';
import { useProcessExpense } from './useProcessExpense';
import { useHistoryStore } from '../../submission/store/useHistoryStore';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export const useSyncManager = () => {
  const { queue, removeFromQueue } = useSyncStore();
  const { mutateAsync } = useProcessExpense();
  const addExpense = useHistoryStore((state) => state.addExpense);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && queue.length > 0) {
        console.log(`📡 Conexión recuperada. Sincronizando ${queue.length} gastos pendientes...`);
        syncQueue();
      }
    });

    return () => unsubscribe();
  }, [queue.length]);

  const syncQueue = async () => {
    // Procesamos uno por uno para evitar saturar Azure y el backend
    for (const item of queue) {
      try {
        const result = await mutateAsync(item.capture);
        addExpense(result);
        removeFromQueue(item.id);
        
        ReactNativeHapticFeedback.trigger("notificationSuccess", { enableVibrateFallback: true });
        console.log(`✅ Gasto sincronizado exitosamente: ${item.id}`);
      } catch (error) {
        console.error(`❌ Error sincronizando gasto ${item.id}:`, error);
        // Si falla, se queda en la cola para el próximo intento
      }
    }
  };

  return { isSyncing: queue.length > 0 };
};
