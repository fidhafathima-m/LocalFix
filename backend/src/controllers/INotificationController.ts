import { Request, Response } from "express";
import { INotificationService } from "../interfaces/services/INotificationService";
import { ResponseHelper } from "../utils/responseHelper";
import { LoggerService } from "../services/LoggerService";

export class NotificationController {
  private notificationService: INotificationService;
  private logger: LoggerService;

  constructor(notificationService: INotificationService) {
    this.notificationService = notificationService;
    this.logger = new LoggerService();
  }

  getNotificationsByUser = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const context = {
      operation: "getNotificationsByUser",
      userId,
      page,
      limit,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info("Fetching notifications for user", context);

      if (!userId || typeof userId !== "string") {
        const response = ResponseHelper.badRequest("User ID is required");
        res.status(response.statusCode).json(response);
        return;
      }

      const result = await this.notificationService.getNotificationsByUser(userId, page, limit);

      this.logger.info("Notifications retrieved successfully", {
        ...context,
        count: result.notifications.length
      });

      const response = ResponseHelper.success("Notifications retrieved successfully", result);
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      this.logger.error("Get notifications controller error", {
        ...context,
        error: error.message,
        stack: error.stack
      });

      const response = ResponseHelper.error("Failed to retrieve notifications");
      res.status(response.statusCode).json(response);
    }
  };

  markAsRead = async (req: Request, res: Response): Promise<void> => {
    const { notificationId } = req.params;

    const context = {
      operation: "markAsRead",
      notificationId,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info("Marking notification as read", context);

      const result = await this.notificationService.markAsRead(notificationId);

      this.logger.info("Notification marked as read successfully", context);

      const response = ResponseHelper.success("Notification marked as read", {
        notification: result
      });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      this.logger.error("Mark as read controller error", {
        ...context,
        error: error.message,
        stack: error.stack
      });

      const response = error.message === "Notification not found" 
        ? ResponseHelper.notFound("Notification not found")
        : ResponseHelper.error("Failed to mark notification as read");
      
      res.status(response.statusCode).json(response);
    }
  };

  markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.body;

    const context = {
      operation: "markAllAsRead",
      userId,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info("Marking all notifications as read", context);

      if (!userId) {
        const response = ResponseHelper.badRequest("User ID is required");
        res.status(response.statusCode).json(response);
        return;
      }

      const result = await this.notificationService.markAllAsRead(userId);

      const response = result.success
        ? ResponseHelper.success(result.message)
        : ResponseHelper.error(result.message);
      
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      this.logger.error("Mark all as read controller error", {
        ...context,
        error: error.message,
        stack: error.stack
      });

      const response = ResponseHelper.error("Failed to mark all notifications as read");
      res.status(response.statusCode).json(response);
    }
  };

  getUnreadCount = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.query;

    const context = {
      operation: "getUnreadCount",
      userId,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info("Getting unread notification count", context);

      if (!userId || typeof userId !== "string") {
        const response = ResponseHelper.badRequest("User ID is required");
        res.status(response.statusCode).json(response);
        return;
      }

      const result = await this.notificationService.getUnreadCount(userId);

      const response = result.success
        ? ResponseHelper.success("Unread count retrieved", { count: result.count })
        : ResponseHelper.error(result.message || "Failed to get unread count");
      
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      this.logger.error("Get unread count controller error", {
        ...context,
        error: error.message,
        stack: error.stack
      });

      const response = ResponseHelper.error("Failed to get unread count");
      res.status(response.statusCode).json(response);
    }
  };
}