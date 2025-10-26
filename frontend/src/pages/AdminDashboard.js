import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ChatInterface from '../components/ChatInterface';
import './AdminDashboard.css';
import '../App.css';

const AdminDashboard = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const pollingIntervalRef = React.useRef(null);
  
  const { isAuthenticated, admin } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setShowSidebar(!mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    // Initial fetch
    fetchConversations();

    // Poll for updates every 3 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchConversations();
    }, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isAuthenticated, navigate]);

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - messageTime) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    
    return messageTime.toLocaleDateString();
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('https://safevoice2-heuo.vercel.app/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter out conversations without messages
        const conversationsWithMessages = data.filter(conv => 
          conv.last_message && conv.last_message.trim() !== ''
        );
        setConversations(conversationsWithMessages);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    if (conversation.unread_count > 0) {
      markAsRead(conversation.id);
    }
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`https://safevoice2-heuo.vercel.app/api/chat/conversations/${conversationId}/mark-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleBackToConversations = () => {
    setShowSidebar(true);
    setSelectedConversation(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    navigate('/admin/login');
  };

  const conversationsWithMessages = conversations.filter(conv => 
    conv.last_message && conv.last_message.trim() !== ''
  );
  
  const unreadCount = conversationsWithMessages.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loading-spinner"></div>
        <p className="admin-loading-text">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Header - Only show on desktop */}
      {!isMobile && (
        <header className="admin-dashboard-header">
          <div className="admin-header-left">
            <h1 className="admin-dashboard-logo">SafeVoice</h1>
            <span className="admin-dashboard-label">Admin Portal</span>
          </div>
          <div className="admin-header-right">
            <div className="admin-stats">
              <div className="admin-stat">
                <span className="admin-stat-number">{conversationsWithMessages.length}</span>
                <span className="admin-stat-label">Active Chats</span>
              </div>
              <div className="admin-stat">
                <span className="admin-stat-number">{unreadCount}</span>
                <span className="admin-stat-label">Unread</span>
              </div>
            </div>
            <button onClick={handleLogout} className="admin-logout-button">
              Sign Out
            </button>
          </div>
        </header>
      )}

      <div className="admin-dashboard-content">
        {/* Sidebar */}
        {(showSidebar || !selectedConversation) && (
          <div className="admin-sidebar">
            {/* Mobile Header */}
            {isMobile && (
              <div className="admin-mobile-header">
                <div className="admin-mobile-header-left">
                  <h1 className="admin-dashboard-logo">SafeVoice</h1>
                </div>
                <div className="admin-mobile-header-right">
                  <div className="admin-stats-mobile">
                    <span className="admin-stat-mobile">{conversationsWithMessages.length} chats</span>
                    {unreadCount > 0 && (
                      <span className="admin-unread-total">{unreadCount}</span>
                    )}
                  </div>
                  <button onClick={handleLogout} className="admin-logout-button-mobile">
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            <div className="admin-sidebar-header">
              <h2 className="admin-sidebar-title">Conversations</h2>
              <button onClick={fetchConversations} className="admin-refresh-button" title="Refresh">
                ↻
              </button>
            </div>

            <div className="admin-conversation-list">
              {conversationsWithMessages.length === 0 ? (
                <div className="admin-empty-state">
                  <div className="admin-empty-icon">💬</div>
                  <p>No active conversations</p>
                  <small>Conversations with messages will appear here</small>
                </div>
              ) : (
                conversationsWithMessages.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`
                      admin-conversation-card
                      ${selectedConversation?.id === conversation.id ? 'admin-conversation-card-active' : ''}
                      ${conversation.unread_count > 0 ? 'admin-conversation-card-unread' : ''}
                    `}
                  >
                    <div className="admin-conversation-avatar">
                      <div className="admin-avatar">
                        {conversation.anonymous_token ? conversation.anonymous_token.substring(0, 2).toUpperCase() : 'AN'}
                      </div>
                    </div>
                    
                    <div className="admin-conversation-content">
                      <div className="admin-conversation-header">
                        <div className="admin-user-name">
                          User {conversation.anonymous_token || 'Anonymous'}
                        </div>
                        <div className="admin-conversation-time">
                          {getTimeAgo(conversation.updated_at)}
                        </div>
                      </div>
                      
                      <div className="admin-conversation-preview">
                        <div className="admin-last-message">
                          {conversation.last_message.length > 35 
                            ? conversation.last_message.substring(0, 35) + '...' 
                            : conversation.last_message
                          }
                        </div>
                        {conversation.unread_count > 0 && (
                          <span className="admin-unread-badge">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className={`admin-main-content ${!selectedConversation ? 'admin-main-content-empty' : ''}`}>
          {selectedConversation ? (
            <div className="admin-chat-container">
              {/* Chat Header */}
              <div className="admin-chat-header">
                {isMobile && (
                  <button 
                    onClick={handleBackToConversations}
                    className="admin-back-button"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                  </button>
                )}
                <div className="admin-chat-user">
                  <div className="admin-chat-avatar">
                    {selectedConversation.anonymous_token ? selectedConversation.anonymous_token.substring(0, 2).toUpperCase() : 'AN'}
                  </div>
                  <div className="admin-chat-user-info">
                    <h3 className="admin-chat-user-name">
                      User {selectedConversation.anonymous_token || 'Anonymous'}
                    </h3>
                  </div>
                </div>
                <div className="admin-chat-actions">
                  <button className="admin-chat-action-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Chat Interface */}
              <div className="admin-chat-interface">
                <ChatInterface 
                  conversationId={selectedConversation.id} 
                  isAdmin={true}
                />
              </div>
            </div>
          ) : (
            <div className="admin-welcome-screen">
              <div className="admin-welcome-content">
                <div className="admin-welcome-icon">🔒</div>
                <h2 className="admin-welcome-title">SafeVoice Admin</h2>
                <p className="admin-welcome-text">
                  Select a conversation from the sidebar to start messaging.
                  All conversations are secure and anonymous.
                </p>
                <div className="admin-welcome-features">
                  <div className="admin-featuree">
                    <span className="admin-featuree-icon">🛡️</span>
                    <span>Secure & Encrypted</span>
                  </div>
                  <div className="admin-featuree">
                    <span className="admin-featuree-icon">⚡</span>
                    <span>Real-time Messaging</span>
                  </div>
                  <div className="admin-featuree">
                    <span className="admin-featuree-icon">🎨</span>
                    <span>SafeVoice Themed</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;