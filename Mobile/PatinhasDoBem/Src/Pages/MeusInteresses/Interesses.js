import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/FontAwesome";
import api from "../../Service/tokenService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const TelaMeusInteresses = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [Petts, setPetts] = useState([]);
  const [removingPetID, setRemovingPetID] = useState(null); // Adicionando o estado para rastrear o pet removido
  const [yourUserID, setYourUserID] = useState(null); // Armazena o ID do doador (usuário)

  const fetchPets = () => {
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert("Erro", "Usuário não autenticado. Faça login novamente.");
          throw new Error("Usuário não autenticado.");
        }

        setIsLoading(true);
        return api.get(
          "/MeusInteresses",
          {},
          {
            headers: { authorization: token },
          }
        );
      })
      .then((response) => {
        console.log('caraaaaaaaaaa',response.data);
        const petsData = response.data.myInterests;
        const petIDs = petsData.map((pet) => pet.ID);
        const DoadorIDs = petsData.map((user) => user.IDDoador);
        console.log(DoadorIDs);
        console.log(petsData);
        console.log(petIDs); // Mostra todos os IDs

        // Supondo que o primeiro ID do Doador é o seu (ou escolha a lógica que se aplica)
        setYourUserID(DoadorIDs); // Aqui você define como obter o seu ID
        setPetts(petsData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao visualizar pet:", error);
        Alert.alert("Erro", "Ocorreu um erro ao visualizar o pet.");
        setIsLoading(false);
      });
  };

  const handleRemoveInterest = (petID) => {
    console.log("ssssssssssssssss", petID);
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert("Erro", "Usuário não autenticado. Faça login novamente.");
          throw new Error("Usuário não autenticado");
        }

        setRemovingPetID(petID); // Define o pet que está sendo removido
        return api.delete(
          `/RemoverInteressePet`,
          { PetID: petID
           },
          {
            headers: { authorization: token },
          }
        );
      })
      .then((response) => {
        console.log(response);
        Toast.show({
          text1: "Sucesso",
          text2: "Você não tem mais interesse neste pet!",
          position: "top",
          type: "success",
          visibilityTime: 3000,
        });
        fetchPets(); // Atualiza a lista após remover o interesse
      })
      .catch((error) => {
        console.error("Erro ao remover interesse no pet:", error);
        Toast.show({
          text1: "Erro",
          text2: "Erro ao remover interesse no pet!",
          position: "top",
          type: "error",
          visibilityTime: 3000,
        });
      })
      .finally(() => setRemovingPetID(null)); // Reseta o estado de remoção
  };

  useEffect(() => {
    fetchPets();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navigateButton}
        onPress={() => navigation.navigate("Pets")}
      >
        <Icon name="arrow-left" size={25} color="#3DAAD9" />
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3DAAD9" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.cardsContainer}>
          {Petts.length > 0 ? (
            Petts.filter((pet) => pet.IDDoador !== yourUserID) // Filtrando os pets que não pertencem a você
              .map(
                (pet, index) => (
                  console.log("aaaaaaaaaaa", pet),
                  (
                    <View key={index} style={styles.card}>
                      <TouchableOpacity
                        style={styles.doadorImageContainer}
                        onPress={() =>
                          navigation.navigate("User", {
                            userID: pet.IDDoador,
                          })
                        } // Navega para a tela de perfil com o ID do doador
                      >
                        <Image
                          source={{
                            uri: `https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/perfil%2F${pet.IDDoador}?alt=media`,
                          }}
                          style={styles.doadorImage}
                        />
                      </TouchableOpacity>

                      <Image
                        source={{
                          uri: `https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/pets%2F${pet.ID}?alt=media`,
                        }}
                        style={styles.petImage}
                      />
                      <View style={styles.overlay}>
                        <Text style={styles.petName}>{pet.TipoAnimal}</Text>
                        
                        <Text style={styles.petDescription}>
                          Idade:{pet.Idade}
                        </Text>
                        <Text style={styles.petDescription}>
                          Genêro:{pet.Sexo}
                        </Text>
                        <Text style={styles.petDescription}>
                          Linhagem:{pet.Linhagem}
                        </Text>
                        <Text style={styles.petDescription}>
                          Descrição:{pet.Descricao}
                        </Text>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => handleRemoveInterest(pet.ID)}
                          disabled={removingPetID === pet.ID} 
                        >
                          <Text style={styles.removeButtonText}>
                            {removingPetID === pet.ID
                              ? "Removendo..."
                              : "Remover Interesse"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )
                )
              )
          ) : (
            <Text style={styles.noPetsText}>
              Nenhum pet disponível no momento.
            </Text>
          )}
        </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 10,
  },
  navigateButton: {
    position: "absolute",
    top: 30,
    left: "5%",
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardsContainer: {
    flex: 1,
    marginTop: 60,
  },
  card: {
    width: width * 0.9,
    borderRadius: 15,
    marginVertical: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    overflow: "hidden",
  },
  petImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  overlay: {
    padding: 10,
  },
  petName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  petDescription: {
    fontSize: 16,
    color: "#555",
  },
  doadorImageContainer: {
    position: "absolute",
    top: 10,
    right: 10, // Coloca no canto superior direito
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#000",
    zIndex: 2,
    elevation: 10, // Para sombras em dispositivos Android
  },
  doadorImage: {
    width: "100%",
    height: "100%",
    borderRadius: 25, // Deixa a imagem redonda
  },
  removeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#ff4444",
    borderRadius: 5,
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  noPetsText: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
  },
});

export default TelaMeusInteresses;
