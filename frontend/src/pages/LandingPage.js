import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="landing-page-container">
      <div className="landing-background-pattern"></div>
      <div className="landing-floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      {/* Header */}
      <header className="landing-page-header">
        <div className="landing-page-header-content">
          <Link to="/" className="landing-page-logo">
            <span className="logo-icon">🛡️</span>
            SafeVoice
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="landing-page-nav">
            <Link to="/" className="landing-page-nav-link">Home</Link>
            <Link to="/features" className="landing-page-nav-link">Features</Link>
            <Link to="/security" className="landing-page-nav-link">Security</Link>
            <Link to="/admin/login" className="landing-page-nav-link">Admin</Link>
            <Link to="/contact" className="landing-page-nav-link">Contact</Link>
            <Link to="/chat" className="landing-page-nav-button">Start Chat</Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div 
        className={`mobile-nav-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      >
        <div 
          className={`mobile-nav-content ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="mobile-nav-close" onClick={closeMobileMenu}>
            ✕
          </button>
          
          <nav className="mobile-nav-links">
            <Link to="/features" className="mobile-nav-link" onClick={closeMobileMenu}>
              Features
            </Link>
            <Link to="/security" className="mobile-nav-link" onClick={closeMobileMenu}>
              Security
            </Link>
            <Link to="/admin/login" className="mobile-nav-link" onClick={closeMobileMenu}>
              Admin
            </Link>
            <Link to="/chat" className="mobile-nav-button" onClick={closeMobileMenu}>
              Start Chat
            </Link>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="landing-page-hero">
        <div className="landing-page-hero-content">
          <div className="landing-hero-text">
            <div className="hero-badge animated-badge">
              <span>🔒 Enterprise Secure</span>
            </div>
            <h1 className="landing-hero-title">
              Speak Up <span className="landing-hero-highlight">Safely</span>
            </h1>
            <p className="landing-hero-subtitle">Anonymous Reporting Platform</p>
            <p className="landing-hero-description">
              SafeVoice provides a completely anonymous and secure platform for 
              confidential reporting. Your identity is protected with end-to-end encryption 
              while ensuring enterprise-level compliance and security.
            </p>
            
            <div className="landing-hero-actions">
              <Link to="/chat" className="landing-primary-button animated-button">
                <span className="button-icon">💬</span>
                Start Anonymous Chat
              </Link>
              <Link to="/features" className="landing-secondary-button">
                Learn More
              </Link>
            </div>

            <div className="landing-security-badges">
              <span className="landing-badge pulse-badge">🔒 End-to-End Encrypted</span>
              <span className="landing-badge pulse-badge">📊 GDPR Compliant</span>
              <span className="landing-badge pulse-badge">⚖️ Legal Protection</span>
              <span className="landing-badge pulse-badge">🌐 Enterprise Ready</span>
            </div>
          </div>
          
          <div className="landing-hero-visual">
            <div className="landing-visual-card hover-card">
              <div className="landing-card-icon">🎭</div>
              <h3>Total Anonymity</h3>
              <p>No registration, no personal data collected</p>
            </div>
            <div className="landing-visual-card hover-card">
              <div className="landing-card-icon">⚡</div>
              <h3>Instant Connection</h3>
              <p>Real-time chat with support teams</p>
            </div>
            <div className="landing-visual-card hover-card">
              <div className="landing-card-icon">🛡️</div>
              <h3>Industry-standard encryption</h3>
              <p>End-to-end encryption and secure protocols</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features-section">
        <div className="landing-container">
          <h2 className="landing-features-title">Why Organizations Trust SafeVoice</h2>
          <div className="landing-features-grid">
            <div className="landing-feature-card hover-card">
              <div className="landing-feature-icon">🚀</div>
              <h3>Instant Deployment</h3>
              <p>Get started in minutes with our cloud-based platform. No complex setup required.</p>
            </div>
            <div className="landing-feature-card hover-card">
              <div className="landing-feature-icon">📈</div>
              <h3>Scalable Infrastructure</h3>
              <p>Designed to handle organizations of all sizes, from startups to enterprises.</p>
            </div>
            <div className="landing-feature-card hover-card">
              <div className="landing-feature-icon">🔍</div>
              <h3>Compliance Ready</h3>
              <p>Built to meet GDPR, HIPAA, and SOC 2 compliance requirements.</p>
            </div>
            <div className="landing-feature-card hover-card">
              <div className="landing-feature-icon">🌙</div>
              <h3>24/7 Availability</h3>
              <p>Round-the-clock availability for reporting issues anytime, anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta-section">
        <div className="landing-container">
          <div className="landing-cta-content">
            <h2>Ready to Secure Your Organization?</h2>
            <p>Join organizations that trust SafeVoice for confidential communication and anonymous reporting.</p>
            <div className="landing-cta-actions">
              <Link to="/contact" className="landing-cta-primary animated-button">
                Get in Touch
              </Link>
              <Link to="/security" className="landing-cta-secondary">
                View Security Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-page-footer">
        <div className="landing-container">
          <div className="landing-footer-content">
            <div className="landing-footer-brand">
              <h3 className="landing-footer-logo">SafeVoice</h3>
              <p>Enterprise Anonymous Reporting Platform</p>
            </div>
            <div className="landing-footer-links">
              <div className="landing-footer-column">
                <h4>Product</h4>
                <Link to="/features">Features</Link>
                <Link to="/security">Security</Link>
                <Link to="/chat">Live Chat</Link>
              </div>
              <div className="landing-footer-column">
                <h4>Company</h4>
                <Link to="/admin/login">Admin Portal</Link>
                <Link to="/contact">Contact</Link>
              </div>
            </div>
          </div>
          <div className="landing-footer-bottom">
            <p>SafeVoice Enterprise v2.0 • ISO 27001 Compliant • © 2025 LiCorp Technologies LTD</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;