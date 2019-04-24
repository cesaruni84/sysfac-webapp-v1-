import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Factoria } from '../../models/factoria.model';

@Injectable({
  providedIn: 'root'
})
export class FactoriaService {

  url = `${HOST}/clientes/factorias/SRV1`;
  url2 = `${HOST}/clientes/factorias/`;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'})
  };

  constructor(private http: HttpClient) { }


  listarComboFactorias( tipoFactoria: string) {
    return this.http.get<Factoria[]>(this.url2);
  }

  listarTodasLasFactorias( tipoFactoria: string) {
    return this.http.get<Factoria[]>(this.url2);
  }

  listarComboFactoriasPorTipo( tipoFactoria: string) {
    const params = new HttpParams().set('tipoFactoria', tipoFactoria);
    return this.http.get<Factoria[]>(this.url, {params: params});
  }

  registrarFactoria(factoria: Factoria) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post<any>(this.url2, factoria, this.httpOptions);
  }

  actualizarFactoria(factoria: Factoria) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.put<any>(this.url2 + '/' + factoria.id, factoria, this.httpOptions);
  }

}
