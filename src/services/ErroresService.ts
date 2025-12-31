import { IError } from "../interfaces/IError.js";
import { ErrorRanelagh } from "../model/Error.js";
import { RepoPostrgresError } from "../repo/RepoPostrgresError.js";
import { PersonalService } from "./PersonalService.js";

export class ErroresService {
    constructor(
        private errorRepo: RepoPostrgresError,
        private personalService: PersonalService
    ) { }

    async registrarError(datos: IError): Promise<ErrorRanelagh> {
        try {

            const responsable = await this.personalService.obtenerPorId(parseInt(datos.responsable));
            const emitidoPor = await this.personalService.obtenerPorId(parseInt(datos.emitidoPor));
            const detectadoPor = await this.personalService.obtenerPorId(parseInt(datos.detectadoPor));

            if (!responsable) {
                throw new Error("RESPONSABLE_NOT_FOUND");
            }
            const nuevoError = new ErrorRanelagh({
                refDocumento: datos.refDocumento,
                responsable: responsable.getNombre(),
                puestoResponsable: responsable.getPuesto(),
                sectorResponsable: responsable.getSector(),
                detectadoPor: detectadoPor?.getNombre() || "no identificado",
                emitidoPor: emitidoPor?.getNombre() || "no identificado",
                comentarioError: datos.comentarioError,
                fechaRegistro: datos.fechaRegistro || new Date().toLocaleDateString('es-AR'),
                fechaResolucion: datos.fechaResolucion || "No tiene fecha de resolución",
                id: null,
                comparado: false
            });
            const errorGuardado = await this.errorRepo.create(nuevoError);
            this.notificarWebhook(errorGuardado);
            return errorGuardado;
        } catch (error: any) {
            console.error("Error en ErroresService.registrarError:", error.message);
            throw error;
        }
    }

    async obtenerTodos(): Promise<ErrorRanelagh[]> {
        try {
            return await this.errorRepo.getAll();
        } catch (error) {
            console.error("Error al obtener todos los errores:", error);
            throw new Error("ERROR AL OBTENER TODOS LOS ERRORES");
        }
    }

    async obtenerPorId(id: number): Promise<ErrorRanelagh | null> {
        try {
            return await this.errorRepo.get(id);
        } catch (error) {
            console.error(`Error al obtener el error con ID ${id}:`, error);
            throw new Error("ERROR AL BUSCAR POR ID");
        }
    }

    // --- NUEVOS MÉTODOS DE BÚSQUEDA Y FILTROS ---

    async buscarPorTexto(termino: string): Promise<ErrorRanelagh[]> {
        try {
            // Este método busca en responsable, comentario, etc.
            return await this.errorRepo.buscar(termino);
        } catch (error) {
            console.error("Error en búsqueda por texto:", error);
            throw new Error("ERROR EN LA BÚSQUEDA");
        }
    }

    async filtrarPorRangoFechas(inicio: string, fin: string): Promise<ErrorRanelagh[]> {
        try {
            // Normalizamos barras por guiones para asegurar formato YYYY-MM-DD
            const start = inicio.replace(/\//g, '-');
            const end = fin.replace(/\//g, '-');
            return await this.errorRepo.buscarPorRangoFechas(start, end);
        } catch (error) {
            console.error("Error en filtrado por rango de fechas:", error);
            throw new Error("ERROR AL FILTRAR FECHAS");
        }
    }

    async buscarPorPatronFecha(patron: string): Promise<ErrorRanelagh[]> {
        try {
            // El que te permite buscar "28/08"
            return await this.errorRepo.buscarPorPatronFecha(patron);
        } catch (error) {
            console.error("Error en búsqueda por patrón de fecha:", error);
            throw new Error("ERROR AL BUSCAR FECHA PARCIAL");
        }
    }

    // --- MÉTODOS DE ESTADÍSTICAS ---

    async obtenerConteoDiario(fecha?: string): Promise<number> {
        try {
            const fechaABuscar = fecha || new Date().toISOString().split('T')[0];
            return await this.errorRepo.contarErroresPorFecha(fechaABuscar);
        } catch (error) {
            console.error("Error al contar errores diarios:", error);
            throw new Error("ERROR AL OBTENER CONTEO");
        }
    }

    async obtenerEstadisticasDashboard() {
        try {
            const [sectores, responsables] = await Promise.all([
                this.errorRepo.getEstadisticasSectores(),
                this.errorRepo.getTopResponsables()
            ]);
            return { sectores, responsables };
        } catch (error) {
            console.error("Error al generar estadísticas:", error);
            throw new Error("ERROR AL GENERAR DASHBOARD");
        }
    }



    async eliminar(id: number): Promise<void> {
        try {
            await this.errorRepo.delete(id);
        } catch (error) {
            console.error(`Error al eliminar el error ${id}:`, error);
            throw new Error("ERROR AL ELIMINAR");
        }
    }

    private async notificarWebhook(error: ErrorRanelagh) {
        try {
            const url = process.env.WEBHOOK;
            if (!url) return;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(error)
            });
            if (!response.ok) throw new Error(`Webhook status: ${response.status}`);
        } catch (e) {
            console.error("Error enviando a n8n:", e);
        }
    }
}