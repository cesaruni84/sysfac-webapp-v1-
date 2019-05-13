import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FacturaDocumento } from '../../models/facturacion.model';

@Injectable({
  providedIn: 'root'
})
export class ItemFacturaService {

  url = `${HOST}/empresas/`;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'})
  };

  constructor(private http: HttpClient) { }

  listarItemsParaFactura(idCodigo: number, idTipoItem: number, ) {
    return this.http.get<any[]>(this.url + idCodigo + '/clientes');
  }

  registrarDocumentoElectronico(documento: FacturaDocumento, idEmpresa: number) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post<any>(this.url + idEmpresa + '/documentos', documento, this.httpOptions);

  }

  listarDocumentosPorFiltro(idEmpresa: number,
                            serie: string,
                            secuencia: string,
                            tipoDocumento: number,
                            idCliente: number,
                            idEstado: number,
                             fechaIni: string,
                             fechaFin: string) {
    const params = new HttpParams().set('nroSerie', serie.toString())
                                      .set('nroSecuencia', secuencia.toString())
                                      .set('tipoDocumento', tipoDocumento.toString())
                                      .set('cliente', idCliente.toString())
                                      .set('estado', idEstado.toString())
                                      .set('fechaIni', fechaIni.toString())
                                      .set('fechaFin', fechaFin.toString());

    return this.http.get<FacturaDocumento[]>(this.url + idEmpresa + '/documentos/SRV2', { params: params });
}


}
