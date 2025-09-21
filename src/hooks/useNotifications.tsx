import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "./use-toast";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
  timestamp: number;
}

interface NotificationOptions {
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

class NotificationManager {
  private notifications: Notification[] = [];
  private listeners: Array<(notifications: Notification[]) => void> = [];
  private timers: Map<string, NodeJS.Timeout> = new Map();

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.notifications]));
  }

  add(notification: Omit<Notification, "id" | "timestamp">) {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
    };

    this.notifications.unshift(newNotification);
    this.notify();

    // Auto-remove notification after duration
    if (!notification.persistent && notification.duration !== 0) {
      const duration = notification.duration || 5000;
      const timer = setTimeout(() => {
        this.remove(id);
      }, duration);
      this.timers.set(id, timer);
    }

    return id;
  }

  remove(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notify();

    // Clear timer if exists
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  clear() {
    this.notifications = [];
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.notify();
  }

  getNotifications() {
    return [...this.notifications];
  }
}

const notificationManager = new NotificationManager();

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = notificationManager.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  const addNotification = useCallback(
    (
      type: Notification["type"],
      title: string,
      message?: string,
      options?: NotificationOptions
    ) => {
      const id = notificationManager.add({
        type,
        title,
        message,
        ...options,
      });

      // Also show toast for immediate feedback
      toast({
        title,
        description: message,
        variant: type === "error" ? "destructive" : "default",
      });

      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    notificationManager.remove(id);
  }, []);

  const clearNotifications = useCallback(() => {
    notificationManager.clear();
  }, []);

  const success = useCallback(
    (title: string, message?: string, options?: NotificationOptions) => {
      return addNotification("success", title, message, options);
    },
    [addNotification]
  );

  const error = useCallback(
    (title: string, message?: string, options?: NotificationOptions) => {
      return addNotification("error", title, message, {
        persistent: true,
        ...options,
      });
    },
    [addNotification]
  );

  const warning = useCallback(
    (title: string, message?: string, options?: NotificationOptions) => {
      return addNotification("warning", title, message, options);
    },
    [addNotification]
  );

  const info = useCallback(
    (title: string, message?: string, options?: NotificationOptions) => {
      return addNotification("info", title, message, options);
    },
    [addNotification]
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    warning,
    info,
  };
}

// Specific notification helpers for common use cases
export function useApiNotifications() {
  const { success, error, warning, info } = useNotifications();

  const apiSuccess = useCallback(
    (action: string, entity?: string) => {
      success(
        `${action} Successful`,
        entity
          ? `${entity} has been ${action.toLowerCase()}d successfully`
          : undefined
      );
    },
    [success]
  );

  const apiError = useCallback(
    (action: string, errorMessage?: string, entity?: string) => {
      error(
        `${action} Failed`,
        errorMessage || `Failed to ${action.toLowerCase()} ${entity || "item"}`
      );
    },
    [error]
  );

  const validationError = useCallback(
    (message: string) => {
      error("Validation Error", message);
    },
    [error]
  );

  const networkError = useCallback(() => {
    error(
      "Connection Error",
      "Please check your internet connection and try again",
      { persistent: true }
    );
  }, [error]);

  const sessionExpired = useCallback(() => {
    warning("Session Expired", "Please login again to continue", {
      persistent: true,
    });
  }, [warning]);

  const permissionDenied = useCallback(
    (action?: string) => {
      error(
        "Access Denied",
        action
          ? `You don't have permission to ${action}`
          : "You don't have permission to perform this action"
      );
    },
    [error]
  );

  const notFound = useCallback(
    (entity?: string) => {
      error(
        "Not Found",
        entity
          ? `${entity} was not found`
          : "The requested resource was not found"
      );
    },
    [error]
  );

  const conflict = useCallback(
    (message?: string) => {
      error("Conflict", message || "This resource already exists or is in use");
    },
    [error]
  );

  const rateLimited = useCallback(() => {
    warning("Too Many Requests", "Please wait a moment before trying again");
  }, [warning]);

  return {
    apiSuccess,
    apiError,
    validationError,
    networkError,
    sessionExpired,
    permissionDenied,
    notFound,
    conflict,
    rateLimited,
  };
}

// Notification component for displaying notifications
export function NotificationItem({
  notification,
  onRemove,
}: {
  notification: Notification;
  onRemove: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const getTypeStyles = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "•";
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } border rounded-lg p-4 shadow-lg max-w-sm w-full ${getTypeStyles()}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <span className="text-lg">{getIcon()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium">{notification.title}</h4>
          {notification.message && (
            <p className="text-sm mt-1 opacity-90">{notification.message}</p>
          )}
          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-2 space-x-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="text-xs underline hover:no-underline">
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="flex-shrink-0 text-lg hover:opacity-70">
          ×
        </button>
      </div>
    </div>
  );
}

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
}

export default useNotifications;
