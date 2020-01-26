import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { Usuario } from '../../../../shared/models/usuario.model';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { TipoIGV, TipoItem } from '../../../../shared/models/tipos_facturacion';
import { UnidadMedida } from '../../../../shared/models/unidad_medida.model';
import { DocumentoItem } from '../../../../shared/models/facturacion.model';
import { ErrorResponse, InfoResponse } from '../../../../shared/models/error_response.model';
import { Factoria } from '../../../../shared/models/factoria.model';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { UnidadMedidaService } from '../../../../shared/services/unidad-medida/unidad-medida.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { TiposGenericosService } from '../../../../shared/services/util/tiposGenericos.service';
import { GuiaRemisionService } from '../../../../shared/services/guias/guia-remision.service';
import { OrdenServicioService } from '../../../../shared/services/liquidacion/orden-servicio.service';
import { UsuarioService } from '../../../../shared/services/auth/usuario.service';
import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Producto } from '../../../../shared/models/producto.model';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../shared/helpers/date.adapter';
import { FactoriaService } from '../../../../shared/services/factorias/factoria.service';
import { GuiaRemision, EstadoGuia } from '../../../../shared/models/guia_remision.model';
import { throwError, Subject, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-factura-item-guias',
  templateUrl: './factura-item-guias.component.html',
  styleUrls: ['./factura-item-guias.component.scss'],
  providers: [
    {
        provide: DateAdapter, useClass: AppDateAdapter
    },
    {
        provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
    ]
})
export class FacturaItemGuiasComponent implements OnInit {

  rows = [];
  temp = [];
  selected = [];
  columns = [];
  usuarioSession: Usuario;
  listaItemsSelected = [];
  listaItems = [];


  // Ng Model
  formFilter: FormGroup;
  public comboTiposIGV: TipoIGV[]= [];
  public comboTiposItem: TipoItem[]= [];
  public comboUnidades: UnidadMedida[]= [];
  public comboFactorias: Factoria[] = [];
  public comboFactoriasDestino: Factoria[] = [];
  public itemFactura: DocumentoItem;
  public listaItemsFactura: DocumentoItem[] = [];
  public valorOrigenSelected_: any;
  public valorDestinoSelected_: any;

  protected _onDestroy = new Subject<void>();
  public factoriasOrigenFiltrados: ReplaySubject<Factoria[]> = new ReplaySubject<Factoria[]>(1);
  public factoriasDestinoFiltrados: ReplaySubject<Factoria[]> = new ReplaySubject<Factoria[]>(1);


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

  // Manejo de respuesta
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;


  constructor(
    @Inject(LOCALE_ID) private locale: string,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FacturaItemGuiasComponent>,
    private fb: FormBuilder,
    private userService: UsuarioService,
    private ordenServicioService: OrdenServicioService,
    private factoriaService: FactoriaService,
    private guiaRemisionService: GuiaRemisionService,
    private unidadMedidaService: UnidadMedidaService,
    private tiposGenService: TiposGenericosService,
    public snackBar: MatSnackBar,
    private loader: AppLoaderService) {
  }

