"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Camera,
  Save,
  RefreshCw,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  Bell,
  Shield,
  Activity,
  TrendingUp,
  Award,
  Clock,
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

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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
      setImagePreview(data.avatar || null);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        bio: data.bio || "",
        location: data.location || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
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

  const updateProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          image: imagePreview || undefined,
        }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar perfil");

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });

      fetchUserProfile();
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Erro da API:", error);
        throw new Error(error.error || "Erro ao alterar senha");
      }

      const result = await response.json();
      console.log("✅ Senha alterada com sucesso:", result);

      // Marcar sucesso
      setPasswordChangeSuccess(true);

      toast({
        title: "✅ Sucesso",
        description:
          "Senha alterada com sucesso! Sua conta está mais segura agora.",
        duration: 5000,
      });

      // Limpar campos após sucesso
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      // Remover indicador de sucesso após 3 segundos
      setTimeout(() => {
        setPasswordChangeSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro no upload");
      }

      const result = await response.json();
      setImagePreview(result.imageUrl);

      // Salvar imagem no perfil automaticamente
      await updateProfileImage(result.imageUrl);

      // Atualizar contexto de autenticação
      await refreshUser();

      toast({
        title: "Sucesso",
        description: "Foto de perfil atualizada com sucesso!",
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro no upload da imagem",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const updateProfileImage = async (imageUrl: string) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageUrl,
        }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar imagem do perfil");

      // Atualizar o perfil local
      fetchUserProfile();
    } catch (error) {
      console.error("Erro ao atualizar imagem do perfil:", error);
      throw error;
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

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Erro ao carregar perfil do usuário.
          </p>
          <Button onClick={fetchUserProfile}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas informações pessoais e configurações
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {profile.role}
        </Badge>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Atividade
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Aba Perfil */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Foto de Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={imagePreview || profile.avatar || undefined}
                      alt={profile.name}
                    />
                    <AvatarFallback className="text-lg">
                      {profile.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>JPG, PNG ou GIF. Máximo 2MB.</p>
                  <p>Tamanho recomendado: 400x400px</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    O e-mail não pode ser alterado
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="(11) 99999-9999"
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Campo temporariamente indisponível
                  </p>
                </div>
                <div>
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="Cidade, Estado"
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Campo temporariamente indisponível
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Conte um pouco sobre você..."
                  rows={3}
                  disabled
                  className="bg-gray-50 dark:bg-gray-800"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Campo temporariamente indisponível
                </p>
              </div>
              <Button onClick={updateProfile} disabled={loading}>
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Segurança */}
        <TabsContent value="security" className="space-y-6">
          {passwordChangeSuccess && (
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">
                      Senha alterada com sucesso!
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Sua conta está mais segura agora.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Alterar Senha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Senha atual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="Digite sua senha atual"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Digite sua nova senha"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Confirme sua nova senha"
                />
              </div>
              <Button
                onClick={updatePassword}
                disabled={loading}
                className={
                  passwordChangeSuccess ? "bg-green-600 hover:bg-green-700" : ""
                }
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : passwordChangeSuccess ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <Key className="h-4 w-4 mr-2" />
                )}
                {passwordChangeSuccess ? "Senha alterada!" : "Alterar senha"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Mostrar perfil público</Label>
                  <p className="text-sm text-gray-600">
                    Permitir que outros usuários vejam seu perfil
                  </p>
                </div>
                <Switch
                  checked={profile.preferences.privacy.showProfile}
                  disabled
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Mostrar agendamentos</Label>
                  <p className="text-sm text-gray-600">
                    Permitir que outros vejam seus agendamentos
                  </p>
                </div>
                <Switch
                  checked={profile.preferences.privacy.showBookings}
                  disabled
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Mostrar atividade</Label>
                  <p className="text-sm text-gray-600">
                    Mostrar quando você está online
                  </p>
                </div>
                <Switch
                  checked={profile.preferences.privacy.showActivity}
                  disabled
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Atividade */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total de Agendamentos
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {profile.stats.totalBookings}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Confirmados
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {profile.stats.confirmedBookings}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Cancelados
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {profile.stats.cancelledBookings}
                    </p>
                  </div>
                  <RefreshCw className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Membro desde
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {new Date(profile.stats.joinDate).getFullYear()}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Data de cadastro</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(profile.stats.joinDate).toLocaleDateString(
                      "pt-BR",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
                <div>
                  <Label>Última atividade</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(profile.stats.lastActivity).toLocaleDateString(
                      "pt-BR",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Configurações */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações por E-mail</Label>
                  <p className="text-sm text-gray-600">
                    Receber notificações por e-mail
                  </p>
                </div>
                <Switch
                  checked={profile.preferences.notifications.email}
                  disabled
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
                  disabled
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Lembretes de Agendamento</Label>
                  <p className="text-sm text-gray-600">
                    Lembretes de agendamentos próximos
                  </p>
                </div>
                <Switch
                  checked={profile.preferences.notifications.reminders}
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exportar Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Baixe uma cópia de todos os seus dados em formato JSON.
              </p>
              <Button onClick={exportData} disabled={loading}>
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <TrendingUp className="h-4 w-4 mr-2" />
                )}
                Exportar dados
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
