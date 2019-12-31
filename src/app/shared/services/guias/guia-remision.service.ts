import { GuiaRemision } from '../../models/guia_remision.model';
import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { GrillaGuiaRemision } from '../../models/guia_remision.model';
import { Cacheable } from 'ngx-cacheable';


@Injectable({
  providedIn: 'root'
})
export class GuiaRemisionService {

  url = `${HOST}/empresas/`;
  url2 = `${HOST}/guias`;
  url3 = `${HOST}/liquidaciones`;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'})
  };

  constructor(private http: HttpClient) { }

  @Cacheable({
    maxCacheCount: 10,
    // maxAge: 2 * 60000,
  })
  listarGrillaGuias(idEmpresa: number) {
    return this.http.get<GrillaGuiaRemision[]>(this.url + idEmpresa + '/guias/SRV1').pipe(
    );
  }

  listarGuiasConFiltros(idEmpresa: number,
                        nroSerie: string , nroSecuencia: string,
                        idEstado: number, idChofer: number, idDestino: number,
                        fechaIni: string, fechaFin: string) {
    const params = new HttpParams().set('nroSerie', nroSerie)
                                    .set('nroSecuencia', nroSecuencia)
                                    .set('chofer', idChofer.toString())
                                    .set('destino', idDestino.toString())
                                    .set('estado', idEstado.toString())
                                    .set('fechaIni', fechaIni.toString())
                                    .set('fechaFin', fechaFin.toString());

    return this.http.get<GuiaRemision[]>(this.url + idEmpresa + '/guias/SRV2', { params: params });
  }

  @Cacheable({
    maxCacheCount: 10,
  })
  listarGuiasConFiltros2(idEmpresa: number,
    nroSerie: string , nroSecuencia: string,
    idEstado: number, idChofer: number, idDestino: number,
    fechaIni: string, fechaFin: string) {
    const params = new HttpParams().set('nroSerie', nroSerie)
                .set('nroSecuencia', nroSecuencia)
                .set('chofer', idChofer.toString())
                .set('destino', idDestino.toString())
                .set('estado', idEstado.toString())
                .set('fechaIni', fechaIni.toString())
                .set('fechaFin', fechaFin.toString());

    return this.http.get<GuiaRemision[]>(this.url + idEmpresa + '/guias/SRV2', { params: params }).pipe();
  }



  obtenerGuiaRemision(idEmpresa: number) {
    return this.http.get<GrillaGuiaRemision[]>(this.url + idEmpresa + '/guias/SRV3');
  }

  registrarGuiaRemisionBD(guiaRemision: GuiaRemision) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post<any>(this.url2, guiaRemision, this.httpOptions);
  }

  actualizarGuiaRemisionBD(guiaRemision: GuiaRemision) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.put<any>(this.url2 + '/' + guiaRemision.id, guiaRemision, this.httpOptions);
  }

  actualizarGuiaRemisionLiquidacion(guiaRemision: GuiaRemision, idLiquidacion: number) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.put<any>(this.url3 + '/' + idLiquidacion + '/guias/'+ guiaRemision.id , guiaRemision, this.httpOptions);
  }
  obtenerGuiaRemisionxNroGuia(idEmpresa: number, nroSerie: string , nroSecuencia: string ) {
    const params = new HttpParams().set('nroSerie', nroSerie).set('nroSecuencia', nroSecuencia);
    return this.http.get<GuiaRemision>(this.url + idEmpresa + '/guias/SRV3', {params: params});
  }


  listarGuiasRemisionPorLiquidar(idEmpresa: number, idOrigen: number, idDestino: number, fechaIni: string, fechaFin: string) {
    const params = new HttpParams().set('origen', idOrigen.toString())
                                    .set('destino', idDestino.toString())
                                    .set('fechaIni', fechaIni.toString())
                                    .set('fechaFin', fechaFin.toString());

    return this.http.get<GuiaRemision[]>(this.url + idEmpresa + '/guias/SRV0', { params: params });
  }


  listarGuiasRemisionPorFacturar(idEmpresa: number, idOrigen: number, idDestino: number, fechaIni: string, fechaFin: string) {
    const params = new HttpParams().set('origen', idOrigen.toString())
                                    .set('destino', idDestino.toString())
                                    .set('fechaIni', fechaIni.toString())
                                    .set('fechaFin', fechaFin.toString());

    return this.http.get<GuiaRemision[]>(this.url + idEmpresa + '/guias/SRV4', { params: params });
  }

}
