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
  TextInput,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import {authAPI} from '../api/apiService';
import { AuthContext } from '../context/AuthContext';

const UserProfile = () => {
  const navigation = useNavigation();
  const { signOut } = React.useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [address, setAddress] = useState(null);
  const [editAddressModalVisible, setEditAddressModalVisible] = useState(false);
  const [editAddress, setEditAddress] = useState({
    name: '',
    phone: '',
    pincode: '',
    state: '',
    city: '',
    houseNumber: '',
    village: '',
    areaName: '',
    nearby: '',
  });

  useEffect(() => {
    fetchUserData();
    fetchAddress();
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
              day: 'numeric',
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

  const fetchAddress = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const addr = await authAPI.getAddress(token);
      setAddress(addr);
    } catch (error) {
      setAddress(null);
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

  const handleEditPress = e => {
    e.stopPropagation();
    handleImagePick();
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const openEditAddressModal = () => {
    setEditAddress({
      name: address?.name || '',
      phone: address?.phone || '',
      pincode: address?.pincode || '',
      state: address?.state || '',
      city: address?.city || '',
      houseNumber: address?.houseNumber || '',
      village: address?.village || '',
      areaName: address?.areaName || '',
      nearby: address?.nearby || '',
    });
    setEditAddressModalVisible(true);
  };

  const handleEditAddressChange = (field, value) => {
    setEditAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleEditAddressSubmit = async () => {
    if (!editAddress.name || !editAddress.phone || !editAddress.pincode || !editAddress.state || !editAddress.city || !editAddress.houseNumber || !editAddress.village || !editAddress.areaName) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('userToken');
      await authAPI.updateAddress(editAddress, token);
      Alert.alert('Success', 'Address updated successfully!');
      setEditAddressModalVisible(false);
      fetchAddress();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update address');
    }
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

      <ScrollView contentContainerStyle={{paddingBottom: 40}}>
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
          {/* Address Section */}
          <View style={styles.infoContainer}>
            <Text style={[styles.label, {marginBottom: 8}]}>Address</Text>
            {address && address.name ? (
              <>
                <Text style={styles.value}>Name: {address.name}</Text>
                <Text style={styles.value}>Phone: {address.phone}</Text>
                <Text style={styles.value}>Pincode: {address.pincode}</Text>
                <Text style={styles.value}>State: {address.state}</Text>
                <Text style={styles.value}>City: {address.city}</Text>
                <Text style={styles.value}>House No.: {address.houseNumber}</Text>
                <Text style={styles.value}>Village: {address.village}</Text>
                <Text style={styles.value}>Area Name: {address.areaName}</Text>
                <Text style={styles.value}>Nearby: {address.nearby}</Text>
                <TouchableOpacity style={[styles.logoutButton, {marginTop: 16, backgroundColor: '#2196F3'}]} onPress={openEditAddressModal}>
                  <Icon name="edit" size={20} color="#FFFFFF" />
                  <Text style={styles.logoutButtonText}>Edit Address</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.value}>No address set yet.</Text>
                <TouchableOpacity style={[styles.logoutButton, {marginTop: 16, backgroundColor: '#4CAF50'}]} onPress={() => {
                  setEditAddress({
                    name: '', phone: '', pincode: '', state: '', city: '', houseNumber: '', village: '', areaName: '', nearby: ''
                  });
                  setEditAddressModalVisible(true);
                }}>
                  <Icon name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.logoutButtonText}>Add Address</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          {/* Logout Button at the end of ScrollView */}
          <TouchableOpacity style={[styles.logoutButton, {marginTop: 32, marginBottom: 24}]} onPress={handleLogout}>
            <Icon name="logout" size={22} color="#FFFFFF" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
      <Modal
        visible={editAddressModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditAddressModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 20, width: '90%' }}>
            <ScrollView>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Edit Address</Text>
              <TextInput placeholder="Name" value={editAddress.name} onChangeText={v => handleEditAddressChange('name', v)} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
              <TextInput placeholder="Phone Number" value={editAddress.phone} onChangeText={v => handleEditAddressChange('phone', v)} keyboardType="phone-pad" style={{ borderBottomWidth: 1, marginBottom: 10 }} />
              <TextInput placeholder="Pincode" value={editAddress.pincode} onChangeText={v => handleEditAddressChange('pincode', v)} keyboardType="number-pad" style={{ borderBottomWidth: 1, marginBottom: 10 }} />
              <TextInput placeholder="State" value={editAddress.state} onChangeText={v => handleEditAddressChange('state', v)} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
              <TextInput placeholder="City" value={editAddress.city} onChangeText={v => handleEditAddressChange('city', v)} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
              <TextInput placeholder="House Number" value={editAddress.houseNumber} onChangeText={v => handleEditAddressChange('houseNumber', v)} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
              <TextInput placeholder="Village" value={editAddress.village} onChangeText={v => handleEditAddressChange('village', v)} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
              <TextInput placeholder="Area Name" value={editAddress.areaName} onChangeText={v => handleEditAddressChange('areaName', v)} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
              <TextInput placeholder="Nearby" value={editAddress.nearby} onChangeText={v => handleEditAddressChange('nearby', v)} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                <TouchableOpacity onPress={() => setEditAddressModalVisible(false)} style={{ padding: 12, backgroundColor: '#ccc', borderRadius: 6, flex: 1, marginRight: 10 }}>
                  <Text style={{ textAlign: 'center', color: '#333' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleEditAddressSubmit} style={{ padding: 12, backgroundColor: '#4CAF50', borderRadius: 6, flex: 1 }}>
                  <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Save Address</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    margin: 20,
    borderRadius: 8,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default UserProfile;
