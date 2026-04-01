import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ZigZagEdge = () => {
  return (
    <View className="flex-row w-full h-4 overflow-hidden -mt-1">
      {[...Array(20)].map((_, i) => (
        <View 
          key={i} 
          style={{
            width: 20,
            height: 20,
            backgroundColor: 'white',
            borderRadius: 10,
            marginTop: -10,
            marginRight: -2,
          }} 
        />
      ))}
    </View>
  );
};

export const TicketDivider = () => (
  <View className="border-b border-dashed border-slate-200 w-full my-4" />
);
