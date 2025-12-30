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
                req.session.user = user;

                res.status(200).json({
                    message: "Login correcto",
                    user: {
                        id: user.getId(),
                        username: user.getUsername(),
                        personal: user.getPersonal(),
                    }
                });
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
        console.log("Datos recibidos:", username, newPassword);
        if (!username || !newPassword) {
            res.status(400).json({ error: "El nombre de usuario y la nueva contraseña son requeridos" });
            return;
        }

        try {
            await this.loginService.cambiarPassword(username, newPassword);
            res.status(200).json({ message: "Contraseña actualizada correctamente" });
        } catch (error: any) {
            console.error("Error al cambiar password:", error);
            const status = error.message === "Usuario no encontrado" ? 404 : 500;
            res.status(status).json({ error: error.message });
        }
    }

    getCurrentUser(req: Request, res: Response): void {
        res.status(200).json({ user: req.session.user });
    }
}