import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { useNavigation, useRoute } from '@react-navigation/native';
import { orderAPI } from '../api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext';

const PaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { razorpayOptions, orderProducts, total, address, token, onSuccessScreen } = route.params || {};
  const { clearCart } = useCart();

  useEffect(() => {
    if (!razorpayOptions) {
      Alert.alert('Error', 'Payment options not provided');
      navigation.goBack();
      return;
    }
    RazorpayCheckout.open(razorpayOptions)
      .then(async (data) => {
        // On payment success, place the order in your backend
        try {
          const res = await orderAPI.placeOrder(
            {
              products: orderProducts,
              total,
              address,
              paymentId: data.razorpay_payment_id,
              razorpayOrderId: data.razorpay_order_id,
              signature: data.razorpay_signature,
            },
            token
          );
          if (res.success) {
            await clearCart();
            navigation.replace(onSuccessScreen || 'Success');
          } else {
            Alert.alert('Order Failed', res.message || 'Could not place order.');
            navigation.goBack();
          }
        } catch (error) {
          Alert.alert('Order Failed', error.message || 'Could not place order.');
          navigation.goBack();
        }
      })
      .catch((error) => {
        // handle failure
        Alert.alert('Payment Failed', error.description || 'Payment was not completed');
        navigation.goBack();
      });
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#4CAF50" />
      <Text style={{ marginTop: 20 }}>Processing Payment...</Text>
    </View>
  );
};

export default PaymentScreen; 