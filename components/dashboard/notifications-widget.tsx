"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, Clock, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
}

const notificationIcons = {
  info: Info,
  success: Check,
  warning: AlertCircle,
  error: AlertCircle,
};

const notificationColors = {
  info: "text-blue-600 bg-blue-100",
  success: "text-green-600 bg-green-100",
  warning: "text-yellow-600 bg-yellow-100",
  error: "text-red-600 bg-red-100",
};

export function NotificationsWidget() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Agendamento Confirmado",
      message: "Sua reserva do Data Show para amanhã foi confirmada",
      type: "success",
      timestamp: new Date(Date.now() - 30 * 60000), // 30 min atrás
      read: false,
    },
    {
      id: "2",
      title: "Lembrete",
      message: "Você tem um agendamento do Lab de Informática em 1 hora",
      type: "info",
      timestamp: new Date(Date.now() - 60 * 60000), // 1 hora atrás
      read: false,
    },
    {
      id: "3",
      title: "Manutenção Programada",
      message: "O sistema ficará em manutenção no domingo das 2h às 6h",
      type: "warning",
      timestamp: new Date(Date.now() - 120 * 60000), // 2 horas atrás
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Simular nova notificação (em produção seria via WebSocket/SSE)
  useEffect(() => {
    const timer = setTimeout(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: "Novo Recurso Disponível",
        message: "Um novo projetor 4K foi adicionado ao sistema",
        type: "info",
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
    }, 15000); // Nova notificação após 15 segundos

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Card className="h-[400px] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Notificações</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5">
                  {unreadCount}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>
          <CardDescription>
            Atualizações e lembretes importantes
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <AnimatePresence>
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notification, index) => {
                    const Icon = notificationIcons[notification.type];
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-colors",
                          notification.read
                            ? "bg-muted/50"
                            : "bg-background hover:bg-accent"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex gap-3">
                          <div
                            className={cn(
                              "p-2 rounded-full shrink-0",
                              notificationColors[notification.type]
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p
                                  className={cn(
                                    "font-medium text-sm",
                                    notification.read && "text-muted-foreground"
                                  )}
                                >
                                  {notification.title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-primary rounded-full shrink-0 mt-1" />
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {format(notification.timestamp, "HH:mm", {
                                  locale: ptBR,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <Bell className="h-12 w-12 mb-3 opacity-20" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
