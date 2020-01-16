import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TipoDocumento, TipoOperacion, FormaPago, Moneda, TipoIGV, TipoItem, TipoDocPersona, 
  TiposEstadosDocumento } from '../../models/tipos_facturacion';
import { TiposGenericosDB } from '../../models/tiposGenericosDB';

@Injectable({
  providedIn: 'root'
})
export class TiposGenericosService {

  public tipoDocumentoDB: Observable<TipoDocumento[]>;
  public tiposGenericos: any = new TiposGenericosDB();


  constructor() { }

  public retornarTiposDocumento(): TipoDocumento[] {
    return this.tiposGenericos.tiposDocumentoDB;
  }

  public retornarTiposOperacion(): TipoOperacion[] {
    return this.tiposGenericos.tiposOperacionDB;
  }

  public retornarFormasPago(): FormaPago[] {
    return this.tiposGenericos.formasPagoDB;
  }

  public retornarMonedas(): Moneda[] {
    return this.tiposGenericos.monedaDB;
  }

  public retornarTiposIGV(): TipoIGV[] {
    return this.tiposGenericos.tiposIgvDB;
  }

  public retornarTiposItemFactura(): TipoItem[] {
    return this.tiposGenericos.tiposItemFactura;
  }

  public retornarTiposDocPersona(): TipoDocPersona[] {
    return this.tiposGenericos.tipoDocumentoPersona;
  }
  public retornarEstadosDocumento(): TiposEstadosDocumento[] {
    return this.tiposGenericos.tiposEstadoFactura;
  }


}
