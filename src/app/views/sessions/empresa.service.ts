import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Empresa } from '../../shared/models/empresa.model';
import { HOST } from '../../shared/helpers/var.constant';


@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  url = `${HOST}/empresas`;

  constructor(private http: HttpClient) { }


  listarComboEmpresas() {
    return this.http.get<Empresa[]>(this.url);
  }


}
