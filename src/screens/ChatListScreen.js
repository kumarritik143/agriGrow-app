import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {chatAPI} from '../api/apiService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ChatListScreen = () => {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'android' ? (insets.top || StatusBar.currentHeight || 0) : insets.top;
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching participants...');
      const response = await chatAPI.getChatParticipants();
      console.log('Raw API response:', JSON.stringify(response, null, 2));

      if (response.success) {
        console.log(
          'Setting participants:',
          JSON.stringify(response.data, null, 2),
        );
        setParticipants(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch participants');
      }
    } catch (error) {
      console.error('Fetch participants error:', error);
      setError(error.message || 'Failed to fetch participants');
      Alert.alert(
        'Error',
        'Failed to load chat participants. Please try again later.',
        [
          {
            text: 'Retry',
            onPress: () => fetchParticipants(),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ],
      );
    } finally {
      setLoading(false);
    }
  };

  const renderParticipant = ({item}) => {
    console.log('Rendering participant:', JSON.stringify(item, null, 2));

    const displayName = item.name || item.email;
    console.log('Display name determined:', {
      name: item.name,
      email: item.email,
      isAdmin: item.isAdmin,
      finalDisplayName: displayName,
    });

    return (
      <TouchableOpacity
        style={styles.participantCard}
        onPress={() => navigation.navigate('Chat', {participant: item})}>
        <View style={styles.avatarContainer}>
          {item.profileImage ? (
            <Image source={{uri: item.profileImage}} style={styles.avatar} />
          ) : (
            <Icon name="person" size={30} color="#666666" />
          )}
        </View>
        <View style={styles.participantInfo}>
          <Text style={styles.participantName}>{displayName}</Text>
          {item.isAdmin && <Text style={styles.adminLabel}>Admin</Text>}
        </View>
        <Icon name="chevron-right" size={24} color="#666666" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={styles.headerButton} />
      </View>

      <FlatList
        data={participants}
        renderItem={renderParticipant}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="chat" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>No chats available</Text>
          </View>
        )}
      />
    </View>
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
    paddingHorizontal: 12,
  },
  headerButton: {
    width: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  list: {
    padding: 16,
  },
  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  adminLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
});

export default ChatListScreen;
