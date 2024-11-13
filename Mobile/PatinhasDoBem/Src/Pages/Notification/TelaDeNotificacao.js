import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../Service/tokenService";
import Icon from "react-native-vector-icons/MaterialIcons";

// Componente principal
const TelaNotificacoes = () => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Função para buscar as notificações de amizade do usuário
  const buscarNotificacoes = () => {
    setIsLoading(true);
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert("Erro", "Usuário não autenticado.");
          return Promise.reject("Usuário não autenticado");
        }
        return api.get("/MinhasSolicitacoes", {}, {
          headers: { authorization: token },
        });
      })
      .then((response) => {
        console.log("Notificações recebidas:", response.data);
        setNotificacoes(response.data.invites || []);  // Garantindo que notificacoes seja um array, mesmo que esteja vazio
        setIsLoading(false);

        // Verifica se não há notificações
        if (response.data.invites?.length === 0) {
          Alert.alert("Sem Notificações", "Você não tem notificações pendentes.");
        }
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
          return Promise.reject("Usuário não autenticado");
        }
        return api.post("/AceitaSolicitacaoAmizade", { inviteID }, {
          headers: { authorization: token },
        });
      })
      .then(() => {
        Alert.alert("Solicitação Aceita", "Você aceitou a solicitação de amizade.");
        buscarNotificacoes(); // Recarregar as notificações
      })
      .catch((error) => {
        console.error("Erro ao aceitar solicitação:", error);
        Alert.alert("Erro", "Houve um erro ao aceitar a solicitação de amizade.");
      });
  };

  // Função para recusar uma solicitação de amizade
  const recusarSolicitacao = (inviteID) => {
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert("Erro", "Usuário não autenticado.");
          return Promise.reject("Usuário não autenticado");
        }
        return api.post("/RecusarSolicitacaoAmizade", { inviteID }, {
          headers: { authorization: token },
        });
      })
      .then(() => {
        Alert.alert("Solicitação Recusada", "Você recusou a solicitação de amizade.");
        buscarNotificacoes(); // Recarregar as notificações
      })
      .catch((error) => {
        console.error("Erro ao recusar solicitação:", error);
        Alert.alert("Erro", "Houve um erro ao recusar a solicitação de amizade.");
      });
  };

  // Função para marcar todas as notificações como visualizadas
  const marcarNotificacoesComoVisualizadas = () => {
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert("Erro", "Usuário não autenticado.");
          return Promise.reject("Usuário não autenticado");
        }
        return api.put("/MarcarNotificacoesVisto", {}, {
          headers: { authorization: token },
        });
      })
      .then(() => {
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

  // Chama a função para buscar notificações ao carregar a tela
  useEffect(() => {
    buscarNotificacoes();
  }, []);

  // Função de renderização dos itens da lista
  const renderItem = ({ item }) => (
    <View style={[styles.notificacao, item.visualizada && styles.notificacaoLida]}>
      <View style={styles.notificacaoHeader}>
        {/* Exibindo a foto do solicitante */}
        <Image
          source={{
            uri: `https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/perfil%2F${item.IDSolicitante}?alt=media`, 
          }}
          style={styles.fotoUsuario}
        />
        <Text style={styles.nomeSolicitante}>{item.Nome}</Text>
      </View>
      <TouchableOpacity style={styles.botaoAceitar} onPress={() => aceitarSolicitacao(item.ID)}>
        <Text style={styles.textoBotao}>Aceitar Solicitação</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.botaoRecusar} onPress={() => recusarSolicitacao(item.ID)}>
        <Text style={styles.textoBotao}>Recusar Solicitação</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Minhas Notificações</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          {notificacoes.length === 0 ? (
            <Text style={styles.mensagemSemNotificacoes}>Você não tem notificações pendentes.</Text>
          ) : (
            <FlatList
              data={notificacoes}
              renderItem={renderItem}
              keyExtractor={(item) => item.ID.toString()}
            />
          )}
        </>
      )}
      <TouchableOpacity style={styles.botao} onPress={marcarNotificacoesComoVisualizadas}>
        <Icon name="done-all" size={24} color="white" />
        <Text style={styles.textoBotao}>Marcar todas como visualizadas</Text>
      </TouchableOpacity>
    </View>
  );
};

// Estilos da tela
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#343a40",
  },
  notificacao: {
    padding: 15,
    backgroundColor: "#ffffff",
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dee2e6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  notificacaoLida: {
    backgroundColor: "#e9ecef",
  },
  notificacaoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  fotoUsuario: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  nomeSolicitante: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#495057",
  },
  botaoAceitar: {
    padding: 12,
    backgroundColor: "#28a745",
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  botaoRecusar: {
    padding: 12,
    backgroundColor: "#dc3545",
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  textoBotao: {
    color: "white",
    fontSize: 16,
  },
  mensagemSemNotificacoes: {
    fontSize: 18,
    color: "#868e96",
    textAlign: "center",
    marginTop: 30,
  },
  botao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#007bff",
    borderRadius: 12,
    marginTop: 30,
  },
  textoBotao: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
});

export default TelaNotificacoes;
