import { Documento } from './../../../shared/models/facturacion.model';
import { Component, OnInit, Inject, LOCALE_ID, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { TipoDocumento, TipoOperacion, FormaPago, Moneda, TipoIGV } from '../../../shared/models/tipos_facturacion';
import { ClienteService } from '../../../shared/services/facturacion/cliente.service';
import { Cliente } from '../../../shared/models/cliente.model';
import { TiposGenericosService } from '../../../shared/services/util/tiposGenericos.service';
import { DateAdapter, MAT_DATE_FORMATS, MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../shared/helpers/date.adapter';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { FacturaPopUpComponent } from './factura-pop-up/factura-pop-up.component';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { FacturaItemComponent } from './factura-item/factura-item.component';
import { Usuario } from '../../../shared/models/usuario.model';
import { UsuarioService } from '../../../shared/services/auth/usuario.service';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs/internal/observable/throwError';
import { ErrorResponse, InfoResponse } from '../../../shared/models/error_response.model';
import { FacturaItemGuiasComponent } from './factura-item-guias/factura-item-guias.component';
import { DocumentoItem, EstadoDocumento } from '../../../shared/models/facturacion.model';
import { ItemFacturaService } from '../../../shared/services/facturacion/item-factura.service';
import { GuiaRemision } from 'app/shared/models/guia_remision.model';
import { Router, ActivatedRoute } from '@angular/router';
import { Liquidacion } from '../../../shared/models/liquidacion.model';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subscription } from 'rxjs';
import { getDay } from 'date-fns';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css'],
  providers: [
    {
        provide: DateAdapter, useClass: AppDateAdapter
    },
    {
        provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    },
    ],
})
export class WizardComponent implements OnInit, OnDestroy {

  @ViewChild(DatatableComponent) table: DatatableComponent;

  // Formulario
  facturaForm: FormGroup;
  totalSum: number;

  // Totales
  simbolo: string;
  subTotal: number;
  anticipos: number;
  descuentos: number;
  valorVenta: number;
  valorIGV: number;
  otrosCargos: number;
  otrosTributos: number;
  importeTotal: number;


  esNuevo: boolean = true;
  nroSerieQuery: string;
  nroSecuenciaQuery: string;
  tipoDocumentoQuery: number;

  edicion: boolean = true;
  conGuiaRemision_: boolean = false;
  conLiquidaciones_: boolean = false;
  idDocumento: number;
  subTipoFactura: string;


  // Grilla Detalle de Factura
 // rows = [];
  temp = [];
  rows =  [];
  rows_guias =  [];
  columns = [];
  panelOpenState = true;
  usuarioSession: Usuario;
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;
  step = 0;

  liquidaciones_ = [];
  guias_remision = [];

  // Manejo default de mensajes en grilla
    messages: any = {
      // Message to show when array is presented
      // but contains no values
      emptyMessage: '-',

      // Footer total message
      totalMessage: 'total',

      // Footer selected message
      selectedMessage: 'selected'
  };

  // Valores de Combo de Formulario
  public comboTiposDocumento: TipoDocumento[];
  public comboTiposOperacion: TipoOperacion[];
  public comboFormasPago: FormaPago[];
  public comboMonedas: Moneda[];
  public comboTiposIGV: TipoIGV[];
  public comboClientes: Cliente[];
  public facturaDocumento: Documento;
  public listaItemsFactura: DocumentoItem[] = [];

  private itemSub: Subscription;
  private clienteSub: Subscription;
  private doumentoSub: Subscription;

  public comboEstadosFactura = [
    { id: 1, codigo: '001' , descripcion: 'Registrado' },
    { id: 2, codigo: '002' , descripcion: 'Cancelado'},
    { id: 3, codigo: '003' , descripcion: 'Anulado'},

    // { id: 3, codigo: '003' , descripcion: 'Enviado y Aceptado SUNAT'},
    // { id: 4, codigo: '004' , descripcion: 'Observada SUNAT'},
    // { id: 5, codigo: '005' , descripcion: 'Anulada'},
  ];



