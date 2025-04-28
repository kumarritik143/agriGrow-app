import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import {authAPI} from '../api/apiService';

const UserProfile = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');

      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        const memberSinceDate = parsedData.createdAt 
          ? new Date(parsedData.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : 'N/A';
        
        setUserData({
          ...parsedData,
          memberSince: memberSinceDate,
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 800,
      maxWidth: 800,
      quality: 0.7,
    };

    try {
      const response = await launchImageLibrary(options);

      if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        setIsUploading(true);

        const token = await AsyncStorage.getItem('userToken');
        const imageBase64 = `data:${selectedImage.type};base64,${selectedImage.base64}`;

        const result = await authAPI.updateProfile({imageBase64}, token);

        if (result.success) {
          const updatedUserData = {
            ...userData,
            profileImage: result.data.profileImage,
          };

          // Update both userData and lastProfileImage
          await AsyncStorage.multiSet([
            ['userData', JSON.stringify(updatedUserData)],
            ['lastProfileImage', result.data.profileImage],
          ]);

          setUserData(updatedUserData);
        }
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      Alert.alert('Error', 'Failed to update profile image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleImagePress = () => {
    if (userData?.profileImage) {
      setShowImageModal(true);
    }
  };

  const handleEditPress = (e) => {
    e.stopPropagation(); // Prevent the image modal from opening
    handleImagePick();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={handleImagePress}
          disabled={isUploading}>
          {isUploading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : userData?.profileImage ? (
            <Image
              source={{uri: userData.profileImage}}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileIcon}>
              <Icon name="person" size={60} color="#4CAF50" />
            </View>
          )}
          <TouchableOpacity 
            style={styles.editIconContainer}
            onPress={handleEditPress}>
            <Icon name="edit" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.value}>{userData?.fullName || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{userData?.email || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Member Since</Text>
            <Text style={styles.value}>{userData?.memberSince || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Full Size Image Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        onRequestClose={() => setShowImageModal(false)}>
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setShowImageModal(false)}>
          <Image
            source={{uri: userData?.profileImage}}
            style={styles.fullSizeImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 30,
    position: 'relative',
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  profileIcon: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullSizeImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
  },
});

export default UserProfile;