export const URL_BASE = '/api';


export async function obtenerDatos() {
    const datosPersonal = await fetch(`${URL_BASE}/personal`);
    const data = await datosPersonal.json();
    return data;
}


/**
 * Enviar los errores registrados a través de la API.
 *
 * @param {Object} data - Los datos del error a registrar.
 * @return {Promise} - Una promesa que se resuelve con los datos de la respuesta.
 */
export async function enviarErrores(data) {
    try {
        const response = await fetch(`${URL_BASE}/registrar-error`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            return {
                tipo: 'error',
                titulo: 'Error',
                posicion: 'top-right',
                autoClose: 5000,
                mensaje: 'Error interno del servidor'
            };
        }

        const res = await response.json();
        return res;

    } catch (error) {
        console.error("Error al enviar error:", error);
        return {
            tipo: 'error',
            titulo: 'Error de conexión',
            posicion: 'top-right',
            autoClose: 5000,
            mensaje: 'No se pudo conectar con el servidor'
        };
    }
}