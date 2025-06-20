import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  priority: "low" | "normal" | "high" | "urgent";
  category: "booking" | "resource" | "maintenance" | "system" | "general";
  actionUrl?: string;
  metadata?: string;
  expiresAt?: string;
  createdAt: string;
  readAt?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  stats: NotificationStats;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    read: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar notificações
  const fetchNotifications = useCallback(
    async (options?: {
      isRead?: boolean;
      category?: string;
      priority?: string;
      limit?: number;
      offset?: number;
    }) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (options?.isRead !== undefined)
          params.set("isRead", options.isRead.toString());
        if (options?.category) params.set("category", options.category);
        if (options?.priority) params.set("priority", options.priority);
        if (options?.limit) params.set("limit", options.limit.toString());
        if (options?.offset) params.set("offset", options.offset.toString());

        const response = await fetch(`/api/notifications?${params}`);

        if (!response.ok) {
          throw new Error("Erro ao buscar notificações");
        }

        const data: NotificationResponse = await response.json();

        if (options?.offset && options.offset > 0) {
          // Se é paginação, adicionar às existentes
          setNotifications((prev) => [...prev, ...data.notifications]);
        } else {
          // Se é busca inicial, substituir todas
          setNotifications(data.notifications);
        }

        setStats(data.stats);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        toast.error("Erro ao carregar notificações");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Marcar notificação como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) {
        throw new Error("Erro ao marcar notificação como lida");
      }

      const updatedNotification: Notification = await response.json();

      // Atualizar estado local
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? updatedNotification
            : notification
        )
      );

      // Atualizar estatísticas
      setStats((prev) => ({
        total: prev.total,
        unread: Math.max(0, prev.unread - 1),
        read: prev.read + 1,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(errorMessage);
    }
  }, []);

  // Marcar notificação como não lida
  const markAsUnread = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead: false }),
      });

      if (!response.ok) {
        throw new Error("Erro ao marcar notificação como não lida");
      }

      const updatedNotification: Notification = await response.json();

      // Atualizar estado local
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? updatedNotification
            : notification
        )
      );

      // Atualizar estatísticas
      setStats((prev) => ({
        total: prev.total,
        unread: prev.unread + 1,
        read: Math.max(0, prev.read - 1),
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(errorMessage);
    }
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications?action=mark-all-read", {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Erro ao marcar todas as notificações como lidas");
      }

      // Atualizar estado local
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString(),
        }))
      );

      // Atualizar estatísticas
      setStats((prev) => ({
        total: prev.total,
        unread: 0,
        read: prev.total,
      }));

      toast.success("Todas as notificações foram marcadas como lidas");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(errorMessage);
    }
  }, []);

  // Remover notificação
  const removeNotification = useCallback(
    async (notificationId: string) => {
      try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Erro ao remover notificação");
        }

        const removedNotification = notifications.find(
          (n) => n.id === notificationId
        );

        // Atualizar estado local
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        // Atualizar estatísticas
        setStats((prev) => ({
          total: Math.max(0, prev.total - 1),
          unread:
            removedNotification && !removedNotification.isRead
              ? Math.max(0, prev.unread - 1)
              : prev.unread,
          read:
            removedNotification && removedNotification.isRead
              ? Math.max(0, prev.read - 1)
              : prev.read,
        }));

        toast.success("Notificação removida");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        toast.error(errorMessage);
      }
    },
    [notifications]
  );

  // Limpar notificações lidas
  const clearReadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications?action=clear-read", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao limpar notificações");
      }

      const result = await response.json();

      // Atualizar estado local
      setNotifications((prev) => prev.filter((n) => !n.isRead));

      // Atualizar estatísticas
      setStats((prev) => ({
        total: prev.unread,
        unread: prev.unread,
        read: 0,
      }));

      toast.success(result.message);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(errorMessage);
    }
  }, []);

  // Criar nova notificação (para admins)
  const createNotification = useCallback(
    async (data: {
      userId?: string;
      type: string;
      title: string;
      content: string;
      priority?: "low" | "normal" | "high" | "urgent";
      category?: "booking" | "resource" | "maintenance" | "system" | "general";
      actionUrl?: string;
      metadata?: string;
      expiresAt?: string;
    }) => {
      try {
        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Erro ao criar notificação");
        }

        const newNotification: Notification = await response.json();

        // Se a notificação é para o usuário atual, adicionar à lista
        setNotifications((prev) => [newNotification, ...prev]);

        // Atualizar estatísticas
        setStats((prev) => ({
          total: prev.total + 1,
          unread: prev.unread + 1,
          read: prev.read,
        }));

        toast.success("Notificação criada com sucesso");
        return newNotification;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        toast.error(errorMessage);
        throw err;
      }
    },
    []
  );

  // Buscar notificações não lidas na inicialização
  useEffect(() => {
    fetchNotifications({ isRead: false, limit: 20 });
  }, [fetchNotifications]);

  return {
    notifications,
    stats,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    removeNotification,
    clearReadNotifications,
    createNotification,
    // Helpers
    unreadCount: stats.unread,
    hasUnread: stats.unread > 0,
  };
}
