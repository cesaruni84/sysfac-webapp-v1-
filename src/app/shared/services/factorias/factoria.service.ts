import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Factoria } from '../../models/factoria.model';

@Injectable({
  providedIn: 'root'
})
export class FactoriaService {

  url = `${HOST}/clientes/factorias/SRV1`;
  url2 = `${HOST}/clientes/factorias/`;

  constructor(private http: HttpClient) { }


  listarComboFactorias( tipoFactoria: string) {
    return this.http.get<Factoria[]>(this.url2);
  }

  listarComboFactoriasPorTipo( tipoFactoria: string) {
    const params = new HttpParams().set('tipoFactoria', tipoFactoria);
    return this.http.get<Factoria[]>(this.url, {params: params});
  }
}
