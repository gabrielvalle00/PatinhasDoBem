import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
} from "react-native";
import api from "../../Service/tokenService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { Toast } from "react-native-toast-message";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Importar corretamente
import { storage } from "../../Firebase/FirebaseConfig"; // Certifique-se de que 'storage' esteja sendo exportado corretamente

const TelaPostagens = ({ route, navigation }) => {
  const [postagens, setPostagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gapQuantity, setGapQuantity] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [curtido, setCurtido] = useState(false);

  useEffect(() => {
    carregarPostagens();
  }, [gapQuantity]);

  const carregarPostagens = () => {
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert("Erro", "Usuário não autenticado.");
          return Promise.reject("Usuário não autenticado");
        }

        return api.post(
          "/VerPostagens",
          { gapQuantity },
          {
            headers: { authorization: token },
          }
        );
      })
      .then((response) => {
        console.log(response.data);

        setPostagens((prevPostagens) => {
          const newPosts = response.data.posts;
          const uniquePosts = [
            ...prevPostagens,
            ...newPosts.filter(
              (newPost) =>
                !prevPostagens.some((prevPost) => prevPost.ID === newPost.ID)
            ),
          ];
          return uniquePosts;
        });
      })
      .catch((error) => {
        console.error("Erro ao carregar postagens:", error);
        Alert.alert("Erro", "Não foi possível carregar as postagens.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSearch = () => {
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert("Erro", "Usuário não autenticado.");
          return;
        }

        return api.get(`/buscarUsuarios?nome=${searchText}`, {
          headers: { authorization: token },
        });
      })
      .then((response) => {
        setFilteredUsers(response.data.usuarios);
      })
      .catch((error) => {
        console.error("Erro ao buscar usuários:", error);
        Alert.alert("Erro", "Não foi possível buscar os usuários.");
      });
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userResultContainer}>
      {item.UserPicture && (
        <TouchableOpacity onPress={() => navigation.navigate('User', { userId: item.UserId })}>
          <Image source={{ uri: item.UserPicture }} style={styles.userImage} />
        </TouchableOpacity>
      )}
      <Text style={styles.userName}>{item.nome}</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.userInfoContainer}>
        {item.UserPicture && (
          <TouchableOpacity onPress={() => navigation.navigate('User', { userId: item.UserId })}>
            <Image source={{ uri: item.UserPicture }} style={styles.userImage} />
          </TouchableOpacity>
        )}
        <Text style={styles.userName}>{item.NomeUsuario}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.postDescription}>{item.Descricao}</Text>
        {item.PostPicture && (
          <Image
            source={{
              uri: `https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/postagem%2F${item.ID}?alt=media`,
            }}
            style={styles.postImage}
          />
        )}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={() =>
              reagirPostagem(item.ID, curtido ? "Descurtir" : "Curtir")
            }
          >
            <Icon
              name={curtido ? "favorite" : "favorite-border"}
              size={24}
              color={curtido ? "#11212D" : "gray"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => comentarPostagem(item.ID)}>
            <Text style={styles.actionText}>Comentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const criarPostagem = async () => {
    if (!descricao) {
      Toast.show({
        type: "error",
        text1: "A descrição não pode estar vazia.",
      });
      return;
    }

    const descricaoLimpa = descricao.replace(/[^a-zA-Z0-9\s]/g, "");

    let imageUrl = null;

    AsyncStorage.getItem("token")
      .then((token) => {
        return api.post(
          "/CriarPostagem",
          { Descricao: descricaoLimpa },
          {
            headers: { authorization: token },
          }
        );
      })
      .then(async (response) => {
        console.log(response);

        const postID = response.data.idPostagem;

        if (imageUri) {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const storageRef = ref(storage, `postagem/${postID}`);
          await uploadBytes(storageRef, blob);
        }

        Alert.alert("Postagem feita com sucesso!")

        // Limpa os campos e fecha o modal
        setDescricao("");
        setImageUri(null);
        setShowCreatePostModal(false); // Fecha o modal

        carregarPostagens();
      })
      .catch((error) => {
        console.error("Erro ao criar postagem:", error);
        Alert.alert("erro ao fazer postagem")
      });
  };



  const selecionarImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === "granted") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } else {
      Alert.alert("Permissão de acesso à galeria negada.");
    }
  };

  const reagirPostagem = (postID, tipo) => {
    AsyncStorage.getItem("token")
      .then((token) => {
        return api.post(
          "/ReagirPostagem",
          { postID, tipo },
          {
            headers: { authorization: token },
          }
        );
      })
      .then((e) => {
        console.log(e);
        setCurtido(tipo === "Curtir"); // Atualiza estado com base na reação enviada
        carregarPostagens(); // Atualiza as postagens após a reação
      })
      .catch((error) => {
        console.error("Erro ao reagir a postagem:", error);
        Alert.alert("Erro ao reagir a postagem")
      });
  };

  const comentarPostagem = (postID) => {
    const comentario = prompt("Digite seu comentário:");
    if (!comentario) return;

    AsyncStorage.getItem("token")
      .then((token) => {
        return api.post(
          "/comentarPost",
          { postID, comentario },
          {
            headers: { authorization: token },
          }
        );
      })
      .then(() => {
        Toast.show({
          type: "success",
          text1: "Comentário adicionado com sucesso!",
        });
        carregarPostagens();
      })
      .catch((error) => {
        console.error("Erro ao comentar a postagem:", error);
        Toast.show({
          type: "error",
          text1: "Erro ao comentar a postagem.",
        });
      });
  };

  const handleLoadMore = () => {
    setGapQuantity((prev) => prev + 1);
  };

  if (loading) {
    return <Text style={styles.loadingText}>Carregando...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={24} color="#6c757d" />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
        </View>

        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => setShowCreatePostModal(true)}
        >
          <Icon name="add-box" size={28} color="#6c757d" />
        </TouchableOpacity>
      </View>

      {filteredUsers.length > 0 && (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.ID.toString()}
          renderItem={renderUserItem}
          style={styles.searchResults}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FlatList
        data={postagens}
        keyExtractor={(item) => item.ID.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />

      <Modal
        visible={showCreatePostModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreatePostModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Criar nova postagem</Text>
            <TextInput
              style={styles.input}
              placeholder="Descrição"
              value={descricao}
              onChangeText={setDescricao}
            />
            <TouchableOpacity style={styles.button} onPress={selecionarImagem}>
              <Text style={styles.buttonText}>Selecionar Imagem</Text>
            </TouchableOpacity>
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.selectedImage} />
            )}
            <TouchableOpacity style={styles.button} onPress={criarPostagem}>
              <Text style={styles.buttonText}>Postar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCreatePostModal(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#11212D",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    paddingHorizontal: 10,
    flex: 1,
  },
  searchInput: { flex: 1, marginLeft: 10 },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  postContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  userImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  userName: { fontWeight: "bold" },
  card: { backgroundColor: "#fff", borderRadius: 8, padding: 10 },
  postDescription: { marginBottom: 10 },
  postImage: { width: "100%", height: 200, borderRadius: 8, marginBottom: 10 },
  actionsContainer: { flexDirection: "row", justifyContent: "space-between" },
  actionText: { color: "#007bff" },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    width: "80%",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: { color: "#fff" },
  selectedImage: { width: 100, height: 100, marginTop: 10, borderRadius: 8 },
  loadingText: { textAlign: "center", marginTop: 20 },
  userResultContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  searchResults: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingTop: 5,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo translúcido para escurecer a tela
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
  closeButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#333',
    fontSize: 16,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
});

export default TelaPostagens;
