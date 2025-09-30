import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './FeaturesPage.css';
import '../App.css';

const FeaturesPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const features = [
    {
      icon: '🛡️',
      title: 'Industry-Standard Encryption',
      description: 'Your conversations are protected with end-to-end encryption that ensures only you and the recipient can read them.',
      details: ['AES-256 encryption', 'Perfect forward secrecy', 'Zero-knowledge architecture']
    },
    {
      icon: '🎭',
      title: 'Complete Anonymity',
      description: 'No personal information required. Start chatting immediately without registration or login.',
      details: ['No email required', 'No phone number', 'No tracking cookies']
    },
    {
      icon: '💾',
      title: 'Save & Resume',
      description: 'Continue your conversations anytime by saving your anonymous ID. Your chat history is preserved securely.',
      details: ['Unlimited conversation history', 'Cross-device compatibility', 'Auto-expire after 30 days']
    },
    {
      icon: '⚡',
      title: 'Real-time Chat',
      description: 'Instant messaging with our support team. Get immediate responses without delays.',
      details: ['Live typing indicators', 'File sharing support', '24/7 availability']
    },
    {
      icon: '📱',
      title: 'Device Agnostic',
      description: 'Access SafeVoice from any device with a web browser. No app installation required.',
      details: ['Mobile responsive', 'Tablet optimized', 'Desktop compatible']
    },
    {
      icon: '🔐',
      title: 'Self-Destructing Messages',
      description: 'Optional message expiration ensures sensitive information doesn\'t persist indefinitely.',
      details: ['Custom expiration times', 'Manual deletion option', 'Auto-cleanup']
    }
  ];

  const securityFeatures = [
    {
      icon: '🔒',
      title: 'End-to-End Encryption',
      description: 'Messages are encrypted on your device and only decrypted on the recipient\'s device.'
    },
    {
      icon: '🌐',
      title: 'Secure Servers',
      description: 'Our servers are hosted in secure data centers with multiple layers of physical and digital security.'
    },
    {
      icon: '📜',
      title: 'Compliance Ready',
      description: 'Designed to meet industry standards for secure communication and data protection.'
    }
  ];

  return (
    <div className="features-page">
      {/* Header */}
      <header className="features-header">
        <div className="features-header-content">
          <Link to="/" className="features-logo">SafeVoice</Link>
          
          {/* Desktop Navigation */}
          <nav className="features-nav">
            <Link to="/" className="features-nav-link">Home</Link>
            <Link to="/features" className="features-nav-link active">Features</Link>
            <Link to="/security" className="features-nav-link">Security</Link>
            <Link to="/admin/login" className="features-nav-link">Admin</Link>
            <Link to="/contact" className="features-nav-link">Contact</Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="features-mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div 
        className={`features-mobile-nav-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      >
        <div 
          className={`features-mobile-nav-content ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="features-mobile-nav-close" onClick={closeMobileMenu}>
            ✕
          </button>
          
          <nav className="features-mobile-nav-links">
            <Link to="/" className="features-mobile-nav-link" onClick={closeMobileMenu}>
              Home
            </Link>
            <Link to="/features" className="features-mobile-nav-link active" onClick={closeMobileMenu}>
              Features
            </Link>
            <Link to="/security" className="features-mobile-nav-link" onClick={closeMobileMenu}>
              Security
            </Link>
            <Link to="/admin/login" className="features-mobile-nav-link" onClick={closeMobileMenu}>
              Admin
            </Link>
            <Link to="/contact" className="features-mobile-nav-link" onClick={closeMobileMenu}>
              Contact
            </Link>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="features-hero">
        <div className="features-hero-content">
          <h1 className="features-hero-title">
            Powerful Features for <span className="hero-highlight">Secure Communication</span>
          </h1>
          <p className="features-hero-description">
            SafeVoice combines cutting-edge technology with user-friendly design to provide 
            the most secure anonymous chat platform available.
          </p>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="main-features">
        <div className="container">
          <h2 className="section-title">Core Features</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <ul className="feature-details">
                  {feature.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Highlights */}
      <section className="security-highlights">
        <div className="container">
          <h2 className="section-title">Built-in Security</h2>
          <div className="security-grid">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="security-card">
                <div className="security-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="features-cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of users who trust SafeVoice for their confidential communications.</p>
          <div className="cta-buttons">
            <Link to="/contact" className="cta-button primary">Get in Touch</Link>
            <Link to="/security" className="cta-button secondary">Learn About Security</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;