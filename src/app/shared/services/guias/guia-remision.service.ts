import { GuiaRemision } from './../../models/guia_remision.model';
import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GrillaGuiaRemision } from '../../models/guia_remision.model';


@Injectable({
  providedIn: 'root'
})
export class GuiaRemisionService {

  url = `${HOST}/empresas/`;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'})
  };

  constructor(private http: HttpClient) { }


  listarGrillaGuias(idEmpresa: number) {
    return this.http.get<GrillaGuiaRemision[]>(this.url + idEmpresa + '/guias/SRV1');
  }


  registrarGuiaRemisionBD(guiaRemision: GuiaRemision) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post<any>(this.url, guiaRemision, this.httpOptions);
  }


}