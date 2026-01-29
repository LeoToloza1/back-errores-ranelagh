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

    async getAllByName(name: string): Promise<ErrorRanelagh[]> {
        const query = `SELECT * FROM errores WHERE emitidopor ILIKE $1;`;
        const values = [`%${name}%`];
        const res = await this.pool.query(query, values);
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

    /**
         * Búsqueda global por texto (ILIKE)
         */
    async buscar(termino: string): Promise<ErrorRanelagh[]> {
        const query = `
            SELECT * FROM errores 
            WHERE responsable ILIKE $1 
               OR comentarioerror ILIKE $1 
               OR refdocumento ILIKE $1
            ORDER BY id DESC`;
        const res = await this.pool.query(query, [`%${termino}%`]);
        return res.rows.map(row => this.mapRowToError(row));
    }

    /**
     * Buscar errores entre dos fechas (Formato DD/MM/YYYY)
     */
    async buscarPorRangoFechas(inicio: string, fin: string): Promise<ErrorRanelagh[]> {
        const query = `
            SELECT * FROM errores 
            WHERE TO_DATE(fecharegistro, 'YYYY-MM-DD') 
            BETWEEN TO_DATE($1, 'YYYY-MM-DD') AND TO_DATE($2, 'YYYY-MM-DD')
            ORDER BY TO_DATE(fecharegistro, 'YYYY-MM-DD') DESC`;

        const res = await this.pool.query(query, [inicio, fin]);
        return res.rows.map(row => this.mapRowToError(row));
    }

    async buscarPorPatronFecha(patron: string): Promise<ErrorRanelagh[]> {
        const busqueda = patron.replace(/\//g, '-');
        const query = `
        SELECT * FROM errores 
        WHERE fecharegistro ILIKE $1 
        OR TO_CHAR(TO_DATE(fecharegistro, 'YYYY-MM-DD'), 'DD-MM-YYYY') ILIKE $1
        ORDER BY id DESC`;
        const res = await this.pool.query(query, [`%${busqueda}%`]);
        return res.rows.map(row => this.mapRowToError(row));
    }


    /**
     * Cuenta cuántos errores hubo en una fecha específica
     */
    async contarErroresPorFecha(fecha: string): Promise<number> {
        const fechaFormateada = fecha.replace(/\//g, '-');
        const query = `
        SELECT COUNT(*) 
        FROM errores 
        WHERE TO_DATE(fecharegistro, 'YYYY-MM-DD') = TO_DATE($1, 'YYYY-MM-DD')`;
        const res = await this.pool.query(query, [fechaFormateada]);
        return parseInt(res.rows[0].count);
    }
    /**
     * Estadísticas: Top Sectores con más errores
     */
    async getEstadisticasSectores(): Promise<{ sector: string, cantidad: number }[]> {
        const query = `
            SELECT sectorresponsable as sector, COUNT(*) as cantidad 
            FROM errores 
            GROUP BY sectorresponsable 
            ORDER BY cantidad DESC`;
        const res = await this.pool.query(query);
        return res.rows.map(row => ({
            sector: row.sector,
            cantidad: parseInt(row.cantidad)
        }));
    }

    /**
     * Estadísticas: Errores por Responsable (Top 5)
     */
    async getTopResponsables(): Promise<{ nombre: string, cantidad: number }[]> {
        const query = `
            SELECT responsable as nombre, COUNT(*) as cantidad 
            FROM errores 
            GROUP BY responsable 
            ORDER BY cantidad DESC 
            LIMIT 5`;
        const res = await this.pool.query(query);
        return res.rows.map(row => ({
            nombre: row.nombre,
            cantidad: parseInt(row.cantidad)
        }));
    }
    private mapRowToError(row: any): ErrorRanelagh {
        return new ErrorRanelagh({
            refDocumento: row.refdocumento,
            responsable: row.responsable,
            detectadoPor: row.detectadopor,
            puestoResponsable: row.puestoresponsable,
            sectorResponsable: row.sectorresponsable,
            comentarioError: row.comentarioerror,
            fechaRegistro: row.fecharegistro,
            fechaResolucion: row.fecharesolucion,
            emitidoPor: row.emitidopor,
            id: row.id,
            comparado: row.comparado
        });
    }
}