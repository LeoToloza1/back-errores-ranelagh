import { Usuario } from "../model/Usuario.js";
import { RepoPostgresUsuario } from "../repo/RepoPostgresUsuario.js";
import { AuthService } from "./authService.js";

export class LoginService {
    constructor(
        private readonly repo: RepoPostgresUsuario,
        private readonly authService: AuthService
    ) { }

    async login(username: string, password: string): Promise<Usuario | null> {
        const user = await this.repo.findByUsername(username);
        if (!user) return null;

        const isValid = await this.authService.compararPass(password, user.getPassword());

        if (!isValid) return null;
        user.setPassword("");
        return user;
    }

    async cambiarPassword(username: string, newPassword: string): Promise<void> {
        const user = await this.repo.findByUsername(username);
        if (!user) {
            throw new Error("Usuario no encontrado");
        }
        const hashedPass = await this.authService.hashearPass(newPassword);
        user.setPassword(hashedPass);
        await this.repo.actualizar(user);
    }
}