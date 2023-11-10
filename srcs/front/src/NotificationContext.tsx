import React from 'react';

const NotificationContext = React.createContext({} as { handleNotification: (msg: string) => void });

export default NotificationContext;
