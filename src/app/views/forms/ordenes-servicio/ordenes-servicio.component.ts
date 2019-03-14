import { OrdenServicio } from '../../../shared/models/orden-servicio';
import { UsuarioService } from '../../../shared/services/auth/usuario.service';
import { ClienteService } from '../../../shared/services/facturacion/cliente.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, DateAdapter, MAT_DATE_FORMATS, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { FormaPago, Moneda } from '../../../shared/models/tipos_facturacion';
import { Cliente } from '../../../shared/models/cliente.model';
import { TiposGenericosService } from '../../../shared/services/util/tiposGenericos.service';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../shared/helpers/date.adapter';
import { Usuario } from '../../../shared/models/usuario.model';
import { isThisMonth } from 'date-fns';
import { ImpuestoService } from '../../../shared/services/liquidacion/impuesto.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { OrdenServicioService } from '../../../shared/services/liquidacion/orden-servicio.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse, InfoResponse } from '../../../shared/models/error_response.model';
import { throwError } from 'rxjs/internal/observable/throwError';

@Component({
  selector: 'app-ordenes-servicio',
  templateUrl: './ordenes-servicio.component.html',
  styleUrls: ['./ordenes-servicio.component.scss'],
  providers: [
    {
        provide: DateAdapter, useClass: AppDateAdapter
    },
    {
        provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
    ]
})
export class OrdenesServicioComponent implements OnInit {

  public ordenServicioForm: FormGroup;

  rows = [];
  temp = [];
  columns = [];
  usuarioSession: Usuario;
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;

  // Totales
  subTotal: number;
  descuentos: number;
  valorCompra: number;
  valorIGV: number;
  totalImporte: number;
  public IGV_DEFAULT: number;

  //
  totalCantidad: number;
  ordenServicioModel: OrdenServicio;

  // Manejo default de mensajes en grilla
  messages: any = {
      // Message to show when array is presented
      // but contains no values
      emptyMessage: '-',

      // Footer total message
      totalMessage: 'total',

      // Footer selected message
      selectedMessage: 'seleccionado'
  };

  // Valores de Combo de Formulario
  public comboFormasPago: FormaPago[];
  public comboMonedas: Moneda[];
  public comboClientes: Cliente[];
  public comboEstados = [
    { id: 1, codigo: '001' , descripcion: 'Abierto' },
    { id: 2, codigo: '002' , descripcion: 'Procesado' },
    { id: 3, codigo: '003' , descripcion: 'Observado'},
    { id: 4, codigo: '004' , descripcion: 'Anulado'},
  ];


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<OrdenesServicioComponent>,
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private tiposGenService: TiposGenericosService,
    private userService: UsuarioService,
    private impuestoService: ImpuestoService,
    private loader: AppLoaderService,
    private confirmService: AppConfirmService,
    private ordenServicioService: OrdenServicioService,
    public snackBar: MatSnackBar,
  ) {

    // Obtiene % impuesto I.G.V - 1
    this.impuestoService.obtenerValorImpuesto(1).subscribe(data2 => {
      this.IGV_DEFAULT = data2.valor;
    });

  }

  ngOnInit() {

    // Recupera datos de usuario de session
    this.usuarioSession = this.userService.getUserLoggedIn();


    this.ordenServicioForm = this.fb.group({
      nroOrdenServicio: ['', [Validators.minLength(8),
                              Validators.maxLength(12),
                              Validators.required]],
      estadoOrden: [''],
      cliente: [{value: '', disabled: true}, [Validators.required]],
      glosa: [''],
      formaPago: [''],
      fechaOrden: [ ,
        [ Validators.minLength(10),
          Validators.maxLength(10),
          Validators.required,
          CustomValidators.date
        ]
      ],
      fechaAprobacion: [ '' ,
        [ Validators.minLength(10),
          Validators.maxLength(10),
          CustomValidators.date
        ]
      ],
      fechaVencimiento: [ '' ,
      [ Validators.minLength(10),
        Validators.maxLength(10),
        CustomValidators.date
      ]
    ],
      moneda: [''],
      subTotal: [{value: '0.00', disabled: true}],
      descuento: [{value: '0.00', disabled: true}],
      valorCompra: [{value: '0.00', disabled: true}],
      valorIGV: [{value: '0.00', disabled: true}],
      totalImporte: [{value: '0.00', disabled: true}],
    });

    // Carga Valores de Formulario
    this.cargarValoresFormulario();

  }

  cargarValoresFormulario() {
    this.cargarCombos();
    this.ordenServicioForm.patchValue({
      fechaOrden: new Date(),
      estadoOrden: this.comboEstados[0],
      formaPago: this.comboFormasPago[0],
      cliente: this.rows[0].origen.cliente,
      moneda: this.comboMonedas[0],
      subTotal: this.subTotal,
      descuento: this.descuentos ,
      valorCompra: this.valorCompra,
      valorIGV: this.valorIGV,
      totalImporte: this.totalImporte,
    });
  }


   /**
   * Carga Todos los valores de los combos de la página
   */
  cargarCombos() {

    // Payload con las liquidaciones
    this.rows = this.data.payload;

    // Combo Clientes
    this.clienteService.listarClientesPorEmpresa(this.usuarioSession.empresa.id).subscribe(dataClientes => {
      this.comboClientes = dataClientes;
    });

    // Combo Formas de Pago
    this.comboFormasPago = this.tiposGenService.retornarFormasPago();

    // Combo Monedas
    this.comboMonedas = this.tiposGenService.retornarMonedas();

    // Totales
    this.totalCantidad = this.rows.map(t => t.totalCantidad).reduce((acc, value) => acc + value, 0);
    this.subTotal = this.rows.map(t => t.importeTotal).reduce((acc, value) => acc + value, 0);
    this.descuentos = 0.00;
    this.valorCompra = this.subTotal - this.descuentos;
    this.valorIGV = 0.18 * this.valorCompra;
    this.totalImporte = this.valorCompra + this.valorIGV;

  }

  grabarOrdenServicio(model: any, isValid: boolean, e: Event) {
    this.loader.open();

    if (this.ordenServicioForm.invalid) {
      console.log('hay errores aun');
      this.loader.close();
    } else {
      this.confirmService.confirm({message: `Confirma grabar la orden de servicio: ${this.nroOrdenServicio_.value}?`})
      .subscribe(res => {
        if (res) { // OK
          this.ordenServicioModel = new OrdenServicio();
          this.ordenServicioModel.tipocod = 'LST';
          this.ordenServicioModel.nroOrden = this.nroOrdenServicio_.value;
          this.ordenServicioModel.fechaOrden = this.fechaOrden_.value;
          this.ordenServicioModel.fechaVencimiento = this.fechaVencimiento_.value;
          this.ordenServicioModel.fechaAprobacion = this.fechaAprobacion_.value;
          this.ordenServicioModel.situacion = this.estadoOrden_.value.id;
          this.ordenServicioModel.moneda = this.moneda_.value;
          this.ordenServicioModel.formaPago = this.formaPago_.value;
          this.ordenServicioModel.cliente = this.cliente_.value;
          this.ordenServicioModel.glosa = this.glosa_.value;
          this.ordenServicioModel.totalCantidad = this.totalCantidad;
          this.ordenServicioModel.subTotal = this.subTotal;
          this.ordenServicioModel.descuentos = this.descuentos;
          this.ordenServicioModel.valorCompra = this.valorCompra;
          this.ordenServicioModel.igvAplicado = this.valorIGV;
          this.ordenServicioModel.importeTotal = this.totalImporte;
          this.ordenServicioModel.empresa = this.usuarioSession.empresa;
          this.ordenServicioModel.usuarioRegistro = this.usuarioSession.codigo ;
          this.ordenServicioModel.usuarioActualiza = this.usuarioSession.codigo ;
          this.ordenServicioModel.liquidaciones = this.rows;
          this.grabar();

        } else {// Cancelar
          this.loader.close();
        }
      });
    }
  }


  grabar() {
    this.ordenServicioService.registrarOrdenServicioBD(this.ordenServicioModel, this.usuarioSession.empresa.id ).subscribe((data_) => {
      this.infoResponse_ = data_;
      this.loader.close();
      this.snackBar.open(this.infoResponse_.alertMessage, 'OK', { duration: 2000 });

      // Resetea Formulario
      this.snackBar._openedSnackBarRef.afterDismissed().subscribe(() => {
        this.dialogRef.close(this.ordenServicioForm.value);
      });
    },
    (error: HttpErrorResponse) => {
      this.handleError(error);
    });

  }


   /**
   * Getters de campos de formulario
   */
  get nroOrdenServicio_ (): FormControl {
    return this.ordenServicioForm.get('nroOrdenServicio') as FormControl;
  }

  get estadoOrden_ (): FormControl {
    return this.ordenServicioForm.get('estadoOrden') as FormControl;
  }

  get cliente_ (): FormControl {
    return this.ordenServicioForm.get('cliente') as FormControl;
  }

  get glosa_ (): FormControl {
    return this.ordenServicioForm.get('glosa') as FormControl;
  }

  get formaPago_ (): FormControl {
    return this.ordenServicioForm.get('formaPago') as FormControl;
  }

  get fechaOrden_ (): FormControl {
    return this.ordenServicioForm.get('fechaOrden') as FormControl;
  }

  get fechaAprobacion_ (): FormControl {
    return this.ordenServicioForm.get('fechaAprobacion') as FormControl;
  }

  get fechaVencimiento_ (): FormControl {
    return this.ordenServicioForm.get('fechaVencimiento') as FormControl;
  }

  get moneda_ (): FormControl {
    return this.ordenServicioForm.get('moneda') as FormControl;
  }

  get subTotal_ (): FormControl {
    return this.ordenServicioForm.get('subTotal') as FormControl;
  }

  get descuento_ (): FormControl {
    return this.ordenServicioForm.get('descuento') as FormControl;
  }

  get valorCompra_ (): FormControl {
    return this.ordenServicioForm.get('valorCompra') as FormControl;
  }

  get valorIGV_ (): FormControl {
    return this.ordenServicioForm.get('valorIGV') as FormControl;
  }

  get totalImporte_ (): FormControl {
    return this.ordenServicioForm.get('totalImporte') as FormControl;
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1.name === o2.name && o1.id === o2.id;
  }


  private handleError(error: HttpErrorResponse) {

    this.loader.close();
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      // this.errorResponse_ = error.error;
      this.snackBar.open(this.errorResponse_.errorMessage, 'OK', { duration: 5000 });
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      this.snackBar.open('Ocurrió un error inesperado!!, intenta nuevamente.', 'OK', { duration: 5000 });
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Ocurrió un error inesperado, volver a intentar.');
  };

}
