import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { TipoDocumento, TipoOperacion, FormaPago, Moneda, TipoIGV } from '../../models/tipos_facturacion';
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

}
