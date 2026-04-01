import { Platform } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/apiClient';
import { CaptureData } from '../../capture/store/useCaptureStore';

export interface ExtractedData {
  merchantName: string;
  transactionDate: string;
  totalAmount: number;
  taxAmount: number;
  currency: string;
  category: string;
  baseAmount?: number | null;
  logoUrl?: string | null;
  notes?: string;
  items?: {
    description: string;
    quantity?: number;
    totalPrice?: number;
  }[];
}

const processDocument = async (capture: CaptureData): Promise<ExtractedData> => {
  const formData = new FormData();
  
  // Limpieza de URI: En Android debe empezar por file://, en iOS depende del contexto
  const cleanUri = Platform.OS === 'android' ? capture.uri : capture.uri.replace('file://', '');
  
  formData.append('document', {
    uri: cleanUri,
    type: capture.type === 'pdf' ? 'application/pdf' : 'image/jpeg',
    name: capture.name || 'upload.jpg',
  } as any);

  try {
    const { data } = await apiClient.post('/expenses/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!data || !data.success) {
      throw new Error('El servidor no devolvió éxito');
    }

    return data.data;
  } catch (error: any) {
    console.error('❌ DETALLE ERROR RED:', error.message);
    if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
    }
    throw error;
  }
};

export const useProcessExpense = () => {
  return useMutation({
    mutationFn: processDocument,
    onSuccess: (data) => {
      console.log('Extracción exitosa:', data);
    },
    onError: (error) => {
      console.error('Error procesando el documento:', error);
    },
  });
};
