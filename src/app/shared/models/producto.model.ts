export class Producto {
    id: number;
    nemonico: string;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    fechaIngreso: string;
    fechaActualizacion: string;
    categoria: Categoria;
    codigo: string;

    constructor () {

    }
}


export class Categoria {
    id: number;
    nombre: string;
}
