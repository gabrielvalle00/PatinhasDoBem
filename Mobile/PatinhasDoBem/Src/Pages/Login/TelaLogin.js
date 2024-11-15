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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { Ionicons } from '@expo/vector-icons'; // Ícones do Ionicons
import api from '../../Service/tokenService'; // Importa o Axios já configurado
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import * as Font from 'expo-font'; // Importa a biblioteca de fontes
import { auth } from '../../Firebase/FirebaseConfig';

class LoginScreen extends Component {
  state = {
    Email: '',
    Senha: '',
    loggedInUser: null,
    errorMessage: null,
    fontLoaded: false, // Estado para verificar se a fonte está carregada
  };

  async componentDidMount() {
    await this.loadFonts(); // Carrega as fontes

  }

  // Função para carregar a fonte
  loadFonts = async () => {
    await Font.loadAsync({
      'Kavoon': require('../../../assets/font/Kavoon-Regular.ttf'), // Caminho da fonte
    });
    this.setState({ fontLoaded: true }); // Atualiza o estado
  };

  handleLogin = async () => {
    const { Email, Senha } = this.state;

    if (!Email || !Senha) {
      Toast.show({
        text1: 'Atenção',
        text2: 'Por favor, preencha todos os campos.',
        position: 'top',
        type: 'warning',
        visibilityTime: 3000, // Tempo em milissegundos para mostrar a notificação
      });
      return; // Verifica se os campos estão preenchidos
    }

    try {
      const response = await api.post('/Login', {
        Email,
        Senha,
      }, {
        headers: {
          platform: "mobile",
        }
      });

      console.log('Resposta do backend:', response.data.token); // Verifique a resposta do backend aqui
      console.log(response);

      if (response.data.token) {
        console.log("Login bem-sucedido, token recebido:", response.data.token);

        // Armazena o token no AsyncStorage para persistência do login
        await AsyncStorage.setItem('token', response.data.token);
        console.log(await AsyncStorage.getItem('token'));


        this.props.navigation.navigate('Home');
        Toast.show({
          text1: 'Sucesso',
          text2: 'Bem-vindo de volta! Preparado para explorar mais hoje?',
          position: 'top',
          type: 'success',
          visibilityTime: 3000, // Tempo em milissegundos para mostrar a notificação
        });
      } else {
        Toast.show({
          text1: 'Erro',
          text2: 'Senha ou Email incorreto!',
          position: 'top',
          type: 'error',
          visibilityTime: 3000, // Tempo em milissegundos para mostrar a notificação
        });
        console.log('Login inválido');
      }

    } catch (error) {
      console.log('Erro ao fazer login:', error),
        Toast.show({
          text1: 'Erro',
          text2: 'Usuário invalido',
          position: 'top',
          type: 'warning',
          visibilityTime: 3000, // Tempo em milissegundos para mostrar a notificação
        });
      this.setState({ errorMessage: 'Erro ao conectar ao servidor. Tente novamente.' });
    }
  };

  render() {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0} // Ajuste conforme necessário
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Image
              source={{
                uri: 'https://img.freepik.com/fotos-gratis/colagem-de-animal-de-estimacao-bonito-isolada_23-2150007407.jpg?w=740&t=st=1726268282~exp=1726268882~hmac=a7b97e6ec229c718b75f0a9c6b6f2c0b6f948559714034c5cf6312780321d2b6',
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
            {this.state.fontLoaded && ( // Verifica se a fonte está carregada
              <Text style={styles.greeting}>{`Bem-vindo ao\nPatinhas do Bem`}</Text>
            )}

            <View style={styles.errorMessage}>
              {!!this.state.errorMessage && (
                <Text style={styles.error}>{this.state.errorMessage}</Text>
              )}
              {!!this.state.loggedInUser && (
                <Text style={styles.success}>Logado como: {this.state.loggedInUser}</Text>
              )}
            </View>

            <View style={{ marginTop: 140, justifyContent: 'flex-end', marginBottom: 30 }}>
              <View style={styles.form}>
                <Text style={styles.inputTitle}>Endereço de E-mail</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="orange" />
                  <TextInput
                    style={styles.input}
                    autoCapitalize="none"
                    onChangeText={(Email) => this.setState({ Email })}
                    value={this.state.Email}
                    placeholder="Digite seu e-mail"
                  />
                </View>
              </View>

              <View style={styles.form}>
                <Text style={styles.inputTitle}>Senha</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="orange" />
                  <TextInput
                    style={styles.input}
                    secureTextEntry
                    autoCapitalize="none"
                    onChangeText={(Senha) => this.setState({ Senha })}
                    value={this.state.Senha}
                    placeholder="Digite sua senha"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={this.handleLogin}>
              <Text style={{ color: "#fff", fontWeight: "500" }}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ alignSelf: "center", margin: 32 }}
              onPress={() => this.props.navigation.navigate("Register")}
            >
              <Text style={{ color: "#11212D", fontSize: 13 }}>
                Não tem conta?{" "}
                <Text style={{ fontWeight: "500", color: "orange" }}>
                  Cadastre-se
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4", // Ajuste de fundo
  },
  greeting: {
    marginTop: -180,  // Mantém o título onde está
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
  errorMessage: {
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 30,
  },
  error: {
    color: "#E9446A",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  success: {
    color: "#134973",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  form: {
    marginBottom: 24, // Reduzimos o espaço entre os campos
    marginHorizontal: 30,
  },
  inputTitle: {
    color: "#11212D",
    textTransform: "uppercase",
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: "orange", // Cor da borda do campo de input
    borderBottomWidth: 2,
    height: 40,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "orange",
  },
  button: {
    marginHorizontal: 30,
    backgroundColor: "#11212D", // Cor do botão
    borderRadius: 20,
    borderWidth: 3,        // Define a espessura da borda
    borderColor: 'orange', // Define a cor da borda
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,  // Ajusta o espaçamento abaixo do botão
  },
});

export default LoginScreen;
