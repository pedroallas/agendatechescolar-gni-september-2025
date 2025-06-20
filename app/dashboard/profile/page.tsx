"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  User,
  Mail,
  Briefcase,
  Bell,
  Shield,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { PushNotificationSettings } from "@/components/push-notification-settings";

const profileSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  role: z.enum(["professor", "coordenador", "diretor", "funcionario"]),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    bookingReminders: z.boolean(),
    systemUpdates: z.boolean(),
  }),
});

type ProfileInput = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      role: (user?.role as any) || "professor",
      notifications: {
        email: true,
        push: true,
        bookingReminders: true,
        systemUpdates: false,
      },
    },
  });

  const watchedRole = watch("role");

  const onSubmit = async (data: ProfileInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          role: data.role,
          image: imagePreview || undefined,
          notifications: data.notifications,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar perfil");
      }

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });

      await refreshUser();
    } catch (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Foto de Perfil */}
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
              <CardDescription>
                Clique para alterar sua foto de perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={imagePreview || user?.image || undefined}
                      alt={user?.name}
                    />
                    <AvatarFallback>
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full"
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
                  <p>JPG, GIF ou PNG. Máximo 1MB.</p>
                  <p>Tamanho recomendado: 400x400px</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações básicas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    <User className="inline h-4 w-4 mr-2" />
                    Nome Completo
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Seu nome completo"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="inline h-4 w-4 mr-2" />
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    O e-mail não pode ser alterado
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">
                  <Briefcase className="inline h-4 w-4 mr-2" />
                  Cargo
                </Label>
                <Select
                  value={watchedRole}
                  onValueChange={(value) => setValue("role", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professor">Professor</SelectItem>
                    <SelectItem value="coordenador">Coordenador</SelectItem>
                    <SelectItem value="diretor">Diretor</SelectItem>
                    <SelectItem value="funcionario">Funcionário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Preferências de Notificação */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Bell className="inline h-5 w-5 mr-2" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure como você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">
                      Notificações por E-mail
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receba atualizações importantes por e-mail
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    {...register("notifications.email")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">
                      Notificações Push
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações no navegador
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    {...register("notifications.push")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="booking-reminders">
                      Lembretes de Agendamento
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Seja lembrado dos seus agendamentos
                    </p>
                  </div>
                  <Switch
                    id="booking-reminders"
                    {...register("notifications.bookingReminders")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="system-updates">
                      Atualizações do Sistema
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Novidades e manutenções programadas
                    </p>
                  </div>
                  <Switch
                    id="system-updates"
                    {...register("notifications.systemUpdates")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações Avançadas de Push Notifications */}
          <PushNotificationSettings />

          {/* Segurança */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Shield className="inline h-5 w-5 mr-2" />
                Segurança
              </CardTitle>
              <CardDescription>
                Gerencie suas configurações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {/* TODO: Verificar se o usuário tem senha ou usa login social */}
                    Gerencie suas configurações de segurança e privacidade
                  </AlertDescription>
                </Alert>
                <Button variant="outline" type="button">
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => window.history.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!isDirty || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
