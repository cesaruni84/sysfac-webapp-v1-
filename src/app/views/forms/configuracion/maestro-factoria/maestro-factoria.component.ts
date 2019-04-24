import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar, MatDialogRef } from '@angular/material';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { Subscription } from 'rxjs/Subscription';
import { MaestroFactoriaPopupComponent } from './maestro-factoria-popup/maestro-factoria-popup.component';
import { FactoriaService } from '../../../../shared/services/factorias/factoria.service';
import { CrudService } from '../../../cruds/crud.service';

@Component({
  selector: 'app-maestro-factoria',
  templateUrl: './maestro-factoria.component.html',
  styleUrls: ['./maestro-factoria.component.scss']
})
export class MaestroFactoriaComponent implements OnInit {

  public rows: any[];
  public getItemSub: Subscription;


  constructor(private dialog: MatDialog,
              private snack: MatSnackBar,
              private factoriaService: FactoriaService,
              private confirmService: AppConfirmService,
    private loader: AppLoaderService
  ) { }

  ngOnInit() {
    this.listarFactorias();
  }

  // ngOnDestroy() {
  //   if (this.getItemSub) {
  //     this.getItemSub.unsubscribe();
  //   }
  // }

  /* Lista todas las factorias de la BD */
  listarFactorias() {
    this.getItemSub = this.factoriaService.listarTodasLasFactorias('O').subscribe(data1 => {
        this.rows = data1;
    });
  }

  openPopUp(data: any = {}, isNew?) {
    let title = isNew ? 'Nueva Planta' : 'Actualizar Planta';
    let dialogRef: MatDialogRef<any> = this.dialog.open(MaestroFactoriaPopupComponent, {
      width: '740px',
      disableClose: true,
      data: { title: title, isNew: isNew, payload: data }
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        if(!res) {
          // If user press cancel
          return;
        }
        // this.loader.open();
        this.listarFactorias();
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



  compareObjects(o1: any, o2: any): boolean {
    return o1.name === o2.name && o1.id === o2.id;
  }

}
