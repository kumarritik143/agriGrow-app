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
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import OrdersScreen from './screens/OrdersScreen'; // (to be created)
import { SafeAreaProvider } from 'react-native-safe-area-context';
import PaymentScreen from './screens/PaymentScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0, height: 60 },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'dashboard';
          else if (route.name === 'Products') iconName = 'shopping-bag';
          else if (route.name === 'ChatList') iconName = 'chat';
          else if (route.name === 'UserProfile') iconName = 'person';
          else if (route.name === 'Cart') iconName = 'shopping-cart';
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: { fontSize: 12, marginBottom: 0 },
      })}
    >
      <Tab.Screen name="Dashboard" component={AgrigrowDashboard} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Chat' }} />
      <Tab.Screen name="UserProfile" component={UserProfile} options={{ title: 'Profile' }} />
      <Tab.Screen name="Cart" component={CartScreen} />
    </Tab.Navigator>
  );
}

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
    const initializeApp = async () => {
      await checkUserToken();

      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    };

    initializeApp();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={authContext}>
        <CartProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{headerShown: false}}>
              {isLoading ? (
                <Stack.Screen name="Splash" component={SplashScreen} />
              ) : userToken ? (
                isAdmin ? (
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
                  <>
                    <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
                    <Stack.Screen name="ProductDetail" component={ProductDetail} />
                    <Stack.Screen name="Success" component={SuccessScreen} />
                    <Stack.Screen name="Chat" component={ChatScreen} />
                    <Stack.Screen name="Orders" component={OrdersScreen} />
                    <Stack.Screen name="Payment" component={PaymentScreen} options={{ presentation: 'modal', headerShown: false }} />
                  </>
                )
              ) : (
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
    </SafeAreaProvider>
  );
}
