import { Personal } from "../model/Personal.js";
import { IRepoBase } from "./IRepoBase.js";
import db from "../db_config.js";


export class RepoPostgresPersonal implements IRepoBase<Personal> {
    private pool = db.getConexion();

    constructor() {
    }

    async get(id: number): Promise<Personal | null> {
        const res = await this.pool.query(
            "SELECT * FROM personal WHERE id = $1",
            [id]
        );
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        return new Personal(row.id, row.nombre, row.puesto, row.sector);
    }

    async getAll(): Promise<Personal[]> {
        const res = await this.pool.query("SELECT * FROM personal ORDER BY id ASC");
        return res.rows.map(row => new Personal(row.id, row.nombre, row.puesto, row.sector));
    }

    async create(item: Personal): Promise<Personal> {
        const res = await this.pool.query(
            "INSERT INTO personal (nombre, puesto, sector) VALUES ($1, $2, $3) RETURNING *",
            [item.getNombre(), item.getPuesto(), item.getSector()]
        );
        const row = res.rows[0];
        return new Personal(row.id, row.nombre, row.puesto, row.sector);
    }

    async update(item: Personal): Promise<Personal> {
        const res = await this.pool.query(
            "UPDATE personal SET nombre = $1, puesto = $2, sector = $3 WHERE id = $4 RETURNING *",
            [item.getNombre(), item.getPuesto(), item.getSector(), item.getId()]
        );
        if (res.rows.length === 0) throw new Error("Personal not found");
        const row = res.rows[0];
        return new Personal(row.id, row.nombre, row.puesto, row.sector);
    }

    async delete(id: number): Promise<void> {
        await this.pool.query("DELETE FROM personal WHERE id = $1", [id]);
    }
}
