import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient } from '@angular/common/http';
import { Factoria } from '../../models/factoria.model';

@Injectable({
  providedIn: 'root'
})
export class FactoriaService {

  url = `${HOST}/clientes/factorias`;

  constructor(private http: HttpClient) { }


  listarComboFactorias() {
    return this.http.get<Factoria[]>(this.url);
  }
}
