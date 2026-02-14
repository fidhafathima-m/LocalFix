import { OrderService } from './OrderService';
import { LoggerService } from './LoggerService';

export class CronService {
  private orderService: OrderService;
  private logger: LoggerService;

  constructor(orderService: OrderService, logger: LoggerService) {
    this.orderService = orderService;
    this.logger = logger;
  }

  async autoCancelExpiredOrders(): Promise<void> {
    try {
      this.logger.info('Running auto-cancel expired orders cron job');
      await this.orderService.autoCancelExpiredOrders();
      this.logger.info('Auto-cancel expired orders cron job completed');
    } catch (error) {
      this.logger.error('Failed to run auto-cancel expired orders cron job', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