  constructor(
              @Inject(LOCALE_ID) private locale: string,
              private formBuilder: FormBuilder,
              private tiposGenService: TiposGenericosService,
              private loader: AppLoaderService,
              private dialog: MatDialog,
              private confirmService: AppConfirmService,
              private itemFacturaService: ItemFacturaService,
              private route: ActivatedRoute,
              private router: Router,
              private snack: MatSnackBar,
              private cdRef: ChangeDetectorRef,
              private userService: UsuarioService,
              private clienteService: ClienteService) {

    this.validarGrabarActualizar();

  }

  ngOnInit() {
    this.facturaForm = this.formBuilder.group({
      cliente: ['', [Validators.required]],
      direccion: new FormControl({value: '', disabled: true}, ),
      tipoDocumento: [{value: '', disabled: true}],
      serieDocumento: ['E001', [Validators.required]],
      numeroDocumento: ['', [Validators.required]],
      tipoOperacion: [''],
      tipoAfectacionIGV: [''],
      formaPago: [''],
      fechaEmision: [ '' ,
        [ Validators.minLength(10),
          Validators.maxLength(10),
          Validators.required,
          CustomValidators.date
        ]
      ],
      fechaVencimiento: [ '' ,
        [ Validators.minLength(10),
          Validators.maxLength(10),
          CustomValidators.date
        ]
      ],
      estado: [{value: '', disabled: false}],
      observacion: [''],
      ordenServicio: [{value: '', disabled: false}],
      moneda: [''],
      conOrdenServicio: [''],
      conGuiaRemision: [''],
    });


    if (this.edicion) {
      this.cargarCombos();
      this.recuperarDocumentoBD();

    } else {
      // Carga Valores de Formulario Default
      this.cargarValoresFormulario();

      // Carga valores de Totales Default
      this.cargaValoresTotales();
    }


  }

  ngOnDestroy(): void {
    if (this.itemSub) {
      this.itemSub.unsubscribe();
    }
    if (this.clienteSub) {
      this.clienteSub.unsubscribe();
    }
    if (this.doumentoSub) {
      this.doumentoSub.unsubscribe();
    }
  }

  cargarValoresFormulario() {
    this.cargarCombos();
    this.facturaForm.patchValue({
      fechaEmision: new Date(),
      estado: this.comboEstadosFactura[0],
      tipoDocumento: this.comboTiposDocumento[0],
      formaPago: this.comboFormasPago[0],
      tipoOperacion: this.comboTiposOperacion[0],
      tipoAfectacionIGV: this.comboTiposIGV[0],
      moneda: this.comboMonedas[0],
    });
  }

  cargaValoresTotales() {
    this.totalSum = 0.00;
    this.simbolo = 'S/';
    this.subTotal = 0.00;
    this.anticipos = 0.00;
    this.descuentos = 0.00;
    this.valorVenta = 0.00;
    this.valorIGV = 0.00;
    this.otrosCargos = 0.00;
    this.otrosTributos = 0.00;
    this.importeTotal = 0.00;
  }


  validarGrabarActualizar() {
    this.itemSub = this.route.queryParams.subscribe(params => {
        this.nroSerieQuery = params.serie;
        this.nroSecuenciaQuery =  params.secuencia;
        this.tipoDocumentoQuery =  params.tipoDoc;
        this.edicion = (this.nroSerieQuery) != null ;
      }
    );
  }

  selecccionarSimbolo() {
      this.simbolo = (this.moneda.value as Moneda).nemonico;
  }

  get moneda (): FormControl {
    return this.facturaForm.get('moneda') as FormControl;
  }

  getHeight(row: any, index: number): number {
    return row.someHeight;
  }

