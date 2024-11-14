import { create } from 'apisauce';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cria uma instância do Apisauce
const api = create({
  baseURL: 'http://10.0.3.252:5000',
});

// Adiciona transformação de requisição
// api.addRequestTransform(async (request) => {
//   const token = await AsyncStorage.getItem('@CodeApi:token');
//   console.log('Token recuperado:', token); 
//   if (token) {
//     request.headers['Authorization'] = `Bearer ${token}`;
//   }
// });

// Adiciona transformação de resposta
// api.addResponseTransform(response => {
//   if (!response.ok) throw response;
// });

export default api;
