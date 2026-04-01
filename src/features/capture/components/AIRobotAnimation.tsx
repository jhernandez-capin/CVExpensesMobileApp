import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';

const PulseCircle = ({ delay = 0, size = 100, opacity: initialOpacity = 0.5 }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(initialOpacity);

  useEffect(() => {
    scale.value = withDelay(delay, withRepeat(
      withTiming(1.5, { duration: 2000, easing: Easing.out(Easing.quad) }),
      -1,
      false
    ));
    opacity.value = withDelay(delay, withRepeat(
      withTiming(0, { duration: 2000, easing: Easing.out(Easing.quad) }),
      -1,
      false
    ));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: '#3B82F6',
          position: 'absolute',
        },
        animatedStyle
      ]} 
    />
  );
};

export const AIRobotAnimation = () => {
  const coreScale = useSharedValue(1);

  useEffect(() => {
    coreScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coreScale.value }],
  }));

  return (
    <View className="items-center justify-center w-40 h-40">
      {/* Ondas de choque de IA */}
      <PulseCircle delay={0} size={100} />
      <PulseCircle delay={500} size={100} />
      <PulseCircle delay={1000} size={100} />
      
      {/* Núcleo de IA */}
      <Animated.View 
        style={[
          {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#1E293B',
            borderWidth: 4,
            borderColor: '#3B82F6',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: "#3B82F6",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 20,
            elevation: 10,
          },
          coreStyle
        ]}
      >
        <View className="w-2 h-2 bg-blue-400 rounded-full" />
      </Animated.View>
    </View>
  );
};
