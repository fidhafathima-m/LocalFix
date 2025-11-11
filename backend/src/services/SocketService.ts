import { Server } from "socket.io";
import { LocationTrackingService } from "./LocationTrackingService";
import { ITechnicianLocationShare } from "@/interfaces/common/ILocationTracking";

export class SocketService {
  private io: Server;
  private locationService: LocationTrackingService;
  private activeConnections: Map<string, string> = new Map(); // socketId -> technicianId

  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    this.locationService = new LocationTrackingService();
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // Change ALL booking-{id} to order-{id}
      socket.on(
        "technician-location-share",
        async (data: ITechnicianLocationShare) => {
          try {
            const { technicianId, orderId, location } = data;

            console.log("📍 BACKEND: Received technician-location-share:", {
              technicianId,
              orderId,
              location,
              socketId: socket.id,
            });

            // Store connection mapping
            this.activeConnections.set(socket.id, technicianId);

            // Start location sharing in database
            const result = await this.locationService.startLocationSharing(
              technicianId,
              orderId,
              location
            );

            if (result.success) {
              console.log(
                "📍 BACKEND: Successfully stored location in database"
              );

              const roomName = `order-${orderId}`; // CHANGED: booking- to order-

              // Get room info
              const room = this.io.sockets.adapter.rooms.get(roomName);
              const roomSize = room ? room.size : 0;

              console.log("📍 BACKEND: Room status:", {
                room: roomName,
                clientsInRoom: roomSize,
                roomMembers: room ? Array.from(room) : [],
              });

              // Broadcast to ALL clients in the room
              this.io.to(roomName).emit("technician-location-update", {
                technicianId,
                location: {
                  ...location,
                  timestamp: new Date(),
                },
                isActive: true,
              });

              console.log(
                "📍 BACKEND: Location broadcast completed to room:",
                roomName
              );
            }
          } catch (error) {
            console.error(
              "❌ BACKEND: Error in technician-location-share:",
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
          const roomName = `order-${orderId}`; // CHANGED: booking- to order-

          console.log("📍 BACKEND: Broadcasting update to room:", {
            room: roomName,
          });

          this.io.to(roomName).emit("technician-location-update", {
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
          const roomName = `order-${orderId}`; // CHANGED: booking- to order-
          socket.join(roomName);
          console.log(`User ${userId} joined tracking for order ${orderId}`);
        }
      );

      socket.on("check-room", (data: { orderId: string }) => {
        const { orderId } = data;
        const roomName = `order-${orderId}`; // CHANGED: booking- to order-
        const room = this.io.sockets.adapter.rooms.get(roomName);
        const roomSize = room ? room.size : 0;

        console.log("🏠 BACKEND: Room check:", {
          room: roomName,
          clientsInRoom: roomSize,
          clientSocketId: socket.id,
        });

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
            await this.locationService.stopLocationSharing(
              technicianId,
              orderId
            );

            // Remove connection mapping
            this.activeConnections.delete(socket.id);

            // Notify user
            socket.to(`booking-${orderId}`).emit("technician-location-ended", {
              technicianId,
              orderId,
              timestamp: new Date(),
            });

            console.log(
              `Technician ${technicianId} stopped sharing location for booking ${orderId}`
            );
          } catch (error) {
            console.error("Error in technician-location-stop:", error);
            socket.emit("location-error", {
              message: "Failed to stop location sharing",
            });
          }
        }
      );

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        // Clean up disconnected technicians
        const technicianId = this.activeConnections.get(socket.id);
        if (technicianId) {
          this.activeConnections.delete(socket.id);
          // Note: We don't automatically stop location sharing on disconnect
          // to handle temporary connection losses
        }
      });
    });
  }

  public getIO(): Server {
    return this.io;
  }
}