    /**
   * Carga Todos los valores de los combos de la página
   */
  cargarCombos() {

    // Recupera datos de usuario de session
    this.usuarioSession = this.userService.getUserLoggedIn();

    // Combo Clientes
    this.clienteSub = this.clienteService.listarClientesPorEmpresa(1).subscribe(dataClientes => {
      this.comboClientes = dataClientes;
    });


    // Combo Tipos Documento
    this.comboTiposDocumento = this.tiposGenService.retornarTiposDocumento();

    // Combo Tipos de Operacion
    this.comboTiposOperacion = this.tiposGenService.retornarTiposOperacion();

    // Combo Formas de Pago
    this.comboFormasPago = this.tiposGenService.retornarFormasPago();

    // Combo Monedas
    this.comboMonedas = this.tiposGenService.retornarMonedas();

    // Combo Tipos de Afectación IGV
    this.comboTiposIGV = this.tiposGenService.retornarTiposIGV();

  }

    // Obtiene datos de base de datos
    recuperarDocumentoBD()  {
      this.doumentoSub = this.itemFacturaService.obtenerDocumentPorSerie(this.usuarioSession.empresa.id,
                                                      this.tipoDocumentoQuery,
                                                      this.nroSerieQuery,
                                                      this.nroSecuenciaQuery).subscribe((documento) => {
        // Id de base de datos
        this.idDocumento = documento.id;

        // Completa valores de formulario cabecerea
        this.facturaForm.patchValue({
          tipoDocumento: this.comboTiposDocumento[0],
          serieDocumento: documento.serie,
          numeroDocumento: documento.secuencia,
          fechaEmision: this.calcularFechaHoraLocal(documento.fechaEmision) || '',
          fechaVencimiento: this.calcularFechaHoraLocal(documento.fechaVencimiento) || '',
          estado: this.comboEstadosFactura.find(o => o.id === documento.estado),
          tipoOperacion: this.comboTiposOperacion.find(o => o.id === documento.tipoOperacion),
          moneda: this.comboMonedas.find(o => o.id === documento.moneda.id),
          formaPago: this.comboFormasPago.find(o => o.id === documento.formaPago.id),
          tipoAfectacionIGV: this.comboTiposIGV.find(o => o.id === documento.tipoAfectacion),
          cliente: this.comboClientes.find(o => o.id === documento.cliente.id),
          direccion: documento.cliente.direccion,
          observacion: documento.observacion,
          ordenServicio: documento.nroOrden || ''
        });

        // Simbolo de Moneda
        this.simbolo = this.comboMonedas.find(o => o.id === documento.moneda.id).nemonico || 'S/';

        // 1: item por defecto , 2: Orden Servicio, 3: Guia Remisión
        this.subTipoFactura = documento.notas;
        this.liquidaciones_ = documento.liquidaciones;
        this.guias_remision = documento.guiasRemision;

        if (this.liquidaciones_.length > 0) {
          this.conLiquidaciones_  = true;
          let i = 0;
          documento.liquidaciones.forEach(element => {
            documento.documentoitemSet[i].guiasRemision = element.guias;
            documento.documentoitemSet[i].idRelated = element.id;  // pasa el id real de la liquidacion
            i++;
          });
        }

        if (this.guias_remision.length > 0) {
          this.conGuiaRemision_  = true;
          let i = 0;
          documento.guiasRemision.forEach(element => {
            documento.documentoitemSet[i].idRelated = element.id;  // pasa el id real de la guia de remision
            i++;
          });
        }

        // Completa items: documento.liquidaciones.guias[0]
        this.rows = documento.documentoitemSet;

         // Completa totales
         this.totalSum = documento.subTotalVentas;
         this.subTotal = documento.subTotalVentas;
         this.anticipos = documento.anticipos;
         this.descuentos = documento.descuentos;
         this.valorVenta = 0.00;
         this.valorIGV = documento.igv;
         this.otrosCargos = documento.otrosCargos;
         this.otrosTributos = documento.otrosTributos;
         this.importeTotal = documento.totalDocumento;

      }, (error: HttpErrorResponse) => {
        this.handleError(error);
      });
    }




