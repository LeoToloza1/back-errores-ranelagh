import { Personal } from "../model/Personal.js";
import { RepoPostgresPersonal } from "../repo/RepoPostgresPersonal.js";
export class PersonalService {
    constructor(private repo: RepoPostgresPersonal) { }

    /**
     * Obtener la lista de personal de la base de datos.
     * @returns {Promise<Personal[]>} Una promesa que devuelve la lista de personal.
     * @throws {Error} Si hay un error al obtener la lista de personal.
     */
    async obtenerTodos(): Promise<Personal[]> {
        try {
            return this.repo.getAll();

        } catch (error) {
            console.error("Error al obtener personal:", error);
            throw new Error("no hay personal cargado o hubo un error");
        }
    }

    /**
     * Obtener un personal por su ID.
     * @param {number} id - El ID del personal a obtener.
     * @returns {Promise<Personal | null>} Una promesa que devuelve el personal con el ID especificado o null si no se encuentra.
     * @throws {Error} Si hay un error al obtener el personal.
     */
    async obtenerPorId(id: number): Promise<Personal | null> {
        try {
            return this.repo.get(id);
        } catch (error) {
            console.error("Error al obtener personal:", error);
            throw new Error("no hay personal cargado o hubo un error");
        }
    }

    guardar(personal: Personal): Promise<Personal> {
        return this.repo.create(personal);
    }

    async actualizar(id: number, personal: Personal): Promise<Personal> {
        try {
            const personal = await this.obtenerPorId(id);
            if (!personal) {
                throw new Error("Personal no encontrado");
            }
            personal.setNombre(personal.getNombre());
            personal.setPuesto(personal.getPuesto());
            personal.setSector(personal.getSector());
            return this.repo.update(personal);
        } catch (error) {
            console.error("Error al actualizar personal:", error);
            throw new Error("no hay personal cargado o hubo un error");
        }
    }

    async eliminar(id: number): Promise<void> {
        try {
            const personal = await this.obtenerPorId(id);
            if (!personal) {
                throw new Error("Personal no encontrado");
            }
            await this.repo.delete(id);
        } catch (error) {
            console.error("Error al eliminar personal:", error);
            throw new Error("no hay personal cargado o hubo un error");
        }
    }

    async buscarPorSector(sector: string): Promise<Personal[]> {
        try {
            return this.repo.buscarPorSector(sector);
        } catch (error) {
            console.error("Error al buscar personal por sector:", error);
            throw new Error("no hay personal cargado o hubo un error");
        }
    }

    async buscarPorPuesto(puesto: string): Promise<Personal[]> {
        try {
            return this.repo.buscarPorPuesto(puesto);
        } catch (error) {
            console.error("Error al buscar personal por puesto:", error);
            throw new Error("no hay personal cargado o hubo un error");
        }
    }

    async buscarPorNombre(nombre: string): Promise<Personal[]> {
        try {
            return this.repo.buscarPorNombre(nombre);
        } catch (error) {
            console.error("Error al buscar personal por nombre:", error);
            throw new Error("no hay personal cargado o hubo un error");
        }
    }

    async buscar(termino: string): Promise<Personal[]> {
        try {
            return this.repo.buscarPorTipeo(termino);
        } catch (error) {
            console.error("Error al buscar personal por tipeo:", error);
            throw new Error("no hay personal cargado o hubo un error");
        }
    }

}
