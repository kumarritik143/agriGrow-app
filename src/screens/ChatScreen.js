import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../api/apiService';

const { width } = Dimensions.get('window');

const ChatScreen = ({ route }) => {
  const { participant } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigation = useNavigation();
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          console.log('Current user:', user);
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUser || !participant) {
      console.log('Cannot setup socket: missing user or participant data');
      return;
    }

    console.log('Setting up socket connection...');
    socketRef.current = io(API_URL.replace('/api', ''), {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      path: '/socket.io',
      forceNew: true,
      allowEIO3: true,
      query: {
        EIO: '3'
      }
    });
    
    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket.id);
      const roomId = [currentUser._id, participant._id].sort().join('_');
      console.log('Joining room:', roomId);
      socket.emit('joinRoom', roomId);
    });

    socket.on('newMessage', (message) => {
      console.log('New message received:', message);
      if (
        (message.senderId === participant._id && message.receiverId === currentUser._id) ||
        (message.receiverId === participant._id && message.senderId === currentUser._id)
      ) {
        console.log('Message is for this chat, updating state');
        setMessages(prevMessages => {
          const messageExists = prevMessages.some(m => m._id === message._id);
          if (!messageExists) {
            const updatedMessages = [...prevMessages, {
              ...message,
              sender: message.senderId,
              receiver: message.receiverId
            }];
            console.log('Updated messages count:', updatedMessages.length);
            return updatedMessages;
          }
          return prevMessages;
        });
        
        setTimeout(() => {
          if (flatListRef.current) {
            console.log('Scrolling to bottom');
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      } else {
        console.log('Message is not for this chat, ignoring');
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      console.log('Cleaning up socket connection');
      socket.disconnect();
    };
  }, [currentUser?._id, participant?._id]);

  useEffect(() => {
    if (!currentUser || !participant) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(
          `${API_URL}/chat/messages/${participant._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          setMessages(data.data);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }
      } catch (error) {
        console.error('Fetch messages error:', error);
        Alert.alert(
          'Error',
          'Failed to load messages. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentUser?._id, participant?._id]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) {
      console.log('Cannot send message: empty message or no current user');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create a temporary message object
      const tempMessage = {
        _id: Date.now().toString(), // Temporary ID
        sender: currentUser._id,
        receiver: participant._id,
        message: newMessage.trim(),
        timestamp: new Date(),
      };

      // Immediately add the message to the UI
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);

      // Send the message to the server
      const response = await fetch(`${API_URL}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: participant._id,
          message: newMessage.trim(),
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      // Remove the temporary message if sending failed
      setMessages(prevMessages => prevMessages.filter(m => m._id !== tempMessage._id));
    }
  };

  const renderMessage = ({ item }) => {
    const isSentByMe = item.sender.toString() === currentUser?._id.toString();

    return (
      <View
        style={[
          styles.messageRow,
          isSentByMe ? styles.sentMessageRow : styles.receivedMessageRow,
        ]}>
        <View
          style={[
            styles.messageContainer,
            isSentByMe ? styles.sentMessage : styles.receivedMessage,
          ]}>
          <Text
            style={[
              styles.messageText,
              isSentByMe ? styles.sentMessageText : styles.receivedMessageText,
            ]}>
            {item.message}
          </Text>
          <Text
            style={[
              styles.timestamp,
              isSentByMe ? styles.sentTimestamp : styles.receivedTimestamp,
            ]}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {participant.fullName || participant.email}
          </Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {participant.fullName || participant.email}
        </Text>
        <View style={styles.headerButton} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            multiline
            maxHeight={100}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}>
            <Icon
              name="send"
              size={24}
              color={newMessage.trim() ? '#FFFFFF' : '#A5D6A7'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    width: '100%',
    paddingHorizontal: 8,
  },
  sentMessageRow: {
    justifyContent: 'flex-end',
  },
  receivedMessageRow: {
    justifyContent: 'flex-start',
  },
  messageContainer: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  sentMessage: {
    backgroundColor: '#4CAF50',
    borderTopRightRadius: 4,
    marginLeft: 40,
  },
  receivedMessage: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    marginRight: 40,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  sentMessageText: {
    color: '#FFFFFF',
  },
  receivedMessageText: {
    color: '#333333',
  },
  timestamp: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  sentTimestamp: {
    color: '#E8F5E9',
  },
  receivedTimestamp: {
    color: '#9E9E9E',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: 8,
    paddingRight: 40,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E8F5E9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;