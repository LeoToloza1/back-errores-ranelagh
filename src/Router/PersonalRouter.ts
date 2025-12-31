import { Router, Request, Response } from "express";
import { Notificacion } from "../interfaces/Notificacion.js";
import { PersonalController } from "../controller/PersonalController.js";
import { Personal } from "../model/Personal.js";

export class PersonalRouter {
    router: Router;

    constructor(private controller: PersonalController) {
        this.router = Router();
        this.cargarRutas();
    }

    private cargarRutas() {
        this.router.get("/", async (req: Request, res: Response) => {
            try {
                const personal = await this.controller.ObtenerTodos();
                res.json(personal);
            } catch (error) {
                res.status(500).json({ mensaje: "Error al obtener personal" });
            }
        });

        this.router.get("/buscar", async (req, res) => {
            const resultados = await this.controller.Buscar(req.query);
            res.json(resultados);
        });

        this.router.get("/:id", async (req: Request, res: Response) => {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id)) return res.status(400).json({ mensaje: "ID inválido" });

                const personal = await this.controller.ObtenerPorId(id);
                personal ? res.json(personal) : res.status(404).json({ mensaje: "No encontrado" });
            } catch (error) {
                res.status(500).json({ mensaje: "Error al obtener por ID" });
            }
        });
        this.router.post("/", async (req: Request, res: Response) => {
            try {
                const { nombre, puesto, sector } = req.body;
                const personal = new Personal(0, nombre, puesto, sector);
                const nuevoPersonal = await this.controller.Guardar(personal);

                const notificacion: Notificacion = {
                    tipo: "success",
                    titulo: "Éxito",
                    posicion: "top-right",
                    autoClose: "3000",
                    mensaje: "Personal registrado correctamente"
                };
                res.status(201).json({ nuevoPersonal, notificacion });
            } catch (error) {
                res.status(500).json({ mensaje: "Error al guardar" });
            }
        });

        this.router.put("/:id", async (req: Request, res: Response) => {
            try {
                const id = parseInt(req.params.id);
                const { nombre, puesto, sector } = req.body;
                const personal = new Personal(id, nombre, puesto, sector);
                const personalActualizado = await this.controller.Actualizar(id, personal);

                const notificacion: Notificacion = {
                    tipo: "success",
                    titulo: "Éxito",
                    posicion: "top-right",
                    autoClose: "3000",
                    mensaje: "Personal actualizado correctamente"
                };
                res.status(200).json({ personalActualizado, notificacion });
            } catch (error) {
                res.status(500).json({ mensaje: "Error al actualizar" });
            }
        });
    }

    getRouter(): Router {
        return this.router;
    }
}