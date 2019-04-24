import { Injectable } from '@angular/core';
import { HOST } from '../helpers/var.constant';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { TarifaRuta } from '../models/tarifa-ruta.model';

@Injectable({
  providedIn: 'root'
})
export class TarifaRutaService {
  url = `${HOST}/empresas/`;


  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'})
  };

  constructor(private http: HttpClient) { }

  listarTodasLasTarifasPorEmpresa(idEmpresa: number) {
    return this.http.get<[TarifaRuta]>(this.url + idEmpresa + '/tarifas');
  }

  registrarTarifa(tarifaRuta: TarifaRuta) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post<any>(this.url + tarifaRuta.empresa.id + '/tarifas', tarifaRuta, this.httpOptions);
  }

  actualizarTarifa(tarifaRuta: TarifaRuta) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.put<any>(this.url + tarifaRuta.empresa.id + '/tarifas/' + tarifaRuta.id, tarifaRuta, this.httpOptions);
  }
}
