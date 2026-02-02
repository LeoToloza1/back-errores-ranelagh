import { Router, Request, Response, NextFunction } from "express";
import { RepoPostgresPersonal } from "../repo/RepoPostgresPersonal.js";
import { RepoPostrgresError } from "../repo/RepoPostrgresError.js";
import { Usuario } from "../model/Usuario.js";
import { Personal } from "../model/Personal.js";
import { authRequired } from "../middleware/authmiddleware.js";

declare module 'express-session' {
    interface SessionData {
        user?: Usuario;
        nombre?: string;
        apellido?: string;
    }
}

export class ViewsRouter {
    public readonly router: Router = Router();
    constructor(
        private repoPersonal: RepoPostgresPersonal,
        private repoError: RepoPostrgresError
    ) {
        this.cargarRutas();
    }
    private cargarRutas() {
        this.router.get("/", (req, res) => res.render("index"));
        this.router.get("/login", (req, res) => res.render("login"));

        // VISTA DE ERRORES (Modificada)
        this.router.get("/admin", authRequired, async (req: Request, res: Response) => {
            try {
                const usuario = req.session.user as any;
                const nombreUsuario = usuario?.nombre || "Usuario";


                const [errores, totalPersonal] = await Promise.all([
                    this.repoError.getAll(),
                    this.repoPersonal.getAll()
                ]);
                const filteredErrors = this.filtrarErrores(errores, req.query);
                res.render("admin", {
                    activePage: 'errores',
                    errors: filteredErrors.map(e => e.toJson()),
                    personal: totalPersonal, // <--- Faltaba pasar esto
                    nombreUsuario,
                    query: req.query
                });

            } catch (error) {
                res.render("admin", { activePage: 'errores', errors: [], error: "Error" });
            }
        });

        // NUEVA VISTA DE PERSONAL
        this.router.get("/admin/personal", authRequired, async (req: Request, res: Response) => {
            try {
                const personal = await this.repoPersonal.getAll();
                res.render("personal", { // Usará personal.pug
                    activePage: 'personal', // Para el layout
                    personal: personal.map(p => p.toJSON()),
                    nombreUsuario: (req.session.user as any)?.nombre || "Usuario"
                });
            } catch (error) {
                res.redirect("/admin?error=Error al cargar personal");
            }
        });

        // Rutas para ABM de personal
        this.router.post("/admin/personal", authRequired, async (req: Request, res: Response) => {
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

        this.router.post("/admin/personal/:id/delete", authRequired, async (req: Request, res: Response) => {
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

    getRouter() {
        return this.router;
    }
    private filtrarErrores(errors: any[], query: any) {
        const { responsable, fechaDesde, fechaHasta } = query;
        return errors.filter(e => {
            const matchResp = !responsable || e.getResponsable().toLowerCase().includes(responsable.toLowerCase());
            const fecha = new Date(e.getFechaRegistro());
            const matchDesde = !fechaDesde || fecha >= new Date(fechaDesde);
            const matchHasta = !fechaHasta || fecha <= new Date(fechaHasta);
            return matchResp && matchDesde && matchHasta;
        });
    }
}