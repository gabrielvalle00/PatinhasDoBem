import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../Service/tokenService";
import { useNavigation } from "@react-navigation/native";

export default function TelaContatos() {
  const [contatosDeInteresses, setContatosDeInteresses] = useState([]);
  const [contatosSemInteresses, setContatosSemInteresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarInteresses, setMostrarInteresses] = useState(true); // Estado para alternar entre os tipos de contatos
  const navigation = useNavigation();

  // Função para buscar os contatos da API
  const buscarContatos = () => {
    setIsLoading(true);
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert("Erro", "Usuário não autenticado.");
          return Promise.reject("Usuário não autenticado");
        }
        return api.get("/MeusContatos", {}, { headers: { authorization: token } });
      })
      .then((response) => {
        if (response.data.success) {
          setContatosDeInteresses(response.data.contatosDeInteresses);
          setContatosSemInteresses(response.data.contatosSemInteresses);
        } else {
          Alert.alert("Erro", response.data.error || "Erro ao carregar contatos.");
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar contatos:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    buscarContatos();
  }, []);

  const renderContact = (item) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() =>
        navigation.navigate("Mensagens", {
          contatoID: item.contatoID,
          nome: item.Nome,
        })
      }
    >
      {/* Imagem do contato */}
      <Image
        source={{
          uri: `https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/perfil%2F${item.IDUsuario}?alt=media`,
        }}
        style={styles.contactImage}
      />
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.Nome}</Text>
        <Text style={styles.lastMessage}>{item.ultimaMensagem}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contatos</Text>

      {/* Barra de navegação entre os tipos de contatos */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            mostrarInteresses ? styles.activeTab : null,
          ]}
          onPress={() => setMostrarInteresses(true)}
        >
          <Text style={styles.tabText}>Contatos de Interesse</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            !mostrarInteresses ? styles.activeTab : null,
          ]}
          onPress={() => setMostrarInteresses(false)}
        >
          <Text style={styles.tabText}>Contatos Sem Interesse</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <Text>Carregando...</Text>
      ) : contatosDeInteresses.length === 0 && contatosSemInteresses.length === 0 ? (
        <Text style={styles.noContactsText}>Você não tem nenhum contato.</Text>
      ) : (
        <FlatList
          data={mostrarInteresses ? contatosDeInteresses : contatosSemInteresses}
          keyExtractor={(item) => item.IDUsuario.toString()}
          renderItem={({ item }) => renderContact(item)}
          refreshing={isLoading}
          onRefresh={buscarContatos}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  tabButton: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 18,
    color: "#555",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#3DAAD9", // Cor da barrinha quando o botão estiver ativo
  },
  noContactsText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  contactImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: { fontSize: 18, fontWeight: "bold" },
  lastMessage: { fontSize: 14, color: "#777" },
});
