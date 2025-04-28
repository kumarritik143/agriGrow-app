import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import SplashScreen from './screens/SplashScreen';
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import AgrigrowDashboard from './screens/AgrigrowDashboard';
import ProductsScreen from './screens/ProductsScreen';
import {AuthContext} from './context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminLogin from './screens/AdminLogin';
import AdminDashboard from './screens/AdminDashboard';
import {set} from 'mongoose';
import AddProducts from './screens/AddProducts';
import UserProfile from './screens/UserProfile';
import ProductDetail from './screens/ProductDetail';
import CartScreen from './screens/CartScreen';
import {CartProvider} from './context/CartContext';
import ManageProducts from './screens/ManageProducts';
import EditProduct from './screens/EditProduct';
import SuccessScreen from './screens/SuccessScreen';

import ChatListScreen from './screens/ChatListScreen';
import ChatScreen from './screens/ChatScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkUserToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      if (token && userData) {
        const parsedUserData = JSON.parse(userData);
        setUserToken(token);
        setIsAdmin(parsedUserData.isAdmin || false);
      }
    } catch (error) {
      console.log('Error checking token:', error);
    }
  };

  const authContext = React.useMemo(
    () => ({
      signIn: async (token, userData) => {
        try {
          await AsyncStorage.setItem('userToken', token);
          if (userData) {
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            setIsAdmin(userData.isAdmin || false);
          }
          setUserToken(token);
        } catch (e) {
          console.log('Error signing in:', e);
        }
      },
      signOut: async () => {
        try {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userData');
          setUserToken(null);
          setIsAdmin(false);
        } catch (e) {
          console.log('Error signing out:', e);
        }
      },
      isAdmin,
    }),
    [isAdmin],
  );
  useEffect(() => {
    // Check for user token AND show splash screen
    const initializeApp = async () => {
      await checkUserToken(); // This was missing

      // Still show splash for minimum 2 seconds
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    };

    initializeApp();
  }, []);

  return (
    <AuthContext.Provider value={authContext}>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{headerShown: false}}>
            {isLoading ? (
              <Stack.Screen name="Splash" component={SplashScreen} />
            ) : userToken ? (
              isAdmin ? (
                // Admin is logged in
                <>
                  <Stack.Screen
                    name="AdminDashboard"
                    component={AdminDashboard}
                    options={{gestureEnabled: false}}
                  />
                  <Stack.Screen name="AddProduct" component={AddProducts} />
                  <Stack.Screen
                    name="ManageProducts"
                    component={ManageProducts}
                  />
                  <Stack.Screen name="EditProduct" component={EditProduct} />
                  <Stack.Screen name="ChatList" component={ChatListScreen} />
                  <Stack.Screen name="Chat" component={ChatScreen} />
                </>
              ) : (
                // Regular user is logged in
                <>
                  <Stack.Screen
                    name="AgrigrowDashboard"
                    component={AgrigrowDashboard}
                  />
                  <Stack.Screen name="Products" component={ProductsScreen} />
                  <Stack.Screen name="UserProfile" component={UserProfile} />
                  <Stack.Screen
                    name="ProductDetail"
                    component={ProductDetail}
                  />
                  <Stack.Screen name="Cart" component={CartScreen} />
                  <Stack.Screen name="Success" component={SuccessScreen} />
                  <Stack.Screen name="ChatList" component={ChatListScreen} />
                  <Stack.Screen name="Chat" component={ChatScreen} />
                </>
              )
            ) : (
              // Not logged in
              <>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="AdminLogin" component={AdminLogin} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </AuthContext.Provider>
  );
}
