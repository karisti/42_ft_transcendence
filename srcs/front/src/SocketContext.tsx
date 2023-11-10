import { createContext, ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import { getServerIP } from './utils/utils';

const SocketContext1 = createContext<Socket | null>(null);
const SocketContext2 = createContext<Socket | null>(null);

// Crear un proveedor para cada socket
export function SocketProvider1({ children }: { children: ReactNode }) {
  const [socket1, setSocket1] = useState<Socket | null>(null);

  useEffect(() => {
    console.log('Creating socket1');  // Agrega esta línea

    const socketOptions = {
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: 'Bearer ' + localStorage.getItem("token"),
          }
        }
      },
    };

    const newSocket = io(getServerIP(8083), socketOptions);
    
    setSocket1(newSocket);

    return () => {
      console.log('Cleaning up socket1');  // Y esta línea
      newSocket.off();
      if (newSocket.connected) {
        newSocket.disconnect();
      }
    };
  }, []);

  
  return (
    <SocketContext1.Provider value={socket1}>
      {children}
    </SocketContext1.Provider>
  );
}

export function SocketProvider2({ children }: { children: ReactNode }) {
  const [socket2, setSocket2] = useState<Socket | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isVerify2FA = location.pathname.includes('/verify2fa');
  const isRegister = location.pathname.includes('/register');
  
  useEffect(() => {
    console.log('Creating socket2');  // Agrega esta línea
    const socketOptions = {
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: 'Bearer ' + localStorage.getItem("token"),
          }
        }
      }
    };
    
    const newSocket = io(getServerIP(8081), socketOptions);
    setSocket2(newSocket);
    
    return () => {
      newSocket.off();
      if (newSocket.connected) {
        newSocket.disconnect();
      }
    };
  }, []);
  
  useEffect(() => {
    socket2?.on('disconnect', () => {
      if (localStorage.getItem('token'))
        navigate('/');
      console.log('Socket desconectado');
      localStorage.removeItem('token');
    });
  }, [socket2])

  return (
    <SocketContext2.Provider value={socket2}>
      {children}
    </SocketContext2.Provider>
  );
}

export { SocketContext1, SocketContext2 };
