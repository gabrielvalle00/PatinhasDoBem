import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import api from "../../Service/tokenService"; // Certifique-se de configurar corretamente o serviço de API

const TelaNotificacoes = () => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Função para buscar as notificações
  const buscarNotificacoes = () => {
    setIsLoading(true);
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert("Erro", "Usuário não autenticado.");
          throw new Error("Usuário não autenticado");
        }
        return api.get("/MinhasSolicitacoes",{}, {
          headers: { authorization: token },
        });
      })
      .then((response) => {
        console.log("aaaaaaa",response);
        
        setNotificacoes(response.data.invites || []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar notificações:", error);
        setIsLoading(false);
      });
  };

  // Função para aceitar uma solicitação de amizade
  const aceitarSolicitacao = (inviteID) => {
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert("Erro", "Usuário não autenticado.");
          throw new Error("Usuário não autenticado");
        }
        return api.post(
          "/AceitaSolicitacaoAmizade",
          { inviteID },
          { headers: { authorization: token } }
        );
      })
      .then(() => {
        Alert.alert("Solicitação Aceita", "Você aceitou a solicitação de amizade.");
        buscarNotificacoes(); // Atualiza as notificações
      })
      .catch((error) => {
        console.error("Erro ao aceitar solicitação:", error);
        Alert.alert("Erro", "Não foi possível aceitar a solicitação.");
      });
  };

  // Função para recusar uma solicitação de amizade
  const recusarSolicitacao = (inviteID) => {
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert("Erro", "Usuário não autenticado.");
          throw new Error("Usuário não autenticado");
        }
        return api.post(
          "/RecusarSolicitacaoAmizade",
          { inviteID },
          { headers: { authorization: token } }
        );
      })
      .then((e) => {
        console.log("eita",e);
        
        Alert.alert("Solicitação Recusada", "Você recusou a solicitação de amizade.");
        buscarNotificacoes(); // Atualiza as notificações
      })
      .catch((error) => {
        console.error("Erro ao recusar solicitação:", error);
        Alert.alert("Erro", "Não foi possível recusar a solicitação.");
      });
  };

  // Função para marcar notificações como visualizadas
  const marcarNotificacoesComoVisualizadas = () => {
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert("Erro", "Usuário não autenticado.");
          throw new Error("Usuário não autenticado");
        }
        return api.put("/MarcarNotificacoesVisto", {}, { headers: { authorization: token } });
      })
      .then((e) => {
       console.log(e);
        const notificacoesAtualizadas = notificacoes.map((notificacao) => ({
          ...notificacao,
          visualizada: true,
        }));
        setNotificacoes(notificacoesAtualizadas);
      })
      .catch((error) => {
        console.error("Erro ao marcar notificações como visualizadas:", error);
      });
  };

  // Busca as notificações ao montar a tela
  useEffect(() => {
    buscarNotificacoes();
  }, []);

  // Renderização de cada item da lista
  const renderItem = ({ item }) => (
    <View style={[styles.notificacao, item.visualizada && styles.notificacaoLida]}>
      <View style={styles.notificacaoHeader}>
        <Image
          source={{
            uri: `https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/perfil%2F${item.IDSolicitante}?alt=media`,
          }}
          style={styles.fotoUsuario}
        />
        <Text style={styles.nomeSolicitante}>{item.Nome}</Text>
      </View>
      <Text style={styles.mensagemSolicitacao}>
        {item.Interessado === 1
          ? "está interessado em um de seus pets"
          : "enviou uma solicitação de amizade"}
      </Text>
      <View style={styles.botoes}>
        <TouchableOpacity
          style={styles.botaoAceitar}
          onPress={() => aceitarSolicitacao(item.ID)}
        >
          <Text style={styles.textoBotao}>Aceitar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botaoRecusar}
          onPress={() => recusarSolicitacao(item.ID)}
        >
          <Text style={styles.textoBotao}>Recusar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notificações</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={notificacoes}
          renderItem={renderItem}
          keyExtractor={(item) => item.ID.toString()}
          ListEmptyComponent={
            <Text style={styles.mensagemSemNotificacoes}>
              Você não tem notificações pendentes.
            </Text>
          }
        />
      )}
      <TouchableOpacity
        style={styles.botaoVisualizar}
        onPress={marcarNotificacoesComoVisualizadas}
      >
        <Icon name="done-all" size={24} color="white" />
        <Text style={styles.textoBotao}>Marcar todas como lidas</Text>
      </TouchableOpacity>
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#343a40",
  },
  notificacao: {
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  notificacaoLida: {
    backgroundColor: "#e9ecef",
  },
  notificacaoHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  fotoUsuario: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  nomeSolicitante: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#343a40",
  },
  mensagemSolicitacao: {
    marginTop: 10,
    color: "#6c757d",
  },
  botoes: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  botaoAceitar: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 5,
  },
  botaoRecusar: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 5,
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  mensagemSemNotificacoes: {
    textAlign: "center",
    color: "#6c757d",
  },
  botaoVisualizar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
});

export default TelaNotificacoes;
