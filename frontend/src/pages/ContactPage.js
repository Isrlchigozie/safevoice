import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ContactPage.css';
import { FaEnvelope, FaWhatsapp, FaPhoneAlt, FaBuilding } from 'react-icons/fa';
import '../App.css';

const ContactPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: ''
      });
    }, 2000);
  };

    const contactMethods = [
    {
        icon: <FaEnvelope />,
        title: 'Email Us',
        description: 'Send us an email and we\'ll get back to you within 24 hours.',
        details: 'contact@safevoice.com',
        action: 'mailto:contact@officiallicorp@gmail.com'
    },
    {
        icon: <FaWhatsapp color="#25D366" />,
        title: 'WhatsApp Chat',
        description: 'Chat with us directly on WhatsApp for quick assistance.',
        details: '+234 707 941 9739',
        action: 'https://wa.me/2347079419739'
    },
    {
        icon: <FaPhoneAlt />,
        title: 'Sales Team',
        description: 'Speak with our sales team for enterprise solutions.',
        details: '+234 707 941 9739',
        action: 'tel:+2347079419739'
    },
    ];

  const faqs = [
    {
      question: 'Who can use SafeVoice?',
      answer: 'SafeVoice is designed for schools, universities, workplaces, healthcare providers, NGOs, government agencies, churches, and online platforms. Any organization that needs anonymous and secure communication can benefit.'
    },
    {
      question: 'How can SafeVoice be deployed in my organization?',
      answer: 'We offer flexible deployment options including cloud-hosted, on-premise, and API integrations. This ensures SafeVoice fits seamlessly with your existing systems.'
    },
    {
      question: 'Is communication really anonymous?',
      answer: 'Yes. SafeVoice uses end-to-end encryption and does not collect personal data. Reports and chats are anonymized to protect user identity while still allowing organizations to respond effectively.'
    },
    {
      question: 'Can SafeVoice be customized for different institutions?',
      answer: 'Absolutely. SafeVoice can be tailored with custom branding, workflows, and access controls to match your organization’s needs — whether you’re a school, hospital, or enterprise.'
    },
    {
      question: 'What support do you provide?',
      answer: 'We provide 24/7 technical support, onboarding assistance, and detailed documentation. Enterprise clients also get dedicated account managers for smooth implementation.'
    }
  ];

  return (
    <div className="contact-page">
      {/* Header */}
      <header className="contact-header">
        <div className="contact-header-content">
          <Link to="/" className="contact-logo">
            <span className="contact-logo-icon">🛡️</span>
            SafeVoice
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="contact-nav">
            <Link to="/" className="contact-nav-link">Home</Link>
            <Link to="/features" className="contact-nav-link">Features</Link>
            <Link to="/security" className="contact-nav-link">Security</Link>
            <Link to="/admin/login" className="contact-nav-link">Admin</Link>
            <Link to="/contact" className="contact-nav-link active">Contact</Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="contact-mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div 
        className={`contact-mobile-nav-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      >
        <div 
          className={`contact-mobile-nav-content ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="contact-mobile-nav-close" onClick={closeMobileMenu}>
            ✕
          </button>
          
          <nav className="contact-mobile-nav-links">
            <Link to="/" className="contact-mobile-nav-link" onClick={closeMobileMenu}>
              Home
            </Link>
            <Link to="/features" className="contact-mobile-nav-link" onClick={closeMobileMenu}>
              Features
            </Link>
            <Link to="/security" className="contact-mobile-nav-link" onClick={closeMobileMenu}>
              Security
            </Link>
            <Link to="/admin/login" className="contact-mobile-nav-link" onClick={closeMobileMenu}>
              Admin
            </Link>
            <Link to="/contact" className="contact-mobile-nav-link active" onClick={closeMobileMenu}>
              Contact
            </Link>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1 className="contact-hero-title">
            Get in <span className="contact-hero-highlight">Touch</span>
          </h1>
          <p className="contact-hero-description">
            Ready to secure your organization with anonymous reporting? Our team is here to help 
            you implement SafeVoice and answer any questions you may have.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="contact-methods">
        <div className="container">
          <h2 className="section-title">Choose How to Reach Us</h2>
          <div className="contact-methods-grid">
            {contactMethods.map((method, index) => (
              <div key={index} className="contact-method-card">
                <div className="contact-method-icon">{method.icon}</div>
                <h3 className="contact-method-title">{method.title}</h3>
                <p className="contact-method-description">{method.description}</p>
                <div className="contact-method-details">
                  {method.action.startsWith('http') || method.action.startsWith('/') || method.action.startsWith('mailto') || method.action.startsWith('tel') ? (
                    <a href={method.action} className="contact-method-link" target="_blank" rel="noopener noreferrer">
                      {method.details}
                    </a>
                  ) : (
                    <span>{method.details}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="contact-form-section">
        <div className="container">
          <div className="contact-form-container">
            <div className="contact-form-info">
              <h2 className="contact-form-title">Send us a Message</h2>
              <p className="contact-form-description">
                Fill out the form below and our team will get back to you as soon as possible. 
                We're here to help you implement the best anonymous reporting solution for your organization.
              </p>
              <div className="contact-form-features">
                <div className="contact-feature">
                  <span className="contact-feature-icon">⚡</span>
                  <span>Response within 24 hours</span>
                </div>
                <div className="contact-feature">
                  <span className="contact-feature-icon">🔒</span>
                  <span>Secure and confidential</span>
                </div>
                <div className="contact-feature">
                  <span className="contact-feature-icon">👥</span>
                  <span>Expert consultation</span>
                </div>
              </div>
            </div>

            <div className="contact-form-wrapper">
              {submitted ? (
                <div className="contact-success-message">
                  <div className="success-icon">✅</div>
                  <h3>Thank You!</h3>
                  <p>Your message has been sent successfully. Our team will get back to you within 24 hours.</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="contact-success-button"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="company" className="form-label">Company/Organization</label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter your company name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="subject" className="form-label">Subject *</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="enterprise">Enterprise Solution</option>
                        <option value="demo">Request a Demo</option>
                        <option value="pricing">Pricing Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="partnership">Partnership</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message" className="form-label">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="form-textarea"
                      placeholder="Tell us about your requirements and how we can help..."
                      rows="6"
                      required
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="contact-submit-button"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="contact-button-spinner"></div>
                        Sending Message...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="contact-faq">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <h3 className="faq-question">{faq.question}</h3>
                <p className="faq-answer">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="contact-cta">
        <div className="container">
          <div className="contact-cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join organizations that trust SafeVoice for confidential communication and anonymous reporting.</p>
            <div className="contact-cta-buttons">
              <a href="https://wa.me/2347079419739" target="_blank" rel="noopener noreferrer" className="cta-button primary">Chat on WhatsApp</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;