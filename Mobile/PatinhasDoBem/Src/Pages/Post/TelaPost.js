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
import { Ionicons } from "@expo/vector-icons";
import { format } from 'date-fns'; // Para formatar a data
import { ptBR } from 'date-fns/locale'; // Para idioma português
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
  const [comentario, setComentario] = useState("");

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

        const formattedPosts = response.data.posts.map((post) => ({
          ...post,
          dataFormatada: new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "America/Sao_Paulo",
          }).format(new Date(post.dataPublicacao)),

        }));


        setPostagens((prevPostagens) => {
          const uniquePosts = [
            ...prevPostagens,
            ...formattedPosts.filter(
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
        <Text style={styles.date}>{item.dataFormatada}</Text>
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
          <TouchableOpacity onPress={() => reagirPostagem(item)}>
            <Icon
              name={item.avaliei ? 'favorite' : 'favorite-border'}
              size={24}
              color={item.avaliei ? '#11212D' : 'gray'}
            />
          </TouchableOpacity>
          <Text style={styles.like}>{item.quantidadeDeLike}</Text>
        </View>

        {/* Renderizando os comentários */}
        <View>
          {item.comentariosDoPost && item.comentariosDoPost.length > 0 ? (
            item.comentariosDoPost.map((comentario, index) => (
              <View key={index} style={styles.commentContainer}>
                <Image
                  source={{
                    uri: `https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/perfil%2F${comentario.IDUsuario}?alt=media`,
                  }}
                  style={styles.comentImage}
                />
                <Text style={styles.datas}>
                  {format(new Date(comentario.Data), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </Text>
                <Text style={styles.commentUser}>{comentario.Nome}</Text>
                <View style={styles.comeCont}>
                  <Text style={styles.commentText}>{comentario.Texto}</Text>
                </View>

              </View>
            ))
          ) : (
            <Text style={styles.noComments}>Nenhum comentário ainda.</Text>
          )}

          <View style={styles.inputContainer1}>
            <TextInput
              style={styles.input1}
              placeholder="Comentar..."
              value={comentario}
              onChangeText={setComentario}
              placeholderTextColor="#11212D"
            />
            <TouchableOpacity onPress={comentarPostagem} style={styles.iconContainer1}>
              <Ionicons name="send" size={20} color="#11212D" />
            </TouchableOpacity>
          </View>
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

  const reagirPostagem = (postID) => {
    const tipo = "like"; // Tipo de reação fixo

    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          throw new Error("Token não encontrado");
        }
        // Enviar a requisição à API
        return api.post(
          "/ReagirPostagem",
          { IDPostagem: postID, tipo: "like" },
          {
            headers: { authorization: token },
          }
        );
      })
      .then((response) => {
        console.log("Reação registrada com sucesso:", response.data);

        const updatedPostagens = postagens.map((p) =>
          p.ID === postID
            ? {
              ...p,
              avaliei: !p.avaliei, // Alterna o estado de curtida
              quantidadeDeLike: p.avaliei
                ? p.quantidadeDeLike - 1
                : p.quantidadeDeLike + 1,
            }
            : p
        );

        setPostagens(updatedPostagens); // Atualiza a lista de postagens
      })
      .catch((error) => {
        console.error("Erro ao reagir à postagem:", error.message || error);
        Alert.alert("Erro", "Não foi possível reagir à postagem. Tente novamente.");
      });
  };


  const comentarPostagem = () => {
    if (!comentario.trim()) {
      Toast.show({
        type: "error",
        text1: "Comentário vazio.",
        text2: "Por favor, escreva algo antes de enviar.",
      });
      return;
    }

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
        setComentario(""); // Limpa o campo após o envio
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
  inputContainer1: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 15,
  },
  input1: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: "#333",
  },
  iconContainer1: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
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
  like: {
    flex: 1,
    marginTop: 2,
    color: "gray"

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
  date: {
    color: "gray",
    fontSize: 12,
    marginLeft: -96,
    marginTop: 35

  },
  datas: {
    color: "gray",
    fontSize: 12,
    marginLeft: 5,
    marginTop: 20

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
  commentsContainer: {
    marginTop: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  comentImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  comeCont: {
    flex: 1,
  },
  commentUser: {
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: -100,
    color: "#333333",
    marginBottom: 5,
  },
  commentText: {
    flex: 1,
    width: "auto",
    fontSize: 14,
    color: "#555555",
    backgroundColor: "#f4f4f4",
    padding: 8,
    marginTop: 40,
    marginLeft: -140,
    borderRadius: 6,
  },
  noComments: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
    paddingVertical: 10,
  },
});

export default TelaPostagens;
