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

@Component({
  selector: 'app-cliente-popup',
  templateUrl: './cliente-popup.component.html',
  styleUrls: ['./cliente-popup.component.scss']
})
export class ClientePopupComponent implements OnInit {

  public clienteForm: FormGroup;
  comboClientes: Cliente[];
  comboTiposDocumento: TipoDocPersona[];
  usuarioSession: Usuario;
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;
  clienteData: Cliente;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ClientePopupComponent>,
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private tiposGenService: TiposGenericosService,
    private userService: UsuarioService,
    private loader: AppLoaderService,
    private snack: MatSnackBar,
  ) { }

  ngOnInit() {
    this.usuarioSession = this.userService.getUserLoggedIn();
    this.cargaCombos();
  }

  buildItemForm(item: any) {

    this.clienteForm = this.fb.group({
      tipoDocumento: [{ }, Validators.required],
      documento: [{ value: item.ruc || '', disabled: false }, Validators.required],
      razonSocial: [{ value: item.razonSocial || '', disabled: false }, Validators.required],
      telefono: [{ value: item.telefono || '', disabled: false }],
      email: [{ value: item.telefono || '', disabled: false }],
      direccion: [{ value: item.direccion || '', disabled: false }],
      distrito: [{ value: item.distrito || '', disabled: false }],
      provincia: [{ value: item.provincia || '', disabled: false }],
      departamento: [{ value: item.departamento || '', disabled: false }],
    });

  }

  cargaCombos() {
    this.comboTiposDocumento = this.tiposGenService.retornarTiposDocPersona();
  }

  seleccionarCliente(event: any) {
    this.clienteForm.patchValue({
      ruc: event.value.ruc,
    });
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1.valor === o2.valor && o1.id === o2.id;
  }

  compareObjects2(o1: any, o2: any): boolean {
    return o1.codigo === o2.codigo && o1.id === o2.id;
  }

  /**
* Getters de campos de formulario
*/
  get cliente_(): FormControl {
    return this.clienteForm.get('cliente') as FormControl;
  }

  get codigo_(): FormControl {
    return this.clienteForm.get('codigo') as FormControl;
  }

  get nombre_(): FormControl {
    return this.clienteForm.get('nombre') as FormControl;
  }

  get direccion_(): FormControl {
    return this.clienteForm.get('direccion') as FormControl;
  }

  get distrito_(): FormControl {
    return this.clienteForm.get('distrito') as FormControl;
  }

  get provincia_(): FormControl {
    return this.clienteForm.get('provincia') as FormControl;
  }

  get departamento_(): FormControl {
    return this.clienteForm.get('departamento') as FormControl;
  }



  submit() {
    if (!this.clienteForm.invalid) {
      //this.clienteData = new Cliente();
      // this.clienteData.codigo = this.codigo_.value;
     // this.clienteData.ruc = this.cliente_.value.ruc;
      //this.clienteData.razonSocial = this.nombre_.value;
     // this.clienteData.direccion = this.direccion_.value;
     // this.clienteData.distrito = this.distrito_.value;
    //  this.clienteData.provincia = this.provincia_.value;
    //  this.clienteData.departamento = this.departamento_.value;

    }
  }

  // registrar() {
  //   this.loader.open();
  //   this.factoriaService.registrarFactoria(this.itemFactoria).subscribe((data_) => {
  //      this.infoResponse_ = data_;
  //      // this.snack.open(this.infoResponse_.alertMessage, 'OK', { duration: 5000 });
  //      this.loader.close();
  //      this.dialogRef.close(this.itemForm_.getRawValue());
  //   },
  //   (error: HttpErrorResponse) => {
  //     this.handleError(error);
  //   });
  // }

  // actualizar() {
  //   this.itemFactoria.id = this.data.payload.id;
  //   this.loader.open();
  //   this.factoriaService.actualizarFactoria(this.itemFactoria).subscribe((data_) => {
  //      this.infoResponse_ = data_;
  //      // this.snack.open(this.infoResponse_.alertMessage, 'OK', { duration: 5000 });
  //      this.loader.close();
  //      this.dialogRef.close(this.itemForm_.getRawValue());

  //   },
  //   (error: HttpErrorResponse) => {
  //     this.handleError(error);
  //   });
  // }

  nuevoDocumento() {
    // this.router.navigate([]);
    this.redirectTo('/forms/facturacion/registro');
  }

  redirectTo(uri: string) {
  //  this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
  //  this.router.navigate([uri]));
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
      if (error.error.codeMessage != null) {
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
