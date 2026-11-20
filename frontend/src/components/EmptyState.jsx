import React from 'react';
import '../styles/components.css';

export default function EmptyState({ icon: Icon, title, message, actionLabel, onAction }) {
  const renderIcon = () => {
    if (!Icon) return null;
    if (typeof Icon === 'string') {
      return (
        <div className="empty-state-emoji" style={{ fontSize: '3.5rem', marginBottom: '16px', lineHeight: 1 }}>
          {Icon}
        </div>
      );
    }
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    if (typeof Icon === 'function' || typeof Icon === 'object') {
      return <Icon size={64} className="empty-state-icon" />;
    }
    return null;
  };

  return (
    <div className="empty-state">
      {renderIcon()}
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-message">{message}</p>
      {actionLabel && onAction && (
        <button className="empty-state-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

