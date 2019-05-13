import { GuiaRemision } from './guia_remision.model';
import { MotivoTraslado } from './motivo_traslado.model';
import { Factoria } from './factoria.model';
import { OrdenServicio } from './orden-servicio';
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
    ordenServicio: OrdenServicio;
    notas1: string;
    notas2: string;

    constructor () {

    }
}

export interface LiquidacionReportExcel {
    item: number;
    nrodoc: string;
    fechaEmision: string;
    ordenServicio: string;
    origen: string;
    destino: string;
    estado: string;
    importeTotal: number;
}

