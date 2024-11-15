import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import Swiper from "react-native-deck-swiper";
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome';
import api from "../../Service/tokenService";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const { width } = Dimensions.get("window");

const TelaDePets = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [Petts, setPetts] = useState([]);

  const fetchPets = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
        return;
      }
      setIsLoading(true);

      const response = await api.post('/PetsAdocao', { gapQuantity: 0 }, {
        headers: { authorization: token },
      }).then((e) => {
        console.log(e);
        const petsData = e.data.dataResponse;
        console.log(petsData);
        // const petIDs = petsData.map(pet => pet.petID);
        // console.log(petIDs);

        setPetts(petsData);
        setIsLoading(false);
        if (!petsData) {
          throw new Error("Erro ao obter ID do pet.");
        }
      }).catch(error => {
        console.log('Erro : ', error);
      });

    } catch (error) {
      console.error("Erro ao visualizar pet:", error);
      Alert.alert("Erro", "Ocorreu um erro ao visualizar o pet.");
    }
  };


  const handleSwipeRight = (petID) => {
    console.log(petID);
    AsyncStorage.getItem('token')
      .then(token => {
        if (!token) {
          Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
          throw new Error('Usuário não autenticado'); // Interrompe o fluxo
        }

        // Exemplo de endpoint ao swipar para a direita
        return api.post(`/DemonstrarInteressePet`, { PetID: petID }, {
          headers: { authorization: token },
        });
      })
      .then(response => {
        console.log('teste');
        console.log(response);

        Toast.show({
          text1: 'Sucesso',
          text2: 'Você demonstrou interesse neste pet!',
          position: 'top',
          type: 'success',
          visibilityTime: 3000, // Tempo em milissegundos para mostrar a notificação
        });
      })
      .catch(error => {
        console.error("Erro ao marcar interesse no pet:", error);
        Toast.show({
          text1: 'Erro',
          text2: 'Erro ao demostrar interresse no pet!',
          position: 'top',
          type: 'error',
          visibilityTime: 3000, // Tempo em milissegundos para mostrar a notificação
        });
      })

  };


  useEffect(() => {
    fetchPets();
  }, []);

  return (
    <View style={styles.container}>
    
    {/* Botão com ícone de patinha para navegar para outra tela */}
    <TouchableOpacity style={styles.navigateButton} onPress={() => navigation.navigate('interesses')}>
      <Icon name="paw" size={30} color="orange" />
    </TouchableOpacity>
    
    {isLoading ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    ) : (
      Petts && Petts.length > 0 ? (
        <Swiper
          cards={Petts}
          renderCard={(item) => (
            <View style={styles.card}>
              {item.petPicture ? (
                <Image source={{ uri: item.petPicture }} style={styles.petImage} />
              ) : (
                <Text style={styles.noImageText}>Sem Imagem</Text>
              )}
              <View style={styles.overlay}>
                <Text style={styles.petName}>{item.TipoAnimal}</Text>
                <Text style={styles.petDescription}>{item.Descricao}</Text>
              </View>
              <View style={styles.additionalInfo}>
                <Text style={styles.petDetail}>Idade: {item.Idade}</Text>
                <Text style={styles.petDetail}>Raça: {item.Linhagem}</Text>
                <Text style={styles.petDetail}>Cor: {item.Cor}</Text>
                <Text style={styles.petDetail}>Sexo: {item.Sexo}</Text>
              </View>
            </View>
          )}
          stackSize={3}
          cardIndex={0}
          backgroundColor="#f0f0f0"
          onSwipedAll={() => Alert.alert("Fim da lista!")}
          onSwipedRight={(cardIndex) => handleSwipeRight(Petts[cardIndex]?.petID)}
          overlayLabels={{
            left: {
              title: "Não tenho interesse",
              style: {
                label: {
                  backgroundColor: "red",
                  borderColor: "red",
                  color: "white",
                  borderWidth: 1,
                  fontSize: 24,
                },
                wrapper: {
                  flexDirection: "column",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  marginTop: 20,
                  marginLeft: -20,
                },
              },
            },
            right: {
              title: "Tenho interesse",
              style: {
                label: {
                  backgroundColor: "green",
                  borderColor: "green",
                  color: "white",
                  borderWidth: 1,
                  fontSize: 24,
                },
                wrapper: {
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  marginTop: 20,
                  marginLeft: 20,
                },
              },
            },
          }}
        />
      ) : (
        <Text style={styles.noPetsText}>Nenhum pet disponível no momento.</Text>
      )
    )}
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  navigateButton: {
    position: 'absolute', // Permite que o botão seja posicionado em relação ao seu pai
    top: 30, // Ajuste a posição vertical conforme necessário
    left: '95%', // Centraliza o botão horizontalmente
    transform: [{ translateX: -50 }], // Ajusta a posição para centralizar corretamente
    backgroundColor: '#000', // Cor de fundo do botão
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 50,
    zIndex: 1, // Coloca o botão acima dos cards
  },
  buttonText: {
    color: '#fff', // Cor do texto do botão
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  swiperContainer: {
    flex: 1,
    justifyContent: "flex-start",
    marginTop: 90,
    alignItems: "center",
  },
  card: {
    width: width * 0.9,
    height: 450,
    borderRadius: 15,
    marginTop: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  petImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  noImageText: {
    color: "#555",
    fontSize: 16,
    textAlign: "center",
    marginTop: 200,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    padding: 15,
  },
  petName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  petDescription: {
    marginTop: 5,
    fontSize: 16,
    color: "#ddd",
  },
  additionalInfo: {
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  petDetail: {
    fontSize: 16,
    color: "#333",
    marginVertical: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noPetsText: {
    fontSize: 18,
    color: "#555",
  },
});

export default TelaDePets;
