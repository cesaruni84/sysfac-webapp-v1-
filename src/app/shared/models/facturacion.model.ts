import { UnidadMedida } from './unidad_medida.model';
import { TipoIGV, TipoItem } from './tipos_facturacion';

export class FacturaDocumento {
}


export interface FacturaItem {
    id: number;
    tipo: TipoItem;
    codigo: string;
    descripcion: string;
    cantidad: number;
    unidadMedida: UnidadMedida;
    tarifa: number;
    descuentos: number;
    subtotal: number;
    tipoIGV: TipoIGV;
    valorIGV: number;
    total: number;
}
