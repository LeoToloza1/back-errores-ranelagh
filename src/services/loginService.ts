export class LoginService {
    constructor(
        private readonly repo: RepoPostgresUsuario, 
        private readonly authService: AuthService
    ) {}

    async login(username: string, password: string): Promise<Usuario | null> {
        const user = await this.repo.findByUsername(username);
        if (!user) return null;

        const isValid = await this.authService.compararPass(password, user.getPassword());
        
        if (!isValid) return null;
        user.setPassword(""); 
        return user;
    }

    async cambiarPassword(id: number, oldPassword: string, newPassword: string): Promise<void> {
        const user = await this.repo.get(id);
        if (!user) throw new Error("User not found");

        const isValid = await this.authService.compararPass(oldPassword, user.getPassword());
        if (!isValid) throw new Error("Invalid old password");

        const hashedPass = await this.authService.hashearPass(newPassword);
        user.setPassword(hashedPass);
        await this.repo.actualizar(user);
    }
}