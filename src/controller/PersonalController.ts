import { Personal } from "../model/Personal.js";
import { PersonalService } from "../services/PersonalService.js";

export class PersonalController {

    constructor(private _service: PersonalService) { }

    public async ObtenerTodos(): Promise<Personal[]> {
        return this._service.obtenerTodos();
    }

    public async ObtenerPorId(id: number): Promise<Personal | null> {
        return this._service.obtenerPorId(id);
    }

    public async Guardar(personal: Personal): Promise<Personal> {
        return this._service.guardar(personal);
    }

    public async Actualizar(id: number, personal: Personal): Promise<Personal> {
        return this._service.actualizar(id, personal);
    }

    public async Eliminar(id: number): Promise<void> {
        return this._service.eliminar(id);
    }
    public async Buscar(filtros: any): Promise<Personal[]> {
        const { nombre, puesto, sector, q } = filtros;
        if (nombre) return this._service.buscarPorNombre(nombre);
        if (puesto) return this._service.buscarPorPuesto(puesto);
        if (sector) return this._service.buscarPorSector(sector);
        return this._service.buscar(q || "");
    }
} 