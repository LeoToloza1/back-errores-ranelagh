import { Request, Response } from "express";
import { LoginService } from "../services/loginService.js";
import { Usuario } from "../model/Usuario.js";

declare module 'express-session' {
    interface SessionData {
        user?: Usuario;
    }
}

export class LoginController {

    constructor(private readonly loginService: LoginService) { }

    async login(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ error: "Username y contraseña son requeridos" });
            return;
        }

        try {
            const user = await this.loginService.login(username, password);

            if (user) {

                req.session.user = {
                    id: user.getId(),
                    username: user.getUsername(),
                    nombre: user.getPersonal().getNombre(),
                    puesto: user.getPersonal().getPuesto(),
                    sector: user.getPersonal().getSector(),
                } as any;

                res.status(200).json({ message: "Login correcto" });

            } else {
                res.status(401).json({ error: "Credenciales incorrectas" });
            }
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ error: "Error al iniciar sesión" });
        }
    }

    async logout(req: Request, res: Response): Promise<void> {
        req.session.destroy((err) => {
            if (err) {
                res.status(500).json({ error: "Error al cerrar sesión" });
            } else {
                res.clearCookie('connect.sid');
                res.status(200).json({ message: "Sesión cerrada" });
            }
        });
    }

    async cambiarPassword(req: Request, res: Response): Promise<void> {
        const { username, newPassword } = req.body;
        if (!username || !newPassword) {
            res.status(400).json({ error: "El nombre de usuario y la nueva contraseña son requeridos" });
            return;
        }

        try {
            await this.loginService.cambiarPassword(username, newPassword);
            req.session.destroy((err) => {
                if (err) {
                    console.error("Error destruyendo sesión post-cambio:", err);

                    res.status(500).json({ error: "Contraseña cambiada pero hubo un error al cerrar la sesión" });
                } else {
                    console.log("Sesión cerrada post-cambio");
                    res.clearCookie('connect.sid');
                    res.status(200).json({
                        message: "Contraseña actualizada. Por seguridad, debe iniciar sesión nuevamente."
                    });
                }
            });

        } catch (error: any) {
            console.error("Error al cambiar password:", error);
            const status = error.message === "Usuario no encontrado" ? 404 : 500;
            res.status(status).json({ error: error.message });
        }
    }


    async actualizarPerfil(req: Request, res: Response): Promise<void> {
        // Extraemos el username actual de la sesión para identificar al usuario en la DB
        const currentUsername = (req.session.user as any)?.username;
        const { newUsername, newPassword } = req.body;

        if (!currentUsername) {
            res.status(401).json({ error: "Sesión no válida" });
            return;
        }

        // Validar que al menos llegue un dato para cambiar
        if (!newUsername && !newPassword) {
            res.status(400).json({ error: "No se proporcionaron datos para actualizar" });
            return;
        }

        try {
            // 1. Llamamos al servicio pasando el usuario actual y los nuevos datos
            // El servicio debe encargarse de actualizar solo lo que no sea undefined
            await this.loginService.updateUserProfile(currentUsername, {
                username: newUsername || undefined,
                password: newPassword || undefined
            });

            // 2. Si el cambio fue exitoso, destruimos la sesión
            req.session.destroy((err) => {
                if (err) {
                    console.error("Error al destruir sesión:", err);
                    res.status(500).json({ error: "Perfil actualizado pero hubo un error al cerrar sesión" });
                } else {
                    res.clearCookie('connect.sid');
                    res.status(200).json({
                        message: "Perfil actualizado con éxito. Por favor, reingrese al sistema."
                    });
                }
            });

        } catch (error: any) {
            console.error("Error en actualizarPerfil:", error);
            res.status(500).json({ error: error.message || "Error interno del servidor" });
        }
    }
    getCurrentUser(req: Request, res: Response): void {
        res.status(200).json({ user: req.session.user });
    }
}