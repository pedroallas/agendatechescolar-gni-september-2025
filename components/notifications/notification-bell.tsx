"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, Settings, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useNotifications, type Notification } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface NotificationBellProps {
  className?: string;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  isProcessing,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  isProcessing: string | null;
}) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500 bg-red-50 dark:bg-red-950";
      case "high":
        return "border-l-orange-500 bg-orange-50 dark:bg-orange-950";
      case "normal":
        return "border-l-blue-500 bg-blue-50 dark:bg-blue-950";
      case "low":
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-950";
      default:
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-950";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "booking":
        return "📅";
      case "resource":
        return "🏫";
      case "maintenance":
        return "🔧";
      case "system":
        return "⚙️";
      default:
        return "💬";
    }
  };

  const isProcessingThis = isProcessing === notification.id;

  return (
    <div
      className={cn(
        "p-3 border-l-4 rounded-r-md transition-all hover:shadow-sm",
        getPriorityColor(notification.priority),
        !notification.isRead && "bg-opacity-80 dark:bg-opacity-80",
        isProcessingThis && "opacity-50 pointer-events-none"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">
              {getCategoryIcon(notification.category)}
            </span>
            <h4
              className={cn(
                "text-sm font-medium truncate",
                !notification.isRead && "font-semibold"
              )}
            >
              {notification.title}
            </h4>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            )}
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {notification.content}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>

            <div className="flex items-center gap-1">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => onMarkAsRead(notification.id)}
                  disabled={isProcessingThis}
                  title="Marcar como lida"
                >
                  {isProcessingThis ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    fetchUnreadNotifications,
  } = useNotifications();

  // Filtrar apenas notificações não lidas para o sino
  const unreadNotifications = notifications.filter((n) => !n.isRead);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Recarregar notificações quando abrir
  useEffect(() => {
    if (isOpen) {
      // Para o sino, buscar apenas notificações não lidas
      fetchUnreadNotifications(10);
    }
  }, [isOpen, fetchUnreadNotifications]);

  // Handlers com loading states
  const handleMarkAsRead = async (id: string) => {
    try {
      setIsProcessing(id);
      await markAsRead(id);
      toast.success("Notificação marcada como lida");
    } catch (error) {
      toast.error("Erro ao marcar notificação como lida");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsProcessing("all");
      await markAllAsRead();
      toast.success("Todas as notificações foram marcadas como lidas");
    } catch (error) {
      toast.error("Erro ao marcar todas como lidas");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Botão do sino */}
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown das notificações */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-background border rounded-lg shadow-lg z-50 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <h3 className="font-semibold">Notificações</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} nova{unreadCount !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={handleMarkAllAsRead}
                  disabled={isProcessing === "all"}
                  title="Marcar todas como lidas"
                >
                  {isProcessing === "all" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCheck className="h-3 w-3" />
                  )}
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Lista de notificações */}
          <ScrollArea className="flex-1 max-h-96">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Carregando notificações...
              </div>
            ) : unreadNotifications.length > 0 ? (
              <div className="p-2 space-y-2">
                {unreadNotifications.slice(0, 10).map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    isProcessing={isProcessing}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">Nenhuma notificação</p>
                <p className="text-sm">Você está em dia!</p>
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {unreadNotifications.length > 0 && (
            <>
              <Separator />
              <div className="p-3 flex items-center justify-between text-sm flex-shrink-0">
                <span className="text-muted-foreground">
                  {unreadNotifications.length} não lida
                  {unreadNotifications.length !== 1 ? "s" : ""}
                </span>

                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => {
                    setIsOpen(false);
                    // Navegar para página de notificações
                    window.location.href = "/dashboard/notifications";
                  }}
                >
                  Ver todas
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
