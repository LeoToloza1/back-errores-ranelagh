import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Personal } from "../model/Personal.js";
import { IRepoBase } from "./IRepoBase.js";


export class JsonRepositorio implements IRepoBase<Personal> {
    private rutaArchivo: string;

    constructor(rutaRelativa: string) {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        this.rutaArchivo = path.join(__dirname, "..", rutaRelativa);
    }

    private async leerArchivo(): Promise<Personal[]> {
        try {
            const datos = await fs.readFile(this.rutaArchivo, "utf-8");
            const objeto = JSON.parse(datos)
            const arreglo = objeto.personal ?? [];
            return arreglo.map((p: any) => new Personal(p.id, p.nombre, p.puesto, p.sector));
        } catch {
            return [];
        }
    }

    private async escribirArchivo(data: Personal[]): Promise<void> {
        const objeto = { personal: data };
        await fs.writeFile(this.rutaArchivo, JSON.stringify(objeto, null, 2), "utf-8");
    }

    async get(id: number): Promise<Personal | null> {
        const lista = await this.leerArchivo();
        return lista.find(p => p.getId() === id) ?? null;
    }

    async getAll(): Promise<Personal[]> {
        return await this.leerArchivo();
    }

    async create(item: Personal): Promise<Personal> {
        const lista = await this.leerArchivo();
        const nuevoId = lista.length > 0 ? Math.max(...lista.map(p => p.getId())) + 1 : 1;

        const nuevo = new Personal(nuevoId, item.getNombre(), item.getPuesto(), item.getSector());
        lista.push(nuevo);
        await this.escribirArchivo(lista);
        return nuevo;
    }

    async update(item: Personal): Promise<Personal> {
        const lista = await this.leerArchivo();
        const index = lista.findIndex(p => p.getId() === item.getId());
        if (index === -1) throw new Error(`No se encontró persona con id ${item.getId()}`);
        lista[index] = item;
        await this.escribirArchivo(lista);
        return item;
    }

    async delete(id: number): Promise<void> {
        const lista = await this.leerArchivo();
        const nuevaLista = lista.filter(p => p.getId() !== id);
        await this.escribirArchivo(nuevaLista);
    }
}