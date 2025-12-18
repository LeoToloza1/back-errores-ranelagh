import { Router, Request, Response, NextFunction } from "express";
import { RepoPostgresPersonal } from "../repo/RepoPostgresPersonal.js";
import { RepoPostrgresError } from "../repo/RepoPostrgresError.js";
import { Usuario } from "../model/Usuario.js";

declare module 'express-session' {
    interface SessionData {
        user?: Usuario;
    }
}

export class ViewsRouter {
    router: Router;
    private repoPersonal: RepoPostgresPersonal;
    private repoError: RepoPostrgresError;

    constructor(repoPersonal: RepoPostgresPersonal, repoError: RepoPostrgresError) {
        this.repoPersonal = repoPersonal;
        this.repoError = repoError;
        this.router = Router();
        this.cargarRutas();
    }

    private requireAuth(req: Request, res: Response, next: NextFunction): void {
        if (req.session.user) {
            next();
        } else {
            res.redirect("/login");
        }
    }

    private cargarRutas() {
        this.router.get("/", (req: Request, res: Response) => {
            res.render("index");
        });

        this.router.get("/login", (req: Request, res: Response) => {
            res.render("login");
        });

        this.router.get("/admin", this.requireAuth, async (req: Request, res: Response) => {
            try {
                const personal = await this.repoPersonal.getAll();
                const errors = await this.repoError.getAll();
                // Aplicar filtros básicos si hay query params
                const { responsable, fechaDesde, fechaHasta } = req.query;
                let filteredErrors = errors;
                if (responsable) {
                    filteredErrors = filteredErrors.filter(e => e.getResponsable().toLowerCase().includes((responsable as string).toLowerCase()));
                }
                if (fechaDesde) {
                    filteredErrors = filteredErrors.filter(e => new Date(e.getFechaRegistro()) >= new Date(fechaDesde as string));
                }
                if (fechaHasta) {
                    filteredErrors = filteredErrors.filter(e => new Date(e.getFechaRegistro()) <= new Date(fechaHasta as string));
                }
                res.render("admin", { errors: filteredErrors.map(e => e.toJson()), personal: personal.map(p => p.toJSON()) });
            } catch (error) {
                console.error("Error al cargar admin:", error);
                res.render("admin", { errors: [], personal: [], error: "Error al cargar datos" });
            }
        });

        // Rutas para ABM de personal
        this.router.post("/admin/personal", this.requireAuth, async (req: Request, res: Response) => {
            try {
                const { nombre, puesto, sector } = req.body;
                const personal = new (await import("../model/Personal.js")).Personal(0, nombre, puesto, sector);
                await this.repoPersonal.create(personal);
                res.redirect("/admin");
            } catch (error) {
                console.error("Error al crear personal:", error);
                res.redirect("/admin?error=Error al crear personal");
            }
        });

        this.router.post("/admin/personal/:id/delete", this.requireAuth, async (req: Request, res: Response) => {
            try {
                const id = parseInt(req.params.id);
                await this.repoPersonal.delete(id);
                res.redirect("/admin");
            } catch (error) {
                console.error("Error al eliminar personal:", error);
                res.redirect("/admin?error=Error al eliminar personal");
            }
        });

        // Para editar, agregar ruta GET /admin/personal/:id/edit y POST /admin/personal/:id/update
        // Por simplicidad, omitir por ahora, o agregar básico.
    }
}