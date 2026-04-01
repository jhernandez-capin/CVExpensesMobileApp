import axios from 'axios';

/**
 * IMPORTANTE PARA DISPOSITIVO FÍSICO:
 * Sustituye '192.168.1.XX' por la IP IPv4 de tu computadora (la obtienes con 'ipconfig')
 * Asegúrate de que el teléfono y la PC estén en la misma red Wi-Fi.
 */
const PC_IP = '192.168.1.16'; // Tu IP local para desarrollo

const BASE_URL = __DEV__
  ? `http://${PC_IP}:3000`
  : 'https://expenses-backend-dvgzhqcqaxa6f9fq.eastus2-01.azurewebsites.net';

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 60000, // Aumentado a 60 segundos para procesos de IA
});
