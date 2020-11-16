import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { HOST } from '../../helpers/var.constant';
import { Liquidacion } from '../../models/liquidacion.model';
import { Cacheable } from 'ngx-cacheable';

@Injectable({
  providedIn: 'root'
})
export class LiquidacionService {

  url = `${HOST}/empresas/`;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'})
  };

  constructor(private http: HttpClient) { }

  registrarLiquidacionBD(liquidacion: Liquidacion, idEmpresa: number) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post<any>(this.url + idEmpresa + '/liquidaciones' , liquidacion, this.httpOptions);
  }

  actualizarLiquidacionBD(liquidacion: Liquidacion, idEmpresa: number) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.put<any>(this.url + idEmpresa + '/liquidaciones/' + liquidacion.id, liquidacion, this.httpOptions);
  }

  obtenerLiquidacionPorNroDoc(idEmpresa: number, nroDocLiq: string) {
    const params = new HttpParams().set('nroDocLiq', nroDocLiq);
    return this.http.get<Liquidacion>(this.url + idEmpresa + '/liquidaciones/SRV1', {params: params});
  }

  validarLiquidacionPorNroDoc(idEmpresa: number, nroDocLiq: string) {
    const params = new HttpParams().set('nroDocLiq', nroDocLiq);
    return this.http.get<any>(this.url + idEmpresa + '/liquidaciones/SRV5', {params: params});
  }

  @Cacheable({
    maxCacheCount: 10,
    // maxAge: 60000,
  })
  listarLiquidacionesPorEmpresa(idEmpresa: number){
    return this.http.get<Liquidacion[]>(this.url + idEmpresa + '/liquidaciones');
  }

  listarLiquidacionesPorFiltro(idEmpresa: number,
                                nroDocLiq: string,
                                idOrigen: number,
                                idDestino: number,
                                idEstado: number,
                                tipoBusqueda: number,
                                 fechaIni: string,
                                 fechaFin: string) {
    const params = new HttpParams().set('nroDocLiq', nroDocLiq.toString())
                                    .set('origen', idOrigen.toString())
                                    .set('destino', idDestino.toString())
                                    .set('estado', idEstado.toString())
                                    .set('tipoBusqueda', tipoBusqueda.toString())
                                    .set('fechaIni', fechaIni.toString())
                                    .set('fechaFin', fechaFin.toString());

    return this.http.get<Liquidacion[]>(this.url + idEmpresa + '/liquidaciones/SRV0', { params: params });
  }

  eliminarLiquidacionBD(idEmpresa: number, liquidacion: any) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.delete<any>(this.url + idEmpresa + '/liquidaciones' + '/eliminar/' + liquidacion.id, this.httpOptions);

  }

}
