import { Balanza } from './balanza.model';
import { Empresa } from './empresa.model';
import { Chofer } from './chofer.model';
import { Factoria } from './factoria.model';
import { GuiaDetalle } from './guia_remision_detalle.model';

export class GuiaRemision {
    id: number;
    serie: string;
    secuencia: string;
    totalCantidad: number;
    totalPeso: number;
    estado: number;
    motivoTraslado: number;
    tarifa: number;
    subTotal: number;
    fechaRemision: Date;
    fechaTraslado: Date;
    fechaRecepcion: Date;
    ticketBalanza: string;
    serieCliente: string;
    secuenciaCliente: string;
    fechaRegistro: Date;
    fechaActualiza: Date;
    usuarioRegistro: string;
    usuarioActualiza: string;
    placaTracto: string;
    placaBombona: string;
    guiaDetalle: GuiaDetalle[];
    balanza: Balanza;
    remitente: Factoria;
    destinatario: Factoria;
    liquidacion: any;
    empresa: Empresa;
    chofer: Chofer;
    idOrigen: string;
    idDestino: string;

    constructor () {

    }



}

export interface GrillaGuiaRemision {
    id: number;
    nroguia: string;
    nroSecuencia: string;
    fechaEmision: string;
    usuarioRegistra: string;
    nroLiq: string;
    ordenServicio: string;
    remitente: string;
    destinatario: string;
    estado: string;
    producto: string;
    cantidad: string;
    chofer: string;
    nroGuiaCliente: string;
    fechaRecepcion: string;
}

export class GuiasRemisionPDF {
    id: number;
    fechaTraslado: string;
    guiaRemision: string;
    guiaCliente: string;
    descripcion: string;
    ticketBalanza: string;
    unidadMedida: string;
    cantidad: string;
    tarifa: string;
    subTotal: string;

    constructor () {

    }
}
