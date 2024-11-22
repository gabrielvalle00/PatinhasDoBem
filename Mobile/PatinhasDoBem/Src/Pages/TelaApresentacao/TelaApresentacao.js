import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TelaDeApresentacao = () => {
  const navigation = useNavigation();
  const [titulo, setTitulo] = useState(''); // Estado para armazenar o texto
  const [escrevendo, setEscrevendo] = useState(true); // Estado para controlar se está escrevendo ou apagando
  const textoCompleto = 'PATINHAS DO BEM'; // O título completo que será "escrito"
  const [indice, setIndice] = useState(0); // Estado para armazenar o índice atual da escrita

  useEffect(() => {
    const escreverTitulo = () => {
      if (escrevendo) {
        // Se estiver escrevendo e ainda há caracteres para escrever
        if (indice < textoCompleto.length) {
          setTitulo((prev) => prev + textoCompleto[indice]);
          setIndice(indice + 1);
        } else {
          setEscrevendo(false); // Quando terminar de escrever, começa a apagar
        }
      } else {
        // Se estiver apagando e há caracteres para apagar
        if (indice > 0) {
          setTitulo((prev) => prev.slice(0, -1));
          setIndice(indice - 1);
        } else {
          setEscrevendo(true); // Quando terminar de apagar, começa a escrever novamente
        }
      }
    };

    const interval = setInterval(escreverTitulo, 150); // Chama a função a cada 150ms

    return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
  }, [indice, escrevendo]);

  return (
    <ImageBackground
      source={{ uri: 'https://img.freepik.com/fotos-gratis/colagem-de-animal-de-estimacao-bonito-isolada_23-2150007407.jpg?w=740&t=st=1726268282~exp=1726268882~hmac=a7b97e6ec229c718b75f0a9c6b6f2c0b6f948559714034c5cf6312780321d2b6' }}
      style={styles.background}
    >
      <View style={styles.overlay} />
      <View style={styles.contentContainer}>
        {/* Título com efeito de escrita automática */}
        <Text style={styles.title}>{titulo}</Text>

        <Text style={styles.subtitle}>Transforme vidas com um simples gesto!</Text>
        

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Começar</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    color: '#fff',
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#11212D',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TelaDeApresentacao;
