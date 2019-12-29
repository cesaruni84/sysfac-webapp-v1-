import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient } from '@angular/common/http';
import { MotivoTraslado } from '../../models/motivo_traslado.model';
import { Cacheable } from 'ngx-cacheable';

@Injectable({
  providedIn: 'root'
})
export class MotivoTrasladoService {

  url = `${HOST}/motivosTraslado`;

  constructor(private http: HttpClient) { }

  @Cacheable({
    maxCacheCount: 10,
  })
  listarComboMotivosTraslado() {
    return this.http.get<MotivoTraslado[]>(this.url).pipe();
  }
}
