import { Router, Request, Response } from "express";
import { JsonRepositorio } from "./repo/jsonRepositorio.js";
import { Personal } from "./model/Personal.js";
import { RepoPostrgresError } from "./repo/RepoPostrgresError.js";
import { ErrorRanelagh } from "./model/Error.js";
import dotenv from "dotenv";
import { RepoPostgresPersonal } from "./repo/RepoPostgresPersonal.js";
import { parse } from "path";
dotenv.config();

export interface Notificacion {
    tipo: "info" | "success" | "warning" | "error";
    titulo: string;
    posicion: string;
    autoClose: string;
    mensaje: string;
}

export class ErroresRouter {
    router: Router;

    /**
     * Constructor de la clase ErroresRouter.
     * @param leerJson Repositorio para obtener la lista de personal.
     * @param posgres Repositorio para obtener errores de Postgres.
     */
    constructor(private repo: RepoPostgresPersonal, private posgres: RepoPostrgresError) {
        this.router = Router();
        this.cargarRutas();
        this.validarRutasDeSalud();
    }

    /**
     * Carga las rutas para obtener la lista de personal y para registrar un error en la base de datos.
     */
    private cargarRutas() {
        this.router.get("/personal", async (req: Request, res: Response) => {
            try {
                const listaPersonal = await this.repo.getAll();
                res.status(200).json(listaPersonal.map(p => (p.toJSON())));
            } catch (error) {
                console.error("Error al obtener personal:", error);
                const notificacion: Notificacion = {
                    tipo: "error",
                    titulo: "Error",
                    posicion: "top-right",
                    autoClose: "5000",
                    mensaje: "Error interno del servidor"
                };
                res.status(500).json(notificacion);
            }
        });

        this.router.post("/registrar-error", async (req: Request, res: Response) => {
            try {
                const datosError = req.body
                const reesponsableId = parseInt(datosError.responsable);
                const responsable = await this.repo.get(reesponsableId); //enviar el nombre, el sector y el puesto
                const detectadoPorId = parseInt(datosError.detectadoPor);
                const emitidoPorId = parseInt(datosError.emitidoPor);
                const emitidoPor = await this.repo.get(emitidoPorId);
                const detectadoPor = await this.repo.get(detectadoPorId); //enviar el nombre
                if (!responsable || responsable.getNombre() === "") {
                    const notificacion: Notificacion = {
                        tipo: "warning",
                        titulo: "Advertencia",
                        posicion: "top-right",
                        autoClose: "4000",
                        mensaje: "No se recibieron los datos del responsable"
                    };
                    return res.status(400).json(notificacion);
                }

                if (!responsable) {
                    const notificacion: Notificacion = {
                        tipo: "warning",
                        titulo: "Advertencia",
                        posicion: "top-right",
                        autoClose: "4000",
                        mensaje: "Responsable no encontrado"
                    };
                    return res.status(400).json(notificacion);
                }

                const enviarAN8N: {
                    refDocumento: string;
                    responsable: string;
                    emitidoPor?: string;
                    detectadoPor?: string;
                    puestoResponsable: string;
                    sectorResponsable: string;
                    comentarioError: string;
                    fechaRegistro: string;
                    fechaResolucion: string;
                    id: number | null;
                    comparado?: boolean
                } = {
                    refDocumento: datosError.refDocumento,
                    responsable: responsable.getNombre(),
                    detectadoPor: detectadoPor?.getNombre(),
                    emitidoPor: emitidoPor?.getNombre(),
                    puestoResponsable: responsable.getPuesto(),
                    sectorResponsable: responsable.getSector(),
                    comentarioError: datosError.comentarioError,
                    fechaRegistro: datosError.fechaRegistro,
                    fechaResolucion: datosError.fechaResolucion || "No tiene fecha de resolucion",
                    id: null,
                    comparado: false
                };
                const errorDB = new ErrorRanelagh(
                    enviarAN8N.refDocumento,
                    enviarAN8N.responsable,
                    enviarAN8N.emitidoPor || "no identificado",
                    enviarAN8N.detectadoPor || "no identificado",
                    enviarAN8N.puestoResponsable,
                    enviarAN8N.sectorResponsable,
                    enviarAN8N.comentarioError,
                    enviarAN8N.fechaRegistro,
                    enviarAN8N.fechaResolucion,
                );
                const errorGuardado = await this.posgres.create(errorDB);
                enviarAN8N.id = errorGuardado.getId();
                enviarAN8N.comparado = errorGuardado.getComparado();

                try {
                    const url = new URL(process.env.WEBHOOK || "");
                    const response = await fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(enviarAN8N)
                    });

                    if (!response.ok) {
                        console.error(`Error al enviar datos a n8n: ${response.status} - ${response.statusText}`);
                    }
                } catch (n8nError) {
                    console.error("Error de conexión con n8n:", n8nError);
                }
                const notificacion: Notificacion = {
                    tipo: "success",
                    titulo: "Éxito",
                    posicion: "top-right",
                    autoClose: "3000",
                    mensaje: "Error registrado correctamente"
                };
                res.status(201).json(notificacion);
            } catch (error) {
                console.error("Error al registrar error:", error);
                const notificacion: Notificacion = {
                    tipo: "error",
                    titulo: "Error",
                    posicion: "top-right",
                    autoClose: "5000",
                    mensaje: "Hubo un problema al registrar el error"
                };
                res.status(500).json(notificacion);
            }
        });

        this.router.post("/personal", async (req: Request, res: Response) => {
            try {
                const { nombre, puesto, sector } = req.body;
                const personal = new Personal(0, nombre, puesto, sector);
                const nuevoPersonal = await this.repo.create(personal);
                const notificacion: Notificacion = {
                    tipo: "success",
                    titulo: "Éxito",
                    posicion: "top-right",
                    autoClose: "3000",
                    mensaje: "Personal registrado correctamente"
                }
                res.status(201).json({ nuevoPersonal, notificacion });
            } catch (error) {
                console.error("Error al registrar personal:", error);
                const notificacion: Notificacion = {
                    tipo: "error",
                    titulo: "Error",
                    posicion: "top-right",
                    autoClose: "5000",
                    mensaje: "Hubo un problema al registrar el personal"
                };
                res.status(500).json(notificacion);
            }
        })
    }
    /**
     * Verifica la salud del servicio.
     *
     * Verifica si la conexión a la base de datos es exitosa y si el
     * servicio n8n est  disponible.
     *
     * Devuelve un objeto con la siguiente estructura:
     * {
     *   uptime: number,
     *   message: string,
     *   timestamp: number,
     *   database: boolean,
     *   external_services: {
     *       n8n: boolean
     *   }
     * }
     *
     * Si el servicio est  disponible, devuelve un 200 con el objeto de salud.
     * Si no est  disponible, devuelve un 503 con el objeto de salud.
     */
    private validarRutasDeSalud() {
        this.router.get("/health", async (req: Request, res: Response) => {
            const healthcheck = {
                uptime: process.uptime(),
                message: 'OK',
                timestamp: Date.now(),
                database: false,
                external_services: {
                    n8n: false
                }
            };

            try {
                const dbStatus = await this.posgres.checkHealth();
                healthcheck.database = dbStatus;
                const n8nUrl = new URL(process.env.WEBHOOK_STATUS || "http://localhost:5678/webhook-test");
                const n8nResponse = await fetch(n8nUrl);
                healthcheck.external_services.n8n = n8nResponse.ok;
                healthcheck.message = "El servicio está disponible";
                if (healthcheck.database && healthcheck.external_services.n8n) {
                    res.status(200).json(healthcheck);
                } else {
                    healthcheck.message = "Servicio no disponible";
                    res.status(503).json(healthcheck);
                }

            } catch (error) {
                healthcheck.message = "Servicio no disponible";
                console.error("Error al verificar la salud del servicio:", error);
                res.status(503).json(healthcheck);
            }
        });
    }


}
