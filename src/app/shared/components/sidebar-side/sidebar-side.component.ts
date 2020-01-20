import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';
// import PerfectScrollbar from 'perfect-scrollbar';
import { UsuarioService } from '../../services/auth/usuario.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-sidebar-side',
  templateUrl: './sidebar-side.component.html'
})
export class SidebarSideComponent implements OnInit, OnDestroy, AfterViewInit {
  // private sidebarPS: PerfectScrollbar;
  public menuItems: any[];
  public hasIconTypeMenuItem: boolean;
  public iconTypeMenuTitle: string;
  private menuItemsSub: Subscription;
  public usuarioSession: Usuario;

  constructor(
    private navService: NavigationService,
    private userService: UsuarioService,
    public themeService: ThemeService,
  ) { }

  ngOnInit() {

    // Recupera datos de usuario de session
    this.usuarioSession = this.userService.getUserLoggedIn();

    // this.iconTypeMenuTitle = this.navService.iconTypeMenuTitle;
    this.menuItemsSub = this.navService.menuItems$.subscribe(menuItem => {
       if (this.usuarioSession.cargo === 'Registrador') {
        // No mostrar opción de Facturación
        menuItem.splice(menuItem.findIndex(e => e.name === 'Facturación'), 1);
      }
      this.menuItems = menuItem;
      // Checks item list has any icon type.
      this.hasIconTypeMenuItem = !!this.menuItems.filter(item => item.type === 'icon').length;
    });
  }
  ngAfterViewInit() {
    // setTimeout(() => {
    //   this.sidebarPS = new PerfectScrollbar('#scroll-area', {
    //     suppressScrollX: true
    //   })
    // })
  }
  ngOnDestroy() {
    // if(this.sidebarPS) {
    //   this.sidebarPS.destroy();
    // }
    if(this.menuItemsSub) {
      this.menuItemsSub.unsubscribe()
    }
  }

}
