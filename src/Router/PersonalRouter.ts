import { Router, Request, Response } from "express";
import { Notificacion } from "../interfaces/Notificacion.js";
import { PersonalController } from "../controller/PersonalController.js";

export class PersonalRouter {
    router: Router;
    ;

    constructor(private controller: PersonalController) {
        this.router = Router();
        this.cargarRutas();
    }

    private cargarRutas() {
        this.router.get("/", async (req: Request, res: Response) => {
            const personal = await this.controller.ObtenerTodos();
            res.json(personal);
        });

        /**
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
        */
    }


    getRouter(): Router {
        return this.router;
    }

}