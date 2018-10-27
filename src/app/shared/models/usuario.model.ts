import { Empresa } from './empresa.model';

export class Usuario {

    id: number;
    codigo: string;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    cargo: string;
    fechaAlta: string;
    empresa: Empresa;

    constructor () {

    }

}