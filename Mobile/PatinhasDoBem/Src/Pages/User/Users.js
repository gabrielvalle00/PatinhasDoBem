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
  const [envioAmizadeFoiFeito, setEnvioAmizadeFoiFeito] = useState(false); // Estado para amizade
  const [numColumns, setNumColumns] = useState(3); // Estado para o número de colunas
  const userID = route.params?.userID;

  // Função para alternar o estado de solicitação de amizade
  const handleAmizade = () => {
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert("Erro", "Usuário não autenticado. Faça login novamente.");
          return;
        }

        // API para enviar ou cancelar amizade
        const endpoint = envioAmizadeFoiFeito
          ? `/cancelarAmizade/${userID}`
          : `/enviarAmizade/${userID}`;

        return api.post(endpoint, {}, { headers: { authorization: token } });
      })
      .then(() => {
        setEnvioAmizadeFoiFeito(!envioAmizadeFoiFeito); // Alterna o estado
      })
      .catch((error) => {
        console.error("Erro ao alterar estado de amizade:", error);
        Alert.alert("Erro", "Ocorreu um erro ao processar sua solicitação.");
      });
  };

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
          setEnvioAmizadeFoiFeito(response.data.envioAmizadeFoiFeito); // Define o estado inicial
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

  const dadosUsuario = profileData?.dadosUsuario;
  const dadosPets = profileData?.dadosPetsUsuario;
  const postagens = profileData?.postagensDoUsuario;

  return (
    <ScrollView style={styles.container}>
      {profileData || postagens ? (
        <>
          <View style={styles.header}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{
                  uri: `https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/perfil%2F${userID}?alt=media`,
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
                {profileData?.following ?? 0}
              </Text>
              <Text style={styles.statLabel}>Seguindo</Text>
            </View>

             {/* Botão de Amizade */}
           <View style={styles.friendButtonContainer}>
            <TouchableOpacity
              style={[
                styles.friendButton,
                envioAmizadeFoiFeito ? styles.friendButtonSent : styles.friendButtonRequest,
              ]}
              onPress={handleAmizade}
            >
              <Text style={styles.friendButtonText}>
                {envioAmizadeFoiFeito ? "Seguindo" : "Seguir"}
              </Text>
            </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", padding: 15, alignItems: "center", justifyContent: "space-around", borderBottomWidth: 0.5, borderBottomColor: "#ddd" },
  profileImageContainer: { position: "relative" },
  profileImage: { width: 80, height: 80, borderRadius: 40 },
  statsContainer: { alignItems: "center" },
  statNumber: { fontSize: 18, fontWeight: "bold" },
  statLabel: { fontSize: 14, color: "#888" },
  bioContainer: { marginLeft:20 ,marginTop:-47, paddingHorizontal: 15, paddingVertical: 0, marginBottom:30  },
  username: { fontSize: 16, fontWeight: "bold" },
  friendButtonContainer: {marginLeft:-110, marginVertical: 5, marginTop:120 },
  friendButton: { padding: 10, borderRadius: 5, alignItems: "center" },
  friendButtonRequest: { backgroundColor: "#1a73e8" },
  friendButtonSent: { backgroundColor: "#aaa" },
  friendButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  petsContainer: { padding: 15 },
  petsTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  postItem: { flex: 1, margin: 5, aspectRatio: 1, backgroundColor: "#f0f0f0", borderRadius: 10, overflow: "hidden", height: 100 },
  postImage: { width: "100%", height: "100%" },
  petItem: { flexDirection: "column", alignItems: "center", marginVertical: 10 },
  petImageContainer: { position: "relative", marginRight: 15 },
  petImage: { width: 60, height: 60, borderRadius: 5 },
  petName: { fontSize: 12 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { textAlign: "center", margin: 20 },
});

export default UserProfileScreen;
