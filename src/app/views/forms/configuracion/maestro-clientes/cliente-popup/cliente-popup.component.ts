import { Component, OnInit, Inject } from '@angular/core';
import { TiposGenericosService } from '../../../../../shared/services/util/tiposGenericos.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ClienteService } from '../../../../../shared/services/facturacion/cliente.service';
import { Usuario } from '../../../../../shared/models/usuario.model';
import { ErrorResponse, InfoResponse } from '../../../../../shared/models/error_response.model';
import { Cliente } from '../../../../../shared/models/cliente.model';
import { throwError } from 'rxjs';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { MatSnackBar, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { UsuarioService } from '../../../../../shared/services/auth/usuario.service';
import { TipoDocPersona } from '../../../../../shared/models/tipos_facturacion';
import { MaestroFactoriaPopupComponent } from '../../maestro-factoria/maestro-factoria-popup/maestro-factoria-popup.component';
import { FactoriaService } from '../../../../../shared/services/factorias/factoria.service';
import { CustomValidators } from 'ng2-validation';

@Component({
  selector: 'app-cliente-popup',
  templateUrl: './cliente-popup.component.html',
  styleUrls: ['./cliente-popup.component.scss']
})
export class ClientePopupComponent implements OnInit {

  public itemForm_: FormGroup;
  public itemCliente: Cliente;
  public comboTiposDocumento: TipoDocPersona[];

  usuarioSession: Usuario;
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<MaestroFactoriaPopupComponent>,
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private tiposGenService: TiposGenericosService,
    private factoriaService: FactoriaService,
    private userService: UsuarioService,
    private loader: AppLoaderService,
    private snack: MatSnackBar,
  ) { }

  ngOnInit() {
    this.usuarioSession = this.userService.getUserLoggedIn();
    this.cargaCombos();
    this.buildItemForm(this.data.payload);
  }


  buildItemForm(item: any) {
    this.itemForm_ = this.fb.group({
      tipoDocumento: [{value: item.cliente || 1 , disabled: false}, Validators.required],
      ruc: [{value: item.ruc || '', disabled: false}, Validators.required],
      nombre: [{value: item.razonSocial || '', disabled: false}, Validators.required],
      direccion: [{value: item.direccion || '', disabled: false}],
      telefono: [{ value: item.telefono || '', disabled: false }],
      email: [{ value: item.email || '', disabled: false }, CustomValidators.email],
      distrito: [{value: item.distrito || '', disabled: false}],
      provincia: [{value: item.provincia || '', disabled: false}],
      departamento: [{value: item.departamento || '', disabled: false}],
    });

  }

  cargaCombos() {
    // Combo Tipo Doc.
    this.comboTiposDocumento = this.tiposGenService.retornarTiposDocPersona();

  }

  seleccionarCliente(event: any) {
    this.itemForm_.patchValue({
      ruc: event.value.ruc,
   });
  }

  compareObjects(o1: any, o2: any): boolean {
    return  o1.id === o2.id;
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
  get tipoDocumento_ (): FormControl {
    return this.itemForm_.get('tipoDocumento') as FormControl;
  }

  get ruc_ (): FormControl {
    return this.itemForm_.get('ruc') as FormControl;
  }

  get nombre_ (): FormControl {
    return this.itemForm_.get('nombre') as FormControl;
  }

  get telefono_ (): FormControl {
    return this.itemForm_.get('telefono') as FormControl;
  }

  get email_ (): FormControl {
    return this.itemForm_.get('email') as FormControl;
  }

  get direccion_ (): FormControl {
    return this.itemForm_.get('direccion') as FormControl;
  }

  get distrito_ (): FormControl {
    return this.itemForm_.get('distrito') as FormControl;
  }

  get provincia_ (): FormControl {
    return this.itemForm_.get('provincia') as FormControl;
  }

  get departamento_ (): FormControl {
    return this.itemForm_.get('departamento') as FormControl;
  }


  submit() {
    if (!this.itemForm_.invalid) {
      this.itemCliente = new Cliente();
      this.itemCliente.tipoDoc = this.tipoDocumento_.value;
      this.itemCliente.ruc = this.ruc_.value;
      this.itemCliente.razonSocial = this.nombre_.value;
      this.itemCliente.nombreComercial = '?';
      this.itemCliente.telefono = this.telefono_.value;
      this.itemCliente.email = this.email_.value;
      this.itemCliente.direccion = this.direccion_.value;
      this.itemCliente.distrito = this.distrito_.value;
      this.itemCliente.provincia = this.provincia_.value;
      this.itemCliente.departamento = this.departamento_.value;
      if (this.data.isNew) {
        this.registrar();
      } else {
        this.actualizar();
      }

    }
  }

  registrar() {
    this.loader.open();
    this.clienteService.registrarCliente(this.itemCliente).subscribe((data_) => {
       this.infoResponse_ = data_;
       this.loader.close();
       this.dialogRef.close(this.itemForm_.getRawValue());
    },
    (error: HttpErrorResponse) => {
      this.handleError(error);
    });
  }

  actualizar() {
    this.itemCliente.id = this.data.payload.id;
    this.loader.open();
    this.clienteService.actualizarCliente(this.itemCliente).subscribe((data_) => {
       this.infoResponse_ = data_;
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
