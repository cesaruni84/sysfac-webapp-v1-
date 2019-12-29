import { UnidadMedida } from '../../models/unidad_medida.model';
import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient } from '@angular/common/http';
import { Cacheable } from 'ngx-cacheable';

@Injectable({
  providedIn: 'root'
})
export class UnidadMedidaService {

  url = `${HOST}/unidadesMedida`;

  constructor(private http: HttpClient) { }

  @Cacheable({
    maxCacheCount: 10,
  })
  listarComboUnidadesMedida() {
    return this.http.get<UnidadMedida[]>(this.url).pipe();
  }
}
