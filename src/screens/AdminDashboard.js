import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import React, {useContext} from 'react';
import {AuthContext} from '../context/AuthContext';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width} = Dimensions.get('window');

const AdminFeatureCard = ({icon, title, description, onPress}) => (
  <TouchableOpacity style={styles.featureCard} onPress={onPress}>
    <Icon name={icon} size={40} color="#4CAF50" />
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDescription}>{description}</Text>
  </TouchableOpacity>
);

const AdminDashboard = () => {
  const {signOut} = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome, Admin!</Text>
          <Text style={styles.subtitle}>
            Manage your agricultural marketplace efficiently
          </Text>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Your Role</Text>
          <Text style={styles.descriptionText}>
            As an administrator of AgriGrow, you play a crucial role in
            maintaining the quality and efficiency of our agricultural
            marketplace. Your responsibilities include managing products,
            ensuring quality control, and maintaining the platform's integrity.
          </Text>
        </View>

        <View style={styles.responsibilitiesSection}>
          <Text style={styles.sectionTitle}>Key Responsibilities</Text>
          <View style={styles.responsibilityList}>
            <View style={styles.responsibilityItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.responsibilityText}>
                Manage and verify product listings
              </Text>
            </View>
            <View style={styles.responsibilityItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.responsibilityText}>
                Monitor product quality and authenticity
              </Text>
            </View>
            <View style={styles.responsibilityItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.responsibilityText}>
                Handle user inquiries and support
              </Text>
            </View>
            <View style={styles.responsibilityItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.responsibilityText}>
                Maintain platform security and integrity
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.featuresGrid}>
            <AdminFeatureCard
              icon="add-circle"
              title="Add Product"
              description="Add new agricultural products to the marketplace"
              onPress={() => navigation.navigate('AddProduct')}
            />
            <AdminFeatureCard
              icon="edit"
              title="Manage Products"
              description="View and manage existing products"
              onPress={() => navigation.navigate('ManageProducts')}
            />
            <AdminFeatureCard
              icon="chat"
              title="Customer Support"
              description="Chat with customers and provide support"
              onPress={() => navigation.navigate('ChatList')}
            />
          </View>
        </View>
      </ScrollView>
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
  logoutButton: {
    padding: 8,
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
  responsibilitiesSection: {
    marginBottom: 30,
  },
  responsibilityList: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
  },
  responsibilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  responsibilityText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  actionsSection: {
    marginBottom: 30,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AdminDashboard;
