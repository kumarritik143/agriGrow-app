import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, orderAPI } from '../api/apiService';

const CartScreen = () => {
  const navigation = useNavigation();
  const { cartItems, removeFromCart, updateQuantity, isLoading, clearCart } = useCart();
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [address, setAddress] = useState({});

  useEffect(() => {
    fetchAddress();
  }, []);

  const fetchAddress = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const addr = await authAPI.getAddress(token);
      setAddress(addr || {});
    } catch (error) {
      setAddress({});
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Please add items to proceed.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('userToken');
      const orderProducts = cartItems.map(item => ({
        product: item._id,
        quantity: item.quantity,
      }));
      const total = calculateTotal();

      // 1. Create Razorpay order on backend (amount in paise)
      const razorpayOrderRes = await orderAPI.createRazorpayOrder({ amount: total * 100 }, token);
      if (!razorpayOrderRes.success) {
        Alert.alert('Payment Error', razorpayOrderRes.message || 'Failed to initiate payment.');
        return;
      }

      const options = {
        description: 'Order Payment',
        image: 'https://res.cloudinary.com/ritik-kumar/image/upload/v1752751232/logo_rmuzej.png', // Your Cloudinary logo
        currency: 'INR',
        key: 'rzp_test_5PWScC3j0RpBhf', // Your Razorpay key
        amount: razorpayOrderRes.amount, // in paise
        name: 'AgriGrow',
        order_id: razorpayOrderRes.order_id, // from backend
        prefill: {
          email: address.email || 'user@example.com',
          contact: address.phone || '',
          name: address.name || '',
        },
        theme: { color: '#4CAF50' },
      };

      navigation.dispatch(
        CommonActions.navigate({
          name: 'Payment',
          params: {
            razorpayOptions: options,
            orderProducts,
            total,
            address,
            token,
            onSuccessScreen: 'Success',
          },
        })
      );
    } catch (error) {
      Alert.alert('Order Failed', error.message || 'Could not place order.');
    }
  };

  const handleAddAddress = () => {
    setAddressModalVisible(true);
  };

  const handleAddressChange = (field, value) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressSubmit = async () => {
    // Simple validation
    if (!address.name || !address.phone || !address.pincode || !address.state || !address.city || !address.houseNumber || !address.village || !address.areaName) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('userToken');
      await authAPI.updateAddress(address, token);
      Alert.alert('Success', 'Address saved successfully!');
      setAddressModalVisible(false);
      fetchAddress(); // Refresh address after saving
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save address');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => {
              if (item.quantity > 1) {
                updateQuantity(item._id, item.quantity - 1);
              }
            }}
            style={styles.quantityButton}>
            <Icon name="remove" size={20} color="#4CAF50" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => updateQuantity(item._id, item.quantity + 1)}
            style={styles.quantityButton}>
            <Icon name="add" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => removeFromCart(item._id)}
        style={styles.removeButton}>
        <Icon name="delete" size={24} color="#FF0000" />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <View style={styles.headerButton} />
      </View>

      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.cartList}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalAmount}>₹{calculateTotal()}</Text>
          </View>
          {address && address.name
            ? (
                <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                  <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                </TouchableOpacity>
              )
            : (
                <TouchableOpacity style={styles.checkoutButton} onPress={handleAddAddress}>
                  <Text style={styles.checkoutButtonText}>Add Address</Text>
                </TouchableOpacity>
              )
          }
          <Modal
            visible={addressModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setAddressModalVisible(false)}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 20, width: '90%' }}>
                <ScrollView>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Add Address</Text>
                  <TextInput placeholder="Name" value={address.name} onChangeText={v => handleAddressChange('name', v)} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
                  <TextInput placeholder="Phone Number" value={address.phone} onChangeText={v => handleAddressChange('phone', v)} keyboardType="phone-pad" style={{ borderBottomWidth: 1, marginBottom: 10 }} />
                  <TextInput placeholder="Pincode" value={address.pincode} onChangeText={v => handleAddressChange('pincode', v)} keyboardType="number-pad" style={{ borderBottomWidth: 1, marginBottom: 10 }} />
                  <TextInput placeholder="State" value={address.state} onChangeText={v => handleAddressChange('state', v)} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
                  <TextInput placeholder="City" value={address.city} onChangeText={v => handleAddressChange('city', v)} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
                  <TextInput placeholder="House Number" value={address.houseNumber} onChangeText={v => handleAddressChange('houseNumber', v)} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
                  <TextInput placeholder="Village" value={address.village} onChangeText={v => handleAddressChange('village', v)} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
                  <TextInput placeholder="Area Name" value={address.areaName} onChangeText={v => handleAddressChange('areaName', v)} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
                  <TextInput placeholder="Nearby" value={address.nearby} onChangeText={v => handleAddressChange('nearby', v)} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                    <TouchableOpacity onPress={() => setAddressModalVisible(false)} style={{ padding: 12, backgroundColor: '#ccc', borderRadius: 6, flex: 1, marginRight: 10 }}>
                      <Text style={{ textAlign: 'center', color: '#333' }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAddressSubmit} style={{ padding: 12, backgroundColor: '#4CAF50', borderRadius: 6, flex: 1 }}>
                      <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Save Address</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <View style={styles.emptyCart}>
          <Icon name="shopping-cart" size={64} color="#CCCCCC" />
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => navigation.navigate('Products')}>
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  headerButton: {
    width: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cartList: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    padding: 4,
  },
  quantityText: {
    paddingHorizontal: 12,
    fontSize: 16,
  },
  removeButton: {
    padding: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666666',
    marginTop: 16,
  },
  continueShoppingButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  continueShoppingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CartScreen;