import { Component, OnInit, Inject } from '@angular/core';
import { throwError } from 'rxjs/internal/observable/throwError';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Usuario } from '../../../../../shared/models/usuario.model';
import { ClienteService } from '../../../../../shared/services/facturacion/cliente.service';
import { FactoriaService } from '../../../../../shared/services/factorias/factoria.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { MAT_DIALOG_DATA, MatSnackBar, MatDialogRef } from '@angular/material';
import { ErrorResponse, InfoResponse } from '../../../../../shared/models/error_response.model';
import { Factoria } from '../../../../../shared/models/factoria.model';
import { TiposGenericosService } from '../../../../../shared/services/util/tiposGenericos.service';
import { TarifaRuta, Turno } from '../../../../../shared/models/tarifa-ruta.model';
import { TarifaRutaService } from '../../../../../shared/services/tarifa-ruta.service';
import { UsuarioService } from '../../../../../shared/services/auth/usuario.service';

@Component({
  selector: 'app-maestro-tarifas-popup',
  templateUrl: './maestro-tarifas-popup.component.html',
  styleUrls: ['./maestro-tarifas-popup.component.scss']
})
export class MaestroTarifasPopupComponent implements OnInit {

  public itemForm_: FormGroup;
  public comboFactorias: Factoria[];
  public comboMonedas: any[];
  public itemTarifa: TarifaRuta;

  usuarioSession: Usuario;
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<MaestroTarifasPopupComponent>,
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private factoriaService: FactoriaService,
    private tarifaRutaService: TarifaRutaService,
    private tiposGenService: TiposGenericosService,
    private userService: UsuarioService,
    private loader: AppLoaderService,
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
    let valueEstado;
    let valordireorigen;
    let valordiredestino;

    if (this.data.isNew) {
       valueEstado = this.data.isNew ;
       valordireorigen = '';
       valordiredestino = '';
    } else {
      valordireorigen = item.origen.direccion;
      valordiredestino = item.destino.direccion;
      valueEstado = item.estado == 0? true : false ;
    }

    this.itemForm_ = this.fb.group({
      origen: [{value: item.origen || '', disabled: false}, Validators.required],
      destino: [{value: item.destino || '', disabled: false}, Validators.required],
      direOrigen: [{value: valordireorigen || '', disabled: true}],
      direDestino: [{value: valordiredestino || '', disabled: true}],
      importe: [{value: item.importe || '', disabled: false}, Validators.required],
      moneda: [{value: item.moneda || '', disabled: false}],
      notas: [{value: item.notas || '', disabled: false}],
      estado: [valueEstado ],
    });

  }

  cargaCombos() {

    // Combo de Monedas
    this.comboMonedas = this.tiposGenService.retornarMonedas();

    // Combo Factorias
    this.factoriaService.listarComboFactorias('O').subscribe(data_ => {
      this.comboFactorias = data_;
    });

  }

  seleccionarOrigen(event: any) {
    this.itemForm_.patchValue({
      direOrigen: event.value.direccion,
   });
  }

  seleccionarDestino(event: any) {
    this.itemForm_.patchValue({
      direDestino: event.value.direccion,
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
  get origen_ (): FormControl {
    return this.itemForm_.get('origen') as FormControl;
  }

  get destino_ (): FormControl {
    return this.itemForm_.get('destino') as FormControl;
  }

  get direOrigen_ (): FormControl {
    return this.itemForm_.get('direOrigen') as FormControl;
  }

  get direDestino_ (): FormControl {
    return this.itemForm_.get('direDestino') as FormControl;
  }

  get importe_ (): FormControl {
    return this.itemForm_.get('importe') as FormControl;
  }

  get moneda_ (): FormControl {
    return this.itemForm_.get('moneda') as FormControl;
  }

  get notas_ (): FormControl {
    return this.itemForm_.get('notas') as FormControl;
  }

  get estado_ (): FormControl {
    return this.itemForm_.get('estado') as FormControl;
  }

  submit() {
    if (!this.itemForm_.invalid) {
      this.itemTarifa = new TarifaRuta();
      this.itemTarifa.origen = this.origen_.value;
      this.itemTarifa.destino = this.destino_.value;
      this.itemTarifa.importe = this.importe_.value;
      this.itemTarifa.moneda = this.moneda_.value;
      this.itemTarifa.notas = this.notas_.value;
      this.itemTarifa.empresa = this.usuarioSession.empresa;
      let objTurno = new Turno();
      objTurno.id = 1;
      this.itemTarifa.turno = objTurno;
      this.itemTarifa.estado = this.estado_.value ? 0 : 1;

      if (this.data.isNew) {
        this.registrar();
      } else {
        this.actualizar();
      }

    }
  }

  registrar() {
    this.loader.open();
    this.tarifaRutaService.registrarTarifa(this.itemTarifa).subscribe((data_) => {
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
    this.itemTarifa.id = this.data.payload.id;
    this.loader.open();
    this.tarifaRutaService.actualizarTarifa(this.itemTarifa).subscribe((data_) => {
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
