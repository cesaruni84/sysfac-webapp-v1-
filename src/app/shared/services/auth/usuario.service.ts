import { Injectable } from '@angular/core';
import { Usuario } from '../../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  public isUserLoggedIn;
  public usserLogged: Usuario;

  constructor() {

   }

  setUserLoggedIn(user: Usuario) {
    this.isUserLoggedIn = true;
    this.usserLogged = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  deleteUserLoggedIn() {
    this.isUserLoggedIn = false;
    localStorage.removeItem('currentUser');
  }

  getUserLoggedIn() {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  getToken() {
    return localStorage.getItem('currentUser');
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }



}
