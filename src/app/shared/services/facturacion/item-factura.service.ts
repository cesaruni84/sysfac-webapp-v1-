import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ItemFacturaService {

  url = `${HOST}/empresas/`;

  constructor(private http: HttpClient) { }

  listarItemsParaFactura(idCodigo: number, idTipoItem: number, ) {
    return this.http.get<any[]>(this.url + idCodigo + '/clientes');
  }


}
