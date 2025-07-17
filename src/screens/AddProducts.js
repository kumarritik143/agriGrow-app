import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useContext} from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {AuthContext} from '../context/AuthContext';
import {productAPI} from '../api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddProducts = () => {
  const navigation = useNavigation();
  const {signOut} = useContext(AuthContext);

  const [productData, setProductData] = useState({
    name: '',
    price: '',
    description: '',
    brand: '',
    image: null,
    imageBase64: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleImagePick = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 1024,
      maxWidth: 1024,
      quality: 0.7,
    };

    try {
      const response = await launchImageLibrary(options);
      console.log('Image picker response:', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error:', response.error);
        Alert.alert('Error', 'Failed to pick image: ' + response.error);
      } else if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        console.log('Selected image:', selectedImage.uri);

        setProductData(prevState => ({
          ...prevState,
          image: selectedImage.uri,
          imageBase64: `data:${selectedImage.type};base64,${selectedImage.base64}`,
        }));
      }
    } catch (error) {
      console.error('Error in handleImagePick:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!productData.name || !productData.price || !productData.image) {
      Alert.alert(
        'Error',
        'Please fill in all required fields and add an image',
      );
      return;
    }

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const productPayload = {
        name: productData.name,
        price: productData.price,
        description: productData.description,
        brand: productData.brand,
        imageBase64: productData.imageBase64,
      };

      const result = await productAPI.createProduct(productPayload, token);

      if (result.success) {
        Alert.alert('Success', 'Product added successfully', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('AdminDashboard'),
          },
        ]);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', error.message || 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Product</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={handleImagePick}>
            {productData.image ? (
              <Image
                source={{uri: productData.image}}
                style={styles.previewImage}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="add-photo-alternate" size={40} color="#666" />
                <Text style={styles.imagePickerText}>Add Product Image</Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Product Name"
            value={productData.name}
            onChangeText={text => setProductData({...productData, name: text})}
          />

          <TextInput
            style={styles.input}
            placeholder="Price"
            value={productData.price}
            onChangeText={text => setProductData({...productData, price: text})}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Brand"
            value={productData.brand}
            onChangeText={text => setProductData({...productData, brand: text})}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={productData.description}
            onChangeText={text =>
              setProductData({...productData, description: text})
            }
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Product</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  imagePickerButton: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  imagePickerText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    minHeight: 50, 
    justifyContent: 'center', 
  },
  saveButtonDisabled: {
    backgroundColor: '#4CAF50',
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddProducts;
