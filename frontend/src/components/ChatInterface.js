import React, { useState, useEffect, useRef } from 'react';
import { initSocket } from '../utils/socket';
import MediaUploader from './MediaUploader';
import useNotification from '../hooks/useNotification';
import Notification from './Notification';
import './ChatInterface.css'

const ChatInterface = ({ conversationId, isAdmin = false, anonymousToken = null }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const { notification, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    const newSocket = initSocket();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Load existing messages first
    fetchMessages();

    // Then join conversation room with proper data
    newSocket.emit('join_conversation', {
      conversationId: conversationId,
      anonymousToken: anonymousToken
    });

    // Socket event listeners
    newSocket.on('receive_message', (message) => {
      console.log('Received message via socket:', message);
      setMessages(prev => [...prev, message]);
      
      // Auto-scroll to bottom when new message arrives
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      // Auto-mark as read if admin is viewing
      if (isAdmin && !message.is_admin_message) {
        markMessageAsRead(message.id);
      }
    });

    // Listen for read receipts
    newSocket.on('message_read', (data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, is_read: true, read_at: data.readAt } : msg
      ));
    });

    // Typing indicators
    const handleUserTyping = (data) => {
      // Don't show typing for current user
      if ((data.isAdmin && isAdmin) || (data.anonymousToken === anonymousToken)) {
        return;
      }
      
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(data.isAdmin ? 'admin' : 'user');
        return newSet;
      });
    };

    const handleUserStopTyping = (data) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.isAdmin ? 'admin' : 'user');
        return newSet;
      });
    };

    newSocket.on('user_typing', handleUserTyping);
    newSocket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      newSocket.off('user_typing', handleUserTyping);
      newSocket.off('user_stop_typing', handleUserStopTyping);
      newSocket.disconnect();
    };
  }, [conversationId, isAdmin, anonymousToken]);

  useEffect(() => {
    // Auto-scroll to bottom when component mounts or messages change
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/chat/conversations/${conversationId}/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showNotification('Failed to load messages', 'error');
    }
  };

  const markMessageAsRead = async (messageId) => {
    if (!isAdmin) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/chat/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Emit read receipt via socket
        socket.emit('message_read', {
          messageId: messageId,
          conversationId: conversationId,
          readAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  };

  const handleFileSelect = async (file) => {
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);
    formData.append('anonymousToken', anonymousToken || '');
    formData.append('isAdminMessage', isAdmin.toString());
    
    let messageType = 'file';
    if (file.type.startsWith('image/')) messageType = 'image';
    else if (file.type.startsWith('video/')) messageType = 'video';
    else if (file.type.startsWith('audio/')) messageType = 'audio';
    
    formData.append('messageType', messageType);

    try {
      const response = await fetch('http://localhost:5000/api/uploads/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const savedMessage = await response.json();
        setMessages(prev => [...prev, savedMessage]);
        
        if (socket) {
          socket.emit('send_message', {
            ...savedMessage,
            conversationId: conversationId
          });
        }
        
        scrollToBottom();
        showNotification('File uploaded successfully!', 'success', 3000);
      } else {
        const error = await response.json();
        showNotification(`Upload failed: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('Upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      content: newMessage.trim(),
      isAdminMessage: isAdmin,
      anonymousToken: isAdmin ? null : anonymousToken
    };

    try {
      const response = await fetch(`http://localhost:5000/api/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const savedMessage = await response.json();
        setMessages(prev => [...prev, savedMessage]);
        
        if (socket) {
          socket.emit('send_message', {
            ...savedMessage,
            conversationId: conversationId
          });
        }
        
        setNewMessage('');
        
        // Clear typing when sending message
        if (socket && typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          socket.emit('typing_stop', { 
            conversationId,
            isAdmin: isAdmin,
            anonymousToken: anonymousToken
          });
        }
        
        // Auto-scroll to bottom after sending
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('Network error. Please check your connection.', 'error');
    }
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing_start', { 
        conversationId,
        isAdmin: isAdmin,
        anonymousToken: anonymousToken
      });
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { 
          conversationId,
          isAdmin: isAdmin,
          anonymousToken: anonymousToken
        });
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // Clear typing when sending message
      if (socket && typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socket.emit('typing_stop', { 
          conversationId,
          isAdmin: isAdmin,
          anonymousToken: anonymousToken
        });
      }
      
      sendMessage(e);
    } else {
      handleTyping();
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Render different content based on message type
  const renderMessageContent = (message) => {
    if (message.message_type === 'text' || !message.message_type) {
      return (
        <div className="message-text-content">
          {message.content.split('\n').map((line, i) => (
            <div key={i} className="message-line">
              {line}
            </div>
          ))}
        </div>
      );
    }

    const getFileIcon = (mimeType, messageType) => {
      if (messageType === 'image') return <ImageFileIcon />;
      if (messageType === 'video') return <VideoFileIcon />;
      if (messageType === 'audio') return <AudioFileIcon />;
      
      // Document types
      if (mimeType.includes('pdf')) return <PDFIcon />;
      if (mimeType.includes('word') || mimeType.includes('document')) return <WordIcon />;
      if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <ExcelIcon />;
      if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return <PowerPointIcon />;
      
      return <GenericFileIcon />;
    };

    switch (message.message_type) {
      case 'image':
        return (
          <div className="media-container image-container">
            <img 
              src={`http://localhost:5000${message.media_url}`} 
              alt={message.file_name}
              className="media-image"
              onClick={() => window.open(`http://localhost:5000${message.media_url}`, '_blank')}
            />
            <div className="file-info">
              <div className="file-name">{message.file_name}</div>
              <div className="file-size">{(message.file_size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="media-container video-container">
            <video 
              controls 
              className="media-video"
              preload="metadata"
            >
              <source src={`http://localhost:5000${message.media_url}`} type={message.mime_type} />
              Your browser does not support the video tag.
            </video>
            <div className="file-info">
              <div className="file-name">{message.file_name}</div>
              <div className="file-size">{(message.file_size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
          </div>
        );
      
      case 'audio':
        return (
          <div className="audio-container">
            <div className="audio-icon">
              <AudioMessageIcon />
            </div>
            <audio 
              controls 
              className="media-audio"
            >
              <source src={`http://localhost:5000${message.media_url}`} type={message.mime_type} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      
      default:
        return (
          <div className="file-container">
            <div className="file-icon">
              {getFileIcon(message.mime_type, message.message_type)}
            </div>
            <div className="file-info">
              <div className="file-name">{message.file_name}</div>
              <div className="file-size">
                {(message.file_size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            <a 
              href={`http://localhost:5000${message.media_url}`} 
              download={message.file_name}
              className="download-button"
            >
              <DownloadIcon />
            </a>
          </div>
        );
    }
  };

  // WhatsApp-style read receipt component
  const ReadReceipt = ({ message, isOwnMessage }) => {
    if (!isOwnMessage) return null;

    return (
      <div className="read-receipt">
        <span className="checkmarks">
          <span className={message.is_read ? "checkmark-read" : "checkmark-sent"}>
            ✓
          </span>
          <span className={message.is_read ? "checkmark-read" : "checkmark-sent"}>
            ✓
          </span>
        </span>
        {message.is_read && (
          <span className="read-time">
            Read {formatMessageTime(message.read_at)}
          </span>
        )}
      </div>
    );
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div className="chat-interface">
      {/* Show notification if exists */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={hideNotification}
        />
      )}
      
      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="messages-container"
      >
        {Object.keys(messageGroups).length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-icon">💬</div>
            <p>No messages yet</p>
            <small>Start the conversation by sending a message</small>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, dateMessages]) => (
            <div key={date} className="message-group">
              {/* Date Separator */}
              <div className="date-separator">
                {formatMessageDate(dateMessages[0].created_at)}
              </div>
              
              {/* Messages for this date */}
              {dateMessages.map((message, index) => (
                <div
                  key={message.id}
                  className={`message-wrapper ${
                    message.is_admin_message ? 'admin-message-wrapper' : 'user-message-wrapper'
                  }`}
                >
                  <div
                    className={`message-bubble ${
                      message.is_admin_message ? 'admin-message-bubble' : 'user-message-bubble'
                    }`}
                  >
                    <div className={`message-content ${
                      message.is_admin_message ? 'admin-message-content' : 'user-message-content'
                    }`}>
                      {renderMessageContent(message)}
                    </div>
                    <div className="message-footer">
                      <span className={`message-time ${
                        message.is_admin_message ? 'admin-message-time' : 'user-message-time'
                      }`}>
                        {formatMessageTime(message.created_at)}
                      </span>
                      <ReadReceipt message={message} isOwnMessage={message.is_admin_message === isAdmin} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
            <span className="typing-text">
              {Array.from(typingUsers).map(user => 
                user === 'admin' ? 'Admin is typing...' : 'User is typing...'
              ).join(', ')}
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} className="messages-end" />
      </div>

      {/* Input Area - Clean SafeVoice Style */}
      <form onSubmit={sendMessage} className="message-input-container">
        <div className="message-input-wrapper">
          {/* Attachment Button */}
          <MediaUploader 
            onFileSelect={handleFileSelect}
            conversationId={conversationId}
            anonymousToken={anonymousToken}
            isAdmin={isAdmin}
          />
          
          {/* Message Input */}
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type a message"
            className="message-input"
            disabled={!isConnected || uploading}
            autoFocus={true}
          />

          {/* Send Button - Always show send icon */}
          <button 
            type="submit" 
            className={`send-button ${!isConnected || (!newMessage.trim() && !uploading) ? 'send-button-disabled' : ''}`}
            disabled={!isConnected || (!newMessage.trim() && !uploading)}
          >
            {uploading ? (
              <div className="upload-spinner"></div>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            )}
          </button>
        </div>
        
        {!isConnected && (
          <div className="connection-warning">
            🔄 Connecting to chat server...
          </div>
        )}
      </form>
    </div>
  );
};

// SafeVoice Style SVG Icons for file types
const ImageFileIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#667eea">
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
  </svg>
);

const VideoFileIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#667eea">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
  </svg>
);

const AudioFileIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#667eea">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
);

const PDFIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#e74c3c">
    <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/>
  </svg>
);

const WordIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#2b579a">
    <path d="M6 2h8l6 6v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2zm7 1.5V9h5.5L13 3.5zM8 13h8v2H8v-2zm0 4h8v2H8v-2z"/>
  </svg>
);

const ExcelIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#217346">
    <path d="M6 2h8l6 6v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2zm7 1.5V9h5.5L13 3.5zM8 13h2v2H8v-2zm0 4h2v2H8v-2zm4-4h6v2h-6v-2zm0 4h6v2h-6v-2z"/>
  </svg>
);

const PowerPointIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#d24726">
    <path d="M6 2h8l6 6v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2zm7 1.5V9h5.5L13 3.5zM8 13h3v2H8v-2zm0 4h3v2H8v-2z"/>
  </svg>
);

const GenericFileIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#666">
    <path d="M6 2h8l6 6v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2zm7 1.5V9h5.5L13 3.5z"/>
  </svg>
);

const AudioMessageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#667eea">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
  </svg>
);

export default ChatInterface;