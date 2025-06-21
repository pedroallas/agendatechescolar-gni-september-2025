"use client";

import { useState, useEffect } from "react";
import { useMessages, Message } from "@/hooks/use-messages";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Mail,
  MailOpen,
  Star,
  StarOff,
  Archive,
  Trash2,
  Reply,
  Send,
  Plus,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle2,
  MoreHorizontal,
  ArrowLeft,
  MoreVertical,
  ArrowDown,
  ArrowUp,
  Minus,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const priorityColors = {
  low: "text-blue-600 bg-blue-50 border-blue-200",
  normal: "text-gray-600 bg-gray-50 border-gray-200",
  high: "text-orange-600 bg-orange-50 border-orange-200",
  urgent: "text-red-600 bg-red-50 border-red-200",
};

const priorityIcons = {
  low: Clock,
  normal: CheckCircle2,
  high: AlertCircle,
  urgent: AlertCircle,
};

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<
    "inbox" | "sent" | "drafts" | "archived"
  >("inbox");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const {
    messages,
    isLoading,
    error,
    stats,
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
  } = useMessages({ type: activeTab, autoRefresh: true });

  // Formulário de nova mensagem
  const [composeForm, setComposeForm] = useState({
    recipientId: "",
    subject: "",
    content: "",
    priority: "normal" as "low" | "normal" | "high" | "urgent",
  });

  // Formulário de resposta
  const [replyForm, setReplyForm] = useState({
    content: "",
    originalSubject: "",
    originalSender: "",
  });

  // Buscar usuários para destinatários
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch("/api/auth/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else if (response.status === 401) {
        toast.error(
          "Você precisa estar logado para acessar esta funcionalidade"
        );
      } else {
        console.error("Erro ao buscar usuários:", response.status);
        toast.error("Erro ao carregar lista de usuários");
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast.error("Erro ao carregar lista de usuários");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Abrir mensagem
  const openMessage = async (message: Message) => {
    // Garantir que replies sempre seja um array
    const messageWithReplies = {
      ...message,
      replies: message.replies || [],
    };

    setSelectedMessage(messageWithReplies);
    setShowMobileDetail(true);

    // Marcar como lida se não foi lida
    if (!message.isRead && activeTab === "inbox") {
      await updateMessage(message.id, { isRead: true });
      // Atualizar a lista após marcar como lida
      refresh();
    }
  };

  // Enviar nova mensagem
  const handleSendMessage = async () => {
    if (
      !composeForm.recipientId ||
      !composeForm.subject ||
      !composeForm.content
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setIsSending(true);
      await createMessage(composeForm);
      setComposeForm({
        recipientId: "",
        subject: "",
        content: "",
        priority: "normal",
      });
      setShowCompose(false);
      toast.success("Mensagem enviada com sucesso!");
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setIsSending(false);
    }
  };

  // Abrir modal de resposta
  const openReplyModal = (message: Message) => {
    setReplyForm({
      content: "",
      originalSubject: message.subject,
      originalSender: message.sender.name,
    });
    setShowReply(true);
  };

  // Buscar mensagem individual
  const fetchSingleMessage = async (messageId: string) => {
    try {
      const message = await fetchMessage(messageId);
      if (message) {
        openMessage(message);
      }
    } catch (error) {
      console.error("Erro ao buscar mensagem:", error);
      toast.error("Erro ao carregar mensagem");
    }
  };

  // Enviar resposta
  const handleSendReply = async () => {
    if (!replyForm.content.trim()) {
      toast.error("Digite uma resposta");
      return;
    }

    if (!selectedMessage) return;

    try {
      await replyMessage(selectedMessage.id, { content: replyForm.content });
      setReplyForm({ content: "", originalSubject: "", originalSender: "" });
      setShowReply(false);

      // Recarregar a mensagem para mostrar a nova resposta
      await fetchSingleMessage(selectedMessage.id);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  // Confirmar exclusão
  const confirmDelete = (message: Message) => {
    setMessageToDelete(message);
    setShowDeleteConfirm(true);
  };

  // Excluir mensagem
  const handleDelete = async () => {
    if (!messageToDelete) return;

    try {
      await deleteMessage(messageToDelete.id);
      setShowDeleteConfirm(false);
      setMessageToDelete(null);

      // Se a mensagem deletada estava selecionada, limpar seleção
      if (selectedMessage?.id === messageToDelete.id) {
        setSelectedMessage(null);
        setShowMobileDetail(false);
      }
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  // Alternar favorito
  const toggleStar = async (message: Message) => {
    try {
      await updateMessage(message.id, { isStarred: !message.isStarred });

      // Atualizar mensagem selecionada se for a mesma
      if (selectedMessage?.id === message.id) {
        setSelectedMessage((prev) =>
          prev ? { ...prev, isStarred: !prev.isStarred } : null
        );
      }
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  // Alternar arquivo
  const toggleArchive = async (message: Message) => {
    try {
      const wasArchived = message.isArchived;
      await updateMessage(message.id, { isArchived: !message.isArchived });

      // Se a mensagem foi arquivada/desarquivada, limpar seleção
      if (selectedMessage?.id === message.id) {
        setSelectedMessage(null);
        setShowMobileDetail(false);
      }

      // Mostrar feedback ao usuário
      if (!wasArchived) {
        toast.success("Mensagem arquivada com sucesso!");
      } else {
        toast.success("Mensagem desarquivada com sucesso!");
      }

      // Forçar atualização da lista atual para remover/adicionar a mensagem
      refresh();
    } catch (error) {
      console.error("Erro ao arquivar/desarquivar mensagem:", error);
      toast.error("Erro ao processar a operação");
    }
  };

  const closeMobileDetail = () => {
    setShowMobileDetail(false);
    setSelectedMessage(null);
  };

  // Carregar usuários quando o modal de composição abre
  useEffect(() => {
    if (showCompose && users.length === 0) {
      fetchUsers();
    }
  }, [showCompose]);

  return (
    <div className="flex flex-col h-full">
      {/* Header - Fixo no topo */}
      <div className="flex-shrink-0 px-4 py-4 border-b bg-background">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold tracking-tight">Mensagens</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex-shrink-0 p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
              <MailOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.unread}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lidas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.read}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ações</CardTitle>
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={stats.unread === 0}
                  className="w-full text-sm"
                >
                  <span className="hidden sm:inline">
                    Marcar Todas como Lidas
                  </span>
                  <span className="sm:hidden">Marcar Todas</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content - Flex para ocupar espaço restante */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full">
          {/* Mobile: Mostrar apenas detalhes quando selecionada */}
          {showMobileDetail && selectedMessage && (
            <Card className="h-full lg:hidden">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeMobileDetail}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base truncate">
                      {selectedMessage.subject}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={selectedMessage.sender.image} />
                          <AvatarFallback className="text-xs">
                            {selectedMessage.sender.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">
                          De: {selectedMessage.sender.name}
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => openReplyModal(selectedMessage)}
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Responder
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleStar(selectedMessage)}
                      >
                        {selectedMessage.isStarred ? (
                          <>
                            <StarOff className="h-4 w-4 mr-2" />
                            Remover favorito
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-2" />
                            Favoritar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleArchive(selectedMessage)}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        {selectedMessage.isArchived
                          ? "Desarquivar"
                          : "Arquivar"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => confirmDelete(selectedMessage)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-4 pr-4 overflow-hidden message-wrapper">
                    <div className="max-w-none message-container">
                      <p className="text-sm message-content">
                        {selectedMessage.content}
                      </p>
                    </div>

                    {selectedMessage.replies?.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <h4 className="font-semibold text-sm">
                            Respostas ({selectedMessage.replies.length})
                          </h4>
                          {selectedMessage.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="border-l-2 border-muted pl-4 message-container"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={reply.sender.image} />
                                  <AvatarFallback className="text-xs">
                                    {reply.sender.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm">
                                  {reply.sender.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(
                                    new Date(reply.createdAt),
                                    "dd/MM/yyyy HH:mm",
                                    { locale: ptBR }
                                  )}
                                </span>
                              </div>
                              <p className="text-sm message-content">
                                {reply.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Desktop: Layout sempre visível, Mobile: Escondido quando detalhes estão abertos */}
          <div
            className={cn(
              "grid grid-cols-1 lg:grid-cols-3 gap-4 h-full",
              showMobileDetail && selectedMessage && "hidden lg:grid"
            )}
          >
            {/* Lista de Mensagens */}
            <div className="lg:col-span-2">
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle>Mensagens</CardTitle>
                    <Button onClick={() => setShowCompose(true)} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Mensagem
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar mensagens..."
                        value={filters.search}
                        onChange={(e) =>
                          applyFilters({ search: e.target.value })
                        }
                        className="pl-8"
                      />
                    </div>
                    <Select
                      value={filters.priority || "all"}
                      onValueChange={(value) =>
                        applyFilters({
                          priority: value === "all" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue placeholder="Prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <Tabs
                    value={activeTab}
                    onValueChange={(value: any) => setActiveTab(value)}
                    className="h-full flex flex-col"
                  >
                    <div className="px-6 pt-2">
                      <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                        <TabsTrigger
                          value="inbox"
                          className="text-xs sm:text-sm flex flex-col sm:flex-row items-center gap-1 py-2 px-1 sm:px-3"
                        >
                          <span className="truncate">Entrada</span>
                          {stats.unread > 0 && (
                            <Badge
                              variant="destructive"
                              className="h-3 w-3 sm:h-4 sm:w-4 p-0 text-xs"
                            >
                              {stats.unread > 99 ? "99+" : stats.unread}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger
                          value="sent"
                          className="text-xs sm:text-sm py-2 px-1 sm:px-3"
                        >
                          <span className="truncate">Enviadas</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="drafts"
                          className="text-xs sm:text-sm py-2 px-1 sm:px-3"
                        >
                          <span className="truncate">Rascunhos</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="archived"
                          className="text-xs sm:text-sm py-2 px-1 sm:px-3"
                        >
                          <span className="truncate">Arquivadas</span>
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent
                      value={activeTab}
                      className="flex-1 overflow-hidden mt-4"
                    >
                      <ScrollArea className="h-full">
                        {isLoading && messages.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground">
                            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                            <p>Carregando mensagens...</p>
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground">
                            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhuma mensagem encontrada</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {messages.map((message) => {
                              const messageWithReplies = {
                                ...message,
                                replies: message.replies || [],
                              };

                              const PriorityIcon =
                                priorityIcons[messageWithReplies.priority];
                              const isSelected =
                                selectedMessage?.id === messageWithReplies.id;

                              return (
                                <div
                                  key={messageWithReplies.id}
                                  className={cn(
                                    "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                                    isSelected && "bg-muted",
                                    !messageWithReplies.isRead &&
                                      activeTab === "inbox" &&
                                      "bg-blue-50/50"
                                  )}
                                  onClick={() =>
                                    openMessage(messageWithReplies)
                                  }
                                >
                                  <div className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                      <AvatarImage
                                        src={
                                          activeTab === "inbox"
                                            ? messageWithReplies.sender.image
                                            : messageWithReplies.recipient.image
                                        }
                                      />
                                      <AvatarFallback className="text-xs">
                                        {activeTab === "inbox"
                                          ? messageWithReplies.sender.name.charAt(
                                              0
                                            )
                                          : messageWithReplies.recipient.name.charAt(
                                              0
                                            )}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2 mb-1">
                                        <p
                                          className={cn(
                                            "text-sm font-medium truncate",
                                            !messageWithReplies.isRead &&
                                              activeTab === "inbox" &&
                                              "font-semibold"
                                          )}
                                        >
                                          {activeTab === "inbox"
                                            ? messageWithReplies.sender.name
                                            : messageWithReplies.recipient.name}
                                        </p>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          <PriorityIcon
                                            className={cn(
                                              "h-3 w-3",
                                              priorityColors[
                                                messageWithReplies.priority
                                              ].split(" ")[0]
                                            )}
                                          />
                                          {messageWithReplies.isStarred && (
                                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                          )}
                                        </div>
                                      </div>
                                      <p
                                        className={cn(
                                          "text-sm truncate mb-1",
                                          !messageWithReplies.isRead &&
                                            activeTab === "inbox"
                                            ? "font-medium text-foreground"
                                            : "text-muted-foreground"
                                        )}
                                      >
                                        {messageWithReplies.subject}
                                      </p>
                                      <p className="text-xs text-muted-foreground truncate mb-2">
                                        {messageWithReplies.content}
                                      </p>
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                          {format(
                                            new Date(
                                              messageWithReplies.createdAt
                                            ),
                                            "dd/MM/yyyy HH:mm",
                                            { locale: ptBR }
                                          )}
                                        </span>
                                        {messageWithReplies.replies?.length >
                                          0 && (
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {messageWithReplies.replies.length}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Detalhes da Mensagem - Apenas Desktop */}
            <div className="hidden lg:block">
              {selectedMessage ? (
                <Card className="h-full flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base truncate">
                          {selectedMessage.subject}
                        </CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={selectedMessage.sender.image} />
                              <AvatarFallback className="text-xs">
                                {selectedMessage.sender.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-sm">
                              De: {selectedMessage.sender.name}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1 block">
                            {format(
                              new Date(selectedMessage.createdAt),
                              "dd/MM/yyyy HH:mm",
                              { locale: ptBR }
                            )}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStar(selectedMessage)}
                          className="h-8 px-2"
                        >
                          {selectedMessage.isStarred ? (
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          ) : (
                            <StarOff className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleArchive(selectedMessage)}
                          className="h-8 px-2"
                        >
                          <Archive className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => confirmDelete(selectedMessage)}
                          className="h-8 px-2 text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openReplyModal(selectedMessage)}
                          className="h-8 px-3"
                        >
                          <Reply className="h-3 w-3 mr-1" />
                          Responder
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="space-y-4 pr-4 overflow-hidden message-wrapper">
                        <div className="max-w-none message-container">
                          <p className="text-sm message-content">
                            {selectedMessage.content}
                          </p>
                        </div>

                        {selectedMessage.replies?.length > 0 && (
                          <>
                            <Separator />
                            <div className="space-y-4">
                              <h4 className="font-semibold text-sm">
                                Respostas ({selectedMessage.replies.length})
                              </h4>
                              {selectedMessage.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="border-l-2 border-muted pl-4 message-container"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage src={reply.sender.image} />
                                      <AvatarFallback className="text-xs">
                                        {reply.sender.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-sm">
                                      {reply.sender.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {format(
                                        new Date(reply.createdAt),
                                        "dd/MM/yyyy HH:mm",
                                        { locale: ptBR }
                                      )}
                                    </span>
                                  </div>
                                  <p className="text-sm message-content">
                                    {reply.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent>
                    <div className="text-center text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Selecione uma mensagem para visualizar</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modais */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="mx-4 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta mensagem? Esta ação não pode
              ser desfeita.
              {messageToDelete && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>Assunto:</strong> {messageToDelete?.subject}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showReply} onOpenChange={setShowReply}>
        <DialogContent className="mx-4 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Responder Mensagem</DialogTitle>
            <DialogDescription>Responda à mensagem abaixo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">Respondendo para:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <strong>De:</strong> {replyForm.originalSender}
                </p>
                <p>
                  <strong>Assunto:</strong> Re: {replyForm.originalSubject}
                </p>
              </div>
            </div>
            <div>
              <Label htmlFor="reply-content-modal">Sua Resposta</Label>
              <Textarea
                id="reply-content-modal"
                value={replyForm.content}
                onChange={(e) =>
                  setReplyForm((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                placeholder="Digite sua resposta..."
                rows={6}
                className="mt-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReply(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSendReply}>
                <Send className="h-4 w-4 mr-2" />
                Enviar Resposta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="mx-4 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Mensagem</DialogTitle>
            <DialogDescription>Envie uma nova mensagem</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="compose-recipient">Destinatário</Label>
              <Select
                value={composeForm.recipientId}
                onValueChange={(value) =>
                  setComposeForm((prev) => ({ ...prev, recipientId: value }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione um destinatário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="text-xs">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({user.email})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="compose-subject">Assunto</Label>
              <Input
                id="compose-subject"
                value={composeForm.subject}
                onChange={(e) =>
                  setComposeForm((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
                placeholder="Digite o assunto da mensagem"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="compose-priority">Prioridade</Label>
              <Select
                value={composeForm.priority}
                onValueChange={(value: any) =>
                  setComposeForm((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-3 w-3 text-blue-500" />
                      Baixa
                    </div>
                  </SelectItem>
                  <SelectItem value="normal">
                    <div className="flex items-center gap-2">
                      <Minus className="h-3 w-3 text-gray-500" />
                      Normal
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-3 w-3 text-orange-500" />
                      Alta
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                      Urgente
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="compose-content">Mensagem</Label>
              <Textarea
                id="compose-content"
                value={composeForm.content}
                onChange={(e) =>
                  setComposeForm((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                placeholder="Digite sua mensagem..."
                rows={8}
                className="mt-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCompose(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSendMessage} disabled={isSending}>
                {isSending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
