/**
 * `ToastComponent` es un componente web personalizado que muestra notificaciones tipo "toast".
 * @extends HTMLElement
 */
class ToastComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    /**
     * Define los atributos observados por el componente.
     * @returns {Array<string>}
     */
    static get observedAttributes() {
        return ["icono", "titulo", "mensaje", "tipo", "auto-close", "posicion"];
    }

    /**
     * Se llama cuando uno de los atributos observados cambia.
     * @param {string} name - Nombre del atributo.
     * @param {string} oldValue - Valor antiguo del atributo.
     * @param {string} newValue - Nuevo valor del atributo.
     */
    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }

    /**
     * Se llama cuando el componente se agrega al DOM.
     */
    connectedCallback() {
        this.render();
        this.setupAutoClose();
    }

    // Getters para los atributos del componente
    get icono() {
        return this.getAttribute("icono") || "";
    }

    get titulo() {
        return this.getAttribute("titulo") || "Notificación";
    }

    get mensaje() {
        return this.getAttribute("mensaje") || "";
    }

    get tipo() {
        return this.getAttribute("tipo") || "info";
    }

    get posicion() {
        return this.getAttribute("posicion") || "top-right";
    }

    get autoClose() {
        return this.getAttribute("auto-close") || "3000";
    }

    /**
     * Genera los estilos CSS para el componente basado en el tipo y la posición.
     * @param {string} tipo - Tipo de notificación.
     * @param {string} posicion - Posición de la notificación.
     * @returns {string} - Estilos CSS.
     */
    static getStyles(tipo, posicion) {
        const colors = {
            error: '#EF665B',
            success: '#4CAF50',
            warning: '#ff9800',
            info: '#2196F3'
        };

        const positions = {
            'top-right': 'top: 20px; right: 20px;',
            'top-left': 'top: 20px; left: 20px;',
            'bottom-right': 'bottom: 20px; right: 20px;',
            'bottom-left': 'bottom: 20px; left: 20px;',
            'top-center': 'top: 20px; left: 50%; transform: translateX(-50%);',
            'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%);'
        };

        return `
            :host {
                display: block;
                position: fixed;
                ${positions[posicion]};
                z-index: 9999;
                width: fit-content;
            }

            .toast-component {
                width: 320px;
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                background: ${colors[tipo]};
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                animation: slideIn 0.3s ease-in-out;
                box-sizing: border-box;
            }

            @keyframes slideIn {
                from {
                    transform: translateY(-20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .toast-component__icon {
                flex-shrink: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .toast-component__icon img {
                width: 24px;
                height: 24px;
            }

            .toast-component__content {
                flex-grow: 1;
                margin-right: 8px;
                word-wrap: break-word;
                overflow-wrap: break-word;
            }

            .toast-component__title {
                font-weight: 600;
                font-size: 14px;
                color: white;
                margin-bottom: 4px;
            }

            .toast-component__message {
                font-size: 13px;
                color: rgba(255, 255, 255, 0.9);
                line-height: 1.4;
            }

            .toast-component__close-button {
                flex-shrink: 0;
                width: 24px;
                height: 24px;
                padding: 4px;
                cursor: pointer;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 4px;
                transition: background-color 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .toast-component__close-button:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .toast-component__close-button:active {
                background: rgba(255, 255, 255, 0.3);
            }

            .toast-component__close-button svg {
                width: 16px;
                height: 16px;
                fill: white;
            }

            @media (max-width: 768px) {
                :host {
                    width: 90%;
                    left: 50% !important;
                    right: auto !important;
                    transform: translateX(-50%) !important;
                }
                
                .toast-component {
                    width: 100%;
                    max-width: 100%;
                    padding: 14px;
                    margin: 0;
                }
                
                .toast-component__content {
                    max-width: 75%;
                }
                
                .toast-component__title {
                    font-size: 13px;
                }
                
                .toast-component__message {
                    font-size: 12px;
                }
                
                .toast-component__close-button {
                    margin-left: 8px;
                }
            }

            @media (max-width: 480px) {
                :host {
                    width: 95%;
                }
                
                .toast-component {
                    padding: 12px;
                    gap: 8px;
                }
                
                .toast-component__icon {
                    width: 20px;
                    height: 20px;
                    margin-right: 10px;
                    transform: scale(0.9);
                }
                
                .toast-component__content {
                    max-width: 70%;
                }
                
                .toast-component__title {
                    font-size: 12px;
                    margin-right: 8px;
                }
                
                .toast-component__close-button {
                    width: 22px;
                    height: 22px;
                    padding: 5px;
                }
            }
        `;
    }

    /**
     * Renderiza el contenido del componente.
     */
    render() {
        // Íconos SVG predeterminados para cada tipo
        const iconosSVG = {
            error: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path fill="white" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>`,
            success: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path fill="white" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>`,
            warning: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path fill="white" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>`,
            info: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path fill="white" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>`
        };

        this.shadowRoot.innerHTML = `
            <style>${ToastComponent.getStyles(this.tipo, this.posicion)}</style>
            <div class="toast-component">
                <div class="toast-component__icon">
                    ${this.icono ? `<img src="${this.icono}" alt="icono">` : iconosSVG[this.tipo] || ''}
                </div>
                <div class="toast-component__content">
                    <div class="toast-component__title">${this.titulo}</div>
                    <div class="toast-component__message">${this.mensaje}</div>
                </div>
                <button class="toast-component__close-button" aria-label="Cerrar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="m15.8333 5.34166-1.175-1.175-4.6583 4.65834-4.65833-4.65834-1.175 1.175 4.65833 4.65834-4.65833 4.6583 1.175 1.175 4.65833-4.6583 4.6583 4.6583 1.175-1.175-4.6583-4.6583z"></path>
                    </svg>
                </button>
            </div>
        `;

        this.shadowRoot
            .querySelector(".toast-component__close-button")
            .addEventListener("click", () => this.remove());
    }

    /**
     * Configura el cierre automático de la notificación.
     */
    setupAutoClose() {
        if (this.autoClose) {
            setTimeout(() => this.remove(), parseInt(this.autoClose, 10));
        }
    }
}

