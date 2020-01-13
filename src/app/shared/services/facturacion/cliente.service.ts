import { Cliente } from '../../models/cliente.model';
import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Cacheable } from 'ngx-cacheable';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  url = `${HOST}/empresas/`;
  url2 = `${HOST}/empresas/clientes`;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'})
  };

  constructor(private http: HttpClient) { }



  @Cacheable({
    maxCacheCount: 10,
    maxAge: 5 * 60000,
  })
  listarClientesPorEmpresa(idEmpresa: number) {
    return this.http.get<Cliente[]>(this.url + idEmpresa + '/clientes');
  }

  registrarCliente(cliente: Cliente) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post<any>(this.url2, cliente, this.httpOptions);
  }

  actualizarCliente(cliente: Cliente) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.put<any>(this.url2 + '/' + cliente.id, cliente, this.httpOptions);
  }
}
