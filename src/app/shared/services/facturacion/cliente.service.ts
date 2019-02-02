import { Cliente } from '../../models/cliente.model';
import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  url = `${HOST}/empresas/`;

  constructor(private http: HttpClient) { }

  listarClientesPorEmpresa(idEmpresa: number) {
    return this.http.get<Cliente[]>(this.url + idEmpresa + '/clientes');
  }
}
