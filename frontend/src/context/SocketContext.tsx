import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  useRef,
} from "react";
import io from "socket.io-client";

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
  const connectionAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);

  const connectSocket = () => {
    // Prevent multiple connection attempts
    if (isConnectingRef.current) {
      console.log("Socket connection already in progress...");
      return null;
    }

    try {
      isConnectingRef.current = true;
      const socketUrl =
        import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
      console.log("Connecting to socket server:", socketUrl);

      // Disconnect existing socket first
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
      }

      const newSocket = io(socketUrl, {
        transports: ["websocket", "polling"],
        timeout: 10000,
        autoConnect: true,
        forceNew: false,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5,
      });

      // Connection established
      newSocket.on("connect", () => {
        console.log("Connected to server - Socket ID:", newSocket.id);
        setIsConnected(true);
        connectionAttemptsRef.current = 0;
        isConnectingRef.current = false;
      });

      // Connection lost
      newSocket.on("disconnect", (reason: string) => {
        console.log("Disconnected from server. Reason:", reason);
        setIsConnected(false);
        isConnectingRef.current = false;

        if (reason === "io server disconnect") {
          // Server forced disconnect, wait a bit before reconnecting
          setTimeout(() => {
            newSocket.connect();
          }, 2000);
        }
      });

      // Connection error
      newSocket.on("connect_error", (error: Error) => {
        console.error("Connection error:", error.message);
        setIsConnected(false);
        connectionAttemptsRef.current++;
        isConnectingRef.current = false;

        // Exponential backoff with maximum limit
        const delay = Math.min(
          1000 * Math.pow(2, connectionAttemptsRef.current),
          30000
        );

        setTimeout(() => {
          if (connectionAttemptsRef.current <= 10) {
            // Max 10 attempts
            newSocket.connect();
          } else {
            console.error(" Maximum reconnection attempts reached");
          }
        }, delay);
      });

      // Successful reconnection
      newSocket.on("reconnect", (attempt: number) => {
        console.log(`Reconnected after ${attempt} attempts`);
        setIsConnected(true);
        connectionAttemptsRef.current = 0;
        isConnectingRef.current = false;
      });

      // Reconnection attempt
      newSocket.on("reconnect_attempt", (attempt: number) => {
        console.log(`Reconnection attempt ${attempt}`);
      });

      // Reconnection error
      newSocket.on("reconnect_error", (error: Error) => {
        console.error("Reconnection error:", error.message);
      });

      // Reconnection failed
      newSocket.on("reconnect_failed", () => {
        console.error("Reconnection failed - giving up");
        isConnectingRef.current = false;
      });

      // Ping/Pong to check connection health
      newSocket.on("ping", () => {
        console.log("Ping received");
      });

      newSocket.on("pong", (latency: number) => {
        console.log(`Pong received - latency: ${latency}ms`);
      });

      setSocket(newSocket);
      return newSocket;
    } catch (error) {
      console.error("Error creating socket:", error);
      isConnectingRef.current = false;
      return null;
    }
  };

  useEffect(() => {
    const newSocket = connectSocket();

    return () => {
      console.log("Cleaning up socket connection");
      if (newSocket) {
        newSocket.removeAllListeners();
        newSocket.disconnect();
      }
      isConnectingRef.current = false;
    };
  }, []);

  const reconnect = () => {
    console.log("Manual reconnection requested");
    connectionAttemptsRef.current = 0;
    connectSocket();
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, reconnect }}>
      {children}
    </SocketContext.Provider>
  );
};
