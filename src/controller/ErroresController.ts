import { Request, Response } from "express";
import { ErroresService } from "../services/ErroresService.js";
import { IError } from "../interfaces/IError.js";
import { Notificacion } from "../interfaces/Notificacion.js";

export class ErroresController {
    constructor(private service: ErroresService) { }

    registrarError = async (req: Request, res: Response): Promise<void> => {
        try {
            const datosError: IError = req.body;
            await this.service.registrarError(datosError);

            const respuestaExito: Notificacion = {
                tipo: "success",
                titulo: "Operación Exitosa",
                posicion: "top-right",
                autoClose: "3000",
                mensaje: "El error ha sido registrado y notificado correctamente."
            };

            res.status(201).json(respuestaExito);

        } catch (error: any) {
            console.error("Controller Error:", error.message);
            const respuestaError: Notificacion = {
                tipo: "error",
                titulo: "Error de Registro",
                posicion: "top-right",
                autoClose: "5000",
                mensaje: error.message || "No se pudo procesar la solicitud."
            };

            res.status(400).json(respuestaError);
        }
    }
}