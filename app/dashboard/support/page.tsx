"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  HelpCircle,
  MessageSquare,
  Phone,
  Send,
  Wrench,
  BookOpen,
  Video,
  FileText,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  resourceId?: string;
  resourceName?: string;
  createdAt: string;
  updatedAt: string;
}

interface Resource {
  id: string;
  name: string;
  category: string;
}

export default function SupportCenter() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "medium",
    resourceId: "",
  });

  // Load user tickets and resources
  useEffect(() => {
    loadTickets();
    loadResources();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await fetch("/api/support/tickets");
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error("Erro ao carregar tickets:", error);
    }
  };

  const loadResources = async () => {
    try {
      const response = await fetch("/api/resources");
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error("Erro ao carregar recursos:", error);
    }
  };

  const submitTicket = async () => {
    if (!newTicket.title || !newTicket.description) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTicket),
      });

      if (response.ok) {
        toast.success("Ticket criado com sucesso!");
        setNewTicket({
          title: "",
          description: "",
          priority: "medium",
          resourceId: "",
        });
        loadTickets();
      } else {
        toast.error("Erro ao criar ticket");
      }
    } catch (error) {
      toast.error("Erro ao criar ticket");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "closed":
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const faqData = [
    {
      question: "Como fazer um agendamento?",
      answer:
        "Acesse a aba 'Agendamentos' no menu, selecione o recurso desejado, escolha a data e horário disponível, e confirme o agendamento.",
    },
    {
      question: "Posso cancelar um agendamento?",
      answer:
        "Sim, você pode cancelar agendamentos em 'Meus Agendamentos'. Agendamentos só podem ser cancelados até 2 horas antes do horário marcado.",
    },
    {
      question: "Como avaliar um recurso?",
      answer:
        "Após utilizar um recurso, você receberá uma notificação para avaliá-lo. Você também pode avaliar na página de detalhes do recurso.",
    },
    {
      question: "O que fazer se um equipamento não funcionar?",
      answer:
        "Reporte o problema imediatamente através da Central de Suporte. Inclua detalhes sobre o problema e, se possível, fotos.",
    },
    {
      question: "Como ver o histórico dos meus agendamentos?",
      answer:
        "Acesse 'Meus Agendamentos' no menu principal. Lá você pode filtrar por período e status.",
    },
  ];

  const tutorialData = [
    {
      title: "Configurando Data Show",
      description: "Aprenda a conectar e configurar o data show corretamente",
      type: "video",
      icon: <Video className="h-5 w-5" />,
    },
    {
      title: "Uso do Laboratório de Informática",
      description: "Guia completo para usar o laboratório de informática",
      type: "document",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Chromebooks - Primeiros Passos",
      description: "Tutorial básico para usar os Chromebooks",
      type: "video",
      icon: <Video className="h-5 w-5" />,
    },
    {
      title: "Resolução de Problemas Comuns",
      description: "Soluções para os problemas mais frequentes",
      type: "document",
      icon: <BookOpen className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Central de Suporte
        </h1>
        <p className="text-muted-foreground">
          Obtenha ajuda, reporte problemas e acesse tutoriais
        </p>
      </div>

      <Tabs defaultValue="tickets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tickets">Meus Tickets</TabsTrigger>
          <TabsTrigger value="new-ticket">Reportar Problema</TabsTrigger>
          <TabsTrigger value="tutorials">Tutoriais</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {/* Meus Tickets */}
        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Meus Tickets de Suporte</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum ticket encontrado</p>
                  <p className="text-sm">
                    Crie um novo ticket para reportar problemas
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <Card key={ticket.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(ticket.status)}
                              <h3 className="font-medium">{ticket.title}</h3>
                              <Badge
                                variant={getPriorityColor(ticket.priority)}
                              >
                                {ticket.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {ticket.description}
                            </p>
                            {ticket.resourceName && (
                              <p className="text-xs text-muted-foreground">
                                Recurso: {ticket.resourceName}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Criado em:{" "}
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline">{ticket.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reportar Problema */}
        <TabsContent value="new-ticket" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wrench className="h-5 w-5" />
                <span>Reportar Problema</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título do Problema *</Label>
                  <Input
                    id="title"
                    value={newTicket.title}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, title: e.target.value })
                    }
                    placeholder="Ex: Data Show não liga"
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(value) =>
                      setNewTicket({ ...newTicket, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="resource">Recurso (Opcional)</Label>
                <Select
                  value={newTicket.resourceId}
                  onValueChange={(value) =>
                    setNewTicket({ ...newTicket, resourceId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um recurso" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map((resource) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        {resource.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Descrição do Problema *</Label>
                <Textarea
                  id="description"
                  value={newTicket.description}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, description: e.target.value })
                  }
                  placeholder="Descreva detalhadamente o problema encontrado..."
                  rows={4}
                />
              </div>

              <Button
                onClick={submitTicket}
                disabled={loading}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? "Enviando..." : "Enviar Ticket"}
              </Button>
            </CardContent>
          </Card>

          {/* Contato Direto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>Contato Direto</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Suporte Técnico</p>
                    <p className="text-sm text-muted-foreground">
                      (11) 1234-5678
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      suporte@escola.edu.br
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tutoriais */}
        <TabsContent value="tutorials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Tutoriais e Guias</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutorialData.map((tutorial, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {tutorial.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{tutorial.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {tutorial.description}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {tutorial.type === "video" ? "Vídeo" : "Documento"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5" />
                <span>Perguntas Frequentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqData.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
