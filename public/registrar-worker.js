// La función debe ser declarada como 'async'
const registrarServiceWorker = async () => {
    // Verifica si el navegador soporta Service Workers
    if ('serviceWorker' in navigator) {
        try {
            // Usa 'await' para esperar la resolución de la promesa del registro
            const registro = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });

            console.log('Service Worker registrado con éxito:', registro.scope);

            // Puedes agregar más lógica aquí, por ejemplo, verificar el estado
            if (registro.installing) {
                console.log('Service Worker se está instalando...');
            } else if (registro.waiting) {
                console.log('Service Worker instalado y esperando activación.');
            } else if (registro.active) {
                console.log('Service Worker activo.');
            }

        } catch (error) {
            // 'catch' maneja cualquier error que ocurra durante el registro
            console.error('Fallo en el registro del Service Worker:', error);
        }
    }
};

// Llama a la función para ejecutar el registro cuando la página cargue
window.addEventListener('load', registrarServiceWorker);