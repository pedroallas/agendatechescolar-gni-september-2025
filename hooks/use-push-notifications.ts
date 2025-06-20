"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  subscription: PushSubscription | null;
  permission: NotificationPermission;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    subscription: null,
    permission: "default",
  });

  // Verificar suporte e estado inicial
  useEffect(() => {
    const checkSupport = async () => {
      if (typeof window === "undefined") return;

      const isSupported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;

      if (!isSupported) {
        setState((prev) => ({
          ...prev,
          isSupported: false,
          isLoading: false,
        }));
        return;
      }

      try {
        // Registrar service worker
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registrado:", registration);

        // Verificar permissão atual
        const permission = Notification.permission;

        // Verificar se já está subscrito
        const subscription = await registration.pushManager.getSubscription();

        setState((prev) => ({
          ...prev,
          isSupported: true,
          isSubscribed: !!subscription,
          subscription,
          permission,
          isLoading: false,
        }));
      } catch (error) {
        console.error("Erro ao verificar push notifications:", error);
        setState((prev) => ({
          ...prev,
          isSupported: false,
          isLoading: false,
        }));
      }
    };

    checkSupport();
  }, []);

  // Solicitar permissão
  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      toast.error("Push notifications não são suportadas neste navegador");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();

      setState((prev) => ({ ...prev, permission }));

      if (permission === "granted") {
        toast.success("Permissão para notificações concedida!");
        return true;
      } else if (permission === "denied") {
        toast.error("Permissão para notificações negada");
        return false;
      } else {
        toast.warning("Permissão para notificações não foi concedida");
        return false;
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão:", error);
      toast.error("Erro ao solicitar permissão para notificações");
      return false;
    }
  }, [state.isSupported]);

  // Subscrever para push notifications
  const subscribe = useCallback(async () => {
    if (!state.isSupported || state.permission !== "granted") {
      const hasPermission = await requestPermission();
      if (!hasPermission) return false;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Obter chave pública VAPID
      const response = await fetch("/api/notifications/push");
      const { publicKey } = await response.json();

      // Obter registration do service worker
      const registration = await navigator.serviceWorker.ready;

      // Criar subscrição
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Enviar subscrição para o servidor
      const subscribeResponse = await fetch("/api/notifications/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "subscribe",
          subscription: subscription.toJSON(),
        }),
      });

      if (!subscribeResponse.ok) {
        throw new Error("Erro ao registrar subscrição no servidor");
      }

      setState((prev) => ({
        ...prev,
        isSubscribed: true,
        subscription,
        isLoading: false,
      }));

      toast.success("Push notifications ativadas com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao subscrever push notifications:", error);
      toast.error("Erro ao ativar push notifications");

      setState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [state.isSupported, state.permission, requestPermission]);

  // Cancelar subscrição
  const unsubscribe = useCallback(async () => {
    if (!state.subscription) return false;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Cancelar subscrição no navegador
      await state.subscription.unsubscribe();

      // Cancelar subscrição no servidor
      await fetch(
        `/api/notifications/push?endpoint=${encodeURIComponent(
          state.subscription.endpoint
        )}`,
        {
          method: "DELETE",
        }
      );

      setState((prev) => ({
        ...prev,
        isSubscribed: false,
        subscription: null,
        isLoading: false,
      }));

      toast.success("Push notifications desativadas");
      return true;
    } catch (error) {
      console.error("Erro ao cancelar subscrição:", error);
      toast.error("Erro ao desativar push notifications");

      setState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [state.subscription]);

  // Enviar push notification (apenas para admins)
  const sendPushNotification = useCallback(
    async (data: {
      title: string;
      body: string;
      icon?: string;
      image?: string;
      data?: any;
      userIds?: string[];
      broadcast?: boolean;
    }) => {
      try {
        const response = await fetch("/api/notifications/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "send",
            ...data,
          }),
        });

        if (!response.ok) {
          throw new Error("Erro ao enviar push notification");
        }

        const result = await response.json();
        toast.success(`Push notification enviada para ${result.sent} usuários`);

        return result;
      } catch (error) {
        console.error("Erro ao enviar push notification:", error);
        toast.error("Erro ao enviar push notification");
        return null;
      }
    },
    []
  );

  // Testar push notification local
  const testNotification = useCallback(async () => {
    if (state.permission !== "granted") {
      toast.error("Permissão para notificações necessária");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification("Teste - AgendaTech", {
        body: "Esta é uma notificação de teste",
        icon: "/icon-192x192.png",
        badge: "/badge-72x72.png",
        tag: "test-notification",
        data: {
          url: "/dashboard/notifications",
        },
      });

      toast.success("Notificação de teste enviada!");
    } catch (error) {
      console.error("Erro ao testar notificação:", error);
      toast.error("Erro ao enviar notificação de teste");
    }
  }, [state.permission]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    sendPushNotification,
    testNotification,
  };
}

// Função auxiliar para converter chave VAPID
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
