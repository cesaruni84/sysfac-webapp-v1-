import { Chofer } from '../../models/chofer.model';
import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Cacheable } from 'ngx-cacheable';

@Injectable({
  providedIn: 'root'
})
export class ChoferService {

  url = `${HOST}/empresas/`;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'})
  };

  constructor(private http: HttpClient) { }


  // @Cacheable({
  //  maxCacheCount: 10,
  //  maxAge: 5 * 60000,
  // })
  listarComboChoferes(idEmpresa: number) {
    return this.http.get<Chofer[]>(this.url + idEmpresa + '/choferes').pipe();

  }

  // @Cacheable({
  //  maxCacheCount: 10,
  //  maxAge: 5 * 60000,
  //})
  listarTodosLosChoferes(idEmpresa: number) {
    return this.http.get<Chofer[]>(this.url + idEmpresa + '/choferes').pipe();
  }


  registrarChofer(chofer: Chofer) {
    // return this.http.post<any>(this.url + chofer.empresa.id + '/choferes', chofer, this.httpOptions);
    return this.http.post<any>(this.url + '1' + '/choferes', chofer, this.httpOptions);

  }

  actualizarChofer(chofer: Chofer) {
    // return this.http.put<any>(this.url + chofer.empresa.id + '/choferes/' + chofer.id, chofer, this.httpOptions);
    return this.http.put<any>(this.url + '1' + '/choferes/' + chofer.id, chofer, this.httpOptions);

  }
}
