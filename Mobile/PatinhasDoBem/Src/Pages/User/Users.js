import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../Service/tokenService";
import Ionicons from "react-native-vector-icons/Ionicons";

const UserProfileScreen = ({ route, navigation }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numColumns, setNumColumns] = useState(3); // Estado para o número de colunas
  const userID = route.params?.userID;

  useEffect(() => {
    const fetchProfileData = () => {
      AsyncStorage.getItem("token")
        .then((token) => {
          if (!token) {
            Alert.alert("Erro", "Usuário não autenticado. Faça login novamente.");
            return;
          }

          setLoading(true);
          return api.get(`/ProfileUser/${userID}`, {}, {
            headers: { authorization: token },
          });
        })
        .then((response) => {
          console.log(response);
          setProfileData(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Erro ao visualizar perfil:", error);
          Alert.alert("Erro", "Ocorreu um erro ao visualizar o usuário.");
          setLoading(false);
        });
    };

    fetchProfileData();
  }, [userID]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  const dadosUsuario = profileData.dadosUsuario;
  const dadosPets = profileData.dadosPetsUsuario;
  const postagens = profileData.postagensDoUsuario;
  console.log(postagens);
  

  return (
    <ScrollView style={styles.container}>
      {profileData || postagens? (
        <>
          <View style={styles.header}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{
                  uri: `https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/perfil%2F${postagens.IDUsuario}?alt=media`,
                }}
                style={styles.profileImage}
              />
            </View>
            <View style={styles.statsContainer}>
              <Text style={styles.statNumber}>
                {postagens ? postagens.length : 0}
              </Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statsContainer}>
              <Text style={styles.statNumber}>
                {dadosPets ? dadosPets.length : 0}
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
              {dadosUsuario?.Nome ?? "Usuário"}
            </Text>
          </View>

          {/* Lista de Posts */}
          <FlatList
            data={postagens || []}
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
              data={dadosPets || []}
              keyExtractor={(item, index) =>
                item.ID ? item.ID.toString() : index.toString()
              }
              renderItem={({ item }) => (
                <View style={styles.petItem}>
                  <View style={styles.petImageContainer}>
                    <Image
                      source={{ uri: item.petPicture }}
                      style={styles.petImage}
                    />
                    
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
  petName: {
    fontSize: 12,
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
});

export default UserProfileScreen;
