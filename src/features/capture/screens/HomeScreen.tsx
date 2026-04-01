import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, ActivityIndicator, ScrollView, TextInput, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import NetInfo from '@react-native-community/netinfo';
import { CameraView } from '../components/CameraView';
import { AmbientGlow } from '../components/AmbientGlow';
import { AIRobotAnimation } from '../components/AIRobotAnimation';
import { useCaptureStore } from '../store/useCaptureStore';
import { useProcessExpense } from '../../processing/hooks/useProcessExpense';
import { useHistoryStore } from '../../submission/store/useHistoryStore';
import { useSyncStore } from '../../processing/store/useSyncStore';
import { useSyncManager } from '../../processing/hooks/useSyncManager';

export const HomeScreen = ({ navigation }: any) => {
  const [showCamera, setShowCamera] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const { currentCapture, setCapture, clearCapture } = useCaptureStore();
  const { mutate, isPending } = useProcessExpense();
  const expenses = useHistoryStore((state) => state.expenses);
  const { addToQueue, queue } = useSyncStore();
  const { isSyncing } = useSyncManager();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => setIsOnline(!!state.isConnected));
    return () => unsubscribe();
  }, []);

  const totalMonth = useMemo(() => expenses.reduce((acc, curr) => acc + (curr.baseAmount || curr.totalAmount), 0), [expenses]);

  const filteredExpenses = useMemo(() => {
    if (!searchQuery) return expenses;
    const q = searchQuery.toLowerCase();
    return expenses.filter(e => e.merchantName.toLowerCase().includes(q) || e.category.toLowerCase().includes(q));
  }, [expenses, searchQuery]);

  const triggerHaptic = (type: any = "impactLight") => ReactNativeHapticFeedback.trigger(type, { enableVibrateFallback: true });

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.pdf, DocumentPicker.types.images] });
      triggerHaptic();
      setCapture({ uri: res.uri, type: res.type?.includes('pdf') ? 'pdf' : 'image', name: res.name || 'documento' });
    } catch (err) {}
  };

  const handlePhotoCaptured = (photo: any) => {
    triggerHaptic("notificationSuccess");
    setCapture({ uri: `file://${photo.path}`, type: 'image', name: `capture_${Date.now()}.jpg` });
    setShowCamera(false);
  };

  const handleManualEntry = () => {
    triggerHaptic();
    const today = new Date().toISOString().split('T')[0];
    navigation.navigate('Validation', { 
      initialData: { merchantName: '', transactionDate: today, totalAmount: 0, taxAmount: 0, currency: 'USD', category: 'Otros', baseAmount: null } 
    });
  };

  const handleProcess = () => {
    if (!currentCapture) return;
    if (!isOnline) {
      triggerHaptic("impactMedium");
      addToQueue(currentCapture);
      Alert.alert('🛫 Modo Offline', 'No hay conexión. El gasto se procesará automáticamente al recuperar señal.');
      clearCapture();
      return;
    }
    
    mutate(currentCapture, {
      onSuccess: (data) => {
        triggerHaptic("notificationSuccess");
        navigation.navigate('Validation', { initialData: data });
        clearCapture();
      },
      onError: () => {
        triggerHaptic("notificationError");
        Alert.alert('❌ Error IA', 'Azure no pudo procesar este documento. Inténtelo de nuevo o use entrada manual.');
      }
    });
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Transporte': return '#3B82F6';
      case 'Comidas': return '#F59E0B';
      case 'Alojamiento': return '#8B5CF6';
      case 'Tecnología': return '#10B981';
      default: return '#64748B';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'Transporte': return '🚕';
      case 'Comidas': return '☕';
      case 'Alojamiento': return '🏨';
      case 'Tecnología': return '💻';
      default: return '📄';
    }
  };

  if (showCamera) {
    return <CameraView onPhotoCaptured={handlePhotoCaptured} onClose={() => setShowCamera(false)} />;
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <StatusBar barStyle="dark-content" />
      <SafeAreaView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* Header */}
          <View className="px-8 pt-6 pb-4 flex-row justify-between items-center">
            <View>
                <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-[3px]">Elite Account</Text>
                <Text className="text-2xl font-black text-slate-900 tracking-tight">Jeanpaul D.</Text>
            </View>
            <View className="flex-row items-center gap-x-2">
                {!isOnline && (
                    <View className="bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                        <Text className="text-amber-600 font-bold text-[8px]">OFFLINE</Text>
                    </View>
                )}
                <TouchableOpacity className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm border border-slate-100">
                    <Text className="text-xl">🤵</Text>
                </TouchableOpacity>
            </View>
          </View>

          {/* Balance Card */}
          <View className="px-6 mb-8">
            <View className="bg-slate-900 rounded-[40px] p-8 shadow-2xl shadow-slate-900/30 overflow-hidden">
                <View className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full" />
                <Text className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2">Total Gastado</Text>
                <View className="flex-row items-baseline">
                    <Text className="text-white text-5xl font-black">{totalMonth.toFixed(2)}</Text>
                    <Text className="text-blue-400 text-xl font-bold ml-2">USD</Text>
                </View>
            </View>
          </View>

          {/* Feedback & Actions Layer */}
          <View className="px-6 mb-10">
            {isPending ? (
                /* IA Processing Card with Native Animation */
                <View className="bg-white p-10 rounded-[40px] items-center justify-center shadow-xl border border-blue-50 relative overflow-hidden min-h-[300px]">
                    <AmbientGlow />
                    <AIRobotAnimation />
                    <View className="items-center mt-4">
                        <ActivityIndicator color="#2563EB" size="small" style={{ marginBottom: 10 }} />
                        <Text className="text-blue-600 font-black text-xs uppercase tracking-[4px] text-center">IA Analizando</Text>
                        <Text className="text-slate-400 text-[10px] font-medium mt-2 text-center">Extrayendo datos con precisión...</Text>
                    </View>
                </View>
            ) : currentCapture ? (
                /* Confirmation Card */
                <View className="bg-white p-6 rounded-[40px] shadow-xl border border-slate-100">
                    <View className="w-full h-40 rounded-[24px] overflow-hidden mb-6 bg-slate-50 items-center justify-center">
                        {currentCapture.type === 'image' ? (
                            <Image source={{ uri: currentCapture.uri }} className="w-full h-full opacity-80" resizeMode="cover" />
                        ) : (
                            <View className="items-center">
                                <Text className="text-4xl mb-2">📄</Text>
                                <Text className="text-slate-400 font-bold text-xs uppercase">{currentCapture.name}</Text>
                            </View>
                        )}
                    </View>
                    <View className="flex-row gap-x-4">
                        <TouchableOpacity onPress={() => clearCapture()} className="flex-1 bg-slate-100 py-4 rounded-[20px] items-center">
                            <Text className="text-slate-500 font-bold text-xs uppercase">Descartar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleProcess} className="flex-[2] bg-blue-600 py-4 rounded-[20px] items-center shadow-lg shadow-blue-500/30">
                            <Text className="text-white font-black text-xs uppercase tracking-wider">Procesar Ahora</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                /* Action Buttons */
                <View className="flex-row gap-x-4">
                    <TouchableOpacity 
                        onPress={() => setShowCamera(true)}
                        className="flex-1 bg-white p-8 rounded-[32px] items-center justify-center shadow-sm border border-slate-100"
                    >
                        <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mb-3">
                            <Text className="text-xl">📸</Text>
                        </View>
                        <Text className="text-slate-900 font-black text-[10px] uppercase tracking-widest">Capturar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={handleManualEntry}
                        className="flex-1 bg-white p-8 rounded-[32px] items-center justify-center shadow-sm border border-slate-100"
                    >
                        <View className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center mb-3">
                            <Text className="text-xl">➕</Text>
                        </View>
                        <Text className="text-slate-900 font-black text-[10px] uppercase tracking-widest">Manual</Text>
                    </TouchableOpacity>
                </View>
            )}
          </View>

          {/* Activity Section */}
          <View className="px-8 flex-row justify-between items-end mb-6">
            <Text className="text-slate-900 text-xl font-black">Actividad</Text>
            <TouchableOpacity onPress={handlePickDocument}>
                <Text className="text-blue-600 font-bold text-[10px] uppercase tracking-widest">Subir Archivo</Text>
            </TouchableOpacity>
          </View>

          <View className="px-6">
            <TextInput 
                placeholder="Buscar por comercio..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="bg-white rounded-2xl p-4 mb-6 text-slate-700 font-medium border border-slate-100 shadow-sm"
            />

            {filteredExpenses.length === 0 ? (
                <View className="bg-white p-16 rounded-[40px] items-center border border-slate-50 shadow-sm">
                    <Text className="text-slate-300 font-bold text-[10px] uppercase tracking-[4px]">Sin registros</Text>
                </View>
            ) : (
                filteredExpenses.map((expense) => (
                    <TouchableOpacity 
                        key={expense.id} 
                        onPress={() => navigation.navigate('ExpenseDetail', { expenseId: expense.id })}
                        className="bg-white p-5 rounded-[28px] mb-4 flex-row justify-between items-center shadow-sm border border-slate-50"
                    >
                        <View className="flex-row items-center flex-1 pr-4">
                            <View 
                                style={{ backgroundColor: `${getCategoryColor(expense.category)}15` }} 
                                className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                            >
                                {expense.logoUrl ? (
                                    <Image source={{ uri: expense.logoUrl }} className="w-8 h-8 rounded-lg" resizeMode="contain" />
                                ) : (
                                    <Text className="text-xl">{getCategoryIcon(expense.category)}</Text>
                                )}
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-900 font-bold text-base mb-0.5" numberOfLines={1}>{expense.merchantName || 'Gasto Manual'}</Text>
                                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{expense.transactionDate}</Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <Text className="text-slate-900 font-black text-lg">-{expense.totalAmount.toFixed(2)}</Text>
                            <Text className="text-slate-400 font-bold text-[9px] uppercase">{expense.currency}</Text>
                        </View>
                    </TouchableOpacity>
                ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
