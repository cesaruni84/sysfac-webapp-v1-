import { Producto } from './producto.model';
import { UnidadMedida } from './unidad_medida.model';
export class GuiaDetalle {
    cantidad: number;
    peso: number;
    producto: Producto;
    unidadMedida: UnidadMedida;


    constructor () {

    }
}
