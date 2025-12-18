import { Request, Response } from "express";
import { RepoPostgresUsuario } from "../repo/RepoPostgresUsuario.js";
import { Usuario } from "../model/Usuario.js";

declare module 'express-session' {
    interface SessionData {
        user?: Usuario;
    }
}

export class LoginController {
    private repoUsuario: RepoPostgresUsuario;

    constructor(repoUsuario: RepoPostgresUsuario) {
        this.repoUsuario = repoUsuario;
    }

    async login(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ error: "Username and password are required" });
            return;
        }

        try {
            const user = await this.repoUsuario.authenticate(username, password);
            if (user) {
                req.session.user = user;
                res.status(200).json({ message: "Login successful", user: user.toJSON() });
            } else {
                res.status(401).json({ error: "Invalid credentials" });
            }
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async logout(req: Request, res: Response): Promise<void> {
        req.session.destroy((err) => {
            if (err) {
                console.error("Logout error:", err);
                res.status(500).json({ error: "Logout failed" });
            } else {
                res.status(200).json({ message: "Logout successful" });
            }
        });
    }

    getCurrentUser(req: Request, res: Response): void {
        if (req.session.user) {
            res.status(200).json({ user: req.session.user.toJSON() });
        } else {
            res.status(401).json({ error: "Not authenticated" });
        }
    }
}
