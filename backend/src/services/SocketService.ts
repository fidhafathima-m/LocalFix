import { Server } from "socket.io";
import { LocationTrackingService } from "./LocationTrackingService";
import { ITechnicianLocationShare } from "@/interfaces/common/ILocationTracking";

export class SocketService {
  private _io: Server;
  private _locationService: LocationTrackingService;
  private _activeConnections: Map<string, string> = new Map(); 

  constructor(server: any) {
    this._io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
      },
    });

    this._locationService = new LocationTrackingService();
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this._io.on("connection", (socket) => {

      socket.on(
        "technician-location-share",
        async (data: ITechnicianLocationShare) => {
          try {
            const { technicianId, orderId, location } = data;

            // Store connection mapping
            this._activeConnections.set(socket.id, technicianId);

            // Start location sharing in database
            const result = await this._locationService.startLocationSharing(
              technicianId,
              orderId,
              location
            );

            if (result.success) {
              const roomName = `order-${orderId}`; 

              // Get room info
              const room = this._io.sockets.adapter.rooms.get(roomName);
              const roomSize = room ? room.size : 0;

              // Broadcast to ALL clients in the room
              this._io.to(roomName).emit("technician-location-update", {
                technicianId,
                location: {
                  ...location,
                  timestamp: new Date(),
                },
                isActive: true,
              });
            }
          } catch (error) {
            console.error(
              "BACKEND: Error in technician-location-share:",
              error
            );
            socket.emit("location-error", {
              message: "Failed to share location",
            });
          }
        }
      );

      // Update ALL other handlers too:
      socket.on(
        "technician-location-update",
        async (data: ITechnicianLocationShare) => {
          const { technicianId, orderId, location } = data;
          const roomName = `order-${orderId}`; 

          this._io.to(roomName).emit("technician-location-update", {
            technicianId,
            location: {
              ...location,
              timestamp: new Date(),
            },
            isActive: true,
          });
        }
      );

      socket.on(
        "join-tracking",
        (data: { orderId: string; userId: string }) => {
          const { orderId, userId } = data;
          const roomName = `order-${orderId}`; 
          socket.join(roomName);
        }
      );

      socket.on("check-room", (data: { orderId: string }) => {
        const { orderId } = data;
        const roomName = `order-${orderId}`; 
        const room = this._io.sockets.adapter.rooms.get(roomName);
        const roomSize = room ? room.size : 0;
        socket.emit("room-status", {
          room: roomName,
          clientsInRoom: roomSize,
        });
      });

      // Technician stops sharing location
      socket.on(
        "technician-location-stop",
        async (data: { technicianId: string; orderId: string }) => {
          try {
            const { technicianId, orderId } = data;

            // Stop location sharing in database
            await this._locationService.stopLocationSharing(
              technicianId,
              orderId
            );

            // Remove connection mapping
            this._activeConnections.delete(socket.id);

            // Notify user
            socket.to(`booking-${orderId}`).emit("technician-location-ended", {
              technicianId,
              orderId,
              timestamp: new Date(),
            });

          } catch (error) {
            console.error("Error in technician-location-stop:", error);
            socket.emit("location-error", {
              message: "Failed to stop location sharing",
            });
          }
        }
      );

      socket.on("disconnect", () => {

        // Clean up disconnected technicians
        const technicianId = this._activeConnections.get(socket.id);
        if (technicianId) {
          this._activeConnections.delete(socket.id);
        }
      });
    });
  }

  public getIO(): Server {
    return this._io;
  }
}
