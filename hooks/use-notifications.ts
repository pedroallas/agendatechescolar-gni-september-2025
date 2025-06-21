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

        const response = await fetch(`/api/notifications?${params}`, {
          credentials: "include", // Incluir cookies de autenticação
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Sessão expirada. Faça login novamente.");
          }
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

        // Só mostrar toast se não for erro de autenticação
        if (!errorMessage.includes("Sessão expirada")) {
          toast.error("Erro ao carregar notificações");
        }
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
        credentials: "include",
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sessão expirada. Faça login novamente.");
        }
        throw new Error(
          `Erro ao marcar notificação como lida: ${response.status}`
        );
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

      return updatedNotification;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      throw new Error(errorMessage);
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
        credentials: "include",
        body: JSON.stringify({ isRead: false }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sessão expirada. Faça login novamente.");
        }
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

      return updatedNotification;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      throw new Error(errorMessage);
    }
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications?action=mark-all-read", {
        method: "PUT",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sessão expirada. Faça login novamente.");
        }
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
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      throw new Error(errorMessage);
    }
  }, []);

  // Remover notificação
  const removeNotification = useCallback(
    async (notificationId: string) => {
      try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Sessão expirada. Faça login novamente.");
          }
          throw new Error(`Erro ao remover notificação: ${response.status}`);
        }

        // Encontrar a notificação que será removida para atualizar as estatísticas corretamente
        const removedNotification = notifications.find(
          (n) => n.id === notificationId
        );

        // Atualizar estado local
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== notificationId)
        );

        // Atualizar estatísticas
        if (removedNotification) {
          setStats((prev) => {
            const wasUnread = !removedNotification.isRead;
            return {
              total: Math.max(0, prev.total - 1),
              unread: wasUnread ? Math.max(0, prev.unread - 1) : prev.unread,
              read: wasUnread ? prev.read : Math.max(0, prev.read - 1),
            };
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        throw new Error(errorMessage);
      }
    },
    [notifications]
  );

  // Buscar apenas notificações não lidas (para o sino)
  const fetchUnreadNotifications = useCallback(
    async (limit: number = 10) => {
      return fetchNotifications({ isRead: false, limit });
    },
    [fetchNotifications]
  );

  // Carregar notificações iniciais
  useEffect(() => {
    fetchNotifications({ limit: 20 });
  }, [fetchNotifications]);

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchNotifications({ limit: 20 });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, loading]);

  return {
    notifications,
    stats,
    unreadCount: stats.unread,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    removeNotification,
    fetchUnreadNotifications,
  };
}
