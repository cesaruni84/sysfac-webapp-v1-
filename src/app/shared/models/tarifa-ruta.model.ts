import { Factoria } from './factoria.model';
import { Empresa } from './empresa.model';
export class TarifaRuta {
    id: number;
    notas: string;
    importe: number;
    fechaRegistro: Date;
    fechaActualiza: Date;
    estado: number;
    moneda: number;
    origen: Factoria;
    destino: Factoria;
    empresa: Empresa;
    turno: Turno;

    constructor () {

    }
}

export class Turno {
    id: number;
    nombreturno: string;
    horainicio: string;
    horafin: string;
    constructor () {}
}
