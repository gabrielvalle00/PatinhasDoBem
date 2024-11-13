import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Image
} from "react-native";
import api from "../../Service/tokenService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TelaDeEdicao = ({ route, navigation }) => {
  const { pet } = route.params;
  const [tipoAnimal, setTipoAnimal] = useState(pet.TipoAnimal);
  const [linhagem, setLinhagem] = useState(pet.Linhagem);
  const [idade, setIdade] = useState(pet.Idade);
  const [sexo, setSexo] = useState(pet.Sexo);
  const [cor, setCor] = useState(pet.Cor);
  const [descricao, setDescricao] = useState(pet.Descricao);
  const [loading, setLoading] = useState(false);

  const handleEditPet = () => {
    setLoading(true);
    AsyncStorage.getItem("token")
      .then((token) => {
        if (!token) {
          Alert.alert("Erro", "Usuário não autenticado.");
          setLoading(false);
          return;
        }

        return api.put(
          `/EditaPetInfo`,
          {
            TipoAnimal: tipoAnimal,
            Linhagem: linhagem,
            Idade: idade,
            Sexo: sexo,
            Cor: cor,
            Descricao: descricao,
            PetID: pet.PetID,
          },
          {
            headers: { authorization: token },
          }
        );
      })
      .then((response) => {
        if (response.data.error) {
          Alert.alert("Erro", response.data.error);
        } else {
          Alert.alert("Sucesso", "Informações do pet editadas com sucesso!");
          navigation.goBack();
        }
      })
      .catch((error) => {
        console.error(error);
        Alert.alert("Erro", "Ocorreu um erro ao editar as informações do pet.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Editar Informações do Pet</Text>

      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: `https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/pets%2F${pet.ID}?alt=media`,
          }}
          style={styles.petImage}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Tipo de Animal"
        value={tipoAnimal}
        onChangeText={setTipoAnimal}
      />
      <TextInput
        style={styles.input}
        placeholder="Linhagem"
        value={linhagem}
        onChangeText={setLinhagem}
      />

      <TextInput
        style={styles.input}
        placeholder="Idade"
        value={idade}
        onChangeText={setIdade}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Sexo"
        value={sexo}
        onChangeText={setSexo}
      />
      <TextInput
        style={styles.input}
        placeholder="Cor"
        value={cor}
        onChangeText={setCor}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descrição"
        value={descricao}
        onChangeText={setDescricao}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleEditPet}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f2f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  petImage: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 80,
    paddingTop: 10,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#007bff80",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default TelaDeEdicao;
