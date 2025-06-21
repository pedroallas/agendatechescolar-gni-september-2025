"use client";

import { useState } from "react";
import {
  Bell,
  Filter,
  CheckCheck,
  Trash2,
  Search,
  Settings,
  MoreVertical,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
        return "border-l-red-500 bg-red-50/50 dark:bg-red-950/50";
      case "high":
        return "border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/50";
      case "normal":
        return "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/50";
      case "low":
        return "border-l-gray-500 bg-gray-50/50 dark:bg-gray-950/50";
      default:
        return "border-l-gray-500 bg-gray-50/50 dark:bg-gray-950/50";
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
        "border-l-4 transition-all hover:shadow-md w-full lg:hover:shadow-xl",
        getPriorityColor(notification.priority),
        !notification.isRead && "shadow-sm"
      )}
    >
      <CardHeader className="pb-2 px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 lg:pt-8">
        <div className="space-y-2">
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
            <div className="text-lg sm:text-xl lg:text-2xl flex-shrink-0 mt-0.5">
              {getCategoryIcon(notification.category)}
            </div>
            <div className="flex-1 min-w-0 space-y-1 lg:space-y-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle
                  className={cn(
                    "text-sm sm:text-base lg:text-lg leading-tight",
                    !notification.isRead && "font-bold"
                  )}
                >
                  {notification.title}
                  {!notification.isRead && (
                    <span className="inline-block w-2 h-2 lg:w-3 lg:h-3 bg-blue-500 rounded-full ml-2 align-middle" />
                  )}
                </CardTitle>

                {/* Desktop Actions */}
                <div className="hidden sm:flex items-center gap-1 lg:gap-2 flex-shrink-0">
                  {!notification.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMarkAsRead(notification.id)}
                      className="h-7 lg:h-9 px-2 lg:px-3 text-xs lg:text-sm whitespace-nowrap"
                    >
                      <CheckCheck className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-1.5" />
                      <span>Marcar como lida</span>
                    </Button>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 lg:h-9 px-2 lg:px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="mx-4 max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover notificação</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover esta notificação? Esta
                          ação não pode ser desfeita.
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

                {/* Mobile Actions */}
                <div className="sm:hidden flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {!notification.isRead && (
                        <DropdownMenuItem
                          onClick={() => onMarkAsRead(notification.id)}
                        >
                          <CheckCheck className="h-4 w-4 mr-2" />
                          Marcar como lida
                        </DropdownMenuItem>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="mx-4 max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Remover notificação
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover esta notificação?
                              Esta ação não pode ser desfeita.
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
                <Badge
                  variant={
                    notification.priority === "urgent"
                      ? "destructive"
                      : notification.priority === "high"
                      ? "default"
                      : "secondary"
                  }
                  className="text-xs lg:text-sm px-2 lg:px-3 py-0.5 lg:py-1"
                >
                  {getPriorityText(notification.priority)}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs lg:text-sm px-2 lg:px-3 py-0.5 lg:py-1"
                >
                  {getCategoryText(notification.category)}
                </Badge>
              </div>

              {/* Date */}
              <CardDescription className="text-xs lg:text-sm">
                <div className="space-y-0.5 sm:space-y-0 lg:flex lg:items-center lg:gap-2">
                  <div>
                    {format(
                      new Date(notification.createdAt),
                      "d 'de' MMMM 'às' HH:mm",
                      { locale: ptBR }
                    )}
                  </div>
                  <div className="hidden lg:block text-muted-foreground">•</div>
                  <div className="text-muted-foreground/80">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </div>
                </div>
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-3 sm:px-6 lg:px-8 pb-3 sm:pb-6 lg:pb-8">
        <div className="pl-6 sm:pl-9 lg:pl-12">
          <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
            {notification.content}
          </p>

          {notification.actionUrl && (
            <div className="mt-3 lg:mt-4">
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs sm:text-sm lg:text-base hover:underline"
                onClick={() => (window.location.href = notification.actionUrl!)}
              >
                Ver detalhes →
              </Button>
            </div>
          )}
        </div>
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
    <div className="w-full h-full -m-4 sm:-m-6 p-4 sm:p-6 lg:p-8 overflow-auto">
      <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-start sm:justify-between sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                Notificações
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Gerencie suas notificações e mantenha-se atualizado
              </p>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row gap-2 sm:flex-shrink-0">
            {stats.unread > 0 && (
              <Button
                onClick={markAllAsRead}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                <span className="hidden xs:inline">Marcar todas</span>
                <span className="xs:hidden">Todas</span>
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                  <span className="hidden xs:inline">Limpar lidas</span>
                  <span className="xs:hidden">Limpar</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-3 max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>Limpar notificações lidas</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja remover todas as notificações já
                    lidas? Esta ação não pode ser desfeita.
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
        <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="p-2 sm:p-2.5 lg:p-3 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-xl lg:text-3xl font-bold">
                    {stats.total}
                  </p>
                  <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                    Total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="p-2 sm:p-2.5 lg:p-3 bg-orange-100 dark:bg-orange-900 rounded-lg flex-shrink-0">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-xl lg:text-3xl font-bold">
                    {stats.unread}
                  </p>
                  <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                    Não lidas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="p-2 sm:p-2.5 lg:p-3 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
                  <CheckCheck className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-xl lg:text-3xl font-bold">
                    {stats.read}
                  </p>
                  <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                    Lidas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="space-y-4 lg:space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar notificações..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 text-sm lg:text-base h-10 lg:h-12"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="text-sm lg:text-base h-10 lg:h-12">
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
                  <SelectTrigger className="text-sm lg:text-base h-10 lg:h-12">
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
            </div>
          </CardContent>
        </Card>

        {/* Tabs e Lista */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="w-full sm:w-auto h-auto p-1 lg:p-2">
              <TabsTrigger
                value="all"
                className="flex-1 sm:flex-none gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base px-2 sm:px-3 lg:px-4 py-1.5 lg:py-2"
              >
                <span>Todas</span>
                <Badge
                  variant="secondary"
                  className="text-xs lg:text-sm px-1.5 lg:px-2 py-0.5 lg:py-1 min-w-[20px] lg:min-w-[28px] justify-center"
                >
                  {stats.total}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="flex-1 sm:flex-none gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base px-2 sm:px-3 lg:px-4 py-1.5 lg:py-2"
              >
                <span>Não lidas</span>
                {stats.unread > 0 && (
                  <Badge
                    variant="destructive"
                    className="text-xs lg:text-sm px-1.5 lg:px-2 py-0.5 lg:py-1 min-w-[20px] lg:min-w-[28px] justify-center"
                  >
                    {stats.unread}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="read"
                className="flex-1 sm:flex-none gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base px-2 sm:px-3 lg:px-4 py-1.5 lg:py-2"
              >
                <span>Lidas</span>
                <Badge
                  variant="outline"
                  className="text-xs lg:text-sm px-1.5 lg:px-2 py-0.5 lg:py-1 min-w-[20px] lg:min-w-[28px] justify-center"
                >
                  {stats.read}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value={activeTab}
            className="mt-4 lg:mt-6 space-y-3 lg:space-y-4"
          >
            {loading ? (
              <div className="text-center py-8 sm:py-12 lg:py-16">
                <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3 sm:mb-4 lg:mb-6" />
                <p className="text-sm lg:text-base text-muted-foreground">
                  Carregando notificações...
                </p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="space-y-3 lg:space-y-4">
                {filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onRemove={removeNotification}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 lg:py-20">
                <Bell className="h-10 w-10 sm:h-12 sm:w-12 lg:h-20 lg:w-20 mx-auto mb-3 sm:mb-4 lg:mb-6 text-muted-foreground opacity-50" />
                <h3 className="text-sm sm:text-base lg:text-xl font-medium mb-2 lg:mb-3">
                  Nenhuma notificação encontrada
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground max-w-md mx-auto">
                  {activeTab === "unread"
                    ? "Você está em dia! Não há notificações não lidas."
                    : "Tente ajustar os filtros ou buscar por outros termos."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
