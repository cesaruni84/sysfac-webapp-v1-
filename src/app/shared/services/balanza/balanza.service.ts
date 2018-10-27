import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient } from '@angular/common/http';
import { Balanza } from '../../models/balanza.model';

@Injectable({
  providedIn: 'root'
})
export class BalanzaService {

  url = `${HOST}/balanzas`;

  constructor(private http: HttpClient) { }


  listarComboBalanzas() {
    return this.http.get<Balanza[]>(this.url);

  }
}
