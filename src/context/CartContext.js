import React, {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext();

export const CartProvider = ({children}) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart items from AsyncStorage when app starts
  useEffect(() => {
    loadCartItems();
  }, []);

  // Load cart items from AsyncStorage
  const loadCartItems = async () => {
    try {
      const savedCartItems = await AsyncStorage.getItem('cartItems');
      if (savedCartItems) {
        setCartItems(JSON.parse(savedCartItems));
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save cart items to AsyncStorage
  const saveCartItems = async items => {
    try {
      await AsyncStorage.setItem('cartItems', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart items:', error);
    }
  };

  const addToCart = async product => {
    const updatedItems = [...cartItems];
    const existingItem = updatedItems.find(item => item._id === product._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      updatedItems.push({...product, quantity: 1});
    }

    setCartItems(updatedItems);
    await saveCartItems(updatedItems);
  };

  const removeFromCart = async productId => {
    const updatedItems = cartItems.filter(item => item._id !== productId);
    setCartItems(updatedItems);
    await saveCartItems(updatedItems);
  };

  const updateQuantity = async (productId, quantity) => {
    const updatedItems = cartItems.map(item =>
      item._id === productId ? {...item, quantity} : item,
    );
    setCartItems(updatedItems);
    await saveCartItems(updatedItems);
  };

  const clearCart = async () => {
    setCartItems([]);
    await AsyncStorage.removeItem('cartItems');
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isLoading,
      }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);