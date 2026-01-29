import { Router } from "express";
import { LoginController } from "../controller/LoginController.js";
import { authRequired } from "../middleware/authmiddleware.js";

export class LoginRouter {
    private readonly router: Router;

    constructor(private readonly controller: LoginController) {
        this.router = Router();
        this.configurarRutas();
    }

    private configurarRutas(): void {
        // Rutas Públicas
        // Usamos flecha () => para no perder el contexto del 'this' dentro del controlador
        this.router.post("/login", (req, res) => this.controller.login(req, res));
        this.router.post("/logout", (req, res) => this.controller.logout(req, res));

        // Rutas Protegidas (Middleware authRequired aplicado aquí)
        this.router.post("/cambiar-password", (req, res) =>
            this.controller.cambiarPassword(req, res)
        );

        this.router.get("/me", authRequired, (req, res) =>
            this.controller.getCurrentUser(req, res)
        );
    }

    // Método para obtener el router configurado y usarlo en app.ts o server.ts
    getRouter(): Router {
        return this.router;
    }
}