  ngOnInit() {

    // Inicializa Formulario
    this.initForm();

    // Recupera datos de usuario de session
    this.usuarioSession = this.userService.getUserLoggedIn();

    this.factoriaService.listarComboFactorias('O').subscribe(data1 => {
      this.comboFactorias = data1;
      this.factoriasOrigenFiltrados.next(data1.slice());
      // listen for search field value changes
      this.formFilter.controls['filtroOrigen_'].valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filtrarFactoriaOrigen();
      });
    });

    this.factoriaService.listarComboFactorias('D').subscribe(data3 => {
      this.comboFactoriasDestino = data3;
      this.factoriasDestinoFiltrados.next(data3.slice());
      // listen for search field value changes
      this.formFilter.controls['filtroDestino_'].valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filtrarFactoriaDestino();
      });
    });

    this.unidadMedidaService.listarComboUnidadesMedida().subscribe(data3 => {
      this.comboUnidades = data3;
    });

  }

  initForm() {
    const fechaActual_ = new Date();
    let fechaIniTraslado_ = new Date();
    // fechaIniTraslado_.setDate((fechaIniTraslado_.getDate()) - 30);
    fechaIniTraslado_  =   new Date(fechaActual_.getFullYear(), fechaActual_.getMonth(), 1);


    this.formFilter = this.fb.group({
      serie_: ['', ],
      secuencia_: ['', ],
      serieCli_: ['', ],
      secuenciaCli_: ['', ],
      filtroOrigen: ['0', ],
      filtroOrigen_: ['', ],
      filtroDestino: ['0', ],
      filtroDestino_: ['', ],
      filtroFechaIni: new FormControl(fechaIniTraslado_, ),
      filtroFechaFin: new FormControl(fechaActual_, ),
    });
  }

  protected filtrarFactoriaOrigen() {
    if (!this.comboFactorias) {
      return;
    }
    // busca palabra clave
    let search = this.formFilter.controls['filtroOrigen_'].value;
    if (!search) {
      this.factoriasOrigenFiltrados.next(this.comboFactorias.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filtra
    this.factoriasOrigenFiltrados.next(
      this.comboFactorias.filter(factoria => factoria.refLarga2.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filtrarFactoriaDestino() {
    if (!this.comboFactoriasDestino) {
      return;
    }
    // busca palabra clave
    let search = this.formFilter.controls['filtroDestino_'].value;
    if (!search) {
      this.factoriasDestinoFiltrados.next(this.comboFactoriasDestino.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filtra
    this.factoriasDestinoFiltrados.next(
      this.comboFactoriasDestino.filter(factoria => factoria.refLarga2.toLowerCase().indexOf(search) > -1)
    );
  }



  buscar() {
    if (this.formFilter.controls['serie_'].value || this.formFilter.controls['secuencia_'].value) {
        this.buscarGuiasConFiltros();
    } else {
        if ( this.formFilter.controls['serieCli_'].value || this.formFilter.controls['secuenciaCli_'].value ) {
          this.buscarPorGuiaCliente();
        } else {
          this.buscarGuiasConFiltros();
        }
    }
  }

  buscarGuiasConFiltros() {
    this.loader.open();

    if (this.formFilter.get('serie_').value) {
      this.formFilter.controls['serie_'].setValue(this.pad(this.formFilter.get('serie_').value, 5));
    }

    if (this.formFilter.get('secuencia_').value) {
      this.formFilter.controls['secuencia_'].setValue(this.pad(this.formFilter.get('secuencia_').value, 8));
    }

    // Obtiene valores de parametros para la búsqueda
    const nroSerie  =  this.formFilter.controls['serie_'].value;
    const nroSecuencia  =  this.formFilter.controls['secuencia_'].value;
    const estado =  EstadoGuia.REGISTRADO; // en esta vista solo traer guias registradas mas no anuladas
    const chofer = 0; // no aplica
    const origen = this.formFilter.controls['filtroOrigen'].value;
    const destino = this.formFilter.controls['filtroDestino'].value;
    const formateo = false ; // sin formateo
    const guiasSinLiqFact = true;  // en esta pantalla solo mostrar guias pendientes de Liquidar y/o Facturar
    const soloFacturadas = false;   // no mostrar facturadas
    const fechaIni = formatDate(this.formFilter.controls['filtroFechaIni'].value, 'yyyy-MM-dd', this.locale);
    const fechaFin = formatDate(this.formFilter.controls['filtroFechaFin'].value, 'yyyy-MM-dd', this.locale);


    this.guiaRemisionService.listarGuiasConFiltros(this.usuarioSession.empresa.id,
                                                        nroSerie || '',
                                                        nroSecuencia || '',
                                                        estado, chofer,
                                                        origen, destino ,
                                                        formateo, guiasSinLiqFact, soloFacturadas,
                                                        fechaIni, fechaFin).subscribe(data_ => {
      this.rows = data_;
      this.loader.close();
    },
    (error: HttpErrorResponse) => {
      this.loader.close();
      this.rows = [];
      this.handleError(error);
    });

  }

  buscarPorGuiaCliente() {
    this.loader.open();
    if (this.formFilter.get('serieCli_').value) {
      this.formFilter.controls['serieCli_'].setValue(this.pad(this.formFilter.get('serieCli_').value, 5));
    }
    if (this.formFilter.get('secuenciaCli_').value) {
      this.formFilter.controls['secuenciaCli_'].setValue(this.pad(this.formFilter.get('secuenciaCli_').value, 8));
    }

    // Obtiene valores de parametros para la búsqueda
    const nroSerieCli  =  this.formFilter.controls['serieCli_'].value;
    const nroSecuenciaCli  =  this.formFilter.controls['secuenciaCli_'].value;
    const estado =  EstadoGuia.REGISTRADO; // no aplica
    const chofer = 0; // no aplica
    const origen = this.formFilter.controls['filtroOrigen'].value;
    const destino = this.formFilter.controls['filtroDestino'].value;
    const formateo = false ; // sin formateo
    const guiasSinLiqFact = true;  // en esta pantalla solo mostrar guias pendientes de Liquidar y/o Facturar
    const soloFacturadas = false;   // no mostrar facturadas
    const fechaIni = formatDate(this.formFilter.controls['filtroFechaIni'].value, 'yyyy-MM-dd', this.locale);
    const fechaFin = formatDate(this.formFilter.controls['filtroFechaFin'].value, 'yyyy-MM-dd', this.locale);

    this.guiaRemisionService.listarGuiasPorGuiaCliente(this.usuarioSession.empresa.id,
                                                        nroSerieCli || '',
                                                        nroSecuenciaCli || '',
                                                        estado,
                                                        chofer,
                                                        origen,
                                                        destino,
                                                        formateo,
                                                        guiasSinLiqFact,
                                                        soloFacturadas,
                                                        fechaIni, fechaFin).subscribe(data_ => {
      this.rows = data_;
      this.loader.close();
    },
    (error: HttpErrorResponse) => {
      this.loader.close();
      this.rows = [];
      this.handleError(error);
    });

  }
  buscarGuiasPorFacturar() {
    this.listaItemsSelected = [];
    this.selected = [];
    const origen = this.formFilter.controls['filtroOrigen'].value || 0;
    const destino = this.formFilter.controls['filtroDestino'].value || 0;
    const fechaIni = formatDate(this.formFilter.controls['filtroFechaIni'].value, 'yyyy-MM-dd', this.locale);
    const fechaFin = formatDate(this.formFilter.controls['filtroFechaFin'].value, 'yyyy-MM-dd', this.locale);

    this.guiaRemisionService.listarGuiasRemisionPorFacturar(this.usuarioSession.empresa.id,
                                origen,
                                destino,
                                fechaIni,
                                fechaFin).subscribe(data_ => {
      this.rows = data_;
      this.loader.close();
    },
    (error: HttpErrorResponse) => {
      this.handleError(error);
    });

  }

  pad(number: string, length: number): string {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
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

  // Completar Zeros
  completarZerosNroSerie(event) {
    const valorDigitado = event.target.value.toLowerCase();
    if (!(valorDigitado === '')) {
      this.formFilter.patchValue({
        serie_: this.pad(valorDigitado, 5),
      });
    };
  }

  // Completar Zeros
  completarZerosNroSecuencia(event) {
    const valorDigitado = event.target.value.toLowerCase();
    if (!(valorDigitado === '')) {
      this.formFilter.patchValue({
        secuencia_: this.pad(valorDigitado, 8),
      });
    };
  }

  // Completar Zeros
  completarZerosNroSerieCli(event) {
    const valorDigitado = event.target.value.toLowerCase();
    if (!(valorDigitado === '')) {
      this.formFilter.patchValue({
        serieCli_: this.pad(valorDigitado, 5),
      });
    }
  }

  // Completar Zeros
  completarZerosNroSecuenciaCli(event) {
    const valorDigitado = event.target.value.toLowerCase();
    if (!(valorDigitado === '')) {
      this.formFilter.patchValue({
        secuenciaCli_: this.pad(valorDigitado, 8),
      });
    }
  }

  calcularFechaHora(fecha: Date): Date {
      const fechaLocal = fecha.toLocaleDateString();  // fecha local
      const fechFormt = fechaLocal.split('/').reverse().join('-');  // fecha en formato YYYY-mm-DDD
      return new Date(fechFormt);
  }


  compareObjects(o1: any, o2: any): boolean {
    return o1.codigo === o2.codigo && o1.id === o2.id;
  }

  onSelect({ selected }) {
    this.listaItemsSelected = selected;
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  submit() {

    // Tipos de Afectación IGV
    this.comboTiposIGV = this.tiposGenService.retornarTiposIGV();
    this.comboTiposItem = this.tiposGenService.retornarTiposItemFactura();

    //
    this.listaItemsSelected.forEach(element => {
     let item: DocumentoItem = new DocumentoItem();
     item.idRelated = element.id;   // pasa el id de la Guia al id related del DocumentoItem
     item.codigo = element.serie + '-' + element.secuencia;
     item.descripcion = element.guiaDetalle[0].producto.nombre ;
     item.cantidad = element.totalCantidad;
     item.descuentos = 0.00;
     item.factorDescuento = 0;
     item.productos = element.guiaDetalle[0].producto;
     item.subTotal = element.totalCantidad * element.tarifa;
     item.tipoDescuento = 0;
     item.valorIGV = 0.18 * (item.subTotal); // CALCULAR
     item.valorISC = 0.00;
     item.tipoIGV = 1;  // VALOR POR DEFECTO : 10-OPERACION ONEROSA
     item.tipo = this.comboTiposItem[0].id; // VALOR POR DEFECTO
     item.total = element.totalCantidad * element.tarifa;  // CALCULAR
     item.unidadMedida = this.comboUnidades[0]; // VALOR POR DEFECTO
     item.tarifa = element.tarifa;
     this.itemFactura = item;
     this.listaItemsFactura.push(this.itemFactura);
    });
    this.dialogRef.close(this.listaItemsFactura);
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
      if (error.error.codeMessage != null ) {
        this.errorResponse_ = error.error;
        this.snackBar.open(this.errorResponse_.errorMessage, 'OK', { duration: 5000 });
      } else {
        this.snackBar.open('Error de comunicación con los servicios. Intenta nuevamente.', 'OK',
                         { duration: 5000 , verticalPosition: 'top', horizontalPosition: 'end'});
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
