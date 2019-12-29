import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Vehiculo } from '../../models/vehiculo.model';
import { Cacheable } from 'ngx-cacheable';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {

  url = `${HOST}/empresas/`;
  url2 = `${HOST}/empresas/vehiculos/`;


  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'})
  };

  constructor(private http: HttpClient) { }

  @Cacheable({
    maxCacheCount: 10,
    maxAge: 5 * 60000,
  })
  listarTodosLosVehiculosPorEmpresa(idEmpresa: number) {
    return this.http.get<Vehiculo[]>(this.url + 'vehiculos').pipe();
  }

  registrarVehiculo(vehiculo: Vehiculo) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post<any>(this.url2, vehiculo, this.httpOptions);
  }

  actualizarVehiculo(vehiculo: Vehiculo) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.put<any>(this.url2 + '/' + vehiculo.id, vehiculo, this.httpOptions);
  }

}
