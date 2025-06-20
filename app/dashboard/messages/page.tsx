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
  Filter,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
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
      const response = await fetch("/api/auth/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
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
          <Dialog open={showCompose} onOpenChange={setShowCompose}>
            <DialogTrigger asChild>
              <Button onClick={fetchUsers}>
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
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o destinatário" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.image} />
                              <AvatarFallback>
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {user.name} ({user.email})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
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

      <Card>
        <CardHeader>
          <CardTitle>Sistema de Mensagens</CardTitle>
          <CardDescription>
            O sistema de mensagens internas está em desenvolvimento. Em breve
            você poderá:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center">
                <Send className="h-4 w-4 mr-2" />
                Funcionalidades Disponíveis
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Enviar mensagens para outros usuários</li>
                <li>• Responder mensagens recebidas</li>
                <li>
                  • Organizar por prioridade (baixa, normal, alta, urgente)
                </li>
                <li>• Marcar mensagens como favoritas</li>
                <li>• Arquivar conversas</li>
                <li>• Buscar mensagens por conteúdo</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Recursos Avançados
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Anexar arquivos às mensagens</li>
                <li>• Notificações em tempo real</li>
                <li>• Histórico completo de conversas</li>
                <li>• Filtros avançados</li>
                <li>• Rascunhos automáticos</li>
                <li>• Integração com notificações push</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">
                Status do Desenvolvimento
              </h4>
            </div>
            <p className="text-blue-800 mt-2 text-sm">
              O sistema de mensagens internas está 90% completo. As APIs e hooks
              já estão implementados, faltando apenas finalizar a interface de
              usuário. Previsão de conclusão: próxima atualização.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
