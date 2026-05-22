import { toast } from "sonner";
import { useNotificationStore, Notification } from "../store/useNotificationStore";
import type { BackendNotificationPayload } from "../types/notification";

export interface NotifyOptions {
  type: Notification["type"];
  title: string;
  message: string;
}

export const notificationTypeColors: Record<Notification["type"], string> = {
  success: "text-green-400",
  warning: "text-yellow-400",
  error: "text-red-400",
  info: "text-blue-400",
};

export function notify({ type, title, message }: NotifyOptions) {
  const notification: Notification = {
    id: crypto.randomUUID(),
    type,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  };

  useNotificationStore.getState().addNotification(notification);

  toast[type](title, {
    description: message,
    duration: 5000,
  });
}

/** Maps backend WebSocket events → store + Sonner toast */
export function handleBackendNotification(data: BackendNotificationPayload) {
  const eventType = data.type ?? data.event;
  const message = data.message ?? "";

  switch (eventType) {
    case "LOW_STOCK":
      notify({
        type: "warning",
        title: "Low Stock",
        message,
      });
      break;

    case "ORDER_CREATED":
      notify({
        type: "info",
        title: "New Order",
        message: message || `Order #${data.orderId ?? ""} created`,
      });
      break;

    case "ORDER_PAID":
    case "ORDER_STATUS_UPDATE":
      if (data.status === "paid" || eventType === "ORDER_PAID") {
        notify({
          type: "success",
          title: "Order Completed",
          message: message || `Order #${data.orderId ?? ""} paid`,
        });
      } else {
        notify({
          type: "info",
          title: "Order Updated",
          message: message || `Order #${data.orderId ?? ""} is now ${data.status ?? "updated"}`,
        });
      }
      break;

    case "PAYMENT_FAILED":
      notify({
        type: "error",
        title: "Payment Failed",
        message: message || "Payment could not be completed",
      });
      break;

    case "SHIFT_OPENED":
      notify({
        type: "success",
        title: "Shift Opened",
        message: message || "Shift is now open",
      });
      break;

    case "SHIFT_CLOSED":
      notify({
        type: "info",
        title: "Shift Closed",
        message: message || "Shift has been closed",
      });
      break;

    case "NEW_CUSTOMER":
      notify({
        type: "info",
        title: "New Customer",
        message: message || "A new customer was registered",
      });
      break;

    case "notification":
      notify({
        type: data.level ?? "info",
        title: data.title ?? "Notification",
        message,
      });
      break;

    default:
      if (data.title || message) {
        notify({
          type: data.level ?? "info",
          title: data.title ?? String(eventType ?? "Notification"),
          message,
        });
      }
      break;
  }
}
