import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        style={styles.background}
      >
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>AgriGrow</Text>
        <Text style={styles.subtitle}>Farmer Friendly App</Text>
        <View style={styles.progressBar}>
          <View style={styles.progress} />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 100,
  },
  progressBar: {
    width: '60%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'absolute',
    bottom: 50,
  },
  progress: {
    width: '70%',
    height: 4,
    backgroundColor: 'white',
    borderRadius: 2,
  },
});

export default SplashScreen;