  getControls(frmGrp: FormGroup, key: string) {
    return (<FormArray>frmGrp.controls[key]).controls;
  }


   /**
   * Completar Campo Dirección
   */
  seleccionarCliente(event: any) {
    this.facturaForm.patchValue({
      direccion: event.value.direccion,
    });
  }


  /**
   * Abre Pop-up para Añadir/Actualiza item
   */
  buscarItem(data: any = {}, isNew?) {
    if (this.conLiquidaciones_) {
      this.buscarLiquidacionItem(data, isNew);
    } else {
      if (this.conGuiaRemision_) {
        this.buscarGuiaRemisionItem(data, isNew);
      } else {
        // Item por Defecto
        let title = isNew ? 'Añadir Item' : 'Actualizar Item';
        let dialogRef: MatDialogRef<any> = this.dialog.open(FacturaItemComponent, {
          width: '740px',
          // height: '580px',
          disableClose: true,
          data: { title: title, payload: data }
        });

        dialogRef.afterClosed()
          .subscribe(item => {
            if (!item) {
              // If user press cancel
              return;
            }
            if (isNew) {
              let rowData = { ...item };
              this.rows.splice(this.rows.length, 0, rowData);
              this.rows = [...this.rows];
              this.actualizaTotales();
              this.snack.open('Item añadido!!', 'OK', { duration: 1000 });
              this.subTipoFactura = '1';
            } else {

              this.rows = this.rows.map(element => {
                if (element.id === data.id) {
                  return Object.assign({}, element, item);
                }
                return element;
              });
              this.actualizaTotales();
              this.snack.open('Item actualizado!!', 'OK', { duration: 1000 });
            }
          });
      }
    }
  }

  /**
   * Abre Pop-up para Añadir Guia de Remisión
   */
  buscarGuiaRemisionItem(data3: any = {}, isNew?) {
    let title2 = isNew ? 'Seleccionar Guia de Remisión' : 'Actualizar Item';
    let dialogRef2: MatDialogRef<any> = this.dialog.open(FacturaItemGuiasComponent, {
        width: '1240px',
       // height: '580px',
        disableClose: true,
        data: { title: title2, payload: data3 }
      });

    dialogRef2.afterClosed()
      .subscribe(item => {
        if (!item) {
          // If user press cancel
          return;
        }

        if (isNew) {
          item.forEach(element => {
            let rowData = { ...element};
            this.rows.splice(this.rows.length, 0, rowData);
            this.rows = [...this.rows];
            this.actualizaTotales();
          });
          this.snack.open(item.length + ' Item(s) añadido(s)!!', 'OK', { duration: 1000 });
          this.subTipoFactura = '3';
        } else {

          this.rows = this.rows.map(element => {
            if (element.id === data3.id) {
              return Object.assign({}, element, item);
            }
            return element;
          });
          this.actualizaTotales();
          this.snack.open('Item actualizado!!', 'OK', { duration: 1000 });
        }
      });
  }


 /**
   * Abre Pop-up para Añadir Liquidación
   */
  buscarLiquidacionItem(data2: any = {}, isNew?) {
    let title2 = isNew ? 'Seleccionar Liquidación' : 'Actualizar Item';
    let dialogRef2: MatDialogRef<any> = this.dialog.open(FacturaPopUpComponent, {
        width: '1080px',
       // height: '580px',
        disableClose: true,
        data: { title: title2, payload: data2 }
      });

    dialogRef2.afterClosed()
      .subscribe(item => {
        if (!item) {
          // If user press cancel
          return;
        }
        if (isNew) {
          item.forEach(element => {
            let rowData = { ...element};
            this.rows.splice(this.rows.length, 0, rowData);
            this.rows = [...this.rows];
            this.actualizaTotales();
          });
          this.snack.open(item.length + ' Item(s) añadido(s)!!', 'OK', { duration: 1000 });
          this.subTipoFactura = '2';
        } else {

          this.rows = this.rows.map(element => {
            if (element.id === data2.id) {
              return Object.assign({}, element, item);
            }
            return element;
          });
          this.actualizaTotales();
          this.snack.open('Item actualizado!!', 'OK', { duration: 1000 });
        }
      });
  }


