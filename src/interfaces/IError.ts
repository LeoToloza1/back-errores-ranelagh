export interface IError {
    id: number | null;
    refDocumento: string;
    responsable: string;
    detectadoPor: string;
    puestoResponsable: string;
    sectorResponsable: string;
    comentarioError: string;
    fechaRegistro: string;
    fechaResolucion: string;
    emitidoPor: string;
    comparado: boolean
}