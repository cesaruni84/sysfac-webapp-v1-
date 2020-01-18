import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog, MatSnackBar, MatDialogRef } from '@angular/material';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { MaestroTarifasPopupComponent } from './maestro-tarifas-popup/maestro-tarifas-popup.component';
import { TarifaRutaService } from '../../../../shared/services/tarifa-ruta.service';
import { TarifaRuta } from '../../../../shared/models/tarifa-ruta.model';
import { Usuario } from '../../../../shared/models/usuario.model';
import { ErrorResponse, InfoResponse } from '../../../../shared/models/error_response.model';

@Component({
  selector: 'app-maestro-tarifas',
  templateUrl: './maestro-tarifas.component.html',
  styleUrls: ['./maestro-tarifas.component.scss']
})
export class MaestroTarifasComponent implements OnInit, OnDestroy {
  rows: any[];
  getItemSub: Subscription;

  // Usuario sesionado
  usuarioSession: Usuario;
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;

  constructor(
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private tarifaRutaService: TarifaRutaService,
    private confirmService: AppConfirmService,
    private loader: AppLoaderService
  ) {}

  ngOnInit() {
    this.loader.open();
    this.listarTarifasRuta();
  }

  ngOnDestroy() {
    if (this.getItemSub) {
      this.getItemSub.unsubscribe();
    }
  }

  /* Lista todas las factorias de la BD */
  listarTarifasRuta() {
    this.getItemSub = this.tarifaRutaService
      .listarTodasLasTarifasPorEmpresa(1)
      .subscribe(data => {
        this.rows = data;
        this.loader.close();
      });
  }

  openPopUp(data: any = {}, isNew?) {
    const title = isNew ? 'Nueva Tarifa - Ruta ' : 'Actualizar Tarifa - Ruta';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      MaestroTarifasPopupComponent,
      {
        width: '940px',
        disableClose: true,
        data: { title: title, isNew: isNew, payload: data }
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        // If user press cancel
        return;
      }
      this.loader.open();
      this.listarTarifasRuta();
      if (isNew) {
        this.snack.open('Registro añadido correctamente !', 'OK', {
          duration: 5000
        });
      } else {
        this.snack.open('Registro actualizado correctamente !', 'OK', {
          duration: 5000
        });
      }
    });
  }

  deleteItem(row: TarifaRuta) {
    this.confirmService
      .confirm({
        message: `Confirma eliminar la tarifa de la ruta: 
    ${row.origen.refLarga2}  -->  ${row.destino.refLarga2} ?`
      })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          this.tarifaRutaService.eliminarTarifa(row)
            .subscribe(data => {
              this.infoResponse_ = data;
              this.loader.close();
              this.snack.open(this.infoResponse_ .alertMessage, 'OK', { duration: 5000 });
              this.snack._openedSnackBarRef.afterDismissed().subscribe(() => {
                this.listarTarifasRuta();
              });
          });
        }
      });
  }
}
