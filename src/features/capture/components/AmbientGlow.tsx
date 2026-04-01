import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing
} from 'react-native-reanimated';

export const AmbientGlow = () => {
  const opacity = useSharedValue(0.4);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
    
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} className="items-center justify-center">
      <Animated.View 
        style={[
          {
            width: '90%',
            height: '90%',
            borderRadius: 40,
            backgroundColor: '#3B82F6',
            shadowColor: "#3B82F6",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 40,
            elevation: 20,
          },
          animatedStyle
        ]} 
      />
    </View>
  );
};
