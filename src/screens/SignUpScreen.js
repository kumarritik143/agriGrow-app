import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authAPI} from '../api/apiService';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const handleSignUp = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const userData = {
        fullName,
        email,
        password,
      };

      const response = await authAPI.register(userData);

      await AsyncStorage.setItem('userToken', response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));

      setIsLoading(false);
      Alert.alert('Success', 'Account created successfully', [
        {
          text: 'OK',
  
        },
      ]);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', error.message || 'Failed to register');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <View style={styles.appBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Image
            source={require('../assets/images/back-arrow.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <View style={styles.appBarTitleContainer}>
        </View>
        <View style={styles.appBarRight} />
      </View>
      <View style={styles.greenCircleLeft} />
      <View style={styles.coralCircle} />
      <View style={styles.greenCircleRight} />

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Sign Up</Text>

        <Text style={styles.inputLabel}>Full name</Text>
        <TextInput
          style={[styles.input, styles.nameInput]}
          placeholder="Full name"
          value={fullName}
          onChangeText={(text) => {
            const alphabetOnly = text.replace(/[^a-zA-Z\s]/g, '');
            setFullName(alphabetOnly);
          }}
        />

        <Text style={styles.inputLabel}>E-mail</Text>
        <TextInput
          style={[styles.input, styles.emailInput]}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={togglePasswordVisibility}>
            <Image
              source={require('../assets/images/eye.png')}
              style={styles.eye}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.signUpButton}
          onPress={handleSignUp}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="FFFFFF" />
          ) : (
            <Text style={styles.signUpButtonText}>SIGN UP</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Sign up with</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require('../assets/images/facebook.png')}
              style={styles.socialIcon}
            />
            <Text style={styles.socialButtonText}>Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require('../assets/images/google.png')}
              style={styles.socialIcon}
            />
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  appBar: {
    flexDirection: 'row',
    height: 56,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 0,
    shadowOpacity: 0, 
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  appBarTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
  },
  appBarRight: {
    width: 40, 
  },
  greenCircleLeft: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    top: -15,
    left: -15,
  },
  coralCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF7F50',
    top: 10,
    left: 80,
  },
  greenCircleRight: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    top: -15,
    right: -15,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  nameInput: {
    borderColor: '#FF7F50',
  },
  emailInput: {
    borderColor: '#1E90FF',
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  passwordInput: {
    borderColor: '#4CAF50',
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  eye: {
    width: 24,
    height: 24,
  },
  signUpButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  loginText: {
    color: '#888888',
  },
  loginLink: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDDDDD',
  },
  dividerText: {
    paddingHorizontal: 10,
    color: '#888888',
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 10,
  },
  socialIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 16,
    color: '#000000',
  },
});

export default SignUpScreen;