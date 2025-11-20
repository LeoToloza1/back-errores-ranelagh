import { ErrorRanelagh } from "../model/Error.js";
import { IRepoBase } from "./IRepoBase.js";
import db from "../db_config.js";
import dotenv from "dotenv";
dotenv.config();


export class RepoPostrgresError implements IRepoBase<ErrorRanelagh> {
    private pool = db.getConexion();

    /**
     * Verifica si la conexión a la base de datos es exitosa.
     *
     * Realiza un query simple que no carga la base de datos y devuelve true
     * si se puede conectar o false si falla la conexión. Si falla, se
     * imprime un mensaje de error con la causa del fallo.
     *
     * @returns true si la conexión es exitosa, false en caso contrario
     */
    async checkHealth(): Promise<boolean> {
        try {
            await this.pool.query('SELECT 1');
            return true;
        } catch (error) {
            console.error("La base de datos no está disponible:", error);
            return false;
        }
    }


    async get(id: number): Promise<ErrorRanelagh | null> {
        const res = await this.pool.query('SELECT * FROM errores WHERE id = $1', [id]);
        if (res.rows.length === 0) return null;
        return this.mapRowToError(res.rows[0]);
    }

    async getAll(): Promise<ErrorRanelagh[]> {
        const res = await this.pool.query('SELECT * FROM errores');
        return res.rows.map((row: any) => this.mapRowToError(row));
    }

    async create(item: ErrorRanelagh): Promise<ErrorRanelagh> {
        const res = await this.pool.query(
            `INSERT INTO errores (
            refdocumento, responsable, detectadopor, puestoresponsable, sectorresponsable, comentarioerror, fecharegistro, fecharesolucion,emitidopor
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *`,
            [
                item.getRefDocumento(),
                item.getResponsable(),
                item.getDetectadoPor(),
                item.getPuestoResponsable(),
                item.getSectorResponsable(),
                item.getComentarioError(),
                item.getFechaRegistro(),
                item.getFechaResolucion(),
                item.getEmitidoPor()
            ]
        );
        return this.mapRowToError(res.rows[0]);
    }

    async update(item: ErrorRanelagh): Promise<ErrorRanelagh> {
        const res = await this.pool.query(
            `UPDATE errores SET
                refDocumento = $1,
                responsable = $2,
                detectadoPor = $3,
                puestoResponsable = $4,
                sectorResponsable = $5,
                comentarioError = $6,
                fechaRegistro = $7,
                fechaResolucion = $8,
                emitidoPor = $9
            WHERE id = $10 RETURNING *`,
            [
                item.getRefDocumento(),
                item.getResponsable(),
                item.getDetectadoPor(),
                item.getPuestoResponsable(),
                item.getSectorResponsable(),
                item.getComentarioError(),
                item.getFechaRegistro(),
                item.getFechaResolucion(),
                item.getEmitidoPor(),
                item.getId()
            ]
        );
        if (res.rows.length === 0) throw new Error('Error not found');
        return this.mapRowToError(res.rows[0]);
    }

    async delete(id: number): Promise<void> {
        await this.pool.query('DELETE FROM errores WHERE id = $1', [id]);
    }


    private mapRowToError(row: any): ErrorRanelagh {
        return new ErrorRanelagh(
            row.refdocumento,
            row.responsable,
            row.detectadopor,
            row.puestoresponsable,
            row.sectorresponsable,
            row.comentarioerror,
            row.fecharegistro,
            row.fecharesolucion,
            row.emitidopor,
            row.id
        );
    }
}