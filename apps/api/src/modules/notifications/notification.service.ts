import { Injectable, Logger } from '@nestjs/common';

export interface NotificationPayload {
  user_id: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async send(payload: NotificationPayload): Promise<{ success: true }> {
    // Runtime-safe placeholder implementation for module wiring.
    this.logger.log(
      `Notification queued [${payload.type}] for user ${payload.user_id}`,
    );
    return { success: true };
  }
}
