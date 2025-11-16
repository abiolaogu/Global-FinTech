/**
 * Error Message Component
 * Displays error messages with optional retry action
 */

import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="error-message">
      <div className="error-message__icon">⚠️</div>
      <h3 className="error-message__title">Something went wrong</h3>
      <p className="error-message__text">{message}</p>
      {onRetry && (
        <button className="error-message__retry" onClick={onRetry}>
          Try Again
        </button>
      )}

      <style jsx>{`
        .error-message {
          text-align: center;
          padding: 48px 24px;
        }

        .error-message__icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .error-message__title {
          font-size: 24px;
          margin: 0 0 12px 0;
          color: #F44336;
        }

        .error-message__text {
          color: #666;
          font-size: 16px;
          margin: 0 0 24px 0;
        }

        .error-message__retry {
          padding: 12px 24px;
          background: #1976D2;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .error-message__retry:hover {
          background: #1565C0;
        }
      `}</style>
    </div>
  );
};

export default ErrorMessage;
