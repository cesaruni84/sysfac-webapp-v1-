import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Documento } from '../../models/facturacion.model';
import { Cacheable } from 'ngx-cacheable';


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

  registrarDocumentoElectronico(documento: Documento, idEmpresa: number) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post<any>(this.url + idEmpresa + '/documentos', documento, this.httpOptions);
  }

  actualizarDocumentoElectronico(documento: Documento, idEmpresa: number) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.put<any>(this.url + idEmpresa + '/documentos/' + documento.id, documento, this.httpOptions);
  }

  anularDocumentoElectronico(documento: Documento, idEmpresa: number) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.put<any>(this.url + idEmpresa + '/documentos/' + documento.id + '/extorno', documento, this.httpOptions);
  }

  cancelarDocumentoElectronico(documento: Documento, idEmpresa: number) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.put<any>(this.url + idEmpresa + '/documentos/' + documento.id + '/cancelacion', documento, this.httpOptions);
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

    return this.http.get<Documento[]>(this.url + idEmpresa + '/documentos/SRV2', { params: params });
}

obtenerDocumentPorSerie(idEmpresa: number, tipoDocumento: number, serieDoc: string, secuenciaDoc: string) {
  const params = new HttpParams().set('tipoDocumento', tipoDocumento.toString())
                                  .set('nroSerie', serieDoc.toString())
                                  .set('nroSecuencia', secuenciaDoc.toString());

  return this.http.get<Documento>(this.url + idEmpresa + '/documentos/SRV1', { params: params });
}



validarDocumentPorSerie(idEmpresa: number, tipoDocumento: number, serieDoc: string, secuenciaDoc: string) {
  const params = new HttpParams().set('tipoDocumento', tipoDocumento.toString())
                                  .set('nroSerie', serieDoc.toString())
                                  .set('nroSecuencia', secuenciaDoc.toString());

  return this.http.get<any>(this.url + idEmpresa + '/documentos/SRV5', { params: params });
}

}
