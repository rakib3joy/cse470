import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
//import { useAuth } from './AuthContext'; // Assuming you have an AuthContext

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { user, token } = useAuth(); // Get auth info
  
  // Initialize socket connection
  useEffect(() => {
    if (user && token) {
      const newSocket = io('http://localhost:5000', {
        auth: {
          token
        }
      });
      
      setSocket(newSocket);
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, token]);
  
  // Fetch all chats for the user
  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/chats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch chats');
      
      const data = await response.json();
      setChats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Create a new chat
  const createChat = async (participantId) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ participantId })
      });
      
      if (!response.ok) throw new Error('Failed to create chat');
      
      const newChat = await response.json();
      setChats([newChat, ...chats]);
      return newChat;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch a specific chat
  const fetchChatById = async (chatId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/chats/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch chat');
      
      const chat = await response.json();
      setCurrentChat(chat);
      
      // Join the chat room
      if (socket) {
        socket.emit('join-chat', chatId);
      }
      
      return chat;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Send a message
  const sendMessage = async (chatId, content) => {
    try {
      const response = await fetch('http://localhost:5000/api/chats/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ chatId, content })
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      const updatedChat = await response.json();
      
      // Update current chat with new message
      setCurrentChat(updatedChat);
      
      // Update the chat in the chats list
      setChats(chats.map(chat => 
        chat._id === chatId ? updatedChat : chat
      ));
      
      // Emit the message through socket
      if (socket) {
        socket.emit('send-message', {
          chatId,
          message: {
            sender: user._id,
            content,
            timestamp: new Date()
          },
          sender: {
            _id: user._id,
            name: user.name,
            profilePicture: user.profilePicture,
            userType: user.userType
          }
        });
      }
      
      return updatedChat;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };
  
  // Listen for incoming messages
  useEffect(() => {
    if (socket && currentChat) {
      const handleReceiveMessage = (data) => {
        if (data.chatId === currentChat._id) {
          setCurrentChat(prevChat => ({
            ...prevChat,
            messages: [...prevChat.messages, data.message]
          }));
          
          // Also update in the chats list
          setChats(prevChats => 
            prevChats.map(chat => {
              if (chat._id === data.chatId) {
                return {
                  ...chat,
                  messages: [...chat.messages, data.message]
                };
              }
              return chat;
            })
          );
        }
      };
      
      socket.on('receive-message', handleReceiveMessage);
      
      return () => {
        socket.off('receive-message', handleReceiveMessage);
      };
    }
  }, [socket, currentChat]);
  
  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        loading,
        error,
        fetchChats,
        createChat,
        fetchChatById,
        sendMessage,
        setCurrentChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);