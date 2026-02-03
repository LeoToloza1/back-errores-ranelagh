import { Router } from "express";
import { ErroresController } from "../controller/ErroresController.js";
import { RepoPostrgresError } from "../repo/RepoPostrgresError.js";

export class ErroresRouter {
    public readonly router: Router = Router();

    constructor(
        private controller: ErroresController,
        private posgres: RepoPostrgresError
    ) {
        this.cargarRutas();
    }

    private cargarRutas() {
        // Correcto: Usamos una función flecha para llamar al método
        this.router.post("/registrar-error", (req, res) => this.controller.registrarError(req, res));
        this.validarRutasDeSalud();
    }

    private validarRutasDeSalud() {
        this.router.get("/health", async (_req, res) => {
            const healthcheck = {
                uptime: process.uptime(),
                message: 'OK',
                timestamp: Date.now(),
                database: false,
                external_services: { n8n: false }
            };

            try {
                healthcheck.database = await this.posgres.checkHealth();

                const n8nResponse = await fetch(process.env.WEBHOOK_STATUS || "");
                healthcheck.external_services.n8n = n8nResponse.ok;

                const status = (healthcheck.database && healthcheck.external_services.n8n) ? 200 : 503;
                res.status(status).json(healthcheck);
            } catch (error) {
                res.status(503).json({ ...healthcheck, message: "Servicio no disponible" });
            }
        });
    }

    getRouter(): Router {
        return this.router;
    }
}