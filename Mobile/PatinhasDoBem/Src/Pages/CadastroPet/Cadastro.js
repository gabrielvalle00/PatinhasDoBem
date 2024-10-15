import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import api from "../../Service/tokenService";
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para armazenamento do token
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Importações do Firebase Storage
import { storage } from "../../Firebase/FirebaseConfig";
import * as ImageManipulator from 'expo-image-manipulator';

const CadastroPet = ({ navigation, route }) => {
  const [TipoAnimal, setTipoAnimal] = useState("");
  const [Linhagem, setLinhagem] = useState("");
  const [Idade, setIdade] = useState("");
  const [Sexo, setSexo] = useState("");
  const [Cor, setCor] = useState("");
  const [Descricao, setDescricao] = useState("");
  const [imagemSelecionada, setImagemSelecionada] = useState(null);

  useEffect(() => {
    if (route.params?.imagemSelecionada) {
      setImagemSelecionada(route.params.imagemSelecionada);

    }
  }, [route.params?.imagemSelecionada]);


  const handleCadastroPet = async () => {
    // Validação das entradas
    if (!TipoAnimal || !Linhagem || !Idade || !Sexo || !Cor || !Descricao) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }
  
    if (!imagemSelecionada) {
      Alert.alert("Erro", "Por favor, selecione uma imagem.");
      return;
    }
  
    try {
      // Recupera o token armazenado
      const token = await AsyncStorage.getItem('token');
  
      if (!token) {
        Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
        return;
      }
  
      // Primeiro, cadastra o pet no backend
      const petData = {
        TipoAnimal: String(TipoAnimal),
        Linhagem: String(Linhagem),
        Idade: String(Idade),
        Sexo: String(Sexo),
        Cor: String(Cor),
        Descricao: String(Descricao),
      };
  
      // Enviando os dados do pet para o backend
      api.post("/CadastraPet", petData, {
        headers: {
          authorization: token, // Envia o token no cabeçalho
        },
      })
      .then(async (e) => {
        const idDoPet = e.data.idDoPet; // Obter o ID do pet retornado pela API
        console.log("cahorro:",idDoPet);
        
  
        if (!idDoPet) {
          throw new Error("Erro ao obter ID do pet.");
        }
  
        // Redimensionar a imagem antes do upload (opcional)
        const manipResult = await ImageManipulator.manipulateAsync(
          imagemSelecionada,
          [{ resize: { width: 800 } }], // Redimensionar a imagem para largura de 800px
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
  
        // Converter a imagem para blob
        const responseImage = await fetch(manipResult.uri);
        const blob = await responseImage.blob();
  
        // Nomear a imagem com o ID do pet
        const imageRef = ref(storage, `pets/${idDoPet}.jpg`);
  
        // Faz o upload da imagem para o Firebase Storage
        return uploadBytes(imageRef, blob);
      })
      .then(() => {
        // Caso a requisição e upload tenham sucesso
        Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
        navigation.goBack();
      })
      .catch((error) => {
        console.error("Erro ao cadastrar pet:", error);
        Alert.alert("Erro", "Ocorreu um erro ao cadastrar o pet.");
      });
  
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {/* Botão de Voltar */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>

          <Text style={styles.header}>Cadastrar Pet</Text>

          <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate("Biblioteca")}>
            {imagemSelecionada ? (
              <Image
                source={{ uri: imagemSelecionada }}
                style={{ width: 250, height: 300, borderRadius: 50 }}
              />
            ) : (
              <Ionicons name="add-outline" size={40} color="#fff" style={{ marginTop: 6 }} />
            )}
          </TouchableOpacity>

          {renderInput("Tipo do Animal", "pets", TipoAnimal, setTipoAnimal)}
          {renderInput("Linhagem", "category", Linhagem, setLinhagem)}
          {renderInput("Idade", "calendar-today", Idade, setIdade)}
          {renderInput("Sexo", "person", Sexo, setSexo)}
          {renderInput("Cor", "palette", Cor, setCor)}
          {renderInput("Descrição", "description", Descricao, setDescricao)}

          <TouchableOpacity style={styles.button} onPress={handleCadastroPet}>
            <Text style={styles.buttonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  avatar: {
    width: 250,
    height: 300,
    borderRadius: 50,
    backgroundColor: "#E1E2E6",
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    padding: 20
  },
  imageAvatar: {
    width: 250,
    height: 300,
    borderRadius: 50,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    position: 'absolute',
    top: 15,
    left: 10,
    zIndex: 1,
  },
  backButtonText: {
    color: '#000',
    fontSize: 18,
    marginLeft: 5,
  },
});


export default CadastroPet;