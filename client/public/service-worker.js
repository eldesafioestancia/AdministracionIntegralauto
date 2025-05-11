const CACHE_NAME = 'agro-manager-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html'
];

// Instalar el service worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Almacenando en caché los activos estáticos...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] Instalación completada');
        return self.skipWaiting();
      })
  );
});

// Activar el service worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');
  
  // Eliminar cachés antiguas
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de caché primero, luego red, con fallback a offline
self.addEventListener('fetch', (event) => {
  // Solo interceptamos solicitudes GET
  if (event.request.method !== 'GET') return;
  
  // Ignoramos solicitudes a la API ya que son manejadas por PouchDB
  if (event.request.url.includes('/api/')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Si el recurso está en caché, lo devolvemos
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Si no está en caché, intentamos obtenerlo de la red
        return fetch(event.request)
          .then((response) => {
            // Si la respuesta no es válida, devolvemos una respuesta de error
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Hacemos una copia de la respuesta, ya que es un stream que solo se puede consumir una vez
            const responseToCache = response.clone();
            
            // Guardamos la respuesta en caché para uso futuro
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Si hay un error en la red, verificamos si es una solicitud de página
            if (event.request.headers.get('accept').includes('text/html')) {
              // Devolvemos la página offline como fallback
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Gestionar solicitudes de sincronización en segundo plano
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Evento de sincronización recibido:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // La sincronización real se maneja en el cliente a través de PouchDB
      console.log('[Service Worker] Sincronización de datos solicitada')
    );
  }
});

// Gestionar notificaciones push
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Notificación push recibida:', event);
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Gestionar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Clic en notificación:', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});