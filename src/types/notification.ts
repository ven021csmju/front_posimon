export type BackendNotificationType =
  | 'LOW_STOCK'
  | 'ORDER_CREATED'
  | 'ORDER_PAID'
  | 'PAYMENT_FAILED'
  | 'SHIFT_OPENED'
  | 'SHIFT_CLOSED'
  | 'NEW_CUSTOMER'
  | 'ORDER_STATUS_UPDATE'
  | 'notification';

export interface BackendNotificationPayload {
  type?: BackendNotificationType | string;
  event?: string;
  title?: string;
  message?: string;
  level?: 'success' | 'warning' | 'error' | 'info';
  orderId?: string | number;
  status?: string;
}
