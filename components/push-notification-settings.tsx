"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import {
  Bell,
  BellOff,
  TestTube,
  Send,
  Loader2,
  Shield,
  Smartphone,
  Globe,
} from "lucide-react";

export function PushNotificationSettings() {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    testNotification,
    sendPushNotification,
  } = usePushNotifications();

  const [isTesting, setIsTesting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleToggleSubscription = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    await testNotification();
    setIsTesting(false);
  };

  const handleSendBroadcast = async () => {
    setIsSending(true);
    await sendPushNotification({
      title: "Teste de Broadcast - AgendaTech",
      body: "Esta é uma notificação de teste enviada para todos os usuários",
      broadcast: true,
      data: {
        type: "test",
        timestamp: Date.now(),
      },
    });
    setIsSending(false);
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case "granted":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Permitido
          </Badge>
        );
      case "denied":
        return <Badge variant="destructive">Negado</Badge>;
      default:
        return <Badge variant="secondary">Não solicitado</Badge>;
    }
  };

  const getStatusBadge = () => {
    if (!isSupported) {
      return <Badge variant="destructive">Não suportado</Badge>;
    }
    if (isSubscribed) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Ativo
        </Badge>
      );
    }
    return <Badge variant="secondary">Inativo</Badge>;
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Configurar notificações push para receber alertas em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 text-center">
            <div className="space-y-2">
              <Smartphone className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Push notifications não são suportadas neste navegador
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Configure notificações push para receber alertas em tempo real sobre
          agendamentos, aprovações e atualizações importantes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status atual */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Status das Notificações</p>
              <p className="text-xs text-muted-foreground">
                Estado atual das push notifications
              </p>
            </div>
            {getStatusBadge()}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Permissão do Navegador</p>
              <p className="text-xs text-muted-foreground">
                Permissão para mostrar notificações
              </p>
            </div>
            {getPermissionBadge()}
          </div>
        </div>

        <Separator />

        {/* Controles principais */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Ativar Push Notifications</p>
              <p className="text-xs text-muted-foreground">
                Receba notificações mesmo quando o site não estiver aberto
              </p>
            </div>
            <Switch
              checked={isSubscribed}
              onCheckedChange={handleToggleSubscription}
              disabled={isLoading}
            />
          </div>

          {isSubscribed && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-blue-800">
                  Você receberá notificações sobre agendamentos, aprovações e
                  atualizações importantes
                </p>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Testes e configurações avançadas */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Testes e Configurações</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestNotification}
              disabled={!isSubscribed || isTesting}
              className="flex items-center gap-2"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              Testar Notificação
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSendBroadcast}
              disabled={!isSubscribed || isSending}
              className="flex items-center gap-2"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Enviar Broadcast
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              • Teste de notificação: envia uma notificação local para testar
            </p>
            <p>
              • Broadcast: envia notificação para todos os usuários (apenas
              admins)
            </p>
          </div>
        </div>

        <Separator />

        {/* Informações técnicas */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Informações Técnicas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <p className="font-medium">Suporte do Navegador</p>
              <p className="text-muted-foreground">
                {isSupported ? "✅ Suportado" : "❌ Não suportado"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Service Worker</p>
              <p className="text-muted-foreground">
                {"serviceWorker" in navigator
                  ? "✅ Disponível"
                  : "❌ Indisponível"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Push Manager</p>
              <p className="text-muted-foreground">
                {"PushManager" in window ? "✅ Disponível" : "❌ Indisponível"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Notification API</p>
              <p className="text-muted-foreground">
                {"Notification" in window ? "✅ Disponível" : "❌ Indisponível"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
