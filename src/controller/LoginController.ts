import { Request, Response } from "express";
import { LoginService } from "../services/LoginService.js";
import { Personal } from "../model/Personal.js";

declare module 'express-session' {
    interface SessionData {
        user?: {
            id: number;
            username: string;
            personal: Personal;
        };
    }
}

export class LoginController {
   
    constructor(private readonly loginService: LoginService) {}

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
                    personal: user.getPersonal()
                };

                res.status(200).json({ 
                    message: "Login correcto", 
                    user: req.session.user 
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
        const { oldPassword, newPassword } = req.body;
        const sessionUser = req.session.user!;

        if (!oldPassword || !newPassword) {
            res.status(400).json({ error: "La contraseña antigua y la nueva son requeridas" });
            return;
        }

        try {
            await this.loginService.cambiarPassword(sessionUser.id, oldPassword, newPassword);
            res.status(200).json({ message: "Contraseña cambiada exitosamente" });
        } catch (error: any) {
            const status = error.message === "Contraseña antigua incorrecta" ? 401 : 500;
            res.status(status).json({ error: error.message });
        }
    }

    getCurrentUser(req: Request, res: Response): void {
        res.status(200).json({ user: req.session.user });
    }
}