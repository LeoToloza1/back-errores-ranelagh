export interface Notificacion {
    tipo: "info" | "success" | "warning" | "error";
    titulo: string;
    posicion: string;
    autoClose: string;
    mensaje: string;
}
