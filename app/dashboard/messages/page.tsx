"use client";

import { useState } from "react";
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
  const [activeTab, setActiveTab] = useState<"inbox" | "sent" | "drafts">(
    "inbox"
  );
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

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
    setSelectedMessage(message);

    // Marcar como lida se não foi lida
    if (!message.isRead && activeTab === "inbox") {
      await updateMessage(message.id, { isRead: true });
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
      await createMessage(composeForm);
      setComposeForm({
        recipientId: "",
        subject: "",
        content: "",
        priority: "normal",
      });
      setShowCompose(false);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  // Enviar resposta
  const handleSendReply = async () => {
    if (!selectedMessage || !replyForm.content) {
      toast.error("Digite sua resposta");
      return;
    }

    try {
      await replyMessage(selectedMessage.id, replyForm);
      setReplyForm({ content: "" });
      setShowReply(false);

      // Recarregar mensagem para mostrar nova resposta
      const updatedMessage = await fetchMessage(selectedMessage.id);
      if (updatedMessage) {
        setSelectedMessage(updatedMessage);
      }
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  // Favoritar/desfavoritar
  const toggleStar = async (message: Message) => {
    await updateMessage(message.id, { isStarred: !message.isStarred });
  };

  // Arquivar/desarquivar
  const toggleArchive = async (message: Message) => {
    await updateMessage(message.id, { isArchived: !message.isArchived });
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mensagens</h2>
          <p className="text-muted-foreground">
            Central de mensagens internas da plataforma
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
            />
            Atualizar
          </Button>
          <Dialog
            open={showCompose}
            onOpenChange={(open) => {
              setShowCompose(open);
              if (open) {
                fetchUsers();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Mensagem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Mensagem</DialogTitle>
                <DialogDescription>
                  Envie uma mensagem para outro usuário da plataforma
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipient">Destinatário</Label>
                  <Select
                    value={composeForm.recipientId}
                    onValueChange={(value) =>
                      setComposeForm((prev) => ({
                        ...prev,
                        recipientId: value,
                      }))
                    }
                    disabled={loadingUsers}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingUsers
                            ? "Carregando usuários..."
                            : "Selecione o destinatário"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingUsers ? (
                        <SelectItem value="loading" disabled>
                          Carregando usuários...
                        </SelectItem>
                      ) : users.length === 0 ? (
                        <SelectItem value="no-users" disabled>
                          Nenhum usuário encontrado
                        </SelectItem>
                      ) : (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    value={composeForm.subject}
                    onChange={(e) =>
                      setComposeForm((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    placeholder="Digite o assunto da mensagem"
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={composeForm.priority}
                    onValueChange={(value: any) =>
                      setComposeForm((prev) => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="content">Mensagem</Label>
                  <Textarea
                    id="content"
                    value={composeForm.content}
                    onChange={(e) =>
                      setComposeForm((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    placeholder="Digite sua mensagem..."
                    rows={6}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCompose(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ações</CardTitle>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={stats.unread === 0}
              className="w-full"
            >
              Marcar Todas como Lidas
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Mensagens</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar mensagens..."
                    value={filters.search}
                    onChange={(e) => applyFilters({ search: e.target.value })}
                    className="pl-8"
                  />
                </div>
                <Select
                  value={filters.priority || "all"}
                  onValueChange={(value) =>
                    applyFilters({ priority: value === "all" ? "" : value })
                  }
                >
                  <SelectTrigger className="w-32">
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
            <CardContent className="p-0">
              <Tabs
                value={activeTab}
                onValueChange={(value: any) => setActiveTab(value)}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="inbox">
                    Caixa de Entrada
                    {stats.unread > 0 && (
                      <Badge
                        variant="destructive"
                        className="ml-2 h-5 w-5 p-0 text-xs"
                      >
                        {stats.unread}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="sent">Enviadas</TabsTrigger>
                  <TabsTrigger value="drafts">Rascunhos</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                  <ScrollArea className="h-[600px]">
                    {isLoading && messages.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Carregando mensagens...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Nenhuma mensagem encontrada
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {messages.map((message) => {
                          const PriorityIcon = priorityIcons[message.priority];
                          const isSelected = selectedMessage?.id === message.id;

                          return (
                            <div
                              key={message.id}
                              className={cn(
                                "p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                                isSelected && "bg-muted",
                                !message.isRead &&
                                  activeTab === "inbox" &&
                                  "bg-blue-50/50"
                              )}
                              onClick={() => openMessage(message)}
                            >
                              <div className="flex items-start space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={
                                      activeTab === "inbox"
                                        ? message.sender.image
                                        : message.recipient.image
                                    }
                                  />
                                  <AvatarFallback>
                                    {activeTab === "inbox"
                                      ? message.sender.name.charAt(0)
                                      : message.recipient.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p
                                      className={cn(
                                        "text-sm font-medium truncate",
                                        !message.isRead &&
                                          activeTab === "inbox" &&
                                          "font-semibold"
                                      )}
                                    >
                                      {activeTab === "inbox"
                                        ? message.sender.name
                                        : message.recipient.name}
                                    </p>
                                    <div className="flex items-center space-x-1">
                                      <PriorityIcon
                                        className={cn(
                                          "h-3 w-3",
                                          priorityColors[
                                            message.priority
                                          ].split(" ")[0]
                                        )}
                                      />
                                      {message.isStarred && (
                                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                      )}
                                    </div>
                                  </div>
                                  <p
                                    className={cn(
                                      "text-sm truncate",
                                      !message.isRead && activeTab === "inbox"
                                        ? "font-medium text-foreground"
                                        : "text-muted-foreground"
                                    )}
                                  >
                                    {message.subject}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {message.content}
                                  </p>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-muted-foreground">
                                      {format(
                                        new Date(message.createdAt),
                                        "dd/MM/yyyy HH:mm",
                                        { locale: ptBR }
                                      )}
                                    </span>
                                    {message.replies.length > 0 && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {message.replies.length} resposta
                                        {message.replies.length > 1 ? "s" : ""}
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

        <div className="md:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center space-x-2">
                      <span>{selectedMessage.subject}</span>
                      <Badge
                        variant="outline"
                        className={priorityColors[selectedMessage.priority]}
                      >
                        {selectedMessage.priority === "low" && "Baixa"}
                        {selectedMessage.priority === "normal" && "Normal"}
                        {selectedMessage.priority === "high" && "Alta"}
                        {selectedMessage.priority === "urgent" && "Urgente"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={selectedMessage.sender.image} />
                          <AvatarFallback>
                            {selectedMessage.sender.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          De: {selectedMessage.sender.name} (
                          {selectedMessage.sender.email})
                        </span>
                      </div>
                      <span>
                        {format(
                          new Date(selectedMessage.createdAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: ptBR }
                        )}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStar(selectedMessage)}
                    >
                      {selectedMessage.isStarred ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleArchive(selectedMessage)}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMessage(selectedMessage.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => setShowReply(true)}>
                      <Reply className="h-4 w-4 mr-2" />
                      Responder
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">
                        {selectedMessage.content}
                      </p>
                    </div>

                    {selectedMessage.replies.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <h4 className="font-semibold">
                            Respostas ({selectedMessage.replies.length})
                          </h4>
                          {selectedMessage.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="border-l-2 border-muted pl-4"
                            >
                              <div className="flex items-center space-x-2 mb-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={reply.sender.image} />
                                  <AvatarFallback>
                                    {reply.sender.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {reply.sender.name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {format(
                                    new Date(reply.createdAt),
                                    "dd/MM/yyyy HH:mm",
                                    { locale: ptBR }
                                  )}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">
                                {reply.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>

                {showReply && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <Label>Sua Resposta</Label>
                      <Textarea
                        value={replyForm.content}
                        onChange={(e) =>
                          setReplyForm({ content: e.target.value })
                        }
                        placeholder="Digite sua resposta..."
                        rows={4}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowReply(false)}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleSendReply}>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Resposta
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[600px]">
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
  );
}
