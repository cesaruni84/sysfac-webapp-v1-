import { Impuesto } from './../../models/impuesto.model';
import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ImpuestoService {

  url = `${HOST}/impuestos`;

  constructor(private http: HttpClient) { }

  listarImpuestosSistema() {
    return this.http.get<Impuesto[]>(this.url);
  }

  obtenerValorImpuesto(idImpuesto: number) {
    // 1 - IGV , 2 - ISC
    return this.http.get<Impuesto>(this.url + '/' + idImpuesto );
  }
}
