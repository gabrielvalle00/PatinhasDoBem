import { create } from 'apisauce';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cria uma instância do Apisauce
const api = create({
  baseURL: 'https://tcc-patinhas-do-bem.onrender.com',
});


export default api;
