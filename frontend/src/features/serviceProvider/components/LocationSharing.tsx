import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useSocket } from "../../../context/SocketContext";

interface LocationSharingProps {
  technicianId: string;
  bookingId: string;
  onLocationShared?: (isSharing: boolean) => void;
}

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    speed: number | null;
    heading: number | null;
  };
  timestamp: number;
}

const LocationSharing: React.FC<LocationSharingProps> = ({
  technicianId,
  bookingId,
  onLocationShared
}) => {
  const { socket, isConnected } = useSocket();
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startSharing = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    try {
      // Get initial position
      navigator.geolocation.getCurrentPosition(
        async (position: GeolocationPosition) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          };

          // Start sharing via socket
          if (socket && isConnected) {
            socket.emit("technician-location-share", {
              technicianId,
              bookingId,
              location
            });
          }

          // Start watching position
          const id = navigator.geolocation.watchPosition(
            (pos: GeolocationPosition) => {
              const updatedLocation = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                speed: pos.coords.speed || undefined,
                heading: pos.coords.heading || undefined,
                timestamp: new Date()
              };

              // Update via socket
              if (socket && isConnected) {
                socket.emit("technician-location-update", {
                  technicianId,
                  bookingId,
                  location: updatedLocation
                });
              }
            },
            (err: GeolocationPositionError) => {
              console.error("Error watching position:", err);
              setError("Failed to track location");
              stopSharing();
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 1000
            }
          );

          setWatchId(id);
          setIsSharing(true);
          setError(null);
          
          if (onLocationShared) {
            onLocationShared(true);
          }

          toast.success("Location sharing started");
        },
        (err: GeolocationPositionError) => {
          console.error("Error getting location:", err);
          setError("Failed to get your location. Please check location permissions.");
        }
      );
    } catch (error) {
      console.error("Error starting location sharing:", error);
      setError("Failed to start location sharing");
    }
  }, [technicianId, bookingId, socket, isConnected, onLocationShared]);

  const stopSharing = useCallback(async () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    try {
      if (socket && isConnected) {
        socket.emit("technician-location-stop", { technicianId, bookingId });
      }

      setIsSharing(false);
      
      if (onLocationShared) {
        onLocationShared(false);
      }

      toast.success("Location sharing stopped");
    } catch (error) {
      console.error("Error stopping location sharing:", error);
      setError("Failed to stop location sharing");
    }
  }, [watchId, technicianId, bookingId, socket, isConnected, onLocationShared]);

  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Live Location Sharing</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 mb-2">
            {isSharing 
              ? "Sharing your live location with customer" 
              : "Share your live location when on the way"
            }
          </p>
          {isSharing && (
            <p className="text-green-600 text-sm font-semibold">
              ● Live location active
            </p>
          )}
        </div>
        
        <button
          onClick={isSharing ? stopSharing : startSharing}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            isSharing
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isSharing ? "Stop Sharing" : "Start Sharing"}
        </button>
      </div>
    </div>
  );
};

export default LocationSharing;