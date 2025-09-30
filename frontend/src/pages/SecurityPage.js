import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SecurityPage.css';

const SecurityPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const securityLayers = [
    {
      icon: '🔐',
      title: 'End-to-End Encryption',
      description: 'Your messages are encrypted before they leave your device and can only be decrypted by the intended recipient.',
      features: [
        'AES-256 encryption standard',
        'Perfect forward secrecy',
        'Zero-knowledge proof system'
      ]
    },
    {
      icon: '🆔',
      title: 'Anonymous Authentication',
      description: 'No personal information is ever collected. Your identity remains completely private.',
      features: [
        'No registration required',
        'No email or phone verification',
        'Automatic anonymous token generation'
      ]
    },
    {
      icon: '🗄️',
      title: 'Secure Data Storage',
      description: 'All data is encrypted at rest using military-grade encryption algorithms.',
      features: [
        'Encrypted database storage',
        'Regular security audits',
        'Automated backup encryption'
      ]
    },
    {
      icon: '🌐',
      title: 'Network Security',
      description: 'All communications are protected with TLS 1.3 and additional security layers.',
      features: [
        'TLS 1.3 encryption',
        'DDoS protection',
        'Secure socket layers'
      ]
    },
    {
      icon: '⚡',
      title: 'Real-time Protection',
      description: 'Continuous monitoring and protection against emerging threats.',
      features: [
        'Real-time threat detection',
        'Automatic security updates',
        '24/7 security monitoring'
      ]
    },
    {
      icon: '📜',
      title: 'Compliance & Standards',
      description: 'Built to meet industry security standards and compliance requirements.',
      features: [
        'GDPR compliant architecture',
        'Industry best practices',
        'Regular compliance audits'
      ]
    }
  ];

  return (
    <div className="security-page">
      {/* Header */}
      <header className="security-header">
        <div className="security-header-content">
          <Link to="/" className="security-logo">SafeVoice</Link>
          
          {/* Desktop Navigation */}
          <nav className="security-nav">
            <Link to="/" className="security-nav-link">Home</Link>
            <Link to="/features" className="security-nav-link">Features</Link>
            <Link to="/security" className="security-nav-link active">Security</Link>
            <Link to="/admin/login" className="security-nav-link">Admin</Link>
            <Link to="/contact" className="security-nav-link">Contact</Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="security-mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div 
        className={`security-mobile-nav-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      >
        <div 
          className={`security-mobile-nav-content ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="security-mobile-nav-close" onClick={closeMobileMenu}>
            ✕
          </button>
          
          <nav className="security-mobile-nav-links">
            <Link to="/" className="security-mobile-nav-link" onClick={closeMobileMenu}>
              Home
            </Link>
            <Link to="/features" className="security-mobile-nav-link" onClick={closeMobileMenu}>
              Features
            </Link>
            <Link to="/security" className="security-mobile-nav-link active" onClick={closeMobileMenu}>
              Security
            </Link>
            <Link to="/admin/login" className="security-mobile-nav-link" onClick={closeMobileMenu}>
              Admin
            </Link>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="security-hero">
        <div className="security-hero-content">
          <h1 className="security-hero-title">
            Enterprise-Grade <span className="security-highlight">Security</span>
          </h1>
          <p className="security-hero-description">
            Your privacy and security are our top priority. SafeVoice uses industry-standard encryption 
            and security protocols to ensure your conversations remain completely confidential.
          </p>
          <div className="security-badges">
            <span className="security-badge">🔒 End-to-End Encrypted</span>
            <span className="security-badge">🛡️ Zero-Knowledge</span>
            <span className="security-badge">⚡ TLS 1.3</span>
          </div>
        </div>
      </section>

      {/* Security Layers */}
      <section className="security-layers">
        <div className="container">
          <h2 className="section-title">Security Architecture</h2>
          <div className="security-grid">
            {securityLayers.map((layer, index) => (
              <div key={index} className="security-layer-card">
                <div className="layer-icon">{layer.icon}</div>
                <h3 className="layer-title">{layer.title}</h3>
                <p className="layer-description">{layer.description}</p>
                <ul className="layer-features">
                  {layer.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Commitment */}
      <section className="security-commitment">
        <div className="container">
          <div className="commitment-content">
            <h2>Our Security Commitment</h2>
            <p>
              We believe that privacy is a fundamental human right. That's why we've built SafeVoice 
              with security at its core. Our team continuously works to maintain the highest security 
              standards and protect your confidential communications.
            </p>
            <div className="commitment-points">
              <div className="commitment-point">
                <span className="point-icon">🔍</span>
                <div>
                  <h4>Transparent Security</h4>
                  <p>We're open about our security practices and regularly undergo independent audits.</p>
                </div>
              </div>
              <div className="commitment-point">
                <span className="point-icon">🔄</span>
                <div>
                  <h4>Continuous Improvement</h4>
                  <p>Our security measures are constantly updated to address emerging threats.</p>
                </div>
              </div>
              <div className="commitment-point">
                <span className="point-icon">👥</span>
                <div>
                  <h4>Community Trust</h4>
                  <p>We value the trust of our users and are committed to maintaining it.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="security-cta">
        <div className="container">
          <h2>Ready to Experience Secure Communication?</h2>
          <p>Join thousands of users who trust SafeVoice with their most sensitive conversations.</p>
          <div className="cta-buttons">
            <Link to="/contact" className="cta-button primary">Get in Touch</Link>
            <Link to="/features" className="cta-button secondary">View Features</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SecurityPage;