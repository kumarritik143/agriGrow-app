import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';

const HomeScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['rgba(139, 69, 19, 0.7)', 'rgba(76, 175, 80, 0.6)']}
        style={styles.background}>

        <View style={styles.contentContainer}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.titleText}>AgriGrow</Text>

          <View style={styles.imageContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.subtitleText}>
            Make Easy Farming with fast{'\n'}delivery at your door.
          </Text>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>sign in with</Text>
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

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.buttonText}>Start with Email</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Start with Phone</Text>
          </TouchableOpacity>

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signInLink}>SignIn</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.signInContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('AdminLogin')}>
              <Text style={styles.signInLink}>Login Portal for Admin/Expert</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomIndicator}>
          <View style={styles.indicator} />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 24,
    color: 'white',
    fontWeight: '400',
  },
  titleText: {
    fontSize: 36,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  image: {
    width: 200,
    height: 150,
  },
  subtitleText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dividerText: {
    color: 'white',
    paddingHorizontal: 10,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  socialButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  socialButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 25,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  signInContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  signInText: {
    color: 'white',
    marginRight: 5,
  },
  signInLink: {
    color: 'white',
    fontWeight: 'bold',
  },
  bottomIndicator: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  indicator: {
    width: 60,
    height: 4,
    backgroundColor: 'white',
    borderRadius: 2,
  },
});

export default HomeScreen;