import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar, MatDialogRef } from '@angular/material';
import { ClienteService } from '../../../../shared/services/facturacion/cliente.service';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { UsuarioService } from '../../../../shared/services/auth/usuario.service';
import { Usuario } from '../../../../shared/models/usuario.model';
import { Router } from '@angular/router';
import { ClientePopupComponent } from './cliente-popup/cliente-popup.component';

@Component({
  selector: 'app-maestro-clientes',
  templateUrl: './maestro-clientes.component.html',
  styleUrls: ['./maestro-clientes.component.scss']
})
export class MaestroClientesComponent implements OnInit {

  public rows: any[];
  usuarioSession: Usuario;

  constructor(private dialog: MatDialog,
              private snack: MatSnackBar,
              private clienteService: ClienteService,
              private userService: UsuarioService,
              private router: Router,
              private confirmService: AppConfirmService,
    private loader: AppLoaderService
  ) { }

  ngOnInit() {
    // Recupera datos de usuario de session
    this.usuarioSession = this.userService.getUserLoggedIn();
    this.obtenerClientesBD();
  }

  /* Obtener clientes de BD*/
  obtenerClientesBD() {
     this.clienteService.listarClientesPorEmpresa(this.usuarioSession.empresa.id).subscribe(data => {
        this.rows = data;
    });
  }

  consultarCliente2(row: any) {

  }

  nuevoRegistro() {
    this.redirectTo('/forms/configuracion/clientes');

  }
  redirectTo(uri: string) {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
    this.router.navigate([uri]));
  }


  openPopUp(data: any = {}, isNew?) {
    const title = isNew ? 'Nuevo Cliente' : 'Actualizar Cliente';
    const dialogRef: MatDialogRef<any> = this.dialog.open(ClientePopupComponent, {
      width: '940px',
      disableClose: true,
      data: { title: title, isNew: isNew, payload: data }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
        // this.loader.open();
        this.obtenerClientesBD();
        if (isNew) {
          this.snack.open('Registro añadido correctamente !', 'OK', { duration: 5000 });
        } else {
          this.snack.open('Registro actualizado correctamente !', 'OK', { duration: 5000 });
        }
      });
  }


  deleteItem(row) {
    this.confirmService.confirm({message: `Confirma eliminar el registro: ${row.refLarga2}?`})
      .subscribe(res => {
        if (res) {
          // this.loader.open();
          // this.crudService.removeItem(row)
          //   .subscribe(data => {
          //     this.rows = data;
          //     this.loader.close();
          this.snack.open('Opción deshabilitada !', 'OK', { duration: 4000 });
          //   });
        }
      });
  }




}
