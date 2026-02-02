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

    /**
     * Actualiza el perfil de un usuario.
     * @param {string} currentUsername - El nombre de usuario actual.
     * @param {Object} data - Un objeto con los datos a actualizar.
     * @param {string} [data.username] - El nuevo nombre de usuario.
     * @param {string} [data.password] - La nueva contraseña.
     * @throws {Error} Si el usuario no existe.
     */
    async updateUserProfile(currentUsername: string, data: { username?: string, password?: string }) {

        const user = await this.repo.findByUsername(currentUsername);
        if (!user) throw new Error("Usuario no encontrado");

        if (data.username) user.setUsername(data.username);
        if (data.password) {
            const hashed = await this.authService.hashearPass(data.password);
            user.setPassword(hashed);
        }

        await this.repo.update(user);
    }
}