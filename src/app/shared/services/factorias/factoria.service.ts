import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Factoria } from '../../models/factoria.model';
import { Cacheable } from 'ngx-cacheable';

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

  @Cacheable({
    maxCacheCount: 10,
    maxAge: 5 * 60000,
  })
  listarComboFactorias( tipoFactoria: string) {
    return this.http.get<Factoria[]>(this.url2).pipe();
  }

  @Cacheable({
    maxCacheCount: 10,
    maxAge: 5 * 60000,
  })
  listarTodasLasFactorias( tipoFactoria: string) {
    return this.http.get<Factoria[]>(this.url2).pipe();
  }

  @Cacheable({
    maxCacheCount: 10,
    maxAge: 5 * 60000,
  })
  listarComboFactoriasPorTipo( tipoFactoria: string) {
    const params = new HttpParams().set('tipoFactoria', tipoFactoria);
    return this.http.get<Factoria[]>(this.url, {params: params}).pipe();
  }

  registrarFactoria(factoria: Factoria) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post<any>(this.url2, factoria, this.httpOptions);
  }

  actualizarFactoria(factoria: Factoria) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.put<any>(this.url2 + '/' + factoria.id, factoria, this.httpOptions);
  }

  eliminarFactoria(factoria: Factoria) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.delete<any>(this.url2 + '/' + factoria.id , this.httpOptions);
  }

}
