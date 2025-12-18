import * as bcrypt from "bcrypt";

export class AuthService {
    private readonly SALT_ROUNDS = 10;

    /**
     * Convierte una contraseña en texto plano a un hash seguro.
     */
    async hashearPass(password: string): Promise<string> {
        return await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    /**
     * Compara una contraseña ingresada con el hash guardado en la base de datos.
     */
    async compararPass(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }
}