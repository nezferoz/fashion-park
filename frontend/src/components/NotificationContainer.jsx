import React from 'react';
import Notification from './Notification';

const NotificationContainer = ({ notifications, onRemove }) => {
  return (
    <>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </>
  );
};

export default NotificationContainer;
