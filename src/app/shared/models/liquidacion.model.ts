import { GuiaRemision } from './guia_remision.model';
import { MotivoTraslado } from './motivo_traslado.model';
import { Factoria } from './factoria.model';
export class Liquidacion {
    id: number;
    tipocod: string;
    nrodoc: string;
    fechaEmision: Date;
    estado: number;
    situacion: number;
    fecIniTraslado: Date;
    fecFinTraslado: Date;
    glosa: string;
    moneda: number;
    totalCantidad: number;
    subTotalLiq: number;
    IGV: number;
    importeTotal: number;
    usuarioRegistro: string;
    usuarioActualiza: string;
    motivo: MotivoTraslado;
    origen: Factoria;
    destino: Factoria;
    guias: GuiaRemision[];

    constructor () {

    }
}

