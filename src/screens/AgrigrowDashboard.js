import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
  ScrollView,
  Image,
  Dimensions,
  DrawerLayoutAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {authAPI} from '../api/apiService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AuthContext} from '../context/AuthContext';

const {width} = Dimensions.get('window');

const FeatureCard = ({icon, title, description, onPress}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Icon name={icon} size={40} color="#4CAF50" />
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardDescription}>{description}</Text>
  </TouchableOpacity>
);

const AgrigrowDashboard = () => {
  const navigation = useNavigation();
  const {signOut} = React.useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnimation = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const storedUserData = await AsyncStorage.getItem('userData');

      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }

      if (token) {
        const response = await authAPI.getCurrentUser(token);
        if (response.success) {
          setUserData(response.user);
          await AsyncStorage.setItem('userData', JSON.stringify(response.user));
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.log('Error fetching user data:', error);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const toggleMenu = () => {
    const toValue = menuOpen ? -300 : 0;
    setMenuOpen(!menuOpen);
    Animated.spring(menuAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu}>
          <Icon name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AgriGrow</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('ChatList')}>
            <Icon name="chat" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Cart')}>
            <Icon name="shopping-cart" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome to AgriGrow, {userData?.fullName || 'User'}!
          </Text>
          <Text style={styles.subtitle}>
            Your one-stop solution for agricultural needs
          </Text>
        </View>

        {/* App Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>About AgriGrow</Text>
          <Text style={styles.descriptionText}>
            AgriGrow is a comprehensive agricultural platform designed to connect
            farmers with high-quality agricultural products and resources. Our
            mission is to make farming more accessible and efficient through
            technology.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.cardsContainer}>
            <FeatureCard
              icon="shopping-bag"
              title="Products"
              description="Browse our agricultural products"
              onPress={() => navigation.navigate('Products')}
            />
            <FeatureCard
              icon="chat"
              title="Chat Support"
              description="Get help from our experts"
              onPress={() => navigation.navigate('ChatList')}
            />
            <FeatureCard
              icon="person"
              title="Profile"
              description="View and edit your profile"
              onPress={() => navigation.navigate('UserProfile')}
            />
            <FeatureCard
              icon="shopping-cart"
              title="Cart"
              description="View your shopping cart"
              onPress={() => navigation.navigate('Cart')}
            />
          </View>
        </View>
      </ScrollView>

      {/* Side Menu */}
      <Animated.View
        style={[styles.menu, {transform: [{translateX: menuAnimation}]}]}>
        <View style={styles.menuHeader}>
          <View>
            <Text style={styles.menuTitle}>Menu</Text>
            <Text style={styles.menuUsername}>
              Welcome! {userData ? userData.fullName : 'User'}
            </Text>
          </View>
          <TouchableOpacity onPress={toggleMenu}>
            <Icon name="close" size={30} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleMenu();
            navigation.navigate('UserProfile');
          }}>
          <Icon name="person" size={24} color="#FFFFFF" />
          <Text style={styles.menuItemText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleMenu();
            navigation.navigate('Products');
          }}>
          <Icon name="shopping-basket" size={24} color="#FFFFFF" />
          <Text style={styles.menuItemText}>Products</Text>
        </TouchableOpacity>

        {/* Add Logout Button at the bottom */}
        <TouchableOpacity
          style={[styles.menuItem, styles.logoutButton]}
          onPress={() => {
            toggleMenu();
            handleLogout();
          }}>
          <Icon name="logout" size={24} color="#FFFFFF" />
          <Text style={styles.menuItemText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Overlay */}
      {menuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 15,
    padding: 5,
  },
  scrollContent: {
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  descriptionSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: 30,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  menu: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#4CAF50',
    zIndex: 1001,
    paddingTop: Platform.OS === 'ios' ? 50 : 0,
    flexDirection: 'column',
    height: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 2, height: 0},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuUsername: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 16,
  },
  logoutButton: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
});

export default AgrigrowDashboard;