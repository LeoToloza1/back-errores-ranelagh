export class Personal {
    private id: number = 0;
    private nombre: string = '';
    private puesto: string = '';
    private sector: string = '';

    constructor(id: number, nombre: string, puesto: string, sector: string) {
        this.id = id;
        this.nombre = nombre;
        this.puesto = puesto;
        this.sector = sector;
    }

    public getId(): number {
        return this.id;
    }

    public getNombre(): string {
        return this.nombre;
    }

    public getPuesto(): string {
        return this.puesto;
    }

    public getSector(): string {
        return this.sector;
    }

    public setId(id: number): void {
        this.id = id;
    }

    public setNombre(nombre: string): void {
        this.nombre = nombre;
    }

    public setPuesto(puesto: string): void {
        this.puesto = puesto;
    }

    public setSector(sector: string): void {
        this.sector = sector;
    }

    toString(): string {
        return `ID: ${this.id}, Nombre: ${this.nombre}, Puesto: ${this.puesto}, Sector: ${this.sector}`;
    }
    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            puesto: this.puesto,
            sector: this.sector
        }
    }
}