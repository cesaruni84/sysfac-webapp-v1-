import { FacturaDocumento } from './../../../shared/models/facturacion.model';
import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { TipoDocumento, TipoOperacion, FormaPago, Moneda, TipoIGV } from '../../../shared/models/tipos_facturacion';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClienteService } from '../../../shared/services/facturacion/cliente.service';
import { Cliente } from '../../../shared/models/cliente.model';
import { TiposGenericosService } from '../../../shared/services/util/tiposGenericos.service';
import { GetValueByKeyPipe } from '../../../shared/pipes/get-value-by-key.pipe';
import { DateAdapter, MAT_DATE_FORMATS, MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../shared/helpers/date.adapter';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { FacturaPopUpComponent } from './factura-pop-up/factura-pop-up.component';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { FacturaItemComponent } from './factura-item/factura-item.component';
import { OrdenServicioService } from '../../../shared/services/liquidacion/orden-servicio.service';
import { Usuario } from '../../../shared/models/usuario.model';
import { UsuarioService } from '../../../shared/services/auth/usuario.service';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs/internal/observable/throwError';
import { ErrorResponse, InfoResponse } from '../../../shared/models/error_response.model';
import { FacturaItemGuiasComponent } from './factura-item-guias/factura-item-guias.component';
import { FacturaItem } from '../../../shared/models/facturacion.model';
import { formatDate } from '@angular/common';
import { ItemFacturaService } from '../../../shared/services/facturacion/item-factura.service';
import { OrdenServicio } from '../../../shared/models/orden-servicio';
import { GuiaRemision } from 'app/shared/models/guia_remision.model';
import { Router, ActivatedRoute } from '@angular/router';

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
    }
    ],
})
export class WizardComponent implements OnInit {

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
  conOrdenServicio_: boolean = false;
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

  ordenes_servicio = [];
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
  public facturaDocumento: FacturaDocumento;
  public listaItemsFactura: FacturaItem[] = [];



