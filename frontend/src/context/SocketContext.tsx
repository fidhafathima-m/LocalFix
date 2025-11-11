import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import io from "socket.io-client";

// Define the Socket type based on the return type of io()
type SocketType = ReturnType<typeof io>;

interface SocketContextType {
  socket: SocketType | null;
  isConnected: boolean;
  reconnect: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  reconnect: () => {},
});

interface SocketProviderProps {
  children: ReactNode;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

   const connectSocket = () => {
    try {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
      console.log("🔌 Connecting to socket server:", socketUrl);
      
      const newSocket = io(socketUrl, {
        transports: ["websocket", "polling"],
        timeout: 30000, // Increased timeout
        autoConnect: true,
        forceNew: false,
        reconnection: true,
        reconnectionAttempts: Infinity, // Keep trying to reconnect
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5,
      });
      
      newSocket.on("connect", () => {
        console.log("✅ Connected to server - Socket ID:", newSocket.id);
        setIsConnected(true);
        setConnectionAttempts(0);
      });

      newSocket.on("disconnect", (reason: unknown) => {
        console.log("🔌 Disconnected from server:", reason);
        setIsConnected(false);
        
        if (reason === "io server disconnect") {
          // Server forced disconnect, need to manually reconnect
          newSocket.connect();
        }
      });

      newSocket.on("connect_error", (error: unknown) => {
        console.error("❌ Connection error:", error);
        setIsConnected(false);
        setConnectionAttempts(prev => prev + 1);
        
        // Exponential backoff for reconnection
        const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000);
        console.log(`🔄 Reconnecting in ${delay}ms...`);
        
        setTimeout(() => {
          if (!isConnected) {
            newSocket.connect();
          }
        }, delay);
      });

      newSocket.on("reconnect", (attempt: number) => {
        console.log(`🔄 Reconnected after ${attempt} attempts`);
        setIsConnected(true);
      });

      newSocket.on("reconnect_attempt", (attempt: number) => {
        console.log(`🔄 Reconnection attempt ${attempt}`);
      });

      newSocket.on("reconnect_error", (error: unknown) => {
        console.error("❌ Reconnection error:", error);
      });

      newSocket.on("reconnect_failed", () => {
        console.error("❌ Reconnection failed");
      });

      setSocket(newSocket);
      return newSocket;
    } catch (error) {
      console.error("❌ Error creating socket:", error);
      return null;
    }
  };
  useEffect(() => {
    const newSocket = connectSocket();

    return () => {
     console.log("🧹 Cleaning up socket");
      if (newSocket) {
        newSocket.removeAllListeners();
        newSocket.close();
      }
    };
  }, []);

   const reconnect = () => {
    if (socket) {
      socket.disconnect();
      setTimeout(() => {
        connectSocket();
      }, 1000);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, reconnect }}>
      {children}
    </SocketContext.Provider>
  );
};