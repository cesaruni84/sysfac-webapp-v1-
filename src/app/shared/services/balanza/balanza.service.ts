import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient } from '@angular/common/http';
import { Balanza } from '../../models/balanza.model';
import { Cacheable } from 'ngx-cacheable';

@Injectable({
  providedIn: 'root'
})
export class BalanzaService {

  url = `${HOST}/balanzas`;

  constructor(private http: HttpClient) { }

  @Cacheable({
    maxCacheCount: 10,
    maxAge: 5 * 60000,
  })
  listarComboBalanzas() {
    return this.http.get<Balanza[]>(this.url);

  }
}