/**
 * Clase `Toast` para mostrar notificaciones de manera más sencilla.
 */
class Toast {
    /**
     * Muestra una notificación con el mensaje y las opciones especificadas.
     * @param {string} mensaje - Mensaje de la notificación.
     * @param {Object} options - Opciones de configuración.
     * @returns {ToastComponent} - Instancia del componente `ToastComponent`.
     */
    static show(mensaje, options = {}) {
        const toast = document.createElement('toast-component');
        const defaults = {
            tipo: 'info',
            titulo: 'Notificación',
            posicion: 'top-right',
            autoClose: '3000'
        };

        const config = { ...defaults, ...options };

        toast.setAttribute('mensaje', mensaje);
        toast.setAttribute('tipo', config.tipo);
        toast.setAttribute('titulo', config.titulo);
        toast.setAttribute('posicion', config.posicion);
        toast.setAttribute('auto-close', config.autoClose);
        if (config.icono) toast.setAttribute('icono', config.icono);

        document.body.appendChild(toast);
        return toast;
    }

    /**
     * Muestra una notificación de éxito.
     * @param {string} mensaje - Mensaje de la notificación.
     * @param {number} [duracion] - Duración en milisegundos.
     * @param {string} [posicion] - Posición de la notificación.
     * @param {Object} [options] - Opciones adicionales.
     * @returns {ToastComponent} - Instancia del componente `ToastComponent`.
     */
    static success(mensaje, duracion, posicion, options = {}) {
        const opts = { ...options };
        if (duracion) opts.autoClose = duracion;
        if (posicion) opts.posicion = posicion;
        return this.show(mensaje, { ...opts, tipo: 'success', titulo: 'Éxito' });
    }

    /**
     * Muestra una notificación de error.
     * @param {string} mensaje - Mensaje de la notificación.
     * @param {number} [duracion] - Duración en milisegundos.
     * @param {string} [posicion] - Posición de la notificación.
     * @param {Object} [options] - Opciones adicionales.
     * @returns {ToastComponent} - Instancia del componente `ToastComponent`.
     */
    static error(mensaje, duracion, posicion, options = {}) {
        const opts = { ...options };
        if (duracion) opts.autoClose = duracion;
        if (posicion) opts.posicion = posicion;
        return this.show(mensaje, { ...opts, tipo: 'error', titulo: 'Error' });
    }

    /**
     * Muestra una notificación de advertencia.
     * @param {string} mensaje - Mensaje de la notificación.
     * @param {number} [duracion] - Duración en milisegundos.
     * @param {string} [posicion] - Posición de la notificación.
     * @param {Object} [options] - Opciones adicionales.
     * @returns {ToastComponent} - Instancia del componente `ToastComponent`.
     */
    static warning(mensaje, duracion, posicion, options = {}) {
        const opts = { ...options };
        if (duracion) opts.autoClose = duracion;
        if (posicion) opts.posicion = posicion;
        return this.show(mensaje, { ...opts, tipo: 'warning', titulo: 'Advertencia' });
    }

    /**
     * Muestra una notificación de información.
     * @param {string} mensaje - Mensaje de la notificación.
     * @param {number} [duracion] - Duración en milisegundos.
     * @param {string} [posicion] - Posición de la notificación.
     * @param {Object} [options] - Opciones adicionales.
     * @returns {ToastComponent} - Instancia del componente `ToastComponent`.
     */
    static info(mensaje, duracion, posicion, options = {}) {
        const opts = { ...options };
        if (duracion) opts.autoClose = duracion;
        if (posicion) opts.posicion = posicion;
        return this.show(mensaje, { ...opts, tipo: 'info', titulo: 'Información' });
    }
}

// Registrar el componente solo si no está definido
if (!customElements.get('toast-component')) {
    customElements.define("toast-component", ToastComponent);
}

// Exportar para uso en módulos
window.Toast = Toast;