  /**
 * Abre Pop-up para edición de item
 */
  editarItem(data: any = {}) {
    let title = 'Actualizar Item';
    let dialogRef: MatDialogRef<any> = this.dialog.open(FacturaItemComponent, {
      width: '740px',
      disableClose: true,
      data: { title: title, payload: data }
    });
    dialogRef.afterClosed()
      .subscribe(itemActualizado => {
        if (!itemActualizado) {
          // If user press cancel
          return;
        }

        this.rows = this.rows.map(element => {
          if (element.id === data.id) {
            return Object.assign({}, element, itemActualizado);
          }
          return element;
        });
        this.actualizaTotales();
        this.snack.open('Item actualizado!!', 'OK', { duration: 1000 });

      });
  }

    /**
   * Elimina item de grilla
   */
  eliminarItem(row: any , rowindex) {
    this.confirmService.confirm({message: `Descartar item N° ${rowindex + 1} ?`})
      .subscribe(res => {
        if (res) {
          let i = this.rows.indexOf(row);
          this.rows.splice(i, 1);
          this.actualizaTotales();
          this.snack.open('Item eliminado!', 'OK', { duration: 1000 });
        }
      });
  }

  onDetailToggle(event) {
    // console.log('Detail Toggled', event);
  }

  toggleExpandRow(row) {
    this.table.rowDetail.toggleExpandRow(row);
  }


  grabarFormulario(model: any, isValid: boolean, e: Event) {
    this.loader.open();
    if (this.rows.length === 0) {
        this.snack.open('Debe añadir al menos un item para el documento', 'OK', { duration: 2000 });
        this.loader.close();
    } else {
      if (!this.facturaForm.invalid) {
        this.facturaDocumento = new Documento();
        this.liquidaciones_ = [];
        this.guias_remision = [];
        this.facturaDocumento.tipoDocumento = this.facturaForm.controls['tipoDocumento'].value.id;
        this.facturaDocumento.serie = this.facturaForm.controls['serieDocumento'].value;
        this.facturaDocumento.secuencia = this.facturaForm.controls['numeroDocumento'].value;

        const fe = new Date(this.facturaForm.controls['fechaEmision'].value);
        // fe.setTime(fe.getTime() + fe.getTimezoneOffset() * 60 * 1000);
        this.facturaDocumento.fechaEmision = this.calcularFechaHora(fe);

        // this.facturaDocumento.fechaEmision = this.calcularFechaHora(fe);

        if (this.facturaForm.controls['fechaVencimiento'].value) {
          const fv = new Date(this.facturaForm.controls['fechaVencimiento'].value);
          //  fv.setTime(fv.getTime() + fv.getTimezoneOffset() * 60 * 1000);
          this.facturaDocumento.fechaVencimiento = this.calcularFechaHora(fv);
          // this.facturaDocumento.fechaVencimiento = fv;
        }

        // this.facturaDocumento.fechaVencimiento = this.calcularFechaHora(fv);

        this.facturaDocumento.nroOrden = this.facturaForm.controls['ordenServicio'].value;
        this.facturaDocumento.estado = this.facturaForm.controls['estado'].value.id;
        this.facturaDocumento.observacion = this.facturaForm.controls['observacion'].value;
        this.facturaDocumento.tipoOperacion = this.facturaForm.controls['tipoOperacion'].value.id;
        this.facturaDocumento.moneda = this.facturaForm.controls['moneda'].value;
        this.facturaDocumento.formaPago = this.facturaForm.controls['formaPago'].value;
        this.facturaDocumento.cliente = this.facturaForm.controls['cliente'].value;
        this.facturaDocumento.notas = this.subTipoFactura; // 1: item por defecto , 2: Orden Servicio, 3: Guia Remisión
        this.facturaDocumento.tipoAfectacion = 1;  // 10-Operación Gravada.
        this.facturaDocumento.anticipos = this.anticipos;
        this.facturaDocumento.descuentos = this.descuentos;
        this.facturaDocumento.empresa = this.usuarioSession.empresa;
        this.facturaDocumento.envioSunat = 0; // 0 : Documento No enviado, 1: Documento Enviado a SUNAT
        this.facturaDocumento.estadoEnvioSunat = 0;
        this.facturaDocumento.igv = this.valorIGV;
        this.facturaDocumento.isc = this.otrosTributos;
        this.facturaDocumento.otrosCargos = this.otrosCargos;
        this.facturaDocumento.otrosTributos = this.otrosTributos;
        this.facturaDocumento.subTotalVentas = this.totalSum;
        this.facturaDocumento.totalDocumento = this.importeTotal;
        this.facturaDocumento.ventaTotal = this.importeTotal;

        this.rows.forEach(element => {
           const liquidacion: Liquidacion = new Liquidacion();
           const guia: GuiaRemision = new GuiaRemision();
           if (this.subTipoFactura === '2') {
             // liquidacion.id = element.id;
             liquidacion.id = element.idRelated;

             this.liquidaciones_.push(liquidacion);
           } else if (this.subTipoFactura === '3') {
             // guia.id = element.id;
             guia.id = element.idRelated;
             this.guias_remision.push(guia);
           }
        });

        this.facturaDocumento.liquidaciones = this.liquidaciones_;
        this.facturaDocumento.guiasRemision = this.guias_remision;

        this.facturaDocumento.documentoitemSet = this.rows.map(item => {
             if (!this.edicion) {
               delete item.id;
              }
             return item;
         });

        this.facturaDocumento.usuarioRegistro = this.usuarioSession.codigo;
        this.facturaDocumento.usuarioActualiza = this.usuarioSession.codigo;
        // console.log('Form data are: ' + JSON.stringify(this.facturaDocumento));


       if (!this.edicion) {
         this.registrar();
       }else {
         this.actualizar();
       }
    } else {
        this.snack.open('Complete los datos faltantes', 'OK', { duration: 5000 });
        this.loader.close();
      }

    }

  }

