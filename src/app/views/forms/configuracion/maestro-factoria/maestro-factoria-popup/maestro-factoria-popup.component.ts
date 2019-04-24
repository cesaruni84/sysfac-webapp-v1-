import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Cliente } from '../../../../../shared/models/cliente.model';
import { ClienteService } from '../../../../../shared/services/facturacion/cliente.service';
import { Factoria } from '../../../../../shared/models/factoria.model';
import { FactoriaService } from '../../../../../shared/services/factorias/factoria.service';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { Usuario } from '../../../../../shared/models/usuario.model';
import { ErrorResponse, InfoResponse } from '../../../../../shared/models/error_response.model';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';

@Component({
  selector: 'app-maestro-factoria-popup',
  templateUrl: './maestro-factoria-popup.component.html',
  styleUrls: ['./maestro-factoria-popup.component.scss']
})
export class MaestroFactoriaPopupComponent implements OnInit {

  public itemForm_: FormGroup;
  public comboClientes: Cliente[];
  public itemFactoria: Factoria;

  usuarioSession: Usuario;
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<MaestroFactoriaPopupComponent>,
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private factoriaService: FactoriaService,
    private loader: AppLoaderService,
    private snack: MatSnackBar,
  ) { }

  ngOnInit() {
    this.cargaCombos();
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
      cliente: [{value: item.cliente || '', disabled: false}, Validators.required],
      ruc: [{value: item.ruc || '', disabled: false}, Validators.required],
      codigo: [{value: item.codigo || '', disabled: false}, Validators.required],
      nombre: [{value: item.nombre || '', disabled: false}, Validators.required],
      direccion: [{value: item.direccion || '', disabled: false}, Validators.required],
      distrito: [{value: item.distrito || '', disabled: false}],
      provincia: [{value: item.provincia || '', disabled: false}],
      departamento: [{value: item.departamento || '', disabled: false}],
      estado: [valueEstado ],
    });

  }

  cargaCombos() {
    // Combo Clientes
    this.clienteService.listarClientesPorEmpresa(1).subscribe(dataClientes => {
      this.comboClientes = dataClientes;
    });
  }

  seleccionarCliente(event: any) {
    this.itemForm_.patchValue({
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
  get cliente_ (): FormControl {
    return this.itemForm_.get('cliente') as FormControl;
  }

  get codigo_ (): FormControl {
    return this.itemForm_.get('codigo') as FormControl;
  }

  get nombre_ (): FormControl {
    return this.itemForm_.get('nombre') as FormControl;
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

  get estado_ (): FormControl {
    return this.itemForm_.get('estado') as FormControl;
  }

  submit() {
    if (!this.itemForm_.invalid) {
      this.itemFactoria = new Factoria();
      this.itemFactoria.cliente = this.cliente_.value;
      this.itemFactoria.codigo = this.codigo_.value;
      this.itemFactoria.ruc = this.cliente_.value.ruc;
      this.itemFactoria.nombre = this.nombre_.value;
      this.itemFactoria.direccion = this.direccion_.value;
      this.itemFactoria.distrito = this.distrito_.value;
      this.itemFactoria.provincia = this.provincia_.value;
      this.itemFactoria.departamento = this.departamento_.value;
      this.itemFactoria.estado = this.estado_.value ? 0 : 1;
      this.itemFactoria.referencia = '?';
      this.itemFactoria.tipo = 'O';
      if (this.data.isNew) {
        this.registrar();
      } else {
        this.actualizar();
      }

    }
  }

  registrar() {
    this.loader.open();
    this.factoriaService.registrarFactoria(this.itemFactoria).subscribe((data_) => {
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
    this.itemFactoria.id = this.data.payload.id;
    this.loader.open();
    this.factoriaService.actualizarFactoria(this.itemFactoria).subscribe((data_) => {
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
