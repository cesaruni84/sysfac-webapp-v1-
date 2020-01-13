import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog, MatSnackBar, MatDialogRef } from '@angular/material';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { FactoriaService } from '../../../../shared/services/factorias/factoria.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { VehiculoService } from '../../../../shared/services/vehiculo/vehiculo.service';
import { MaestroVehiculosPopupComponent } from './maestro-vehiculos-popup/maestro-vehiculos-popup.component';
import { globalCacheBusterNotifier } from 'ngx-cacheable';

@Component({
  selector: 'app-maestro-vehiculos',
  templateUrl: './maestro-vehiculos.component.html',
  styleUrls: ['./maestro-vehiculos.component.scss']
})
export class MaestroVehiculosComponent implements OnInit, OnDestroy {

  public rows: any[];
  public getItemSub: Subscription;


  constructor(private dialog: MatDialog,
              private snack: MatSnackBar,
              private vehiculoService: VehiculoService,
              private confirmService: AppConfirmService,
    private loader: AppLoaderService
  ) { }

  ngOnInit() {
    this.listarVehiculos();
  }

   ngOnDestroy() {
    if (this.getItemSub) {
     this.getItemSub.unsubscribe();
     }
   }

  listarVehiculos() {
    this.getItemSub = this.vehiculoService.listarTodosLosVehiculosPorEmpresa(1).subscribe(data1 => {
        this.rows = data1;
    });
  }

  openPopUp(data: any = {}, isNew?) {
    let title = isNew ? 'Nuevo Vehículo' : 'Actualizar Vehículo';
    let dialogRef: MatDialogRef<any> = this.dialog.open(MaestroVehiculosPopupComponent, {
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
        globalCacheBusterNotifier.next();
        this.listarVehiculos();
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
