import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ubigeo } from '../../models/ubigeo';

@Injectable({
  providedIn: 'root'
})
export class UbigeosService {

  constructor(private http: HttpClient) { }


  cargarUbigeos(){
    return this.http.get<Ubigeo[]>('./assets/ubigeo-reniec.json');
  }
}
{

  
}