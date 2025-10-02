import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAnonymousToken, loadAnonymousToken } from '../store/chatSlice';
import ChatInterface from '../components/ChatInterface';
import AnonymousIdManager from '../components/AnonymousIdManager';
import './ChatPage.css';
import '../App.css';

const ChatPage = () => {
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [showResumeInput, setShowResumeInput] = useState(false);
  const [resumeToken, setResumeToken] = useState('');
  const [error, setError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const dispatch = useDispatch();
  const { anonymousToken } = useSelector((state) => state.chat);

  useEffect(() => {
    dispatch(loadAnonymousToken());
    window.scrollTo(0, 0);
  }, [dispatch]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const startNewConversation = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://safevoice2-heuo.vercel.app/api/chat/conversations/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(setAnonymousToken(data.anonymousToken));
        setConversationId(data.conversationId);
        window.scrollTo(0, 0);
      } else {
        setError(data.error || 'Failed to start conversation');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resumeConversation = async () => {
    if (!resumeToken.trim()) {
      setError('Please enter your anonymous ID');
      return;
    }

    setResumeLoading(true);
    setError('');

    try {
      const response = await fetch('https://safevoice2-heuo.vercel.app/api/chat/conversations/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anonymousToken: resumeToken.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch(setAnonymousToken(data.anonymousToken));
        setConversationId(data.conversationId);
        window.scrollTo(0, 0);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid anonymous ID');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setResumeLoading(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="chat-page-container">
        <div className="chat-background-pattern"></div>
        
        {/* Header */}
        <header className="chat-page-header">
          <div className="chat-page-header-content">
            <a href="/" className="chat-page-logo">
              <span className="chat-logo-icon">🛡️</span>
              SafeVoice
            </a>
            
            {/* Desktop Navigation */}
            <nav className="chat-page-nav">
              <a href="/" className="chat-page-nav-link active">Home</a>
              <a href="/features" className="chat-page-nav-link">Features</a>
              <a href="/security" className="chat-page-nav-link">Security</a>
              <a href="/admin/login" className="chat-page-nav-link">Admin</a>
              <a href="/contact" className="chat-page-nav-link">Contact</a>
            </nav>

            {/* Mobile Menu Toggle */}
            <button 
              className="chat-mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              ☰
            </button>
          </div>
        </header>

        {/* Mobile Navigation Overlay */}
        <div 
          className={`chat-mobile-nav-overlay ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={closeMobileMenu}
        >
          <div 
            className={`chat-mobile-nav-content ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="chat-mobile-nav-close" onClick={closeMobileMenu}>
              ✕
            </button>
            
            <nav className="chat-mobile-nav-links">
              <a href="/" className="chat-mobile-nav-link active" onClick={closeMobileMenu}>
                Home
              </a>
              <a href="/features" className="chat-mobile-nav-link" onClick={closeMobileMenu}>
                Features
              </a>
              <a href="/security" className="chat-mobile-nav-link" onClick={closeMobileMenu}>
                Security
              </a>
              <a href="/admin/login" className="chat-mobile-nav-link" onClick={closeMobileMenu}>
                Admin
              </a>
              <a href="/contact" className="chat-mobile-nav-link" onClick={closeMobileMenu}>
                Contact
              </a>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <main className="chat-page-main">
          <section className="chat-page-hero">
            <div className="chat-page-hero-content">
              <div className="chat-hero-text">
                <h1 className="chat-hero-title">
                  Send an Anonymous <span className="chat-hero-highlight">Message</span>
                </h1>
                <p className="chat-hero-description">
                  SafeVoice provides a completely anonymous and secure platform for 
                  confidential reporting. Your identity is protected with industry-standard encryption.
                </p>
                
                {error && (
                  <div className="chat-error-alert">
                    <strong>Error:</strong> {error}
                  </div>
                )}

                <div className="chat-cta-section">
                  <button 
                    onClick={startNewConversation}
                    className="chat-primary-button"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="chat-spinner"></div>
                        Starting Secure Chat...
                      </>
                    ) : (
                      'Start New Anonymous Chat'
                    )}
                  </button>

                  <button 
                    onClick={() => setShowResumeInput(!showResumeInput)}
                    className="chat-secondary-button"
                  >
                    {showResumeInput ? 'Cancel' : 'Continue Previous Chat'}
                  </button>

                  {showResumeInput && (
                    <div className="chat-resume-section">
                      <div className="chat-resume-input-group">
                        <input
                          type="text"
                          value={resumeToken}
                          onChange={(e) => setResumeToken(e.target.value)}
                          placeholder="Enter your anonymous ID"
                          className="chat-resume-input"
                        />
                        <button 
                          onClick={resumeConversation}
                          className="chat-resume-button"
                          disabled={resumeLoading}
                        >
                          {resumeLoading ? 'Loading...' : 'Continue'}
                        </button>
                      </div>
                      <p className="chat-resume-help">
                        Enter the anonymous ID you received from a previous conversation
                      </p>
                    </div>
                  )}

                  <div className="chat-secure-badge">
                    <span className="chat-lock-icon">🔒</span>
                    End-to-End Encrypted
                  </div>
                </div>
              </div>
              
              <div className="chat-hero-visual">
                <div className="chat-visual-card chat-hover-card">
                  <div className="chat-card-icon">🎭</div>
                  <h3>Total Anonymity</h3>
                  <p>No registration, no personal data collected</p>
                </div>
                <div className="chat-visual-card chat-hover-card">
                  <div className="chat-card-icon">⚡</div>
                  <h3>Instant Connection</h3>
                  <p>Real-time chat with Admin</p>
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="chat-features-section">
            <h2 className="chat-features-title">Why Choose SafeVoice?</h2>
            <div className="chat-features-grid">
              <div className="chat-feature-card chat-hover-card">
                <div className="chat-feature-icon">🛡️</div>
                <h3>Industry-Standard Security</h3>
                <p>End-to-end encryption ensures your conversations remain completely private and secure from prying eyes.</p>
              </div>
              <div className="chat-feature-card chat-hover-card">
                <div className="chat-feature-icon">📱</div>
                <h3>Accessible Anywhere</h3>
                <p>Use SafeVoice on any device without installation. Your conversations sync seamlessly across platforms.</p>
              </div>
              <div className="chat-feature-card chat-hover-card">
                <div className="chat-feature-icon">💾</div>
                <h3>Save & Continue</h3>
                <p>Keep your anonymous ID to return to conversations anytime. Your chat history is preserved securely.</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <header className="chat-header">
        <div className="chat-header-content">
          <div className="chat-brand">
            <h1 className="chat-logo">SafeVoice</h1>
            <span className="chat-status">● Live Chat</span>
          </div>
          <AnonymousIdManager anonymousToken={anonymousToken} />
        </div>
      </header>
      
      {/* Chat Interface */}
      <ChatInterface 
        conversationId={conversationId} 
        anonymousToken={anonymousToken}
      />
    </div>
  );
};

export default ChatPage;