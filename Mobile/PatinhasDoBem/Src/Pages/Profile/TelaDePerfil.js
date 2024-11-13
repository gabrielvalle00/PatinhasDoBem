import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Toast from "react-native-toast-message";
import api from "../../Service/tokenService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const TelaDePerfil = ({ route, navigation }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numColumns, setNumColumns] = useState(3); // Estado para o número de colunas
  const userID = route.params?.userID;

  useEffect(() => {
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert("Erro", "Usuário não autenticado. Faça login novamente.");
          throw new Error("Usuário não autenticado.");
        }

        setLoading(true);
        return api.get(
          `/MyProfile`,
          {},
          {
            headers: { authorization: token },
          }
        );
      })
      .then((response) => {
        console.log("Dados do perfil:", response.data);
        setProfileData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao visualizar perfil:", error);
        Alert.alert("Erro", "Ocorreu um erro ao visualizar o usuário.");
        setLoading(false);
      });
  }, [userID]);

  const handleEditPet = (pet) => {
    navigation.navigate("EdicaoPet", { pet });
  };

  const handleAddPet = () => {
    navigation.navigate("Pet");
  };

  const handleEditProfile = () => {
    navigation.navigate("EdicaoUser");
  };

  const handleDeletePet = (pet) => {
    Alert.alert(
      "Confirmação de Adoção",
      "Esse pet foi adotado através da ONG?",
      [
        {
          text: "Sim",
          onPress: () => {
            AsyncStorage.getItem("token").then((token) => {
              api
                .delete(
                  `/RetiraPetAdocao`,
                  { PetID: pet.id },
                  {
                    headers: { authorization: token },
                  }
                )
                .then(() => {
                  Toast.show({
                    type: "success",
                    text1: "Pet marcado como adotado!",
                  });
                  setProfileData((prevData) => ({
                    ...prevData,
                    dadosMeusPets: prevData.dadosMeusPets.filter(
                      (p) => p.id !== pet.id
                    ),
                  }));
                })
                .catch((error) => {
                  console.error("Erro ao marcar pet como adotado:", error);
                  Toast.show({
                    type: "error",
                    text1: "Erro ao marcar o pet como adotado",
                  });
                });
            });
          },
        },
        {
          text: "Não",
          onPress: () => {
            Toast.show({
              type: "info",
              text1: "Pet não foi marcado como adotado.",
            });
          },
          style: "cancel",
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (




    <ScrollView style={styles.container}>
      {profileData ? (
        <>
          <View style={styles.header}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{
                  uri: `https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/perfil%2F${profileData.meusDados.ID}?alt=media`,
                }}
                style={styles.profileImage}
              />
              <TouchableOpacity
                style={styles.editProfileButton}
                onPress={handleEditProfile}
              >
                <Ionicons name="create-outline" size={20} color="#1a73e8" />
              </TouchableOpacity>
            </View>
            <View style={styles.statsContainer}>
              <Text style={styles.statNumber}>
                {profileData.minhasPostagens ? profileData.minhasPostagens.length : 0}
              </Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statsContainer}>
              <Text style={styles.statNumber}>
                {profileData.dadosMeusPets ? profileData.dadosMeusPets.length : 0}
              </Text>
              <Text style={styles.statLabel}>Meus Pets</Text>
            </View>
            <View style={styles.statsContainer}>
              <Text style={styles.statNumber}>
                {profileData.following ?? 0}
              </Text>
              <Text style={styles.statLabel}>Seguindo</Text>
            </View>
          </View>

          <View style={styles.bioContainer}>
            <Text style={styles.username}>
              {profileData.meusDados?.Nome ?? "Usuário"}
            </Text>
          </View>

          {/* Lista de Posts */}
          <FlatList
            data={profileData.minhasPostagens || []}
            keyExtractor={(item) => item.ID.toString()}
            numColumns={numColumns}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.postItem}
                onPress={() =>
                  navigation.navigate("DetalhesPost", { post: item })
                }
              >
                <Image
                  source={{
                    uri: `https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/postagem%2F${item.ID}?alt=media`,
                  }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
            key={numColumns}
          />

          {/* Lista de Pets */}
          <View style={styles.petsContainer}>
            <Text style={styles.petsTitle}>Meus Pets</Text>
            <FlatList
              data={profileData.dadosMeusPets || []}
              keyExtractor={(item, index) =>
                item.id ? item.id.toString() : index.toString()
              }
              
              renderItem={({ item }) => (
                <View style={styles.petItem}>
                  <View style={styles.petImageContainer}>
                    <Image
                      source={{ uri: item.petPicture }}
                      style={styles.petImage}
                    />
                    <TouchableOpacity
                      onPress={() => handleEditPet(item)}
                      style={styles.editIcon}
                    >
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color="#1a73e8"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeletePet(item)}
                      style={styles.deleteIcon}
                    >
                      <Ionicons name="trash-outline" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.petName}>{item.TipoAnimal}</Text>
                </View>
              )}
              horizontal={true}
            />
          </View>
        </>
      ) : (
        <Text style={styles.errorText}>
          Não foi possível carregar os dados do perfil.
        </Text>
      )}

      <TouchableOpacity style={styles.settingsIcon} onPress={handleAddPet}>
        <Ionicons name="paw" size={30} color="#1a73e8" />
      </TouchableOpacity>
    </ScrollView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
    justifyContent: "space-around",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editProfileButton: {
    position: "absolute",
    top: -5,
    right: -15,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 5,
  },
  statsContainer: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#888",
  },
  bioContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
  },
  petsContainer: {
    padding: 15,
  },
  petsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  postItem: {
    flex: 1,
    margin: 5,
    aspectRatio: 1, // Mantém a proporção quadrada
    backgroundColor: "#f0f0f0", // Cor de fundo opcional
    borderRadius: 10, // Arredondamento dos cantos
    overflow: "hidden", // Esconde partes que excedem o limite
    height: 100, // Definindo uma altura fixa
  },
  petName:{
    fontSize: 10,

  },
  postImage: {
    width: "100%", // Largura total do item
    height: "100%", // Altura total do item para garantir que ocupe todo o espaço
  },
  petItem: {
    flexDirection: "column", // Muda para coluna para empilhar a imagem e o nome
    alignItems: "center",     // Alinha ambos (imagem e nome) no centro
    marginVertical: 10,       // Adiciona espaço entre os pets
  },
  petImageContainer: {
    position: "relative",
    marginRight: 15,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  editIcon: {
    position: "absolute",
    top: -7,
    right: -10,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 5,
  },
  deleteIcon: {
    position: "absolute",
    top: -7,
    right: 38,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 5,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    textAlign: "center",
    margin: 20,
  },
  settingsIcon: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default TelaDePerfil;
