// Service Worker para Push Notifications - AgendaTech
const CACHE_NAME = "agendatech-v1";
const urlsToCache = [
  "/",
  "/dashboard",
  "/dashboard/notifications",
  "/offline.html",
];

// Instalar Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Ativar Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar requisições
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retornar cache se disponível, senão buscar da rede
      return response || fetch(event.request);
    })
  );
});

// Receber Push Notifications
self.addEventListener("push", (event) => {
  console.log("Push notification recebida:", event);

  let notificationData = {
    title: "AgendaTech",
    body: "Você tem uma nova notificação",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    data: {
      url: "/dashboard/notifications",
    },
    actions: [
      {
        action: "view",
        title: "Ver Detalhes",
      },
      {
        action: "dismiss",
        title: "Dispensar",
      },
    ],
  };

  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (error) {
      console.error("Erro ao parsear dados da push notification:", error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      image: notificationData.image,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: true,
      tag: "agendatech-notification",
      renotify: true,
      vibrate: [200, 100, 200],
      timestamp: Date.now(),
    })
  );
});

// Clique na Push Notification
self.addEventListener("notificationclick", (event) => {
  console.log("Clique na notification:", event);

  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const urlToOpen = event.notification.data?.url || "/dashboard/notifications";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Verificar se já existe uma aba aberta
        for (const client of clientList) {
          if (client.url.includes("/dashboard") && "focus" in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }

        // Se não houver aba aberta, abrir nova
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Fechar Push Notification
self.addEventListener("notificationclose", (event) => {
  console.log("Notification fechada:", event);

  // Opcional: enviar analytics ou limpar dados
  event.waitUntil(
    fetch("/api/notifications/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "notification_dismissed",
        timestamp: Date.now(),
        tag: event.notification.tag,
      }),
    }).catch((error) => {
      console.log("Erro ao enviar analytics:", error);
    })
  );
});

// Background Sync (para quando voltar online)
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(
      // Sincronizar dados pendentes
      syncPendingData()
    );
  }
});

async function syncPendingData() {
  try {
    // Buscar dados pendentes do IndexedDB ou cache
    const pendingData = await getPendingData();

    if (pendingData.length > 0) {
      for (const data of pendingData) {
        await fetch("/api/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      }

      // Limpar dados sincronizados
      await clearPendingData();
    }
  } catch (error) {
    console.error("Erro na sincronização:", error);
  }
}

async function getPendingData() {
  // Implementar busca de dados pendentes
  return [];
}

async function clearPendingData() {
  // Implementar limpeza de dados sincronizados
}