  registrar() {
    this.itemFacturaService.registrarDocumentoElectronico(this.facturaDocumento, this.usuarioSession.empresa.id).subscribe(data_ => {
      this.infoResponse_ = data_;
      this.loader.close();
      this.snack.open(this.infoResponse_.alertMessage, 'OK', { duration: 5000 });
      this.snack._openedSnackBarRef.afterDismissed().subscribe(() => {
        this.nuevoDocumento();
      });
    },
    (error: HttpErrorResponse) => {
      this.handleError(error);
    });
  }

  actualizar() {
    this.facturaDocumento.id = this.idDocumento;
    this.itemFacturaService.actualizarDocumentoElectronico(this.facturaDocumento, this.usuarioSession.empresa.id).subscribe(data_ => {
      this.infoResponse_ = data_;
      this.loader.close();
      this.snack.open(this.infoResponse_.alertMessage, 'OK', { duration: 5000 });
    },
    (error: HttpErrorResponse) => {
      this.handleError(error);
    });
  }


  validarDocumento(event: any) {
    const valorDigitado = event.target.value.toLowerCase();
    if (!(valorDigitado === '')) {
      this.validar(this.facturaForm.controls['serieDocumento'].value, valorDigitado, this.facturaForm.controls['tipoDocumento'].value.id);
    };
  }

  validar(serie: any, secuencia: any, tipoDoc: any) {
    this.itemFacturaService.validarDocumentPorSerie( this.usuarioSession.empresa.id, tipoDoc, serie, secuencia).subscribe(data_ => {
      this.infoResponse_ = data_;
      if (this.infoResponse_.codeMessage === 'MFA1001') {
        this.snack.open(this.infoResponse_.alertMessage, 'OK', { verticalPosition: 'top', horizontalPosition: 'right', duration: 5000 });
        this.snack._openedSnackBarRef.afterDismissed().subscribe(() => {
          this.facturaForm.patchValue({
            numeroDocumento: '',
          });
        });
      }
    },
    (error: HttpErrorResponse) => {
      this.handleError(error);
    });
  }


