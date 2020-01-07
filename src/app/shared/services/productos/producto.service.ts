import { Injectable } from '@angular/core';
import { HOST } from '../../helpers/var.constant';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Producto } from '../../models/producto.model';
import { Cacheable } from 'ngx-cacheable';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  url = `${HOST}/empresas`;
  url2 = `${HOST}/productos`;
  url3 = `${HOST}/empresas/productos`;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'})
  };


  constructor(private http: HttpClient) { }


  listarComboProductos() {
    return this.http.get<Producto[]>(this.url2).pipe();
  }

  listarComboProductosServicios(idEmpresa: number) {
    return this.http.get<any[]>(this.url +  '/' +  idEmpresa + '/productos-servicios/SRV1').pipe();
  }


  registrarProducto(producto: Producto) {
    return this.http.post<any>(this.url3, producto, this.httpOptions);
  }

  actualizarProducto(producto: Producto) {
    return this.http.put<any>(this.url3 + '/' + producto.id, producto, this.httpOptions);
  }

}
