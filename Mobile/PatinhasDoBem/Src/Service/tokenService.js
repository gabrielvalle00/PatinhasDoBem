import { create } from 'apisauce';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cria uma instância do Apisauce
const api = create({
  baseURL: 'http://10.0.3.253:3000',
});


export default api;
