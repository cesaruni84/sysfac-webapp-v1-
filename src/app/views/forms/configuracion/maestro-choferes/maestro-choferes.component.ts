import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { MaestroVehiculosPopupComponent } from '../maestro-vehiculos/maestro-vehiculos-popup/maestro-vehiculos-popup.component';
import { ChoferService } from '../../../../shared/services/chofer/chofer.service';
import { MaestroChoferesPopupComponent } from './maestro-choferes-popup/maestro-choferes-popup.component';
import { globalCacheBusterNotifier } from 'ngx-cacheable';

@Component({
  selector: 'app-maestro-choferes',
  templateUrl: './maestro-choferes.component.html',
  styleUrls: ['./maestro-choferes.component.scss']
})
export class MaestroChoferesComponent implements OnInit, OnDestroy {

  public rows: any[];
  public getItemSub: Subscription;


  constructor(private dialog: MatDialog,
              private snack: MatSnackBar,
              private choferService: ChoferService,
              private confirmService: AppConfirmService,
              private loader: AppLoaderService
  ) { }

  ngOnInit() {
    this.loader.open();
    this.listarChoferes();
  }

  ngOnDestroy() {
    if (this.getItemSub) {
      this.getItemSub.unsubscribe();
    }
  }

  /* Lista todas las choferes de la BD */
  listarChoferes() {
    this.getItemSub = this.choferService.listarTodosLosChoferes(1).subscribe(data1 => {
        this.rows = data1;
        this.loader.close();
    });
  }

  openPopUp(data: any = {}, isNew?) {
    let title = isNew ? 'Nuevo Chofer' : 'Actualizar Chofer';
    let dialogRef: MatDialogRef<any> = this.dialog.open(MaestroChoferesPopupComponent, {
      width: '840px',
      disableClose: true,
      data: { title: title, isNew: isNew, payload: data }
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        if(!res) {
          // If user press cancel
          return;
        }
        globalCacheBusterNotifier.next();
        this.listarChoferes();
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
