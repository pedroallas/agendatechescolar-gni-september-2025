"use client";

import { useState } from "react";
import {
  Bell,
  Filter,
  CheckCheck,
  Trash2,
  Search,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNotifications, type Notification } from "@/hooks/use-notifications";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

function NotificationCard({
  notification,
  onMarkAsRead,
  onRemove,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
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

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Urgente";
      case "high":
        return "Alta";
      case "normal":
        return "Normal";
      case "low":
        return "Baixa";
      default:
        return "Normal";
    }
  };

  return (
    <Card
      className={cn(
        "border-l-4 transition-all hover:shadow-md",
        getPriorityColor(notification.priority),
        !notification.isRead && "shadow-sm"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="text-2xl">
              {getCategoryIcon(notification.category)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle
                  className={cn("text-lg", !notification.isRead && "font-bold")}
                >
                  {notification.title}
                </CardTitle>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant={
                    notification.priority === "urgent"
                      ? "destructive"
                      : notification.priority === "high"
                      ? "default"
                      : "secondary"
                  }
                >
                  {getPriorityText(notification.priority)}
                </Badge>
                <Badge variant="outline">{notification.category}</Badge>
              </div>
              <CardDescription className="text-sm">
                {format(
                  new Date(notification.createdAt),
                  "d 'de' MMMM 'às' HH:mm",
                  { locale: ptBR }
                )}
                {" • "}
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-start gap-1">
            {!notification.isRead && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
                className="h-8 px-3"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Marcar como lida
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover notificação</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja remover esta notificação? Esta ação
                    não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onRemove(notification.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {notification.content}
        </p>

        {notification.actionUrl && (
          <div className="mt-3">
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={() => (window.location.href = notification.actionUrl!)}
            >
              Ver detalhes →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function NotificationsPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center py-12">
        <Bell className="h-16 w-16 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold mb-2">Sistema de Notificações</h1>
        <p className="text-muted-foreground mb-4">
          Esta página está sendo implementada na Fase 6 - Comunicação e
          Notificações
        </p>
        <div className="text-sm text-muted-foreground">
          ✅ API de notificações criada
          <br />
          ✅ Hook useNotifications implementado
          <br />
          ✅ Sino de notificações na navegação
          <br />
          🚧 Interface completa em desenvolvimento...
        </div>
      </div>
    </div>
  );
}
