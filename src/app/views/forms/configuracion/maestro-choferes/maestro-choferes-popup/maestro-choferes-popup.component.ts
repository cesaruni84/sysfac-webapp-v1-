import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { Vehiculo } from '../../../../../shared/models/vehiculo.model';
import { Chofer } from '../../../../../shared/models/chofer.model';
import { Usuario } from '../../../../../shared/models/usuario.model';
import { ErrorResponse, InfoResponse } from '../../../../../shared/models/error_response.model';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { VehiculoService } from '../../../../../shared/services/vehiculo/vehiculo.service';
import { ChoferService } from '../../../../../shared/services/chofer/chofer.service';
import { CustomValidators } from 'ng2-validation';
import { UsuarioService } from '../../../../../shared/services/auth/usuario.service';

@Component({
  selector: 'app-maestro-choferes-popup',
  templateUrl: './maestro-choferes-popup.component.html',
  styleUrls: ['./maestro-choferes-popup.component.scss']
})
export class MaestroChoferesPopupComponent implements OnInit {

  public itemForm_: FormGroup;
  public comboVehiculos: Vehiculo[];
  public itemChofer: Chofer;

  usuarioSession: Usuario;
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<MaestroChoferesPopupComponent>,
    private fb: FormBuilder,
    private vehiculoService: VehiculoService,
    private choferService: ChoferService,
    private loader: AppLoaderService,
    private userService: UsuarioService,
    private snack: MatSnackBar,
  ) {
    // Recupera datos de usuario de session
     this.usuarioSession = this.userService.getUserLoggedIn();
   }

  ngOnInit() {
    this.cargaCombos();
    this.buildItemForm(this.data.payload);
  }


  buildItemForm(item: any) {

    let certificado_;
    let vehiculo_temp: Vehiculo;

    if (this.data.isNew) {
       certificado_ = '' ;
    } else {
      vehiculo_temp = item.vehiculo;
      certificado_ =  vehiculo_temp.licencia;
    }

    this.itemForm_ = this.fb.group({
      nombres: [{value: item.nombres || '', disabled: false}, Validators.required],
      apellidos: [{value: item.apellidos || '', disabled: false}, Validators.required],
      dni: [{value: item.dni || '', disabled: false}, [Validators.required, Validators.maxLength(8), CustomValidators.digits]],
      telefono: [{value: item.telefono || '', disabled: false}, CustomValidators.digits],
      email: [{value: item.email || '', disabled: false},],
      vehiculo: [{value: item.vehiculo || '', disabled: false}, Validators.required],
      certificado: [{value: item.certificado || '', disabled: false}, Validators.required],
      licencia: [{value: item.licencia || '', disabled: false}, Validators.required],
    });
  }

  cargaCombos() {
    // Combo Unidades de Transporte
    this.vehiculoService.listarTodosLosVehiculosPorEmpresa(1).subscribe(dataVehiculos => {
      this.comboVehiculos = dataVehiculos;
    });
  }

  seleccionarVehiculo(event: any) {
    this.itemForm_.patchValue({
      certificado: event.value.licencia,
   });
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1.valor === o2.valor && o1.id === o2.id;
  }

  compareObjects2(o1: any, o2: any): boolean {
    return o1.codigo === o2.codigo && o1.id === o2.id;
  }

  // Validar Digitos
  validaDigitos(event) {
    const key = window.event ? event.keyCode : event.which;
      if (event.keyCode === 8 || event.keyCode === 46) {
          return true;
      } else if ( key < 48 || key > 57 ) {
        return false;
      } else {
          return true;
      }
  }

  /**
   * Getters de campos de formulario
   */
  get nombres_ (): FormControl {
    return this.itemForm_.get('nombres') as FormControl;
  }

  get apellidos_ (): FormControl {
    return this.itemForm_.get('apellidos') as FormControl;
  }

  get dni_ (): FormControl {
    return this.itemForm_.get('dni') as FormControl;
  }

  get telefono_ (): FormControl {
    return this.itemForm_.get('telefono') as FormControl;
  }

  get email_ (): FormControl {
    return this.itemForm_.get('email') as FormControl;
  }

  get vehiculo_ (): FormControl {
    return this.itemForm_.get('vehiculo') as FormControl;
  }

  get certificado_ (): FormControl {
    return this.itemForm_.get('certificado') as FormControl;
  }

  get licencia_ (): FormControl {
    return this.itemForm_.get('licencia') as FormControl;
  }

  submit() {
    if (!this.itemForm_.invalid) {
      this.itemChofer = new Chofer();
      this.itemChofer.nombres = this.nombres_.value;
      this.itemChofer.apellidos = this.apellidos_.value;
      this.itemChofer.dni = this.dni_.value;
      this.itemChofer.telefono = this.telefono_.value;
      this.itemChofer.email = this.email_.value;
      this.itemChofer.vehiculo = this.vehiculo_.value;
      this.itemChofer.licencia = this.licencia_.value;
      this.itemChofer.certificado = this.certificado_.value;  // artificio verificar


      if (this.data.isNew) {
        this.registrar();
      } else {
        this.actualizar();
      }

    }
  }

  registrar() {
    this.loader.open();
    this.itemChofer.empresa = this.usuarioSession.empresa;
    this.choferService.registrarChofer(this.itemChofer).subscribe((data_) => {
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
    this.loader.open();
    this.itemChofer.id = this.data.payload.id;
    this.itemChofer.empresa = this.data.payload.empresa;
    this.choferService.actualizarChofer(this.itemChofer).subscribe((data_) => {
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
