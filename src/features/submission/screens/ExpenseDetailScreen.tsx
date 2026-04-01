import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import DatePicker from 'react-native-date-picker';
import { useHistoryStore, HistoryItem } from '../store/useHistoryStore';

export const ExpenseDetailScreen = ({ route, navigation }: any) => {
  const { expenseId }: { expenseId: string } = route.params;
  const { expenses, updateExpense } = useHistoryStore();
  
  const expense = expenses.find((e) => e.id === expenseId);

  const parseInitialDate = (dateStr: string | undefined) => {
    if (!dateStr) return new Date();
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const [merchantName, setMerchantName] = useState(expense?.merchantName || '');
  const [date, setDate] = useState(parseInitialDate(expense?.transactionDate));
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [category, setCategory] = useState(expense?.category || 'Otros');
  const [totalAmount, setTotalAmount] = useState(expense?.totalAmount?.toString() || '0');
  const [currency, setCurrency] = useState(expense?.currency || 'EUR');
  const [notes, setNotes] = useState(expense?.notes || '');

  if (!expense) return null;

  const handleSave = () => {
    updateExpense(expenseId, { 
      merchantName, 
      transactionDate: date.toISOString().split('T')[0], 
      category, 
      totalAmount: parseFloat(totalAmount) || 0,
      currency,
      notes 
    });
    ReactNativeHapticFeedback.trigger("notificationSuccess");
    navigation.goBack();
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Transporte': return '#E0F2FE';
      case 'Comidas': return '#FEF3C7';
      case 'Alojamiento': return '#F3E8FF';
      case 'Tecnología': return '#DCFCE7';
      default: return '#F1F5F9';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        {/* Header */}
        <View className="px-8 py-6 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-slate-400 font-bold text-sm uppercase tracking-widest">Cerrar</Text>
          </TouchableOpacity>
          <Text className="text-slate-900 font-black text-lg">Detalles</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text className="text-blue-600 font-black text-sm uppercase tracking-widest">Guardar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
          <View className="items-center mb-12">
            <View 
                style={{ backgroundColor: getCategoryColor(category) }}
                className="w-24 h-24 rounded-[32px] items-center justify-center mb-6 shadow-sm"
            >
                {expense.logoUrl ? (
                    <Image source={{ uri: expense.logoUrl }} className="w-12 h-12" resizeMode="contain" />
                ) : (
                    <Text className="text-4xl">📄</Text>
                )}
            </View>
            <TextInput 
                value={merchantName}
                onChangeText={setMerchantName}
                className="text-2xl font-black text-slate-900 text-center mb-1"
            />
            <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-[4px]">{category}</Text>
          </View>

          <View className="gap-y-10">
            {/* Amount Section */}
            <View className="items-center bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-[3px] mb-2">Monto Registrado</Text>
                <View className="flex-row items-baseline">
                    <TextInput 
                        value={totalAmount}
                        onChangeText={setTotalAmount}
                        keyboardType="numeric"
                        className="text-5xl font-black text-slate-900"
                    />
                    <Text className="text-2xl font-bold text-slate-400 ml-2">{currency}</Text>
                </View>
            </View>

            {/* Basic Info Row */}
            <View className="flex-row justify-between">
                <View className="flex-1 pr-4">
                    <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-[2px] mb-3 px-1">Fecha</Text>
                    <TouchableOpacity 
                        onPress={() => setOpenDatePicker(true)}
                        className="bg-white p-5 rounded-2xl border border-slate-100"
                    >
                        <Text className="text-slate-900 font-bold">
                            {date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Items Breakdown */}
            {expense.items && expense.items.length > 0 && (
                <View>
                    <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-[2px] mb-4 px-1">Conceptos</Text>
                    <View className="gap-y-4">
                        {expense.items.map((item, i) => (
                            <View key={i} className="flex-row justify-between items-center py-2 border-b border-slate-50">
                                <Text className="text-slate-600 font-medium flex-1 mr-4">{item.description}</Text>
                                <Text className="text-slate-900 font-black">{currency} {item.totalPrice?.toFixed(2)}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Notes */}
            <View>
                <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-[2px] mb-3 px-1">Anotaciones</Text>
                <TextInput 
                    multiline
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Añadir contexto adicional..."
                    className="bg-slate-50 p-6 rounded-[24px] text-slate-700 font-medium min-h-[120px]"
                    textAlignVertical="top"
                />
            </View>
          </View>

          <DatePicker
            modal
            mode="date"
            open={openDatePicker}
            date={date}
            onConfirm={(d) => { setOpenDatePicker(false); setDate(d); }}
            onCancel={() => setOpenDatePicker(false)}
            confirmText="Confirmar"
            cancelText="Cancelar"
            title="Ajustar Fecha"
          />

          <View className="h-20" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
