import React, { useRef, useState } from 'react';

const MediaUploader = ({ onFileSelect, conversationId, anonymousToken, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const streamRef = useRef(null);
  
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileSelect(file);
    }
    setIsOpen(false);
    event.target.value = '';
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Audio recording is not supported in your browser');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], `voice-message-${Date.now()}.wav`, { 
          type: 'audio/wav'
        });
        onFileSelect(audioFile);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Microphone access is required for voice messages. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const openCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera is not supported in your browser');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      streamRef.current = stream;
      
      // Create camera preview
      const cameraPreview = document.createElement('div');
      cameraPreview.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: black;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      `;
      
      const video = document.createElement('video');
      video.style.cssText = `
        max-width: 100%;
        max-height: 70vh;
        background: black;
      `;
      video.autoplay = true;
      video.playsInline = true;
      video.srcObject = stream;
      
      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        margin-top: 20px;
        display: flex;
        gap: 20px;
      `;
      
      const captureButton = document.createElement('button');
      captureButton.textContent = '📷 Take Photo';
      captureButton.style.cssText = `
        padding: 12px 24px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
      `;
      
      const cancelButton = document.createElement('button');
      cancelButton.textContent = 'Cancel';
      cancelButton.style.cssText = `
        padding: 12px 24px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
      `;
      
      captureButton.onclick = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          const file = new File([blob], `camera-photo-${Date.now()}.jpg`, {
            type: 'image/jpeg'
          });
          onFileSelect(file);
          closeCamera();
        }, 'image/jpeg', 0.8);
      };
      
      cancelButton.onclick = closeCamera;
      
      function closeCamera() {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (document.body.contains(cameraPreview)) {
          document.body.removeChild(cameraPreview);
        }
        setIsOpen(false);
      }
      
      buttonContainer.appendChild(captureButton);
      buttonContainer.appendChild(cancelButton);
      cameraPreview.appendChild(video);
      cameraPreview.appendChild(buttonContainer);
      document.body.appendChild(cameraPreview);
      
      // Close on escape key
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          closeCamera();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      
      cameraPreview._closeCamera = closeCamera;
      cameraPreview._handleKeyDown = handleKeyDown;
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please make sure you have given camera permissions.');
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
    setIsOpen(false);
  };

  const openImagePicker = () => {
    imageInputRef.current?.click();
    setIsOpen(false);
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('[data-media-uploader]')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div style={styles.container} data-media-uploader>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={styles.attachButton}
        title="Attach file"
        type="button"
      >
        <AttachmentIcon />
      </button>

      {isOpen && (
        <div style={styles.menu}>
          <button onClick={openFilePicker} style={styles.menuItem}>
            <DocumentIcon />
            <span style={styles.menuText}>Document</span>
          </button>
          <button onClick={openImagePicker} style={styles.menuItem}>
            <MediaIcon />
            <span style={styles.menuText}>Photo & Video</span>
          </button>
          <button onClick={openCamera} style={styles.menuItem}>
            <CameraIcon />
            <span style={styles.menuText}>Camera</span>
          </button>
          <button 
            onClick={recording ? stopRecording : startRecording}
            style={{
              ...styles.menuItem,
              ...(recording ? styles.recording : {})
            }}
            type="button"
          >
            {recording ? <RecordingIcon /> : <MicrophoneIcon />}
            <span style={styles.menuText}>
              {recording ? 'Stop Recording' : 'Voice Message'}
            </span>
            {recording && <div style={styles.recordingPulse}></div>}
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.txt,.zip,.ppt,.pptx,.xls,.xlsx"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleFileSelect}
        accept="image/*,video/*"
        style={{ display: 'none' }}
      />
    </div>
  );
};

// WhatsApp-style SVG Icons
const AttachmentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.698-1.594-1.592-4.068-1.711-5.517-.262l-7.916 7.915c-.881.881-.792 2.25.214 3.261.959.958 2.423 1.004 3.263.204l5.511-5.512c.28-.28.267-.722.053-.936l-.244-.244c-.191-.191-.567-.349-.957.04l-5.506 5.506c-.18.18-.593.171-.792-.038-.203-.203-.194-.594.012-.792l7.915-7.917c.818-.817 2.267-.699 3.23.262.5.501.802 1.1.849 1.685.051.573-.156 1.111-.589 1.543l-9.547 9.549a3.97 3.97 0 0 1-2.829 1.171 3.975 3.975 0 0 1-2.83-1.173 3.973 3.973 0 0 1-1.172-2.828c0-1.071.415-2.076 1.172-2.83l7.209-7.211c.157-.157.264-.579.028-.814L11.5 4.36a.572.572 0 0 0-.834.018l-7.205 7.207a5.577 5.577 0 0 0-1.645 3.971z"/>
  </svg>
);

const DocumentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.381 7.078c-.174-.174-.39-.312-.619-.422V17.5a2.5 2.5 0 0 1-2.5 2.5h-9a2.5 2.5 0 0 1-2.5-2.5v-11a2.5 2.5 0 0 1 2.5-2.5h6c.229.11.445.248.619.422l3.5 3.5a.88.88 0 0 1 0 1.156zm-1.225-.689L15.5 3.806V5.5a1 1 0 0 0 1 1h1.694l-.958-.959a.126.126 0 0 1 0-.178zM17.5 19h-9a1.5 1.5 0 0 1-1.5-1.5v-11A1.5 1.5 0 0 1 8.5 5h5.5v2.5A2.5 2.5 0 0 0 16.5 10h2.5v7.5a1.5 1.5 0 0 1-1.5 1.5z"/>
  </svg>
);

const MediaIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.999 3.004c-4.968 0-9 4.032-9 9s4.032 9 9 9 9-4.032 9-9-4.032-9-9-9zm0 16c-3.867 0-7-3.133-7-7s3.133-7 7-7 7 3.133 7 7-3.133 7-7 7z"/>
    <path d="M12 10c-1.103 0-2 .897-2 2s.897 2 2 2 2-.897 2-2-.897-2-2-2z"/>
  </svg>
);

const CameraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 15.2c1.767 0 3.2-1.433 3.2-3.2s-1.433-3.2-3.2-3.2-3.2 1.433-3.2 3.2 1.433 3.2 3.2 3.2z"/>
    <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
  </svg>
);

const MicrophoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
  </svg>
);

const RecordingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="6" fill="#ff0000"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
    <circle cx="12" cy="12" r="3" fill="#ff0000"/>
  </svg>
);

const styles = {
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  attachButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    color: '#666',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
  },
  menu: {
    position: 'absolute',
    bottom: '100%',
    left: '0',
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '8px 0',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    minWidth: '200px',
    zIndex: 1000,
    marginBottom: '8px',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    width: '100%',
    padding: '12px 20px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '15px',
    transition: 'background 0.2s',
    position: 'relative',
    color: '#333',
  },
  menuText: {
    flex: 1,
    textAlign: 'left',
  },
  recording: {
    background: '#ffebee',
    color: '#d32f2f',
    fontWeight: '600',
  },
  recordingPulse: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#d32f2f',
    animation: 'pulse 1s infinite',
  },
};

// Add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.4; }
    100% { opacity: 1; }
  }

  [data-media-uploader] button:hover {
    background-color: #f5f5f5;
  }

  [data-media-uploader] .attach-button:hover {
    background-color: #e0e0e0;
  }

  [data-media-uploader] .menu-item:hover {
    background-color: #f8f9fa;
  }
`;
document.head.appendChild(styleSheet);

export default MediaUploader;