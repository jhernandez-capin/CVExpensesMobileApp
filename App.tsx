import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomeScreen } from './src/features/capture/screens/HomeScreen';
import { ValidationScreen } from './src/features/submission/screens/ValidationScreen';
import { ExpenseDetailScreen } from './src/features/submission/screens/ExpenseDetailScreen';
import { ExtractedData } from './src/features/processing/hooks/useProcessExpense';
import { BiometricLock } from './src/shared/components/BiometricLock';

// 1. Configurar React Query Client
const queryClient = new QueryClient();

// 2. Tipos de navegación
export type RootStackParamList = {
  Home: undefined;
  Validation: { initialData: ExtractedData };
  ExpenseDetail: { expenseId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <BiometricLock>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#F8FAFC' } // bg-slate-50
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen 
              name="Validation" 
              component={ValidationScreen} 
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen 
              name="ExpenseDetail" 
              component={ExpenseDetailScreen} 
              options={{ presentation: 'modal' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </BiometricLock>
    </QueryClientProvider>
  );
}

export default App;
