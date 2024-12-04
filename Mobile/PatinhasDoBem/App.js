
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"; // Usando react-navigation/bottom-tabs
import { FontAwesome } from "react-native-vector-icons";
import Toast from "react-native-toast-message";
import { StatusBar } from 'react-native';

import TelaLogin from "./Src/Pages/Login/TelaLogin";
import TelaLoading from "./Src/Pages/Loading/TelaLoading";
import TelaInicial from "./Src/Pages/Home/TelaInicial";
import TelaDeRegistro from "./Src/Pages/Register/TelaDeRegistro";
import TelaDeApresentacao from "./Src/Pages/TelaApresentacao/TelaApresentacao";
import TelaDeMensagem from "./Src/Pages/Chat/TelaContato";
import TelaDeNotificacao from "./Src/Pages/Notification/TelaDeNotificacao";
import TelaDePerfil from "./Src/Pages/Profile/TelaDePerfil";
import Mensagem from "./Src/Pages/Contatos/chat";
import TelaDePets from "./Src/Pages/Animals/VisualizarPet";
import CadastroPet from "./Src/Pages/CadastroPet/Cadastro";
import TelaBiblioteca from "./Src/Pages/Biblioteca/telaBiblioteca";
import TelaBibliotecaPerfil from "./Src/Pages/Biblioteca perfil/telaBibliotecaPerfil";
import TelaMeusInteresses from "./Src/Pages/MeusInteresses/Interesses";
import UserProfileScreen from "./Src/Pages/User/Users";
import TelaDeEdicao from "./Src/Pages/EdicaoPet/TelaPetEdicao";
import TelaDeEdicaoUsuario from "./Src/Pages/PerfilConfig/TelaConfigPerfil";
import FeedDePostagens from "./Src/Pages/Post/TelaPost";
import DetalhesPost from "./Src/Pages/Detalhes/DetalhesPost";
import IconWithBadge from "./Src/Pages/icon";

// Criando o Stack Navigator
const Stack = createNativeStackNavigator();

// Criando o Bottom Tab Navigator
const Tab = createBottomTabNavigator();

// Configurando as Tabs (Home, Mensagem, Notificação, Perfil)
function HomeTabs() {
 

   
  return (
    <>
      {/* Define a StatusBar com fundo azul e conteúdo branco */}
      <StatusBar backgroundColor="#11212D" barStyle="light-content" />
      {/* Resto do aplicativo */}
    
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          let iconStyle = {}; // Estilo para aplicar o sombreamento

          if (route.name === "Feed") {
            iconName = "home";
            size = 24;
          } else if (route.name === "Mensagem") {
            iconName = "comments";
            size = 24;
          } else if (route.name === "Pets") {
            iconName = "paw";
            size = focused ? 50 : 40; // Maior quando focado
            color = "#ff8c00"; // Cor personalizada
            iconStyle = {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 10, // Para Android
            }; 
          } else if (route.name === "Notificação") {
            iconName = "bell";
            size = 24;
          } else if (route.name === "Perfil") {
            iconName = "user";
            size = 24;
          }

          return (
            
            <FontAwesome
              name={iconName}
              size={size}
              color={color}
              style={
                route.name === "Post" ? { ...iconStyle, marginBottom: 0 } : {}
              }
            />
          );
        },
        tabBarShowLabel: false, // Remove os nomes
        tabBarActiveTintColor: "orange",
        tabBarInactiveTintColor: "#fff",
        tabBarStyle: { display: "flex" },
        tabBarStyle: {
          backgroundColor: "#11212D", // Cor de fundo azul escuro
          borderTopWidth: 0, // Remove a borda superior
          elevation: 5, // Sombra para Android
        },
      })}
    >
      <Tab.Screen
        name="Feed"
        component={FeedDePostagens}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Mensagem"
        component={TelaDeMensagem}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Pets"
        component={TelaDePets}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Notificação" component={TelaDeNotificacao}
      options={{ headerShown: false }} 
       />
      <Tab.Screen name="Perfil" component={TelaDePerfil}
      options={{ headerShown: false }}
       />
    </Tab.Navigator>
    </>
  );
}
// Configuração do App com Stack Navigator
export default function App() {
  return (
    <>
      {/* Define a StatusBar com fundo azul e conteúdo branco */}
      <StatusBar backgroundColor="#11212D" barStyle="light-content" />
      {/* Resto do aplicativo */}
    <NavigationContainer>
    
      <Stack.Navigator initialRouteName="TelaApresentacao">
        <Stack.Screen
          name="TelaApresentacao"
          component={TelaDeApresentacao}
          options={{ headerShown: false }} // Oculta o header
        />

        <Stack.Screen
          name="Loading"
          component={TelaLoading}
          options={{ headerShown: false }} // Oculta o header
        />
        <Stack.Screen
          name="Login"
          component={TelaLogin}
          options={{ headerShown: false }} // Oculta o header
        />
        <Stack.Screen
          name="Register"
          component={TelaDeRegistro}
          options={{ headerShown: false }} // Oculta o header
        />

        <Stack.Screen
          name="Pet"
          component={CadastroPet}
          options={{ headerShown: false }} // Oculta o header
        />

        <Stack.Screen
          name="Biblioteca"
          component={TelaBiblioteca}
          options={{ headerShown: false }} // Oculta o header
        />

        <Stack.Screen
          name="BibliotecaPerfil"
          component={TelaBibliotecaPerfil}
          options={{ headerShown: false }} // Oculta o header
        />

        <Stack.Screen
          name="User"
          component={UserProfileScreen}
          options={{ headerShown: false }} // Oculta o header
        />

        <Stack.Screen
          name="interesses"
          component={TelaMeusInteresses}
          options={{ headerShown: false }} // Oculta o header
        />

        <Stack.Screen
          name="EdicaoPet"
          component={TelaDeEdicao}
          options={{ headerShown: false }} // Oculta o header
        />

        <Stack.Screen
          name="EdicaoUser"
          component={TelaDeEdicaoUsuario}
          options={{ headerShown: false }} // Oculta o header
        />

        <Stack.Screen
          name="DetalhesPost"
          component={DetalhesPost}
          options={{ headerShown: false }} // Oculta o header
        />

        <Stack.Screen
          name="Mensagens"
          component={Mensagem}
          options={{ headerShown: false }} // Oculta o header
        />

        {/* Tela Home agora usa Bottom Tabs */}
        <Stack.Screen
          name="Home"
          component={HomeTabs} // Aqui a Home será o Bottom Tab Navigator
          options={{ headerShown: false }} // Oculta o header
        />
      </Stack.Navigator>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </NavigationContainer>
    </>
  );
}
