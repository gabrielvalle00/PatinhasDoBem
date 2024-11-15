import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as Font from "expo-font";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { ref, uploadBytes } from 'firebase/storage';
import { storage } from '../../Firebase/FirebaseConfig';
import Toast from 'react-native-toast-message';
import axios from "axios";
import api from "../../Service/tokenService";

class TelaRegistro extends Component {
  state = {
    NomeUsuario: '',
    DataNasc: '',
    Email: '',
    Senha: '',
    Cep: '',
    Rua: '',
    Numero: '',
    Bairro: '',
    Cidade: '',
    Estado: '',
    confirmarSenha: '',
    dataNascimento: new Date(),
    showDatePicker: false,
    fontLoaded: false,
    imagemSelecionada: null,
  };

  async componentDidMount() {
    await this.loadFonts();
    const { route } = this.props;
    if (route.params?.imagemSelecionada) {
      this.setState({ imagemSelecionada: route.params.imagemSelecionada });
    }
  }

  loadFonts = async () => {
    await Font.loadAsync({
      Kavoon: require("../../../assets/font/Kavoon-Regular.ttf"),
    });
    this.setState({ fontLoaded: true });
  };

  fetchAddressByCep = async (cep) => {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      const { logradouro, bairro, localidade, uf } = response.data;
      if (logradouro) {
        this.setState({
          Rua: logradouro,
          Bairro: bairro,
          Cidade: localidade,
          Estado: uf,
        });
      } else {
        Alert.alert("Erro", "CEP não encontrado.");
      }
    } catch (error) {
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao buscar o endereço: " + error.message
      );
    }
  };

  handleCepChange = (cep) => {
    this.setState({ Cep: cep });
    if (cep.length === 8) {
      this.fetchAddressByCep(cep);
    }
  };

  selecionarImagem = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      this.setState({ imagemSelecionada: result.assets[0].uri });
    }
  };

  handleRegister = async () => {
    const { NomeUsuario, Email, Senha, confirmarSenha, Cep, Rua, Numero, Bairro, Cidade, Estado, dataNascimento } = this.state;

    if (Senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    if (!NomeUsuario || !Email || !Senha || !Cep || !Rua || !Numero || !Bairro || !Cidade || !Estado) {
      Alert.alert("Erro", "Todos os campos são obrigatórios.");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(Email)) {
      Alert.alert("Erro", "Insira um endereço de e-mail válido.");
      return;
    }

    if (!this.state.imagemSelecionada) {
      Toast.show({
        text1: 'Erro',
        text2: 'Por favor, selecione uma imagem.',
        position: 'top',
        type: 'error',
        visibilityTime: 3000,
      });
      return;
    }

    const numeroFormatado = parseInt(Numero, 10);
    if (isNaN(numeroFormatado)) {
      Alert.alert("Erro", "O campo Número deve ser um valor numérico.");
      return;
    }

    const formattedDate = dataNascimento.toISOString().split('T')[0];

    console.log("Dados a serem enviados:", {
      NomeUsuario,
      DataNasc: formattedDate,
      Email,
      Senha,
      Cep,
      Rua,
      Numero: numeroFormatado,
      Bairro,
      Cidade,
      Estado,
    });

    try {
      await api.post('/Cadastro', {
        NomeUsuario,
        DataNasc: formattedDate,
        Email,
        Senha,
        Cep,
        Rua,
        Numero: numeroFormatado,
        Bairro,
        Cidade,
        Estado,
      })
        .then(async (response) => {
          const IDUsuario = response.data.IDUsuario;
          const manipResult = await ImageManipulator.manipulateAsync(
            this.state.imagemSelecionada,
            [{ resize: { width: 800 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );

          const responseImage = await fetch(manipResult.uri);
          const blob = await responseImage.blob();

          const imageRef = ref(storage, `perfil/${IDUsuario}`);
          return uploadBytes(imageRef, blob);
        })
        .then(() => {
          Toast.show({
            text1: 'Sucesso',
            text2: 'Cadastro realizado com sucesso!',
            position: 'top',
            type: 'success',
            visibilityTime: 3000,
          });
          this.props.navigation.navigate('Login');
        })
        .catch((error) => {
          console.error("Upload Error:", error);
          Alert.alert("Erro", "Ocorreu um erro ao fazer upload da imagem.");
        });
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao registrar o usuário.");
    }
  };

  renderInput = (title, iconName, stateKey, keyboardType = "default", placeholder = "", secureTextEntry = false, editable = true) => (
    <View style={styles.form}>
      <Text style={styles.inputTitle}>{title}</Text>
      <View style={styles.inputContainer}>
        <Ionicons name={iconName} size={20} color="orange" />
        <TextInput
          style={styles.input}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          placeholder={placeholder}
          onChangeText={(value) => {
            if (stateKey === "Cep") {
              this.handleCepChange(value);
            } else {
              this.setState({ [stateKey]: value });
            }
          }}
          value={this.state[stateKey]}
          editable={editable}
        />
      </View>
    </View>
  );

  render() {
    const { showDatePicker, dataNascimento, imagemSelecionada } = this.state;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Image
          source={{
            uri: "https://img.freepik.com/fotos-gratis/colagem-de-animal-de-estimacao-bonito-isolada_23-2150007407.jpg?w=740&t=st=1726268282~exp=1726268882~hmac=a7b97e6ec229c718b75f0a9c6b6f2c0b6f948559714034c5cf6312780321d2b6",
          }}
          style={{
            marginTop: -100,
            width: 460,
            height: 350,
            borderBottomLeftRadius: 110,  // Arredonda o canto inferior esquerdo
            borderBottomRightRadius: 20,  // Arredonda o canto inferior direito
            overflow: 'hidden',           // Garante que o arredondamento seja aplicado corretamente
            shadowColor: '#000',          // Cor da sombra
            shadowOffset: { width: 0, height: 4 },  // Posição da sombra
            shadowOpacity: 0.3,           // Opacidade da sombra
            shadowRadius: 10,             // Suavidade da sombra
            elevation: 10,                // Sombra para Android
          }}
        />
        {this.state.fontLoaded && (
          <Text style={styles.greeting}>{"Bem-vindo ao\nPatinhas do Bem"}</Text>
        )}

        <TouchableOpacity style={styles.avatar} onPress={this.selecionarImagem}>
          {imagemSelecionada ? (
            <Image
              source={{ uri: imagemSelecionada }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
          ) : (
            <Ionicons name="person-outline" size={40} color="orange" style={{ marginTop: 6 }} />
          )}
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {this.renderInput("Nome", "person-outline", "NomeUsuario")}
          {this.renderInput("CEP", "pin", "Cep", "numeric")}
          {this.renderInput("Rua", "home-outline", "Rua", "default", "", false, false)}
          {this.renderInput("Número", "pin", "Numero", "numeric")}
          {this.renderInput("Bairro", "home", "Bairro", "default", "", false, false)}
          {this.renderInput("Cidade", "location-outline", "Cidade", "default", "", false, false)}
          {this.renderInput("Estado", "flag", "Estado", "default", "", false, false)}

          <View style={styles.form}>
            <Text style={styles.inputTitle}>Data de Nascimento</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => this.setState({ showDatePicker: true })}
            >
              <Ionicons name="calendar-outline" size={20} color="orange" />
              <Text style={[styles.input, { paddingTop: 7 }]}>
                {dataNascimento.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dataNascimento}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  this.setState({
                    dataNascimento: selectedDate || dataNascimento,
                    showDatePicker: false,
                  });
                }}
              />
            )}
          </View>

          {this.renderInput("Email", "mail-outline", "Email", "email-address")}
          {this.renderInput("Senha", "lock-closed-outline", "Senha", "default", "", true)}
          {this.renderInput("Confirmar Senha", "lock-closed-outline", "confirmarSenha", "default", "", true)}

          <TouchableOpacity style={styles.button} onPress={this.handleRegister}>
            <Text style={{ color: "#fff", fontWeight: "500" }}>Cadastrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignSelf: "center", margin: 32 }}
            onPress={() => this.props.navigation.navigate("Login")}
          >
            <Text style={{ color: "#11212D", fontSize: 13 }}>
              Já tem conta?{" "}
              <Text style={{ fontWeight: "500", color: "orange" }}>
                Faça login
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  greeting: {
    marginTop: -200,
    fontSize: 28,
    fontWeight: "400",
    textAlign: "center",
    color: "orange", // Ajuste a cor aqui: #FF8C00 (laranja) ou #134973 (azul escuro)
    fontFamily: 'Kavoon', // Aplicando a fonte Kavoon
    borderColor: 'black', // Cor da borda do título (Azul escuro)
     // Configurações de sombra
     textShadowColor: '#000',     // Cor da sombra
     textShadowOffset: { width: 2, height: 2 },  // Posição da sombra
     textShadowRadius: 3,         // Suavidade da sombra
  },
  form: {
    marginBottom: 48,
    marginHorizontal: 30,
  },
  inputTitle: {
    color: "#11212D",
    textTransform: "uppercase",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "orange",
    borderBottomWidth: 2,
    paddingBottom: 5,
  },
  input: {
    height: 40,
    flex: 1,
    color: "orange",
    paddingHorizontal: 10,
  },
  button: {
    marginHorizontal: 30,
    backgroundColor: "#11212D",
    borderRadius: 20,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,        // Define a espessura da borda
    borderColor: 'orange', // Define a cor da borda
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
    borderWidth: 3,        // Define a espessura da borda
    borderColor: 'orange', // Define a cor da borda
  },
});

export default TelaRegistro;