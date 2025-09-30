import React, { useState } from 'react';

const AnonymousIdManager = ({ anonymousToken }) => {
  const [showCopied, setShowCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(anonymousToken);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000); // Hide after 2 seconds
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = anonymousToken;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const downloadToken = () => {
    const blob = new Blob([`SafeVoice Anonymous ID: ${anonymousToken}\n\nSave this ID to return to your conversation.`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safevoice-id-${anonymousToken}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.container}>
      <div style={styles.tokenSection}>
        <h3 style={styles.sectionTitle}>Your Anonymous ID</h3>
        <div style={styles.tokenDisplay}>
          <code style={styles.token}>{anonymousToken}</code>
          <div style={styles.tokenActions}>
            <button onClick={copyToClipboard} style={styles.actionButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
              Copy
            </button>
            <button onClick={downloadToken} style={styles.actionButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              Download
            </button>
          </div>
        </div>
        
        {/* Modern success notification */}
        {showCopied && (
          <div style={styles.copyNotification}>
            <span style={styles.checkmark}>✓</span>
            ID copied to clipboard!
          </div>
        )}
        
        <p style={styles.helpText}>
          Save this ID to return to your conversation later. Your identity remains completely anonymous.
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'var(--white)',
    borderRadius: '12px',
    padding: '24px',
    margin: '20px auto',
    maxWidth: '600px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    position: 'relative',
  },
  tokenSection: {
    position: 'relative',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#1e293b',
  },
  tokenDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    flexWrap: 'wrap',
  },
  token: {
    background: '#f8fafc',
    padding: '12px 16px',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '16px',
    fontWeight: '600',
    color: '#2563eb',
    border: '1px solid #e2e8f0',
    flex: '1',
    minWidth: '200px',
  },
  tokenActions: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  actionButtonHover: {
    background: '#e2e8f0',
  },
  copyNotification: {
    position: 'fixed',
    top: '80px',
    right: '20px',
    background: '#10b981',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    animation: 'slideIn 0.3s ease-out',
  },
  checkmark: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.5',
    marginTop: '8px',
  },
};

// Add CSS animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(styleSheet);

export default AnonymousIdManager;