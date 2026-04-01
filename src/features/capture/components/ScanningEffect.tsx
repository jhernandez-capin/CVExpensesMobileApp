import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  interpolate
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ScanningEffect = () => {
  const translateY = useSharedValue(-100);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(1, {
        duration: 2500,
        easing: Easing.bezier(0.42, 0, 0.58, 1),
      }),
      -1,
      false
    );
  }, []);

  const animatedLineStyle = useAnimatedStyle(() => {
    const top = interpolate(translateY.value, [0, 1], [-10, 150]); // Ajustado al contenedor de la imagen en Home
    return {
      top,
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} className="overflow-hidden rounded-2xl">
      <Animated.View 
        style={[
          {
            height: 4,
            width: '100%',
            backgroundColor: '#3B82F6',
            shadowColor: "#3B82F6",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            elevation: 10,
            zIndex: 50,
          },
          animatedLineStyle
        ]} 
      />
      <Animated.View
        style={[
          {
            height: 60,
            width: '100%',
            position: 'absolute',
          },
          animatedLineStyle
        ]}
      >
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.4)', 'rgba(59, 130, 246, 0.1)', 'transparent']}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};
