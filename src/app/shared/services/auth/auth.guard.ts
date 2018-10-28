import { UsuarioService } from './usuario.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  public authToken;

  constructor(private router: Router, private usuarioService: UsuarioService){}

  canActivate(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.usuarioService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/sessions/signin']);
      return false;
    }
  }
}