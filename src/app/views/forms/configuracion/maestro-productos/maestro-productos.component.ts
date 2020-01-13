import { Component, OnInit } from '@angular/core';
import { MaestroVehiculosPopupComponent } from '../maestro-vehiculos/maestro-vehiculos-popup/maestro-vehiculos-popup.component';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { VehiculoService } from '../../../../shared/services/vehiculo/vehiculo.service';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { Subscription } from 'rxjs/Subscription';
import { ProductoService } from '../../../../shared/services/productos/producto.service';
import { ProductosPopupComponent } from './productos-popup/productos-popup.component';

@Component({
  selector: 'app-maestro-productos',
  templateUrl: './maestro-productos.component.html',
  styleUrls: ['./maestro-productos.component.scss']
})
export class MaestroProductosComponent implements OnInit {

  public rows: any[];
  public getItemSub: Subscription;
  public comboTipoProductos = [
    { id: 1, codigo: '001' , descripcion: 'BIEN' },
    { id: 2, codigo: '002' , descripcion: 'SERVICIO'},
  ];


  constructor(private dialog: MatDialog,
              private snack: MatSnackBar,
              private productoService: ProductoService,
              private confirmService: AppConfirmService ) {

    }

  ngOnInit() {
    this.listarProductos();
  }

  listarProductos() {
     this.productoService.listarComboProductos().subscribe(data => {
        this.rows = data;
    });
  }

  retornarGlosa (value: any) {
    if (value) {
      return this.comboTipoProductos.find(tipoProd => tipoProd.id === value ).descripcion;
    } else {
      return '';
    }
  }

  openPopUp(data: any = {}, isNew?) {
    const title = isNew ? 'Nuevo Producto' : 'Actualizar Producto';
    const dialogRef: MatDialogRef<any> = this.dialog.open(ProductosPopupComponent, {
      width: '740px',
      disableClose: true,
      data: { title: title, isNew: isNew, payload: data }
    }) ;
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
        // this.loader.open();
        this.listarProductos();
        if (isNew) {
          this.snack.open('Registro añadido correctamente !', 'OK', { duration: 5000 });
        } else {
          this.snack.open('Registro actualizado correctamente !', 'OK', { duration: 5000 });
        }
      });
  }


  deleteItem(row) {
    this.confirmService.confirm({message: `Confirma eliminar el registro: ${row.nombre}?`})
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
