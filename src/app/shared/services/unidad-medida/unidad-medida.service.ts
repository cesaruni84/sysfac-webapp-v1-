import { UnidadMedida } from '../../models/unidad_medida.model';
import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UnidadMedidaService {

  url = `${HOST}/unidadesMedida`;

  constructor(private http: HttpClient) { }

  listarComboUnidadesMedida() {
    return this.http.get<UnidadMedida[]>(this.url);
  }
}
