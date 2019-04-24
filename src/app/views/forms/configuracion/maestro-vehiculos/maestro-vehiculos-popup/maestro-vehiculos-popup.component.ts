import { Component, OnInit, Inject } from '@angular/core';
import { throwError } from 'rxjs/internal/observable/throwError';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Vehiculo } from '../../../../../shared/models/vehiculo.model';
import { Usuario } from '../../../../../shared/models/usuario.model';
import { ErrorResponse, InfoResponse } from '../../../../../shared/models/error_response.model';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { VehiculoService } from '../../../../../shared/services/vehiculo/vehiculo.service';

@Component({
  selector: 'app-maestro-vehiculos-popup',
  templateUrl: './maestro-vehiculos-popup.component.html',
  styleUrls: ['./maestro-vehiculos-popup.component.scss']
})
export class MaestroVehiculosPopupComponent implements OnInit {

  comboEstados = [
    { id: 1, codigo: '001' , descripcion: ' OPERATIVO' },
    { id: 2, codigo: '002' , descripcion: ' EN MANTENIMIENTO' },
    { id: 3, codigo: '003' , descripcion: ' INOPERATIVO' },
  ];
  public itemForm_: FormGroup;
  public itemVehiculo: Vehiculo;

  usuarioSession: Usuario;
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<MaestroVehiculosPopupComponent>,
    private fb: FormBuilder,
    private vehiculoService: VehiculoService,
    private loader: AppLoaderService,
    private snack: MatSnackBar,
  ) { }

  ngOnInit() {
    this.buildItemForm(this.data.payload);
  }


  buildItemForm(item: any) {
    let valueEstado;
    if (this.data.isNew) {
       valueEstado = this.data.isNew ;
    } else {
       valueEstado = item.estado == 0? true : false ;
    }

    this.itemForm_ = this.fb.group({
      tracto: [{value: item.placaTracto || '', disabled: false}, Validators.required],
      bombona: [{value: item.placaBombona || '', disabled: false}, Validators.required],
      marca: [{value: item.modelo || '', disabled: false}, Validators.required],
      certificado: [{value: item.licencia || '', disabled: false}, Validators.required],
      estado: [valueEstado ],
    });

  }

     /**
   * Getters de campos de formulario
   */

  get tracto_ (): FormControl {
    return this.itemForm_.get('tracto') as FormControl;
  }

  get bombona_ (): FormControl {
    return this.itemForm_.get('bombona') as FormControl;
  }

  get marca_ (): FormControl {
    return this.itemForm_.get('marca') as FormControl;
  }

  get certificado_ (): FormControl {
    return this.itemForm_.get('certificado') as FormControl;
  }

  get estado_ (): FormControl {
    return this.itemForm_.get('estado') as FormControl;
  }

  submit() {
    if (!this.itemForm_.invalid) {
      this.itemVehiculo = new Vehiculo();
      this.itemVehiculo.placaTracto = this.tracto_.value;
      this.itemVehiculo.placaBombona = this.bombona_.value;
      this.itemVehiculo.modelo = this.marca_.value;
      this.itemVehiculo.licencia = this.certificado_.value;
      this.itemVehiculo.garantia = 'S';
      this.itemVehiculo.estado = this.estado_.value ? 0 : 1;

      if (this.data.isNew) {
        this.registrar();
      } else {
        this.actualizar();
      }

    }
  }

  registrar() {
    this.loader.open();
    this.vehiculoService.registrarVehiculo(this.itemVehiculo).subscribe((data_) => {
       this.infoResponse_ = data_;
       // this.snack.open(this.infoResponse_.alertMessage, 'OK', { duration: 5000 });
       this.loader.close();
       this.dialogRef.close(this.itemForm_.getRawValue());
    },
    (error: HttpErrorResponse) => {
      this.handleError(error);
    });
  }

  actualizar() {
    this.itemVehiculo.id = this.data.payload.id;
    this.loader.open();
    this.vehiculoService.actualizarVehiculo(this.itemVehiculo).subscribe((data_) => {
       this.infoResponse_ = data_;
       // this.snack.open(this.infoResponse_.alertMessage, 'OK', { duration: 5000 });
       this.loader.close();
       this.dialogRef.close(this.itemForm_.getRawValue());

    },
    (error: HttpErrorResponse) => {
      this.handleError(error);
    });
  }


  private handleError(error: HttpErrorResponse) {

    this.loader.close();
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      // this.errorResponse_ = error.error;
      this.snack.open(this.errorResponse_.errorMessage, 'OK', { duration: 3000 });
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      if (error.error.codeMessage != null ) {
        this.errorResponse_ = error.error;
        this.snack.open(this.errorResponse_.errorMessage, 'OK', { duration: 3000 });
      } else {
        this.snack.open('Ocurrió un error inesperado!!, intenta nuevamente.', 'OK', { duration: 3000 });
        console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${error.error}`);
      }

    }
    // return an observable with a user-facing error message
    return throwError(
      'Ocurrió un error inesperado, volver a intentar.');
  };

}
