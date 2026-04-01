import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Animated, { FadeInUp } from 'react-native-reanimated';
import DatePicker from 'react-native-date-picker';
import { apiClient } from '../../../core/api/apiClient';
import { ExtractedData } from '../../processing/hooks/useProcessExpense';
import { useHistoryStore } from '../store/useHistoryStore';
import { ZigZagEdge, TicketDivider } from '../../../shared/components/TicketDecoration';

export const ValidationScreen = ({ route, navigation }: any) => {
  const { initialData }: { initialData: ExtractedData } = route.params;
  const [data, setData] = useState(initialData);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const addExpense = useHistoryStore((state) => state.addExpense);

  const parseDate = (dateStr: string | undefined) => {
    if (!dateStr) return new Date();
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: ExtractedData) => {
      const response = await apiClient.post('/expenses/confirm', payload);
      return response.data;
    },
    onSuccess: (response) => {
      ReactNativeHapticFeedback.trigger("notificationSuccess", { enableVibrateFallback: true });
      addExpense(response.data || data); 
      navigation.navigate('Home');
    },
    onError: () => {
      ReactNativeHapticFeedback.trigger("notificationError", { enableVibrateFallback: true });
      Alert.alert('❌ Error', 'No se pudo guardar el gasto.');
    }
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        {/* Header Ejecutivo */}
        <View className="px-8 py-6 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest">Cancelar</Text>
          </TouchableOpacity>
          <Text className="text-white font-black text-lg">Ticket IA</Text>
          <View className="w-16" />
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInUp.delay(200).duration(800)} className="bg-white rounded-t-3xl pt-10 px-8 pb-4">
            
            {/* Logo y Comercio */}
            <View className="items-center mb-6">
                <View className="w-16 h-16 bg-slate-50 rounded-full items-center justify-center border border-slate-100 mb-4 overflow-hidden">
                    {data.logoUrl ? (
                        <Image source={{ uri: data.logoUrl }} className="w-full h-full" resizeMode="contain" />
                    ) : (
                        <Text className="text-2xl">💰</Text>
                    )}
                </View>
                <TextInput 
                    value={data.merchantName}
                    onChangeText={(t) => setData({...data, merchantName: t})}
                    className="text-2xl font-black text-slate-900 text-center"
                    placeholder="Nombre del Comercio"
                />
                <TouchableOpacity onPress={() => setOpenDatePicker(true)} className="mt-1">
                    <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        {parseDate(data.transactionDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </Text>
                </TouchableOpacity>
            </View>

            <TicketDivider />

            {/* Desglose Estilo Recibo */}
            <View className="py-4">
                {data.items && data.items.length > 0 ? (
                    data.items.map((item, i) => (
                        <View key={i} className="flex-row justify-between mb-3 items-start">
                            <View className="flex-1 pr-4">
                                <Text className="text-slate-600 font-mono text-xs uppercase">{item.description}</Text>
                                {item.quantity && <Text className="text-slate-400 font-mono text-[10px]">x{item.quantity}</Text>}
                            </View>
                            <Text className="text-slate-900 font-mono text-xs font-bold">
                                {item.totalPrice ? item.totalPrice.toFixed(2) : '--.--'}
                            </Text>
                        </View>
                    ))
                ) : (
                    <View className="flex-row justify-between mb-3">
                        <Text className="text-slate-400 font-mono text-xs uppercase tracking-tighter">Detalle no disponible</Text>
                        <Text className="text-slate-900 font-mono text-xs font-bold">{data.totalAmount.toFixed(2)}</Text>
                    </View>
                )}
            </View>

            <TicketDivider />

            {/* Totales */}
            <View className="py-2 gap-y-2">
                <View className="flex-row justify-between">
                    <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Subtotal</Text>
                    <Text className="text-slate-600 font-mono text-xs">{(data.totalAmount - data.taxAmount).toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Impuestos</Text>
                    <TextInput 
                        value={data.taxAmount.toString()}
                        onChangeText={(t) => setData({...data, taxAmount: parseFloat(t) || 0})}
                        keyboardType="numeric"
                        className="text-slate-600 font-mono text-xs text-right p-0"
                    />
                </View>
                <View className="flex-row justify-between mt-4">
                    <Text className="text-slate-900 font-black text-lg uppercase tracking-widest">Total</Text>
                    <View className="flex-row items-baseline">
                        <TextInput 
                            value={data.totalAmount.toString()}
                            onChangeText={(t) => setData({...data, totalAmount: parseFloat(t) || 0})}
                            keyboardType="numeric"
                            className="text-3xl font-black text-slate-900"
                        />
                        <Text className="text-slate-400 font-bold ml-1">{data.currency}</Text>
                    </View>
                </View>
            </View>

            {/* Categoría Tag */}
            <View className="mt-8 items-center">
                <TextInput 
                    value={data.category}
                    onChangeText={(t) => setData({...data, category: t})}
                    className="bg-slate-50 px-4 py-2 rounded-full text-slate-500 font-bold text-[10px] uppercase tracking-widest border border-slate-100"
                />
            </View>

            <View className="h-10" />
          </Animated.View>
          
          {/* El Borde Dentado */}
          <ZigZagEdge />

          <View className="py-8 items-center">
            <Text className="text-slate-500 font-mono text-[10px] uppercase tracking-[4px]">*** Fin del Recibo ***</Text>
          </View>

          <View className="h-20" />
        </ScrollView>

        <DatePicker
            modal
            mode="date"
            open={openDatePicker}
            date={parseDate(data.transactionDate)}
            onConfirm={(d) => { setOpenDatePicker(false); setData({...data, transactionDate: d.toISOString().split('T')[0]}); }}
            onCancel={() => setOpenDatePicker(false)}
            confirmText="Aceptar"
            cancelText="Cancelar"
            title="Fecha"
        />

        {/* Action Button */}
        <View className="p-8 bg-slate-900">
            <TouchableOpacity 
                onPress={() => mutate(data)}
                disabled={isPending}
                className="bg-blue-600 py-5 rounded-2xl items-center shadow-2xl shadow-blue-500/40"
            >
                {isPending ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-black text-base uppercase tracking-widest">Guardar Registro</Text>
                )}
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
