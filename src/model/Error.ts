export class ErrorRanelagh {
    private id: number | null;
    private refDocumento: string;
    private responsable: string;
    private emitidoPor: string;
    private detectadoPor: string;
    private puestoResponsable: string;
    private sectorResponsable: string;
    private comentarioError: string;
    private fechaRegistro: string;
    private fechaResolucion: string;
    private comparado: boolean;

    constructor(
        refDocumento: string,
        responsable: string,
        detectadoPor: string,
        emitidoPor: string,
        puestoResponsable: string,
        sectorResponsable: string,
        comentarioError: string,
        fechaRegistro: string,
        fechaResolucion: string,
        id?: number,
        comparado?: boolean
    ) {
        this.id = id ?? null;
        this.refDocumento = refDocumento;
        this.responsable = responsable;
        this.emitidoPor = emitidoPor;
        this.detectadoPor = detectadoPor;
        this.puestoResponsable = puestoResponsable;
        this.sectorResponsable = sectorResponsable;
        this.comentarioError = comentarioError;
        this.fechaRegistro = fechaRegistro;
        this.fechaResolucion = fechaResolucion;
        this.comparado = comparado ?? false;
    }

    public getId(): number | null {
        return this.id;
    }
    public setId(id: number): void {
        this.id = id;
    }

    public getRefDocumento(): string {
        return this.refDocumento;
    }
    public setRefDocumento(refDocumento: string): void {
        this.refDocumento = refDocumento;
    }

    public getEmitidoPor(): string {
        return this.emitidoPor;
    }
    public setEmitidoPor(emitidoPor: string): void {
        this.emitidoPor = emitidoPor;
    }

    public getResponsable(): string {
        return this.responsable;
    }
    public setResponsable(responsable: string): void {
        this.responsable = responsable;
    }

    public getDetectadoPor(): string {
        return this.detectadoPor;
    }
    public setDetectadoPor(detectadoPor: string): void {
        this.detectadoPor = detectadoPor;
    }

    public getPuestoResponsable(): string {
        return this.puestoResponsable;
    }
    public setPuestoResponsable(puestoResponsable: string): void {
        this.puestoResponsable = puestoResponsable;
    }

    public getSectorResponsable(): string {
        return this.sectorResponsable;
    }
    public setSectorResponsable(sectorResponsable: string): void {
        this.sectorResponsable = sectorResponsable;
    }

    public getComentarioError(): string {
        return this.comentarioError;
    }
    public setComentarioError(comentarioError: string): void {
        this.comentarioError = comentarioError;
    }

    public getFechaRegistro(): string {
        return this.fechaRegistro;
    }
    public setFechaRegistro(fechaRegistro: string): void {
        this.fechaRegistro = fechaRegistro;
    }

    public getFechaResolucion(): string {
        return this.fechaResolucion;
    }
    public setFechaResolucion(fechaResolucion: string): void {
        this.fechaResolucion = fechaResolucion;
    }

    public getComparado(): boolean {
        return this.comparado;
    }
    public setComparado(comparado: boolean): void {
        this.comparado = comparado;
    }

    public toString(): string {
        return `Error {
  id: ${this.id},
  refDocumento: ${this.refDocumento},
  responsable: ${this.responsable},
  detectadoPor: ${this.detectadoPor},
  puestoResponsable: ${this.puestoResponsable},
  sectorResponsable: ${this.sectorResponsable},
  comentarioError: ${this.comentarioError},
  fechaRegistro: ${this.fechaRegistro},
  fechaResolucion: ${this.fechaResolucion},
  comparado: ${this.comparado}
}`;
    }

    public toJson(): object {
        return {
            id: this.id,
            refDocumento: this.refDocumento,
            responsable: this.responsable,
            detectadoPor: this.detectadoPor,
            puestoResponsable: this.puestoResponsable,
            sectorResponsable: this.sectorResponsable,
            comentarioError: this.comentarioError,
            fechaRegistro: this.fechaRegistro,
            fechaResolucion: this.fechaResolucion,
            comparado: this.comparado

        };
    }
}