  nuevoDocumento() {
    // this.router.navigate([]);
    this.redirectTo('/forms/facturacion/registro');
  }

  anularDocumento() {

    const serie = this.facturaForm.controls['serieDocumento'].value;
    const secuencia = this.facturaForm.controls['numeroDocumento'].value;
    const documentoAnulado = new Documento();
    documentoAnulado.id = this.idDocumento;
    documentoAnulado.observacion = this.facturaForm.controls['observacion'].value;
    documentoAnulado.estado = EstadoDocumento.ANULADO;

    this.confirmService.confirm({message: `Confirma anular el documento ${serie} - ${secuencia} ?`})
      .subscribe(res => {
        if (res) {
          this.loader.open();
          this.itemFacturaService.anularDocumentoElectronico(documentoAnulado, this.usuarioSession.empresa.id).subscribe(data_ => {
            this.infoResponse_ = data_;
            this.facturaForm.patchValue({
              estado: this.comboEstadosFactura.find(o => o.id === EstadoDocumento.ANULADO),
            });
            this.loader.close();
            this.facturaForm.disable();
            this.snack.open(this.infoResponse_.alertMessage, 'OK', { duration: 5000 });
          },
          (error: HttpErrorResponse) => {
            this.handleError(error);
          });
        }
      });
  }

  redirectTo(uri: string) {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
    this.router.navigate([uri]));
  }

  /**  Actualiza campos Descuentos */
  actualizaTotales() {
    this.totalSum = 0;
    this.descuentos = 0;
    this.valorIGV = 0;

    this.rows.forEach(element => {
      this.descuentos += (Number.parseFloat(element.descuentos));
      this.totalSum += (Number.parseFloat(element.total));
      this.valorIGV += (Number.parseFloat(element.valorIGV));
    });

    this.importeTotal = this.totalSum + this.valorIGV;
  }


  calcularImporteTotal(): number {
   this.importeTotal = this.totalSum  + this.valorIGV;
    return this.importeTotal;
  }



    /************
   * UTILITARIOS
   *************/

  calcularFechaHora(fecha: Date): Date {
    const fechaLocal = fecha.toLocaleDateString();  // fecha local
    const fechFormt = fechaLocal.split('/').reverse().join('-');  // fecha en formato YYYY-mm-DDD
    return new Date(fechFormt);
  }

  calcularFechaHora2(fecha: Date): Date {
    const offset = (fecha.getTimezoneOffset() / 60) * -1.00;
    const utc = fecha.getTime() + (fecha.getTimezoneOffset() * 60000);
    console.log('offset: ' + offset);
    return new Date(utc + (3600000 * offset));
  }

  calcularFechaHoraLocal(fechaString: Date): Date {
    if (fechaString) {
      const fe = new Date(fechaString.toString());
      fe.setTime(fe.getTime() + fe.getTimezoneOffset() * 60 * 1000);
      return fe;
    }

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

  compareObjects(o1: any, o2: any): boolean {
    return o1.name === o2.name && o1.id === o2.id;
  }



  get nroOrdenServicio_ (): FormControl {
    return this.facturaForm.get('nroOrdenServicio') as FormControl;
  }


  private handleError(error: HttpErrorResponse) {

    this.loader.close();
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      // this.errorResponse_ = error.error;
      this.snack.open(this.errorResponse_.errorMessage, 'OK', { duration: 5000 });
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      if (error.error.codeMessage != null ) {
        this.errorResponse_ = error.error;
        this.snack.open(this.errorResponse_.errorMessage, 'OK', { duration: 5000 });
      } else {
        this.snack.open('Error de comunicación con los servicios. Intenta nuevamente.', 'OK',
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
