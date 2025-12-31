import { ErroresService } from "../services/ErroresService.js";
import { IError } from "../interfaces/IError.js";

export class ErroresController {
    constructor(private service: ErroresService) { }

    async registrarError(error: IError) {
        try {
            const errorGuardado = await this.service.registrarError(error);
        } catch (error) {
            console.error("Error al registrar error:", error);
            throw new Error("no hay personal cargado o hubo un error");
        }
    }
}