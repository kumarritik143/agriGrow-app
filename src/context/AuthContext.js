import React, {useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';
import {authAPI} from '../api/apiService'; // Change this line to import from apiService

export const AuthContext = React.createContext();

export const AuthProvider = ({children}) => {
  const [userToken, setUserToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const signOut = async () => {
    try {
      // Store the user profile image URL before clearing data
      const userData = await AsyncStorage.getItem('userData');
      const {profileImage} = JSON.parse(userData || '{}');

      // Clear auth data
      await AsyncStorage.multiRemove(['userToken', 'userData']);

      // If there was a profile image, store it separately
      if (profileImage) {
        await AsyncStorage.setItem('lastProfileImage', profileImage);
      }

      setUserToken(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await authAPI.login({email, password});

      if (response.success) {
        const {token, user} = response;

        // Get the last profile image if it exists
        const lastProfileImage = await AsyncStorage.getItem('lastProfileImage');

        // Merge with new user data
        const userData = {
          ...user,
          profileImage: user.profileImage || lastProfileImage || '',
        };

        await AsyncStorage.multiSet([
          ['userToken', token],
          ['userData', JSON.stringify(userData)],
        ]);

        setUserToken(token);
        return true;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert('Error', error.message || 'Failed to sign in');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{userToken, isAdmin, signIn, signOut}}>
      {children}
    </AuthContext.Provider>
  );
};