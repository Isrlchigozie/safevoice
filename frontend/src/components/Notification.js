import React, { useEffect } from 'react';

const Notification = ({ message, type = 'error', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div style={{
      ...styles.notification,
      ...styles[type]
    }}>
      <div style={styles.content}>
        <span style={styles.icon}>
          {type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️'}
        </span>
        <span style={styles.message}>{message}</span>
      </div>
      <button onClick={onClose} style={styles.closeButton}>
        ✕
      </button>
    </div>
  );
};

const styles = {
  notification: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '16px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 10000,
    minWidth: '300px',
    maxWidth: '500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    animation: 'slideIn 0.3s ease-out',
  },
  error: {
    background: '#fee',
    border: '1px solid #fcc',
    color: '#c33',
  },
  success: {
    background: '#efe',
    border: '1px solid #cfc',
    color: '#363',
  },
  info: {
    background: '#eef',
    border: '1px solid #ccf',
    color: '#336',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  icon: {
    fontSize: '16px',
  },
  message: {
    flex: 1,
    fontSize: '14px',
    lineHeight: '1.4',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: 'inherit',
    padding: '4px',
    marginLeft: '12px',
    opacity: '0.7',
    transition: 'opacity 0.2s',
  },
};

// Add CSS animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
document.head.appendChild(styleSheet);

export default Notification;