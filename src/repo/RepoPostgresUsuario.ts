import { Usuario } from "../model/Usuario.js";
import { Personal } from "../model/Personal.js";
import { IRepoBase } from "./IRepoBase.js";
import db from "../db_config.js";
import bcrypt from "bcrypt";

export class RepoPostgresUsuario implements IRepoBase<Usuario> {
    private pool = db.getConexion();

    constructor() {
    }

    async get(id: number): Promise<Usuario | null> {
        const res = await this.pool.query(
            "SELECT u.id, u.username, u.password, p.id as personal_id, p.nombre, p.puesto, p.sector FROM usuarios u JOIN personal p ON u.personal_id = p.id WHERE u.id = $1",
            [id]
        );
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        const personal = new Personal(row.personal_id, row.nombre, row.puesto, row.sector);
        return new Usuario(row.id, row.username, row.password, personal);
    }

    /**
     * async getAll(): Promise<Usuario[]> {
        const res = await this.pool.query(
            "SELECT u.id, u.username, u.password, p.id as personal_id, p.nombre, p.puesto, p.sector FROM usuarios u JOIN personal p ON u.personal_id = p.id ORDER BY u.id ASC"
        );
        return res.rows.map(row => {
            const personal = new Personal(row.personal_id, row.nombre, row.puesto, row.sector);
            return new Usuario(row.id, row.username, row.password, personal);
        });
    }
*/
    async create(item: Usuario): Promise<Usuario> {
        const hashedPassword = await bcrypt.hash(item.getPassword(), 10);
        const res = await this.pool.query(
            "INSERT INTO usuarios (username, password, personal_id) VALUES ($1, $2, $3) RETURNING id",
            [item.getUsername(), hashedPassword, item.getPersonal().getId()]
        );
        const newId = res.rows[0].id;
        return new Usuario(newId, item.getUsername(), hashedPassword, item.getPersonal());
    }

    async update(item: Usuario): Promise<Usuario> {
        const hashedPassword = await bcrypt.hash(item.getPassword(), 10);
        const res = await this.pool.query(
            "UPDATE usuarios SET username = $1, password = $2, personal_id = $3 WHERE id = $4 RETURNING id",
            [item.getUsername(), hashedPassword, item.getPersonal().getId(), item.getId()]
        );
        if (res.rows.length === 0) throw new Error("Usuario not found");
        return new Usuario(item.getId(), item.getUsername(), hashedPassword, item.getPersonal());
    }

    async delete(id: number): Promise<void> {
        await this.pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
    }

    async findByUsername(username: string): Promise<Usuario | null> {
        const res = await this.pool.query(
            "SELECT u.id, u.username, u.password, p.id as personal_id, p.nombre, p.puesto, p.sector FROM usuarios u JOIN personal p ON u.personal_id = p.id WHERE u.username = $1",
            [username]
        );
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        const personal = new Personal(row.personal_id, row.nombre, row.puesto, row.sector);
        return new Usuario(row.id, row.username, row.password, personal);
    }

    async authenticate(username: string, password: string): Promise<Usuario | null> {
        const user = await this.findByUsername(username);
        if (!user) return null;
        const isValid = await bcrypt.compare(password, user.getPassword());
        return isValid ? user : null;
    }
}