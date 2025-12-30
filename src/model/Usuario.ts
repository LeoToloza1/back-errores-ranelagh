import { Personal } from './Personal.js';
export class Usuario {
    private id: number = 0;
    private username: string;
    private password: string;
    private personal: Personal;

    /**
     * Constructor de la clase Usuario.
     * @param id Identificador del usuario.
     * @param username Nombre de usuario del usuario.
     * @param password Contraseña del usuario.
     * @param personal Informaci n del personal del usuario.
     */
    constructor(id: number, username: string, password: string, personal: Personal) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.personal = personal;
    }

    public getId(): number {
        return this.id;
    }

    public getUsername(): string {
        return this.username;
    }

    public getPassword(): string {
        return this.password;
    }

    public getPersonal(): Personal {
        return this.personal;
    }

    public setId(id: number): void {
        this.id = id;
    }

    public setUsername(username: string): void {
        this.username = username;
    }

    public setPassword(password: string): void {
        this.password = password;
    }

    public setPersonal(personal: Personal): void {
        this.personal = personal;
    }

    /**
     * Return a JSON representation of the user
     * @returns {Object} with the user's data
     */
    toJSON() {
        return {
            id: this.id,
            username: this.username,
            personal: this.personal.toJSON()
        };
    }
}