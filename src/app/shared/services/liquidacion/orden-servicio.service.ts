import { OrdenServicio } from '../../models/orden-servicio';
import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { GuiaRemision } from '../../models/guia_remision.model';

@Injectable({
  providedIn: 'root'
})
export class OrdenServicioService {

  url = `${HOST}/empresas/`;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'})
  };

  constructor(private http: HttpClient) { }


  registrarOrdenServicioBD(ordenServicio: OrdenServicio, idEmpresa: number) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post<any>(this.url + idEmpresa + '/ordenes-servicio' , ordenServicio, this.httpOptions);
  }

  actualizarLiquidacionBD(ordenServicio: OrdenServicio, idEmpresa: number) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.put<any>(this.url + idEmpresa + '/orden-servicio/' + ordenServicio.id, ordenServicio, this.httpOptions);
  }

  obtenerOrdenServicioPorNroDoc(idEmpresa: number, nroOrden: string) {
    const params = new HttpParams().set('nroOrden', nroOrden);
    return this.http.get<OrdenServicio>(this.url + idEmpresa + '/ordenes-servicio/SRV1', {params: params});
  }

  listarGuiasPorOrdenServicio(idEmpresa: number, nroOrden: string) {
    const params = new HttpParams().set('nroOrdenServicio', nroOrden);
    return this.http.get<GuiaRemision[]>(this.url + idEmpresa + '/ordenes-servicio/SRV2', {params: params});
  }

  listarOrdenesServicioPorFiltro(idEmpresa: number,
                                nroOrden: string,
                                idEstado: number,
                                conFactura: number,
                                 fechaIni: string,
                                 fechaFin: string) {
    const params = new HttpParams().set('nroOrden', nroOrden.toString())
                                    .set('estado', idEstado.toString())
                                    .set('facturado', conFactura.toString())
                                    .set('fechaIni', fechaIni.toString())
                                    .set('fechaFin', fechaFin.toString());

    return this.http.get<OrdenServicio[]>(this.url + idEmpresa + '/orden-servicio/SRV0', { params: params });
  }
}
