import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient } from '@angular/common/http';
import { Producto } from '../../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  url = `${HOST}/empresas`;
  url2 = `${HOST}/productos`;

  constructor(private http: HttpClient) { }


  listarComboProductos() {
    return this.http.get<Producto[]>(this.url2);
  }

  listarComboProductosServicios(idEmpresa: number) {
    return this.http.get<any[]>(this.url +  '/' +  idEmpresa + '/productos-servicios/SRV1');
  }


}
