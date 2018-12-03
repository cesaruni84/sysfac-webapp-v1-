import { Chofer } from '../../models/chofer.model';
import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChoferService {

  url = `${HOST}/empresas/`;

  constructor(private http: HttpClient) { }


  listarComboChoferes(idEmpresa: number) {
    console.log(this.url + idEmpresa + '/choferes');
    return this.http.get<Chofer[]>(this.url + idEmpresa + '/choferes');

  }
}
