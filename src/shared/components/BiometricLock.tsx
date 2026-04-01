import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

export const BiometricLock = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authenticate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      if (available) {
        const { success } = await rnBiometrics.simplePrompt({
          promptMessage: 'Autenticación requerida',
          cancelButtonText: 'Cancelar',
        });

        if (success) {
          setIsAuthenticated(true);
        } else {
          setError('Autenticación fallida o cancelada.');
        }
      } else {
        // Si no hay biometría, permitimos el paso por ahora o podríamos pedir PIN
        console.warn('Biometría no disponible en este dispositivo');
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Error en biometría:', err);
      setError('Error al intentar autenticar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    authenticate();
  }, []);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center px-8">
      <View className="w-24 h-24 bg-blue-600 rounded-3xl items-center justify-center mb-10 shadow-2xl shadow-blue-500/50">
        <Text className="text-white text-5xl font-bold">€</Text>
      </View>
      
      <Text className="text-white text-3xl font-bold mb-2 text-center">Expenses Elite</Text>
      <Text className="text-slate-400 text-center mb-12 text-lg">Protección Biométrica Activa</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" />
      ) : (
        <View className="w-full">
          {error && <Text className="text-red-400 text-center mb-6 font-medium">{error}</Text>}
          <TouchableOpacity 
            onPress={authenticate}
            className="w-full bg-blue-600 py-4 rounded-2xl items-center shadow-lg"
          >
            <Text className="text-white font-bold text-lg">Reintentar Acceso</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text className="text-slate-500 text-xs absolute bottom-12 uppercase tracking-widest font-semibold">
        CEO Edition • 2026
      </Text>
    </SafeAreaView>
  );
};
