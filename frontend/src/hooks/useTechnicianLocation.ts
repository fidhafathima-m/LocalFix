import { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";

interface TechnicianLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: Date;
}

interface UseTechnicianLocationReturn {
  technicianLocation: TechnicianLocation | null;
  isTracking: boolean;
  locationHistory: TechnicianLocation[];
  error: string | null;
  isConnected: boolean;
}

export const useTechnicianLocation = (
  orderId: string | undefined,
  technicianId: string | undefined
): UseTechnicianLocationReturn => {
  const { socket, isConnected } = useSocket();
  const [technicianLocation, setTechnicianLocation] = useState<TechnicianLocation | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [locationHistory, setLocationHistory] = useState<TechnicianLocation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !isConnected || !orderId) {
      console.log("❌ Socket not ready:", { socket: !!socket, isConnected, orderId });
      return;
    }

    console.log('🔗 USER: Joining tracking room:', { orderId, technicianId });

    // Join the tracking room
    socket.emit("join-tracking", { 
      orderId, 
      userId: "user",
      technicianId: technicianId || "unknown"
    });

    // Listen for location updates
    const handleLocationUpdate = (data: {
      technicianId: string;
      location: TechnicianLocation;
      isActive: boolean;
    }) => {
      console.log("📍 USER: Location update received:", data);
      
      // Convert timestamp if it's a string
      const locationData = {
        ...data.location,
        timestamp: data.location.timestamp instanceof Date 
          ? data.location.timestamp 
          : new Date(data.location.timestamp)
      };
      
      setTechnicianLocation(locationData);
      setIsTracking(data.isActive);
      setError(null);

      // Add to history (keep last 50 locations)
      setLocationHistory(prev => {
        const newHistory = [...prev, locationData];
        return newHistory.slice(-50);
      });
    };

    // Listen for tracking ended
    const handleLocationEnded = (data: {
      technicianId: string;
      orderId: string;
      timestamp: Date;
    }) => {
      console.log("🛑 USER: Location tracking ended:", data);
      setIsTracking(false);
      setTechnicianLocation(null);
    };

    // Listen for connection errors
    const handleConnectError = (error: unknown) => {
      console.error("🔌 USER: Socket connection error:", error);
      setError("Failed to connect to tracking service");
    };

    // Listen for general errors
    const handleError = (error: unknown) => {
      console.error("❌ USER: Socket error:", error);
      setError("Socket connection error");
    };

    // Add all listeners
    socket.on("technician-location-update", handleLocationUpdate);
    socket.on("technician-location-ended", handleLocationEnded);
    socket.on("connect_error", handleConnectError);
    socket.on("error", handleError);

    // Debug listeners for specific events
    socket.on("connect", () => {
      console.log("✅ USER: Socket connected");
    });

    socket.on("disconnect", (reason: unknown) => {
      console.log("🔌 USER: Socket disconnected:", reason);
      setIsTracking(false);
    });

    return () => {
      console.log("🧹 USER: Cleaning up socket listeners");
      socket.off("technician-location-update", handleLocationUpdate);
      socket.off("technician-location-ended", handleLocationEnded);
      socket.off("connect_error", handleConnectError);
      socket.off("error", handleError);
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [socket, isConnected, orderId, technicianId]);

  return {
    technicianLocation,
    isTracking,
    locationHistory,
    error,
    isConnected,
  };
};