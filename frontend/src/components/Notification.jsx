import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';

const Notification = ({ 
  type = 'info', // 'success', 'error', 'warning', 'info'
  title,
  message,
  show = true,
  autoClose = true,
  duration = 5000,
  onClose,
  className = '',
  position = 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'inline'
  closable = true
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  useEffect(() => {
    if (autoClose && isVisible && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, isVisible, duration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  // Icon dan warna berdasarkan tipe
  const getNotificationStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <FaCheckCircle className="text-xl" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-500',
          titleColor: 'text-green-900'
        };
      case 'error':
        return {
          icon: <FaExclamationTriangle className="text-xl" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-500',
          titleColor: 'text-red-900'
        };
      case 'warning':
        return {
          icon: <FaExclamationTriangle className="text-xl" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-500',
          titleColor: 'text-yellow-900'
        };
      case 'info':
      default:
        return {
          icon: <FaInfoCircle className="text-xl" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-900'
        };
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return 'fixed top-4 right-4 z-50';
      case 'top-left':
        return 'fixed top-4 left-4 z-50';
      case 'bottom-right':
        return 'fixed bottom-4 right-4 z-50';
      case 'bottom-left':
        return 'fixed bottom-4 left-4 z-50';
      case 'inline':
      default:
        return 'relative';
    }
  };

  const styles = getNotificationStyles();
  const positionStyles = getPositionStyles();

  if (!isVisible) return null;

  return (
    <div className={`${positionStyles} ${className}`}>
      <div className={`
        ${styles.bgColor} 
        ${styles.borderColor} 
        ${styles.textColor} 
        border rounded-lg shadow-lg p-4 max-w-sm w-full
        ${position !== 'inline' ? 'animate-pulse' : ''}
      `}>
        <div className="flex items-start space-x-3">
          <div className={`${styles.iconColor} flex-shrink-0 mt-0.5`}>
            {styles.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className={`text-sm font-semibold ${styles.titleColor} mb-1`}>
                {title}
              </h4>
            )}
            {message && (
              <p className="text-sm leading-relaxed">
                {message}
              </p>
            )}
          </div>
          
          {closable && (
            <button
              onClick={handleClose}
              className={`${styles.textColor} hover:opacity-70 transition-opacity flex-shrink-0 ml-2`}
              aria-label="Tutup notifikasi"
            >
              <FaTimesCircle className="text-lg" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Komponen khusus untuk notifikasi inline (banner)
export const InlineNotification = ({ type, title, message, className = '', onClose }) => (
  <Notification
    type={type}
    title={title}
    message={message}
    position="inline"
    autoClose={false}
    className={`mb-4 ${className}`}
    onClose={onClose}
  />
);

// Komponen khusus untuk notifikasi toast
export const ToastNotification = ({ type, title, message, duration = 5000, onClose }) => (
  <Notification
    type={type}
    title={title}
    message={message}
    position="top-right"
    autoClose={true}
    duration={duration}
    onClose={onClose}
  />
);

// Komponen khusus untuk notifikasi status
export const StatusNotification = ({ type, message, className = '' }) => (
  <div className={`text-center p-3 rounded-lg ${className}`}>
    <InlineNotification
      type={type}
      message={message}
      className="mb-0"
    />
  </div>
);

export default Notification;
