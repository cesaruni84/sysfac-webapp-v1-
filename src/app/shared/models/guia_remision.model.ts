import { Balanza } from './balanza.model';
import { Empresa } from './empresa.model';
import { Chofer } from './chofer.model';
import { Factoria } from './factoria.model';
import { GuiaDetalle } from './guia_remision_detalle.model';

export class GuiaRemision {
    serie: string;
    secuencia: string;
    totalCantidad: number;
    totalPeso: number;
    motivoTraslado: number;
    tarifa: number;
    ticketBalanza: string;
    placaTracto: string;
    placaBombona: string;
    serieCliente: string;
    secuenciaCliente: string;
    usuarioRegistro: string;
    usuarioActualiza: string;
    estado: number;
    fechaRemision: string;
    fechaTraslado: string;
    fechaRecepcion: string;
    guiaDetalle: GuiaDetalle[];
    balanza: Balanza;
    remitente: Factoria;
    destinatario: Factoria;
    empresa: Empresa;
    chofer: Chofer;

    constructor () {

    }



}

export interface GrillaGuiaRemision {
    id: number;
    nroguia: string;
    fechaEmision: string;
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