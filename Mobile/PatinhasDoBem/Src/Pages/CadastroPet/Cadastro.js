import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons"; // Correção no import
import api from "../../Service/tokenService"; // Certifique-se que esse caminho está correto para sua API configurada
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para armazenamento do token

const CadastroPet = ({ navigation }) => {
  const [TipoAnimal, setTipoAnimal] = useState("");
  const [Linhagem, setLinhagem] = useState("");
  const [Idade, setIdade] = useState("");
  const [Sexo, setSexo] = useState("");
  const [Cor, setCor] = useState("");
  const [Descricao, setDescricao] = useState("");

  const handleCadastroPet = async () => {
    // Validação das entradas
    if (!TipoAnimal || !Linhagem || !Idade || !Sexo || !Cor || !Descricao) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    const petData = {
      TipoAnimal: String(TipoAnimal),
      Linhagem: String(Linhagem),
      Idade: String(Idade),
      Sexo: String(Sexo),
      Cor: String(Cor),
      Descricao: String(Descricao),
    };

    console.log("Dados do pet:", petData);

    try {
      const token = await AsyncStorage.getItem('@CodeApi:token');

      if (!token) {
        Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
        return;
      }
      

        const response = await api.post("/CadastraPet", petData, {
          headers: {
            Authorization: token, // Envia o token no cabeçalho
            "Content-Type": "application/json",
          },
        }).then(e => (
          Alert.alert("Sucesso", "Cadastro realizado com sucesso!"),
          navigation.goBack()
        ));

      } catch (error) {
        console.error("Erro ao cadastrar pet:", error);
        Alert.alert("Erro", "Ocorreu um erro ao cadastrar o pet.");
      }
    };

    const renderInput = (placeholder, iconName, value, onChangeText) => (
      <View style={styles.inputContainer}>
        <MaterialIcons name={iconName} size={24} color="#B0BEC5" />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    );

    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Text style={styles.header}>Cadastrar Pet</Text>

          <TouchableOpacity style={styles.avatar}  onPress={() => navigation.navigate("Biblioteca")}>
          <Ionicons
            name="add-outline" // Corrigir o nome do ícone
            size={40}
            color="#fff"
            style={{ marginTop: 6 }}
          />
        </TouchableOpacity>

          {renderInput("Tipo do Animal", "pets", TipoAnimal, setTipoAnimal)}
          {renderInput("Linhagem", "category", Linhagem, setLinhagem)}
          {renderInput("Idade", "calendar-today", Idade, setIdade)}
          {renderInput("Sexo", "person", Sexo, setSexo)}
          {renderInput("Cor", "palette", Cor, setCor)}
          {renderInput("Descrição", "description", Descricao, setDescricao)}

          <TouchableOpacity style={styles.button} onPress={handleCadastroPet}>
            <Text style={styles.buttonText}>Cadastrar Pet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: "#fff",
    },
    header: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#B0BEC5",
      marginBottom: 15,
    },
    input: {
      flex: 1,
      height: 40,
      fontSize: 16,
      marginLeft: 10,
      color: "#333",
    },
    button: {
      backgroundColor: "#134973",
      padding: 15,
      borderRadius: 5,
      alignItems: "center",
      marginTop: 20,
    },
    buttonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "#E1E2E6",
      marginTop: 48,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center", // Centraliza o botão na tela
    },
  });

  export default CadastroPet;
