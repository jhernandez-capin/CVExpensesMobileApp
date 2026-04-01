import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Animated } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, PhotoFile } from 'react-native-vision-camera';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

interface CameraViewProps {
  onPhotoCaptured: (photo: PhotoFile) => void;
  onClose: () => void;
}

export const CameraView = ({ onPhotoCaptured, onClose }: CameraViewProps) => {
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isCapturing, setIsCapturing] = useState(false);
  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(true);
  const [autoCaptureProgress] = useState(new Animated.Value(0));
  const autoCaptureTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const takePhoto = useCallback(async () => {
    try {
      if (camera.current == null) return;
      setIsCapturing(true);
      
      const photo = await camera.current.takePhoto({
        flash: 'auto',
        enableShutterSound: true,
      });
      
      ReactNativeHapticFeedback.trigger("notificationSuccess", { enableVibrateFallback: true });
      onPhotoCaptured(photo);
    } catch (e) {
      console.error('Failed to take photo!', e);
      Alert.alert('Error', 'No se pudo capturar la imagen. Por favor, intente de nuevo.');
    } finally {
      setIsCapturing(false);
      autoCaptureProgress.setValue(0);
    }
  }, [onPhotoCaptured]);

  // Lógica de Auto-Capture por estabilidad (simulada por tiempo de enfoque)
  useEffect(() => {
    if (autoCaptureEnabled && !isCapturing) {
      // Iniciar animación de progreso
      Animated.timing(autoCaptureProgress, {
        toValue: 1,
        duration: 3000, // 3 segundos para auto-captura
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && autoCaptureEnabled) {
          takePhoto();
        }
      });
    } else {
      autoCaptureProgress.setValue(0);
    }

    return () => {
      autoCaptureProgress.stopAnimation();
    };
  }, [autoCaptureEnabled, isCapturing, takePhoto]);

  if (!hasPermission) return <View className="flex-1 bg-black items-center justify-center"><Text className="text-white">Sin permiso de cámara</Text></View>;
  if (device == null) return <View className="flex-1 bg-black items-center justify-center"><Text className="text-white">No se detectó cámara trasera</Text></View>;

  const progressWidth = autoCaptureProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={StyleSheet.absoluteFill} className="bg-black">
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        enableZoomGesture={true}
      />

      {/* Document Frame UI */}
      <View style={StyleSheet.absoluteFill} className="items-center justify-center">
        <View className="w-64 h-96 border-2 border-white/30 rounded-3xl items-center justify-center">
           <View className="w-8 h-8 border-t-2 border-l-2 border-white absolute top-0 left-0" />
           <View className="w-8 h-8 border-t-2 border-r-2 border-white absolute top-0 right-0" />
           <View className="w-8 h-8 border-b-2 border-l-2 border-white absolute bottom-0 left-0" />
           <View className="w-8 h-8 border-b-2 border-r-2 border-white absolute bottom-0 right-0" />
        </View>
      </View>

      {/* UI Overlay */}
      <View className="flex-1 justify-between p-8">
        <View className="flex-row justify-between items-center mt-8">
          <TouchableOpacity 
            onPress={() => {
                setAutoCaptureEnabled(!autoCaptureEnabled);
                ReactNativeHapticFeedback.trigger("impactLight");
            }}
            className={`px-4 py-2 rounded-full ${autoCaptureEnabled ? 'bg-blue-600' : 'bg-black/40'}`}
          >
            <Text className="text-white font-bold text-xs uppercase tracking-widest">
                {autoCaptureEnabled ? 'Auto-Capture: ON' : 'Auto-Capture: OFF'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={onClose}
            className="w-10 h-10 items-center justify-center bg-black/40 rounded-full"
          >
            <Text className="text-white text-xl">✕</Text>
          </TouchableOpacity>
        </View>

        <View className="items-center pb-12">
          {autoCaptureEnabled && !isCapturing && (
            <View className="w-full h-1 bg-white/20 rounded-full mb-6 overflow-hidden max-w-[200px]">
                <Animated.View style={{ width: progressWidth }} className="h-full bg-blue-500" />
            </View>
          )}

          {isCapturing ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <TouchableOpacity 
              onPress={takePhoto}
              disabled={isCapturing}
              className="w-20 h-20 bg-white rounded-full items-center justify-center border-4 border-slate-300"
            >
              <View className="w-14 h-14 bg-white rounded-full border border-slate-200 shadow-sm" />
            </TouchableOpacity>
          )}
          <Text className="text-white mt-4 font-semibold text-lg shadow-md">
            {autoCaptureEnabled ? 'Mantenga la cámara fija...' : 'Capture su recibo'}
          </Text>
        </View>
      </View>
    </View>
  );
};
