import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const windowWidth = Dimensions.get('window').width;

export default function TelaBiblioteca({ navigation }) {
  const [galleryImages, setGalleryImages] = useState([]);
  const [permission, setPermission] = useState(null);

  const loadGalleryImages = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    setPermission(status === 'granted');

    if (status === 'granted') {
      const album = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        first: 200,
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      const imageUris = await Promise.all(
        album.assets.map(async (asset) => {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);
          return assetInfo.localUri || assetInfo.uri;
        })
      );
      setGalleryImages(imageUris);
    } else {
      console.log('Permissão para acessar galeria negada');
      Toast.show({
        text1: 'Atenção',
        text2: 'Permissão para acessar a galeria negada',
        position: 'top',
        type: 'warning',
        visibilityTime: 3000, // Tempo em milissegundos para mostrar a notificação
      });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.cancelled) {
        await MediaLibrary.saveToLibraryAsync(result.assets[0].uri);
        setGalleryImages([result.assets[0].uri, ...galleryImages]);
      
        Toast.show({
          text1: 'Sucesso',
          text2: 'Foto salva na galeria',
          position: 'top',
          type: 'success',
          visibilityTime: 3000, // Tempo em milissegundos para mostrar a notificação
        });
      }
    } else {
      console.log('Permissão para usar a câmera negada');
      Toast.show({
        text1: 'Atenção',
        text2: 'Permissão  para usar a câmera negada',
        position: 'top',
        type: 'warning',
        visibilityTime: 3000, // Tempo em milissegundos para mostrar a notificação
      });
  
    }
  };

  const selectImageForProfile = (uri) => {
    Alert.alert(
      'Selecionar Foto',
      'Deseja usar esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Usar foto do pet', onPress: () => {
            navigation.navigate('Pet', { imagemSelecionada: uri });
            Alert.alert('Foto do Pet atualizada!');
          }},
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    loadGalleryImages();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => selectImageForProfile(item)}>
      <Image source={{ uri: item }} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.headerText}>Adicionar Foto</Text>

      <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
        <Ionicons name="camera" size={32} color="white" />
      </TouchableOpacity>

      {permission ? (
        <FlatList
          data={galleryImages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          numColumns={4}
        />
      ) : (
        <Text style={styles.permissionText}>
          É necessário conceder permissão para acessar a galeria.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 1,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 5,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 60,
  },
  cameraButton: {
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 50,
    shadowColor: '#fff',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  image: {
    width: (windowWidth / 4) - 10,
    height: (windowWidth / 4) - 10,
    margin: 5,
    borderRadius: 10,
  },
});
