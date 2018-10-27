export class Producto {
    id: number;
    nemonico: string;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    fechaIngreso: string;
    fechaActualizacion: string;
    categoria: {
        id: number;
        nombre: string;
    };

    constructor () {

    }
}
