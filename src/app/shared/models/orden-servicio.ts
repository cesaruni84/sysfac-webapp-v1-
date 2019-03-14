import { Cliente } from './cliente.model';
import { Empresa } from './empresa.model';
import { Liquidacion } from './liquidacion.model';
import { Moneda, FormaPago } from './tipos_facturacion';

export class OrdenServicio {
    id: number;
    tipocod: string;
    nroOrden: string;
    situacion: number;
    estado: number;
    fechaOrden: Date;
    fechaVencimiento: Date;
    fechaAprobacion: Date;
    lugarEntrega: string;
    instrucciones: string;
    glosa: string;
    subTotal: number;
    totalCantidad: number;
    descuentos: number;
    valorCompra: number;
    igvAplicado: number;
    importeTotal: number;
    usuarioRegistro: string;
    usuarioActualiza: string;
    fechaRegistro: Date;
    fechaActualiza: Date;
    formaPago: FormaPago;
    cliente: Cliente;
    empresa: Empresa;
    moneda: Moneda;
    liquidaciones: Liquidacion[];

    constructor () {

    }
}