  public comboEstadosFactura = [
    { id: 1, codigo: '001' , descripcion: 'Registrado' },
    { id: 2, codigo: '002' , descripcion: 'Enviado a Facturador SUNAT'},
    { id: 3, codigo: '003' , descripcion: 'Enviado y Aceptado SUNAT'},
    { id: 4, codigo: '004' , descripcion: 'Observada SUNAT'},
    { id: 5, codigo: '005' , descripcion: 'Anulada'},
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
              private userService: UsuarioService,
              private ordenServicioService: OrdenServicioService,
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
      estado: [{value: '', disabled: true}],
      observacion: [''],
     // nroOrdenServicio: [{value: '', disabled: false}, [Validators.required]],
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

    /**
   * Update prices as soon as something changed on units group
   */
  private updateTotalUnitPrice(units: any) {
    // get our units group controll
    const control = <FormArray>this.facturaForm.controls['facturaDetalle'];
    // before recount total price need to be reset.
    this.totalSum = 0;

    for (let i = 0; i < units.length; i++) {

    // for ( var i in units) {
      let totalUnitPrice = (units[i].cantidad * units[i].unitPrice);
      // now format total price with angular currency pipe
      // let totalUnitPriceFormatted = this.currencyPipe.transform(totalUnitPrice, 'USD', 'symbol-narrow', '1.2-2');
      // update total sum field on unit and do not emit event myFormValueChanges$ in this case on units
      control.at(+i).get('unitTotalPrice').setValue(totalUnitPrice, {onlySelf: true, emitEvent: false});
      // update total price for all units
      this.totalSum += totalUnitPrice;
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
    this.route.queryParams.subscribe(params => {
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



    /**
   * Carga Todos los valores de los combos de la página
   */
  cargarCombos() {

    // Recupera datos de usuario de session
    this.usuarioSession = this.userService.getUserLoggedIn();

    // Combo Clientes
    this.clienteService.listarClientesPorEmpresa(1).subscribe(dataClientes => {
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
      this.loader.open();
      this.itemFacturaService.obtenerDocumentPorSerie(this.usuarioSession.empresa.id,
                                                      this.tipoDocumentoQuery,
                                                      this.nroSerieQuery,
                                                      this.nroSecuenciaQuery).subscribe((documento) => {
        // Id de base de datos
        this.idDocumento = documento.id;
        console.log(documento);

        // Completa valores de formulario cabecerea
        this.facturaForm.patchValue({
          tipoDocumento: this.comboTiposDocumento[0],
          serieDocumento: documento.serie,
          numeroDocumento: documento.secuencia,
          fechaEmision: documento.fechaEmision,
          fechaVencimiento: documento.fechaVencimiento,
          estado: this.comboEstadosFactura.find(o => o.id === documento.estado),
          tipoOperacion: this.comboTiposOperacion.find(o => o.id === documento.tipoOperacion),
          moneda: this.comboMonedas.find(o => o.id === documento.moneda.id),
          formaPago: this.comboFormasPago.find(o => o.id === documento.formaPago.id),
          tipoAfectacionIGV: this.comboTiposIGV.find(o => o.id === documento.tipoAfectacion),
          cliente: this.comboClientes.find(o => o.id === documento.cliente.id),
          direccion: documento.cliente.direccion,
          observacion: documento.observacion
        });

        // Completa items
        this.rows = documento.items;

         // Completa totales
         this.totalSum = documento.subTotalVentas;
         this.simbolo = 'S/';
         this.subTotal = documento.subTotalVentas;
         this.anticipos = documento.anticipos;
         this.descuentos = documento.descuentos;
         this.valorVenta = 0.00;
         this.valorIGV = documento.igv;
         this.otrosCargos = documento.otrosCargos;
         this.otrosTributos = documento.otrosTributos;
         this.importeTotal = documento.totalDocumento;

         // 1: item por defecto , 2: Orden Servicio, 3: Guia Remisión
         this.subTipoFactura = documento.notas;
         this.ordenes_servicio = documento.ordenesServicio;
         this.guias_remision = documento.guiasRemision;

        if (this.ordenes_servicio.length > 0) {
          this.conOrdenServicio_  = true;
        }

        if (this.guias_remision.length > 0) {
          this.conGuiaRemision_  = true;
        }

         this.loader.close();

      }, (error: HttpErrorResponse) => {
        this.loader.close();
        this.errorResponse_ = error.error;
        this.snack.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 5000 });
      });
    }




  getControls(frmGrp: FormGroup, key: string) {
    return (<FormArray>frmGrp.controls[key]).controls;
  }

    /**
   * Create form unit
   */
  private obtenerFacturaDetalle() {
    const numberPatern = '^[0-9.,]+$';
    return this.formBuilder.group({
      codigo: ['', [Validators.required, ]],
      descripcion: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.pattern(numberPatern)]],
      unidadMedida: ['', Validators.required],
      unitPrice: ['', [Validators.required, Validators.pattern(numberPatern)]],
      tipoIGV: [ {value: '', disabled: false} , [Validators.required]],
      valorIGV: ['', [Validators.required, Validators.pattern(numberPatern)]],
      unitTotalPrice: [{value: 0.00, disabled: true}]
    });
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
    if (this.conOrdenServicio_) {
      this.buscarOrdenServicioItem(data, isNew);
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

        console.log(item);

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
   * Abre Pop-up para Añadir Ordenes de Servicio
   */
  buscarOrdenServicioItem(data2: any = {}, isNew?) {
    let title2 = isNew ? 'Seleccionar Orden Servicio' : 'Actualizar Item';
    let dialogRef2: MatDialogRef<any> = this.dialog.open(FacturaPopUpComponent, {
        width: '940px',
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
            let rowData = { ...item};
            this.rows.splice(this.rows.length, 0, rowData);
            this.rows = [...this.rows];
            this.actualizaTotales();
            this.snack.open('Item añadido!!', 'OK', { duration: 1000 });
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


  submit() {
    this.loader.open();

    if (this.rows.length === 0) {
        this.snack.open('Debe añadir al menos un item para el documento', 'OK', { duration: 2000 });
        this.loader.close();
    } else {

       this.facturaDocumento = new FacturaDocumento();
       this.ordenes_servicio = [];
       this.guias_remision = [];
       this.facturaDocumento.tipoDocumento = this.facturaForm.controls['tipoDocumento'].value.id;
       this.facturaDocumento.serie = this.facturaForm.controls['serieDocumento'].value;
       this.facturaDocumento.secuencia = this.facturaForm.controls['numeroDocumento'].value;
       this.facturaDocumento.fechaEmision = this.facturaForm.controls['fechaEmision'].value;
       this.facturaDocumento.fechaVencimiento = this.facturaForm.controls['fechaVencimiento'].value;
       this.facturaDocumento.nroOrden = this.rows[0].codigo || '';
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
          let os_obj: OrdenServicio = new OrdenServicio();
          let guia: GuiaRemision = new GuiaRemision();
          if (this.subTipoFactura === '2') {
            os_obj.id = element.id;
            this.ordenes_servicio.push(os_obj);
          } else if (this.subTipoFactura === '3') {
            guia.id = element.id;
            this.guias_remision.push(guia);
          }
       });

       this.facturaDocumento.ordenesServicio = this.ordenes_servicio;
       this.facturaDocumento.guiasRemision = this.guias_remision;

       this.facturaDocumento.items = this.rows.map(item => {
          delete item.id;
          return item;
        } );

       this.facturaDocumento.usuarioRegistro = this.usuarioSession.codigo;
       this.facturaDocumento.usuarioActualiza = this.usuarioSession.codigo;
       console.log('Form data are: ' + JSON.stringify(this.facturaDocumento));


      if (!this.edicion) {
        this.registrar();
      }else {
        this.actualizar();
      }

    }

  }

  registrar() {
    this.itemFacturaService.registrarDocumentoElectronico(this.facturaDocumento, this.usuarioSession.empresa.id).subscribe(data_ => {
      this.infoResponse_ = data_;
      this.loader.close();
      this.snack.open(this.infoResponse_.alertMessage, 'OK', { duration: 5000 });
    },
    (error: HttpErrorResponse) => {
      this.loader.close();
      this.errorResponse_ = error.error;
      this.snack.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 5000 });
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
      this.loader.close();
      this.errorResponse_ = error.error;
      this.snack.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 5000 });
    });
  }



    /**
   * Obtiene una lista de todas las guias de remisión asociadas a la orden de servicio
   */
  buscarGuiasPorOS(event: any) {
    this.ordenServicioService.listarGuiasPorOrdenServicio(this.usuarioSession.empresa.id ,
      this.nroOrdenServicio_.value).subscribe((data_) => {
      this.rows_guias = data_;
      this.setStep(1);
    },
    (error: HttpErrorResponse) => {
      this.rows_guias = [];
      this.setStep(0);
      this.handleError(error);
    });
  }



    /**
   * Default Panel
   */
  setStep(index: number) {
    this.step = index;
  }

    /**
   * Add new unit row into form
   */
   addUnit() {
    const control = <FormArray>this.facturaForm.controls['facturaDetalle'];
    control.push(this.obtenerFacturaDetalle());
  }

  /**
   * Remove unit row from form on click delete button
   */
   removeUnit(i: number) {
    const control = <FormArray>this.facturaForm.controls['facturaDetalle'];
    control.removeAt(i);
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
