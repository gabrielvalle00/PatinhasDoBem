import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../Service/tokenService";
import { useRoute, useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";

export default function TelaMensagens() {
  const route = useRoute();
  const navigation = useNavigation(); // Hook para navegação
  const { contatoID, nome } = route.params;
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef(null); // Referência para o TextInput

  const buscarMensagens = () => {
    setIsLoading(true);
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert("Erro", "Usuário não autenticado.");
          return Promise.reject("Usuário não autenticado");
        }
        return api.get(`/MensagensContato/${contatoID}`, {}, {
          headers: { authorization: token },
        });
      })
      .then((response) => {
        if (response.data.success) {
          setMensagens(response.data.mensagens);
        } else {
          Alert.alert("Erro", response.data.error || "Erro ao carregar mensagens.");
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar mensagens:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const enviarMensagem = () => {
    if (!novaMensagem.trim()) return;

    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert("Erro", "Usuário não autenticado.");
          return Promise.reject("Usuário não autenticado");
        }
        return api.post(
          "/EnviaMensagem",
          { contatoID, texto: novaMensagem },
          { headers: { authorization: token } }
        );
      })
      .then((response) => {
        if (response.data.success) {
          setNovaMensagem("");
          buscarMensagens();
          Keyboard.dismiss(); // Esconde o teclado após enviar a mensagem
        } else {
          Alert.alert("Erro", response.data.error || "Erro ao enviar mensagem.");
        }
      })
      .catch((error) => {
        console.error("Erro ao enviar mensagem:", error);
      });
  };

  useEffect(() => {
    buscarMensagens();
    inputRef.current?.focus(); // Força o foco no campo de entrada assim que a tela é carregada
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // Ajuste o valor conforme necessário
    >
      <View style={styles.container}>
        {/* Cabeçalho com nome e foto do usuário */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("User", {
                userID: contatoID, // Navega para o perfil do contato
              })
            }
          >
            <Image
              source={{
                uri: `https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/perfil%2F${contatoID}?alt=media`,
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <Text style={styles.contactName}>{nome}</Text>
        </View>

        <FlatList
          data={mensagens}
          keyExtractor={(item) => item.ID.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageItem,
                item.IDUsuario === contatoID
                  ? styles.receivedMessage
                  : styles.sentMessage,
              ]}
            >
              <Text style={styles.messageText}>{item.Texto}</Text>
            </View>
          )}
          refreshing={isLoading}
          onRefresh={buscarMensagens}
          contentContainerStyle={styles.messagesContainer}
          keyboardShouldPersistTaps="handled" // Permite que o teclado não desapareça ao tocar na lista
        />

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef} // Referência para o TextInput
            style={styles.input}
            value={novaMensagem}
            onChangeText={setNovaMensagem}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={enviarMensagem} style={styles.sendButton}>
            <FontAwesome name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    padding: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  messagesContainer: {
    paddingBottom: 80, // Espaço para a barra de entrada
  },
  messageItem: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    maxWidth: "80%",
  },
  receivedMessage: {
    backgroundColor: "#e5e5ea",
    alignSelf: "flex-start",
  },
  sentMessage: {
    backgroundColor: "#0078ff",
    alignSelf: "flex-end",
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 50,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    borderRadius: 25,
    padding: 10,
    fontSize: 16,
    color: "#333",
  },
  sendButton: {
    backgroundColor: "#0078ff",
    padding: 10,
    borderRadius: 50,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
