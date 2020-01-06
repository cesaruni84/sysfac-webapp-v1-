import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog, MatSnackBar, MatDialogRef } from '@angular/material';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { MaestroTarifasPopupComponent } from './maestro-tarifas-popup/maestro-tarifas-popup.component';
import { TarifaRutaService } from '../../../../shared/services/tarifa-ruta.service';

@Component({
  selector: 'app-maestro-tarifas',
  templateUrl: './maestro-tarifas.component.html',
  styleUrls: ['./maestro-tarifas.component.scss']
})
export class MaestroTarifasComponent implements OnInit {

  public rows: any[];
  public getItemSub: Subscription;


  constructor(private dialog: MatDialog,
              private snack: MatSnackBar,
              private tarifaRutaService: TarifaRutaService,
              private confirmService: AppConfirmService,
              private loader: AppLoaderService
  ) { }

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
    this.getItemSub = this.tarifaRutaService.listarTodasLasTarifasPorEmpresa(1).subscribe(data1 => {
        this.rows = data1;
        this.loader.close();
    });
  }

  openPopUp(data: any = {}, isNew?) {
    let title = isNew ? 'Nueva Tarifa - Ruta ' : 'Actualizar Tarifa - Ruta';
    let dialogRef: MatDialogRef<any> = this.dialog.open(MaestroTarifasPopupComponent, {
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
        this.loader.open();
        this.listarTarifasRuta();
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
      })
  }





}
