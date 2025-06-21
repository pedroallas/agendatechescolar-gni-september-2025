"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  User,
  Bell,
  Palette,
  Database,
  Download,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Globe,
  Monitor,
  Moon,
  Sun,
  Settings,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  role: string;
  avatar?: string;
  preferences: {
    theme: "light" | "dark" | "system";
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: "12h" | "24h";
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      booking: boolean;
      reminders: boolean;
      updates: boolean;
    };
    privacy: {
      showProfile: boolean;
      showBookings: boolean;
      showActivity: boolean;
    };
    booking: {
      autoConfirm: boolean;
      defaultDuration: number;
      reminderTime: number;
      maxAdvanceDays: number;
    };
  };
  stats: {
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    joinDate: string;
    lastActivity: string;
  };
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch("/api/user/profile");
      if (!response.ok) throw new Error("Erro ao carregar perfil");

      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil do usuário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (
    section: string,
    key: string,
    value: any
  ) => {
    if (!profile) return;

    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          key,
          value,
        }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar preferências");

      // Atualizar estado local (simulado)
      setProfile((prev) => {
        if (!prev) return prev;
        const newPreferences = { ...prev.preferences };
        if (!newPreferences[section as keyof typeof newPreferences]) {
          (newPreferences as any)[section] = {};
        }
        (newPreferences as any)[section][key] = value;

        return {
          ...prev,
          preferences: newPreferences,
        };
      });

      toast({
        title: "Sucesso",
        description: "Preferências atualizadas!",
      });
    } catch (error) {
      console.error("Erro ao atualizar preferências:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as preferências.",
        variant: "destructive",
      });
    }
  };

  const exportData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/export");
      if (!response.ok) throw new Error("Erro ao exportar dados");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dados-usuario-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Sucesso",
        description: "Dados exportados com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir conta");

      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída com sucesso.",
      });

      // Redirecionar para página de login
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conta.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">
          Não foi possível carregar as configurações.
        </p>
        <Button onClick={fetchUserProfile} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie seu perfil e preferências do sistema
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {profile.role}
        </Badge>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Preferências
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Dados
          </TabsTrigger>
        </TabsList>

        {/* Notificações */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por E-mail</Label>
                    <p className="text-sm text-gray-600">
                      Receber notificações por e-mail
                    </p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications.email}
                    onCheckedChange={(checked) =>
                      updatePreferences("notifications", "email", checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-gray-600">
                      Notificações no navegador
                    </p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications.push}
                    onCheckedChange={(checked) =>
                      updatePreferences("notifications", "push", checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS</Label>
                    <p className="text-sm text-gray-600">
                      Notificações por mensagem de texto
                    </p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications.sms}
                    onCheckedChange={(checked) =>
                      updatePreferences("notifications", "sms", checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Agendamentos</Label>
                    <p className="text-sm text-gray-600">
                      Notificações sobre novos agendamentos
                    </p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications.booking}
                    onCheckedChange={(checked) =>
                      updatePreferences("notifications", "booking", checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Lembretes</Label>
                    <p className="text-sm text-gray-600">
                      Lembretes de agendamentos próximos
                    </p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications.reminders}
                    onCheckedChange={(checked) =>
                      updatePreferences("notifications", "reminders", checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Atualizações do Sistema</Label>
                    <p className="text-sm text-gray-600">
                      Notificações sobre atualizações e novidades
                    </p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications.updates}
                    onCheckedChange={(checked) =>
                      updatePreferences("notifications", "updates", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferências */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência e Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Tema</Label>
                  <Select
                    value={profile.preferences.theme}
                    onValueChange={(value) =>
                      updatePreferences("theme", "theme", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Claro
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Escuro
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          Sistema
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Idioma</Label>
                  <Select
                    value={profile.preferences.language}
                    onValueChange={(value) =>
                      updatePreferences("language", "language", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fuso Horário</Label>
                  <Select
                    value={profile.preferences.timezone}
                    onValueChange={(value) =>
                      updatePreferences("timezone", "timezone", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">
                        Brasília (GMT-3)
                      </SelectItem>
                      <SelectItem value="America/New_York">
                        Nova York (GMT-5)
                      </SelectItem>
                      <SelectItem value="Europe/London">
                        Londres (GMT+0)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Formato de Data</Label>
                  <Select
                    value={profile.preferences.dateFormat}
                    onValueChange={(value) =>
                      updatePreferences("dateFormat", "dateFormat", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Formato de Hora</Label>
                  <Select
                    value={profile.preferences.timeFormat}
                    onValueChange={(value) =>
                      updatePreferences("timeFormat", "timeFormat", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 horas (14:30)</SelectItem>
                      <SelectItem value="12h">12 horas (2:30 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações de Agendamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-confirmar agendamentos</Label>
                    <p className="text-sm text-gray-600">
                      Confirmar automaticamente seus agendamentos
                    </p>
                  </div>
                  <Switch
                    checked={profile.preferences.booking.autoConfirm}
                    onCheckedChange={(checked) =>
                      updatePreferences("booking", "autoConfirm", checked)
                    }
                  />
                </div>
                <div>
                  <Label>Duração padrão (minutos)</Label>
                  <Select
                    value={profile.preferences.booking.defaultDuration.toString()}
                    onValueChange={(value) =>
                      updatePreferences(
                        "booking",
                        "defaultDuration",
                        parseInt(value)
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="90">1h 30min</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lembrete (minutos antes)</Label>
                  <Select
                    value={profile.preferences.booking.reminderTime.toString()}
                    onValueChange={(value) =>
                      updatePreferences(
                        "booking",
                        "reminderTime",
                        parseInt(value)
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                      <SelectItem value="1440">1 dia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Máximo de dias para agendamento</Label>
                  <Select
                    value={profile.preferences.booking.maxAdvanceDays.toString()}
                    onValueChange={(value) =>
                      updatePreferences(
                        "booking",
                        "maxAdvanceDays",
                        parseInt(value)
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="14">14 dias</SelectItem>
                      <SelectItem value="30">30 dias</SelectItem>
                      <SelectItem value="60">60 dias</SelectItem>
                      <SelectItem value="90">90 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dados */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Exportar Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Baixe uma cópia de todos os seus dados em formato JSON.
              </p>
              <Button onClick={exportData} disabled={loading}>
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exportar dados
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Zona de Perigo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Excluir sua conta permanentemente. Esta ação não pode ser
                desfeita.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir conta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá
                      permanentemente sua conta e removerá todos os seus dados
                      dos nossos servidores.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={deleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Sim, excluir conta
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
