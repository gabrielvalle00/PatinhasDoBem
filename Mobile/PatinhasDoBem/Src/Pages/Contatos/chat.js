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
import { FontAwesome, Ionicons } from "@expo/vector-icons"; // Importando ícones
import moment from 'moment';

export default function TelaMensagens() {
  const route = useRoute();
  const navigation = useNavigation();
  const { contatoID, nome } = route.params;
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef(null);

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
        console.log(response.data);
        
        if (response.data.success) {
          setMensagens(response.data.messages || []);
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
          { IDContato: contatoID, Texto: novaMensagem },
          { headers: { authorization: token } }
        );
      })
      .then((response) => {
        if (response.data.success) {
          setNovaMensagem("");
          buscarMensagens();
          Keyboard.dismiss(); 
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
    inputRef.current?.focus();
  }, [contatoID]);

  const formatarHora = (data) => {
    return moment(data).format('HH:mm');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <View style={styles.container}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={30} color="#fff" />
          </TouchableOpacity>

          <Image
            source={{
              uri: `https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/perfil%2F${contatoID}?alt=media`,
            }}
            style={styles.avatar}
          />

          <View style={styles.headerInfo}>
            <Text style={styles.contactName}>{nome}</Text>
          </View>
        </View>

        <FlatList
          data={mensagens}
          keyExtractor={(item) => item.IDMensagem.toString()}
          renderItem={({ item }) => (
            <View
              style={[ 
                styles.messageItem,
                item.quemEnviouAMensagem === "Você Enviou"
                  ? styles.sentMessage
                  : styles.receivedMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.quemEnviouAMensagem === "Você Enviou"
                    ? styles.sentText
                    : styles.receivedText,
                ]}
              >
                {item.Texto}
              </Text>
              <Text style={styles.timeText}>
                {formatarHora(item.DataDeEnvio)}
              </Text>
            </View>
          )}
          refreshing={isLoading}
          onRefresh={buscarMensagens}
          contentContainerStyle={styles.messagesContainer}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma mensagem.</Text>}
        />

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
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
    justifyContent: "flex-start", // Ajustando para a seta e a foto ficarem à esquerda
    padding: 10,
    borderBottomColor: "#ddd",
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Fundo semi-transparente (pode ajustar a opacidade)
    position: "absolute", // Para fazer o cabeçalho flutuar sobre a tela
    top: 0, // Certificando que o cabeçalho vai para o topo
    left: 0,
    right: 0,
    zIndex: 10, // Garante que o cabeçalho fique sobre outros elementos
    height: 80, // Ajuste a altura do cabeçalho conforme necessário
    elevation: 5,
  },
  
  backButton: {
    marginRight: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  headerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  messagesContainer: {
    paddingBottom: 80,
  },
  messageItem: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 15,
    maxWidth: "80%",
    position: "relative",
  },
  receivedMessage: {
    backgroundColor: "gray",
    alignSelf: "flex-start",
    marginLeft: 10,
    borderBottomLeftRadius: 0,
  },
  sentMessage: {
    backgroundColor: "#11212D",
    alignSelf: "flex-end",
    marginRight: 10,
    borderBottomRightRadius: 0,
  },
  messageText: {
    fontSize: 16,
  },
  receivedText: {
    color: "#fff",
  },
  sentText: {
    color: "#fff",
  },
  timeText: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
    textAlign: "right",
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
    backgroundColor: "#11212D",
    padding: 10,
    borderRadius: 50,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
});
