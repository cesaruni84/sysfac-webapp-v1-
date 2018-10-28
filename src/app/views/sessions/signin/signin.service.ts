import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UsuarioForm } from '../../../shared/models/usuarioForm.model';
import { HOST } from '../../../shared/helpers/var.constant';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Usuario } from '../../../shared/models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class SigninService {

  url = `${HOST}/login`;

  constructor(private http: HttpClient) {
   }

  login(user: UsuarioForm) {
    // let headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post<Usuario>(this.url, user);
  }

  logout() {
    localStorage.removeItem('currentUser');
  }

}
