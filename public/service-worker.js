const URL_BASE = '/api';
const CACHE_NAME = 'registro-errores-v3';
const urlsToCache = [
    '/',
    '/css/styles.css',
    '/js/datos.js',
    '/js/script.js',
    '/img/error.png',
    '/img/logo_nuevo.png',
    '/manifest.json',
    '/js/components/toast-component.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    // 1. Ignora peticiones de extensiones de Chrome
    if (event.request.url.startsWith('chrome-extension:')) {
        return;
    }

    const isApiRequest = event.request.url.includes(`${URL_BASE}/personal`);

    event.respondWith(
        (async () => {
            // 2. Estrategia 'Cache First' para archivos estáticos
            if (!isApiRequest) {
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) {
                    return cachedResponse;
                }
            }

            // 3. Estrategia 'Network First' para todas las peticiones
            try {
                const response = await fetch(event.request);

                // Si la respuesta no es válida o no es una petición GET, la devuelve sin guardarla
                if (!response || response.status !== 200 || event.request.method !== 'GET') {
                    return response;
                }

                // Clona y guarda la respuesta en la caché
                const responseToCache = response.clone();
                const cache = await caches.open(CACHE_NAME);
                await cache.put(event.request, responseToCache);

                return response;

            } catch (error) {
                // En caso de fallo de red, busca el recurso en la caché
                const cachedResponse = await caches.match(event.request);

                // Si se encuentra en la caché, notifica al cliente y lo devuelve
                if (cachedResponse) {
                    if (isApiRequest) {
                        self.clients.matchAll().then(clients => {
                            clients.forEach(client => client.postMessage({
                                type: 'INFO_FETCH',
                                message: 'Datos cargados desde la caché (sin conexión).',
                                url: event.request.url
                            }));
                        });
                    }
                    return cachedResponse;
                }

                // Si falla la red y no hay caché, notifica el fallo
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => client.postMessage({
                        type: 'FETCH_FAILED',
                        message: 'Error de conexión. No se pudo obtener la información más reciente.',
                        url: event.request.url
                    }));
                });
                return new Response('Network error occurred', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({ 'Content-Type': 'text/plain' })
                });
            }
        })()
    );
});


self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log(`Borrando caché antigua: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});