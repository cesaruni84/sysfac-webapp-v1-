import { Vehiculo } from './vehiculo.model';
import { Empresa } from './empresa.model';

export class Chofer {
    id: number;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    dni: string;
    fechaRegistro: string;
    fechaActualiza: string;
    certificado?: any;
    licencia?: any;
    empresa: Empresa;
    vehiculo: Vehiculo;

    constructor () {

    }
}
