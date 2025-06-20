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

  const getCategoryText = (category: string) => {
    switch (category) {
      case "booking":
        return "Agendamento";
      case "resource":
        return "Recurso";
      case "maintenance":
        return "Manutenção";
      case "system":
        return "Sistema";
      default:
        return "Geral";
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
                <Badge variant="outline">
                  {getCategoryText(notification.category)}
                </Badge>
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
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  const {
    notifications,
    stats,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearReadNotifications,
    fetchNotifications,
  } = useNotifications();

  // Filtrar notificações
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      search === "" ||
      notification.title.toLowerCase().includes(search.toLowerCase()) ||
      notification.content.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || notification.category === selectedCategory;
    const matchesPriority =
      selectedPriority === "all" || notification.priority === selectedPriority;

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "unread" && !notification.isRead) ||
      (activeTab === "read" && notification.isRead);

    return matchesSearch && matchesCategory && matchesPriority && matchesTab;
  });

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Notificações</h1>
            <p className="text-muted-foreground">
              Gerencie suas notificações e mantenha-se atualizado
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stats.unread > 0 && (
            <Button onClick={markAllAsRead} className="gap-2">
              <CheckCheck className="h-4 w-4" />
              Marcar todas como lidas
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Limpar lidas
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar notificações lidas</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja remover todas as notificações já lidas?
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={clearReadNotifications}>
                  Limpar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.unread}</p>
                <p className="text-sm text-muted-foreground">Não lidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.read}</p>
                <p className="text-sm text-muted-foreground">Lidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar notificações..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="booking">📅 Agendamentos</SelectItem>
                <SelectItem value="resource">🏫 Recursos</SelectItem>
                <SelectItem value="maintenance">🔧 Manutenção</SelectItem>
                <SelectItem value="system">⚙️ Sistema</SelectItem>
                <SelectItem value="general">💬 Geral</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedPriority}
              onValueChange={setSelectedPriority}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as prioridades</SelectItem>
                <SelectItem value="urgent">🔴 Urgente</SelectItem>
                <SelectItem value="high">🟠 Alta</SelectItem>
                <SelectItem value="normal">🔵 Normal</SelectItem>
                <SelectItem value="low">⚪ Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs e Lista */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="gap-2">
            Todas
            <Badge variant="secondary">{stats.total}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-2">
            Não lidas
            {stats.unread > 0 && (
              <Badge variant="destructive">{stats.unread}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="read" className="gap-2">
            Lidas
            <Badge variant="outline">{stats.read}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">
                Carregando notificações...
              </p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onRemove={removeNotification}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                Nenhuma notificação encontrada
              </h3>
              <p className="text-muted-foreground">
                {activeTab === "unread"
                  ? "Você está em dia! Não há notificações não lidas."
                  : "Tente ajustar os filtros ou buscar por outros termos."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
