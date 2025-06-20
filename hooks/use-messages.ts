"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string;
  content: string;
  priority: "low" | "normal" | "high" | "urgent";
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  isDraft: boolean;
  attachments: string[];
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string;
  };
  recipient: {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string;
  };
  replies: MessageReply[];
}

export interface MessageReply {
  id: string;
  messageId: string;
  senderId: string;
  content: string;
  attachments: string[];
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface MessagesState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  stats: {
    total: number;
    unread: number;
    read: number;
  };
}

interface UseMessagesOptions {
  type?: "inbox" | "sent" | "drafts" | "archived";
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useMessages(options: UseMessagesOptions = {}) {
  const {
    type = "inbox",
    autoRefresh = false,
    refreshInterval = 30000,
  } = options;

  const [state, setState] = useState<MessagesState>({
    messages: [],
    isLoading: true,
    error: null,
    pagination: {
      total: 0,
      limit: 20,
      offset: 0,
      hasMore: false,
    },
    stats: {
      total: 0,
      unread: 0,
      read: 0,
    },
  });

  const [filters, setFilters] = useState({
    search: "",
    priority: "",
    isRead: "",
  });

  // Função para buscar mensagens
  const fetchMessages = useCallback(
    async (reset = false) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const params = new URLSearchParams({
          type,
          limit: state.pagination.limit.toString(),
          offset: reset ? "0" : state.pagination.offset.toString(),
        });

        if (filters.search) params.append("search", filters.search);
        if (filters.priority) params.append("priority", filters.priority);
        if (filters.isRead) params.append("isRead", filters.isRead);

        const response = await fetch(`/api/messages?${params}`);

        if (!response.ok) {
          throw new Error("Erro ao buscar mensagens");
        }

        const data = await response.json();

        setState((prev) => ({
          ...prev,
          messages: reset
            ? data.messages
            : [...prev.messages, ...data.messages],
          pagination: data.pagination,
          stats: data.stats || prev.stats,
          isLoading: false,
        }));
      } catch (error) {
        console.error("Erro ao buscar mensagens:", error);
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Erro desconhecido",
          isLoading: false,
        }));
      }
    },
    [type, filters, state.pagination.limit, state.pagination.offset]
  );

  // Buscar mensagem específica
  const fetchMessage = useCallback(
    async (messageId: string): Promise<Message | null> => {
      try {
        const response = await fetch(`/api/messages/${messageId}`);

        if (!response.ok) {
          throw new Error("Erro ao buscar mensagem");
        }

        return await response.json();
      } catch (error) {
        console.error("Erro ao buscar mensagem:", error);
        toast.error("Erro ao carregar mensagem");
        return null;
      }
    },
    []
  );

  // Criar nova mensagem
  const createMessage = useCallback(
    async (data: {
      recipientId: string;
      subject: string;
      content: string;
      priority?: "low" | "normal" | "high" | "urgent";
      attachments?: string[];
    }) => {
      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Erro ao enviar mensagem");
        }

        const message = await response.json();

        // Atualizar lista se for tipo 'sent'
        if (type === "sent") {
          setState((prev) => ({
            ...prev,
            messages: [message, ...prev.messages],
          }));
        }

        toast.success("Mensagem enviada com sucesso!");
        return message;
      } catch (error) {
        console.error("Erro ao criar mensagem:", error);
        toast.error(
          error instanceof Error ? error.message : "Erro ao enviar mensagem"
        );
        throw error;
      }
    },
    [type]
  );

  // Responder mensagem
  const replyMessage = useCallback(
    async (
      messageId: string,
      data: {
        content: string;
        attachments?: string[];
      }
    ) => {
      try {
        const response = await fetch(`/api/messages/${messageId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Erro ao responder mensagem");
        }

        const reply = await response.json();

        // Atualizar mensagem na lista
        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  replies: [...msg.replies, reply],
                  updatedAt: new Date().toISOString(),
                }
              : msg
          ),
        }));

        toast.success("Resposta enviada com sucesso!");
        return reply;
      } catch (error) {
        console.error("Erro ao responder mensagem:", error);
        toast.error(
          error instanceof Error ? error.message : "Erro ao responder mensagem"
        );
        throw error;
      }
    },
    []
  );

  // Atualizar mensagem
  const updateMessage = useCallback(
    async (
      messageId: string,
      data: {
        isRead?: boolean;
        isStarred?: boolean;
        isArchived?: boolean;
      }
    ) => {
      try {
        const response = await fetch(`/api/messages/${messageId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Erro ao atualizar mensagem");
        }

        const updatedMessage = await response.json();

        // Atualizar mensagem na lista
        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) =>
            msg.id === messageId ? updatedMessage : msg
          ),
          stats:
            data.isRead !== undefined
              ? {
                  ...prev.stats,
                  unread: data.isRead
                    ? prev.stats.unread - 1
                    : prev.stats.unread + 1,
                  read: data.isRead ? prev.stats.read + 1 : prev.stats.read - 1,
                }
              : prev.stats,
        }));

        return updatedMessage;
      } catch (error) {
        console.error("Erro ao atualizar mensagem:", error);
        toast.error("Erro ao atualizar mensagem");
        throw error;
      }
    },
    []
  );

  // Excluir mensagem
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir mensagem");
      }

      // Remover mensagem da lista
      setState((prev) => ({
        ...prev,
        messages: prev.messages.filter((msg) => msg.id !== messageId),
        pagination: {
          ...prev.pagination,
          total: prev.pagination.total - 1,
        },
      }));

      toast.success("Mensagem excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir mensagem:", error);
      toast.error("Erro ao excluir mensagem");
      throw error;
    }
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch("/api/messages?action=mark-all-read", {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Erro ao marcar mensagens como lidas");
      }

      // Atualizar todas as mensagens
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) => ({ ...msg, isRead: true })),
        stats: {
          ...prev.stats,
          unread: 0,
          read: prev.stats.total,
        },
      }));

      toast.success("Todas as mensagens foram marcadas como lidas");
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
      toast.error("Erro ao marcar mensagens como lidas");
    }
  }, []);

  // Aplicar filtros
  const applyFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, offset: 0 },
    }));
  }, []);

  // Carregar mais mensagens
  const loadMore = useCallback(() => {
    if (!state.pagination.hasMore || state.isLoading) return;

    setState((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        offset: prev.pagination.offset + prev.pagination.limit,
      },
    }));
  }, [state.pagination.hasMore, state.isLoading]);

  // Refresh manual
  const refresh = useCallback(() => {
    setState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, offset: 0 },
    }));
    fetchMessages(true);
  }, [fetchMessages]);

  // Efeito para buscar mensagens
  useEffect(() => {
    fetchMessages(true);
  }, [type, filters]);

  // Efeito para carregar mais mensagens
  useEffect(() => {
    if (state.pagination.offset > 0) {
      fetchMessages(false);
    }
  }, [state.pagination.offset]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    ...state,
    filters,
    fetchMessage,
    createMessage,
    replyMessage,
    updateMessage,
    deleteMessage,
    markAllAsRead,
    applyFilters,
    loadMore,
    refresh,
  };
}
