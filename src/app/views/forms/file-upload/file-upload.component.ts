import { AppDateAdapter, APP_DATE_FORMATS } from '../../../shared/helpers/date.adapter';
import { Liquidacion } from '../../../shared/models/liquidacion.model';
import { LiquidacionService } from '../../../shared/services/liquidacion/liquidacion.service';
import { GuiaRemision, GuiasRemisionPDF } from '../../../shared/models/guia_remision.model';
import { Component, OnInit, Inject, LOCALE_ID, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { UsuarioService } from '../../../shared/services/auth/usuario.service';
import { Usuario } from '../../../shared/models/usuario.model';
import { DateAdapter, MAT_DATE_FORMATS, MatDialogRef, MatDialog } from '@angular/material';
import { CustomValidators } from 'ng2-validation';
import { FactoriaService } from '../../../shared/services/factorias/factoria.service';
import { Factoria } from '../../../shared/models/factoria.model';
import { MotivoTrasladoService } from '../../../shared/services/motivos-traslado/motivo-traslado.service';
import { MotivoTraslado } from '../../../shared/models/motivo_traslado.model';
import { GuiaRemisionService } from '../../../shared/services/guias/guia-remision.service';
import { MatSnackBar } from '@angular/material';
import { formatDate } from '@angular/common';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse, InfoResponse, FiltrosGuiasLiq } from '../../../shared/models/error_response.model';
import { ImpuestoService } from '../../../shared/services/liquidacion/impuesto.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import * as jspdf from 'jspdf';
import 'jspdf-autotable';
import { BuscarGuiaLiqComponent } from './buscar-guia-liq/buscar-guia-liq.component';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
  providers: [
    {
        provide: DateAdapter, useClass: AppDateAdapter
    },
    {
        provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
    ]
})
export class FileUploadComponent implements OnInit {

  console = console;
  filtros: any = {};

  // Usuario sesionado
  usuarioSession: Usuario;
  formLiquidacion: FormGroup;

  // Combos de Formularios
  public comboFactorias: Factoria[] = [];
  public comboFactoriasDestino: Factoria[] = [];
  public comboMotivosTraslado: MotivoTraslado[];

  // Manejo insert o update
  idNroDocLiq: number;
  public nroDocLiqQuery: string;
  edicion: boolean = false;

  // Manejo default de mensajes en grilla
  messages: any = {
    // Message to show when array is presented
    // but contains no values
    emptyMessage: '-',

    // Footer total message
    totalMessage: 'total',

    // Footer selected message
    selectedMessage: 'seleccionados'
  };
  
  // Ng Model
  liquidacionModel: Liquidacion;
  // valorNroDocumentoLiq_: string;
  estadoLiquidacion_: string;
  situacionLiquidacion_: string;
  monedaLiquidacion_: string;
  valorFechaIniTraslado_: Date;
  valorFechaFinTraslado_: Date;
  valorFechaRegistro_: Date;
  valorGlosa_: string;
  valorOrigenSelected_: any;
  valorDestinoSelected_: any;
  motivoTrasladoSelected_: any;

  // Manejo de usuario
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;

  // Listado de Guias
  listadoGuias: GuiaRemision[];
  rowsSelected = [];
  rows = [];
  temp = [];

  // Variables Totales
  totalCantidadGuiasLiq_: number;
  subTotalImpGuiasLiq_: number;
  IGV_DEFAULT: number;
  igvAplicado_: number;
  totalImpGuiasLiq_: number;
  editing = {};
  selected = [];

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  formBusqueda: FormGroup;

  filtroDestino_: any;
  filtroOrigen_: any;
  filtroFechaIni_: Date;
  filtroFechaFin_: Date;

  constructor(private userService: UsuarioService,
              private factoriaService: FactoriaService,
              private motivoTrasladoService: MotivoTrasladoService,
              private impuestoService: ImpuestoService,
              private guiaRemisionService: GuiaRemisionService,
              private liquidacionService: LiquidacionService,
              private confirmService: AppConfirmService,
              private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
              private dialog: MatDialog,
              private loader: AppLoaderService,
              public snackBar: MatSnackBar,
              @Inject(LOCALE_ID) private locale: string,
              ) {

    this.validarGrabarActualizar();
    this.usuarioSession = this.userService.getUserLoggedIn();

  }

  ngOnInit() {
    // Recupera datos de usuario de session
    this.initForm();

    // this.firstFormGroup = this.fb.group({
    //   firstCtrl: ['', Validators.required]
    // });
    // this.secondFormGroup = this.fb.group({
    //   secondCtrl: ['', Validators.required]
    // });

    this.formBusqueda = this.fb.group({
      filtroOrigen: ['', Validators.required],
      filtroDestino: ['', Validators.required],
      filtroFechaIni: ['', Validators.required],
      filtroFechaFin: ['', Validators.required],
    });


    // Carga valores para formulario
    this.cargarCombosFormulario();

    // Si es edicion recuperar datos de BD
    if (this.edicion) {
      this.recuperarLiquidacionBD();
    } else {
      this.defaultValues();
    }
    console.log(this.formLiquidacion);

  }

  initForm() {
    this.formLiquidacion = new FormGroup({
      empresa_: new FormControl({value: this.usuarioSession.empresa.razonSocial, disabled: true},),
      nroDocumentoLiq: new FormControl( ' ', [CustomValidators.digits, Validators.required]),
      fechaRegistro: new FormControl({value: '', disabled: true}),
      estado: new FormControl({value: '0', disabled: true}, ),
      situacion: new FormControl({value: '0', disabled: true}, ),
      moneda: new FormControl({value: '0', disabled: false}, ),
      origen: new FormControl({value: '', disabled: true}, Validators.required),
      destino: new FormControl({value: '', disabled: true}, Validators.required ),
      motivoTraslado: new FormControl({value: '', disabled: true}, ),
      fechaIniTraslado: new FormControl({value: '', disabled: true}, [
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.required,
        CustomValidators.date
      ]),
      fechaFinTraslado: new FormControl({value: '', disabled: true}, [
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.required,
        CustomValidators.date
      ]),
      glosa: new FormControl('-', [
        Validators.minLength(1),
        Validators.maxLength(225),
       ]),
    });

  }


  cargarCombosFormulario() {
    this.factoriaService.listarComboFactorias('O').subscribe(data1 => {
      this.comboFactorias = data1;
      this.valorOrigenSelected_ = this.comboFactorias[0];
      this.filtroOrigen_ = this.comboFactorias[0];
    });

    this.factoriaService.listarComboFactorias('D').subscribe(data3 => {
      this.comboFactoriasDestino = data3;
      this.valorDestinoSelected_ = this.comboFactoriasDestino[1];
      this.filtroDestino_ =  this.comboFactoriasDestino[1];
    });

    this.motivoTrasladoService.listarComboMotivosTraslado().subscribe(data2 => {
      this.comboMotivosTraslado = data2;
    });
  }

  validarGrabarActualizar() {
    this.route.queryParams.subscribe(params => {
        this.nroDocLiqQuery = params.nroDocLiq;
        this.edicion = (this.nroDocLiqQuery) != null ;
      }
    );
  }

  submit() {
    // console.log(this.firstFormGroup.value);
    // console.log(this.secondFormGroup.value);
    // console.log(this.formBusqueda.value);
    console.log('paso para seleccionar');


    if (this.edicion) {
      this.confirmService.confirm({message: `Desea reemplazar las guias asociadas a esta liquidación ?`})
      .subscribe(res => {
        if (res) { // OK
          this.rowsSelected = this.temp;
          this.valorOrigenSelected_ = this.filtroOrigen_;
          this.valorDestinoSelected_ = this.filtroDestino_;
          this.valorFechaIniTraslado_ = this.filtroFechaIni_;
          this.valorFechaFinTraslado_ = this.filtroFechaFin_;
        } else {// Cancelar
          this.loader.close();
        }
      });
    } else {
      this.rowsSelected = this.temp;
      this.valorOrigenSelected_ = this.filtroOrigen_;
      this.valorDestinoSelected_ = this.filtroDestino_;
      this.valorFechaIniTraslado_ = this.filtroFechaIni_;
      this.valorFechaFinTraslado_ = this.filtroFechaFin_;
    }


  }


  onSelect({ selected }) {
    this.temp = selected;
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  // Obtiene datos de base de datos
  recuperarLiquidacionBD()  {
    this.loader.open();
    this.liquidacionService.obtenerLiquidacionPorNroDoc(this.usuarioSession.empresa.id,
                                                        this.nroDocLiqQuery).subscribe((data_) => {
      // Id de base de datos
      this.idNroDocLiq = data_.id;


      // this.valorNroDocumentoLiq_ = this.nroDocLiqQuery;
      this.formLiquidacion.patchValue({
        nroDocumentoLiq: this.nroDocLiqQuery,
      });
      this.estadoLiquidacion_ = data_.estado.toString();
      this.situacionLiquidacion_ = data_.situacion.toString();
      this.monedaLiquidacion_ = data_.moneda.toString();
      this.valorFechaIniTraslado_ = data_.fecIniTraslado;
      this.filtroFechaIni_ = data_.fecIniTraslado;
      this.valorFechaFinTraslado_ = data_.fecFinTraslado;
      this.filtroFechaFin_ = data_.fecFinTraslado;
      this.valorFechaRegistro_ = data_.fechaEmision;
      this.valorOrigenSelected_ = data_.origen;
      this.filtroOrigen_ = data_.origen;
      this.valorDestinoSelected_ = data_.destino;
      this.filtroDestino_ = data_.destino;
      this.motivoTrasladoSelected_ = data_.motivo.id;
      this.valorGlosa_ = data_.glosa;

      // Guias asociadas
      this.rows = data_.guias;
      this.rowsSelected = data_.guias;

      // Obtiene % impuesto I.G.V - 1
      this.impuestoService.obtenerValorImpuesto(1).subscribe(data2 => {
        this.IGV_DEFAULT = data2.valor;
      });

      this.loader.close();


    }, (error: HttpErrorResponse) => {
      this.loader.close();
      this.errorResponse_ = error.error;
      this.snackBar.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 5000,  panelClass: ['blue-snackbar'] });
      console.log(this.errorResponse_.errorMessage);

    });
  }

  defaultValues( ) {
    this.estadoLiquidacion_ = '1';
    this.situacionLiquidacion_ = '1';
    this.monedaLiquidacion_ = '0';
    this.valorFechaIniTraslado_ = new Date();
    this.valorFechaFinTraslado_ = new Date();
    this.valorFechaRegistro_ = new Date();
    this.valorFechaIniTraslado_.setDate((this.valorFechaIniTraslado_ .getDate()) - 30);
    this.motivoTrasladoSelected_ = 1;

    this.filtroFechaIni_ = this.valorFechaIniTraslado_;
    this.filtroFechaFin_ = this.valorFechaFinTraslado_;

    // Obtiene % impuesto I.G.V - 1
    this.impuestoService.obtenerValorImpuesto(1).subscribe(data2 => {
      this.IGV_DEFAULT = data2.valor;
    });

  }

  nuevaBusqueda() {
    this.filtroOrigen_ = this.comboFactorias[0];
    this.filtroDestino_ =  this.comboFactoriasDestino[1];
    this.filtroFechaIni_ = new Date();
    this.filtroFechaFin_ = new Date();
    this.filtroFechaIni_.setDate((this.filtroFechaIni_ .getDate()) - 30);
    this.rows = [];
  }


  buscarGuiasXLiquidar_() {

    this.loader.open();

    const fechaIni = formatDate(this.filtroFechaIni_, 'yyyy-MM-dd', this.locale);
    const fechaFin = formatDate(this.filtroFechaFin_, 'yyyy-MM-dd', this.locale);

    this.guiaRemisionService.listarGuiasRemisionPorLiquidar(this.usuarioSession.empresa.id,
                                this.filtroOrigen_.id,
                                this.filtroDestino_.id,
                                fechaIni,
                                fechaFin).subscribe(data_ => {
      this.listadoGuias = data_;
      this.rows = data_;
      this.loader.close();
    },
    (error: HttpErrorResponse) => {
      this.loader.close();
      this.errorResponse_ = error.error;
      this.snackBar.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 5000,  panelClass: ['blue-snackbar'] });
    });

  }

  // buscarGuiasXLiquidar(isNew: boolean) {

  //     this.filtros.origen = this.valorOrigenSelected_;
  //     this.filtros.destino = this.valorDestinoSelected_;
  //     this.filtros.fechaIni = this.valorFechaIniTraslado_;
  //     this.filtros.fechaFin = this.valorFechaFinTraslado_;

  //     let title = isNew ? 'ASIGNAR ORDEN DE SERVICIO' : 'Actualizar Item';
  //     let dialogRef: MatDialogRef<any> = this.dialog.open(BuscarGuiaLiqComponent, {
  //       width: '1040px',
  //       height: '580px',
  //       disableClose: true,
  //       data: { title: title, payload: this.filtros}
  //     });
  //     dialogRef.afterClosed()
  //       .subscribe(res => {
  //         if (!res) {
  //           // If user press cancel
  //           return;
  //         }
  //         this.loader.open();
  //         if (isNew) {
  //           // this.crudService.addItem(res)
  //           //   .subscribe(data => {
  //               this.rows = res;
  //               this.loader.close();
  //               this.snackBar.open('Se agregaron guias seleccionadas', 'OK', { duration: 4000 });
  //           //   });
  //         } else {
  //           // this.crudService.updateItem(data._id, res)
  //           //   .subscribe(data => {
  //           //     this.items = data;
  //           //     this.loader.close();
  //           //     this.snack.open('Member Updated!', 'OK', { duration: 4000 });
  //           //   });
  //         }
  //       });


  // }


  consultarGuia(row) {
    // const array = row.nroguia.split('-');
    console.log(row);
    const _nroSerie = row.serie;
    const _nroSecuencia = row.secuencia;

    // Envia a Página de Edición de Guia
    this.router.navigate(['/forms/basic'], { queryParams: { _serie: _nroSerie , _secuencia: _nroSecuencia } });
  }



  deleteItem(row) {
    this.confirmService.confirm({message: `Descartar guia:  ${row.serie + '-' + row.secuencia} ?`})
      .subscribe(res => {
        if (res) {
          this.loader.open();
          // this.crudService.removeItem(row)
          //   .subscribe(data => {
          //     this.rows = data;
          //     this.loader.close();
          //     this.snackBar.open('Guia descartada para liquidación!', 'OK', { duration: 4000 })
          //   });

          //  let i = this.rows.indexOf(row);
          //  this.rows.splice(i, 1);
          //  of(this.rows.slice()).pipe(delay(1000));
        }
      });
  }

  /** Gets the total items of all transactions. */
  sumTotalCantidad() {
    this.totalCantidadGuiasLiq_ = this.rows.map(t => t.totalCantidad).reduce((acc, value) => acc + value, 0);
    return this.totalCantidadGuiasLiq_ ;
  }

  /** Gets the total cost of all transactions. */
  sumSubTotalImporte() {
    this.subTotalImpGuiasLiq_ =  this.rows.map(t => t.subTotal).reduce((acc, value) => acc + value, 0);
    return this.subTotalImpGuiasLiq_;
  }

  calcularImporteIGV() {
    this.igvAplicado_ = this.IGV_DEFAULT * this.subTotalImpGuiasLiq_;
    return this.igvAplicado_;
  }

  calcularImporteTotal() {
    this.totalImpGuiasLiq_ = (this.subTotalImpGuiasLiq_ + this.igvAplicado_);
    return this.totalImpGuiasLiq_;
  }

  recalcularTotales() {
    this.sumTotalCantidad();
    this.sumSubTotalImporte();
    this.calcularImporteIGV();
    this.calcularImporteTotal();
  }



  // Grabar Liquidación
  grabaFormulario(model: any, isValid: boolean, e: Event) {

    this.loader.open();

    if (this.formLiquidacion.invalid) {
      console.log('hay errores aun');
      this.loader.close();
    } else {
      this.liquidacionModel = new Liquidacion();

      if (this.rows.length === 0) {
        this.snackBar.open('Debe seleccionar guias a liquidar!!', 'OK', { duration: 4000 });
        this.loader.close();
      } else {
           // Completa valores
          if (!this.validarGuias() ){
            this.snackBar.open('Importe de tarifa es igual a 0.00, configurar la tarifa para la ruta seleccionada.', 'OK', { duration: 5000 });
            this.loader.close();
          } else {
            console.log(this.rows);
            this.liquidacionModel.tipocod = 'LST';
           //  this.valorNroDocumentoLiq_ = this.pad(this.valorNroDocumentoLiq_, 12) ;
           //  this.liquidacionModel.nrodoc = this.valorNroDocumentoLiq_;
            this.liquidacionModel.nrodoc = this.pad(this.nroDocumentoLiq.value, 12);

            this.liquidacionModel.fechaEmision = this.valorFechaRegistro_;
            this.liquidacionModel.estado = this.formLiquidacion.get('estado').value;
            this.liquidacionModel.situacion = this.formLiquidacion.get('situacion').value;
            this.liquidacionModel.fecIniTraslado =  this.valorFechaIniTraslado_;
            this.liquidacionModel.fecFinTraslado =  this.valorFechaFinTraslado_;
            this.liquidacionModel.glosa = this.formLiquidacion.get('glosa').value;
            this.liquidacionModel.moneda = this.formLiquidacion.get('moneda').value;
            this.liquidacionModel.totalCantidad = this.totalCantidadGuiasLiq_;
            this.liquidacionModel.subTotalLiq = this.subTotalImpGuiasLiq_;
            this.liquidacionModel.IGV = this.igvAplicado_;
            this.liquidacionModel.importeTotal = this.totalImpGuiasLiq_;
            this.liquidacionModel.usuarioRegistro = this.usuarioSession.codigo;
            this.liquidacionModel.usuarioActualiza = this.usuarioSession.codigo;

            const motivoTrasladoTemp = new MotivoTraslado();
            motivoTrasladoTemp.id = this.formLiquidacion.get('motivoTraslado').value;
            this.liquidacionModel.motivo =  motivoTrasladoTemp;

            // let origenTemp = new Factoria();
            // origenTemp = this.formLiquidacion.get('origen').value;
            // this.liquidacionModel.origen = origenTemp;
            this.liquidacionModel.origen = this.formLiquidacion.get('origen').value;

            // let destinoTemp = new Factoria();
            // destinoTemp.id = this.formLiquidacion.get('destino').value;
            // this.liquidacionModel.destino = destinoTemp;
            this.liquidacionModel.destino = this.formLiquidacion.get('destino').value;

            this.liquidacionModel.guias = this.rowsSelected;
            console.log(this.liquidacionModel);
            console.log('Form data are: ' + JSON.stringify(this.liquidacionModel));

            if (this.edicion) {
              this.actualizarLiquidacion();
            } else {
              this.grabarLiquidacion();
            }

          }


      }

    }
  }

  grabarLiquidacion() {

    // Manda POST hacia BD AWS
    this.liquidacionService.registrarLiquidacionBD(this.liquidacionModel, this.usuarioSession.empresa.id ).subscribe((data_) => {
      this.infoResponse_ = data_;
      this.loader.close();
      this.snackBar.open(this.infoResponse_.alertMessage, 'OK', { duration: 5000 });

      // Resetea Formulario
      this.snackBar._openedSnackBarRef.afterDismissed().subscribe(() => {
        window.location.reload();
      });
    },
    (error: HttpErrorResponse) => {
      this.loader.close();
      this.errorResponse_ = error.error;
      console.log(this.errorResponse_);
      // if ( !this.errorResponse_ === undefined) {
        this.snackBar.open(this.errorResponse_.errorMessage, 'OK', { duration: 5000 });
      //} else {
        // this.snackBar.open('Hay problemas de conexión con el Servidor.', 'cerrar', { duration: 20000 });
      //}
      console.log(this.errorResponse_.errorMessage);
    });
  }


  actualizarLiquidacion() {

    this.liquidacionModel.id = this.idNroDocLiq;

    // Manda POST hacia BD AWS
    this.liquidacionService.actualizarLiquidacionBD(this.liquidacionModel, this.usuarioSession.empresa.id ).subscribe((data_) => {
      this.infoResponse_ = data_;
      this.loader.close();
      this.snackBar.open(this.infoResponse_.alertMessage, 'cerrar', { duration: 10000 });

      // Resetea Formulario
      this.snackBar._openedSnackBarRef.afterDismissed().subscribe(() => {
        window.location.reload();
      });
    },
    (error: HttpErrorResponse) => {
      this.loader.close();
      this.errorResponse_ = error.error;
      console.log(this.errorResponse_);
      this.snackBar.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 10000 });
      console.log(this.errorResponse_.errorMessage);
    });
  }

  cancelarLiquidacion() {
    this.router.navigate(['/dashboard']);
  }

  imprimirLiquidacion() {
    this.captureScreen();
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

      // Completar Zeros
  completarZerosNroDoc(event) {
    const valorDigitado = event.target.value.toLowerCase();
    // this.valorNroDocumentoLiq_ = this.pad(valorDigitado, 12);
    this.formLiquidacion.patchValue({
      nroDocumentoLiq: this.pad(valorDigitado, 12),
    });
  }

  pad(number: string, length: number): string {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
  }

  updateTarifa(event, cell, rowIndex) {
    console.log('inline editing rowIndex', rowIndex);
    this.editing[rowIndex + '-' + cell] = false;
    this.rowsSelected[rowIndex][cell] = event.target.value;
    this.rowsSelected = [...this.rowsSelected];
    console.log('UPDATED!', this.rowsSelected[rowIndex][cell]);

    this.updateSubTotalRow('subTotal', rowIndex);
    this.recalcularTotales();
  }


  updateSubTotalRow(cell, rowIndex) {
    console.log('inline editing rowIndex', rowIndex);
    this.editing[rowIndex + '-' + cell] = false;
    this.rowsSelected[rowIndex][cell] = this.rowsSelected[rowIndex]['tarifa'] * this.rowsSelected[rowIndex]['totalCantidad'] ;
    this.rowsSelected = [...this.rowsSelected];
    console.log('UPDATED!', this.rowsSelected[rowIndex][cell]);
    this.recalcularTotales();
  }

  validarGuias() {
    let resultado = true;

    this.rowsSelected.forEach((item, i) => {
      // this.subTotal += (item.product.price.sale * item.data.quantity);
       if (this.rowsSelected[i]['tarifa'] === 0.00) {
        resultado = false;
          // console.log('aun quedan valores de 0.00');
       }
    });
    return resultado;
  }


  //  /**
  //  * Getters de campos de formulario
  //  */
  // get origen_ (): FormControl {
  //   return this.formLiquidacion.get('origen') as FormControl;
  // }

  // get destino_ (): FormControl {
  //   return this.formLiquidacion.get('destino') as FormControl;
  // }

  get nroDocumentoLiq (): FormControl {
    return this.formLiquidacion.get('nroDocumentoLiq') as FormControl;
  }

  captureScreen() {
    const doc = new jspdf('l');
    this.listadoGuias = this.rows;
    console.log(this.listadoGuias) ;

    var lista: Array<GuiasRemisionPDF> = new Array<GuiasRemisionPDF>();

    this.listadoGuias.forEach(function(itemGuias, index){
      let guiaPDF: GuiasRemisionPDF = new GuiasRemisionPDF();
        guiaPDF.id = index + 1;
        guiaPDF.fechaTraslado = itemGuias.fechaTraslado.toString();
        guiaPDF.guiaRemision = itemGuias.serie + itemGuias.secuencia;
        guiaPDF.guiaCliente = itemGuias.serieCliente + itemGuias.secuenciaCliente;
        guiaPDF.descripcion = itemGuias.guiaDetalle[0].producto.nemonico;
        guiaPDF.ticketBalanza = itemGuias.ticketBalanza;
        guiaPDF.unidadMedida = itemGuias.guiaDetalle[0].unidadMedida.valor;
        guiaPDF.cantidad = itemGuias.totalCantidad.toFixed(2);
        guiaPDF.tarifa = itemGuias.tarifa.toFixed(2);
        guiaPDF.subTotal = itemGuias.subTotal.toFixed(2);
        lista.push(guiaPDF);
    }, this);

    console.log(lista);

    doc.autoTable({
      headStyles: {fillColor: [155, 89, 182]}, // Purple
      columnStyles: {id: {halign: 'center'}, text: {cellWidth: 'auto'}}, // European countries centered
      // body: [{europe: 'Sweden', america: 'Canada', asia: 'China'}, {europe: 'Norway', america: 'Mexico', asia: 'Japan'}],
      body: lista,
      styles: {overflow: 'ellipsize', cellWidth: 'wrap', fontSize: 8},
      theme: 'striped',
      columns: [{header: 'Item', dataKey: 'id'},
                {header: 'F.Traslado', dataKey: 'fechaTraslado'},
                {header: 'Guia de Remisión', dataKey: 'guiaRemision'},
                {header: 'Guia Rem. Cliente', dataKey: 'guiaCliente'},
                {header: 'Descripción', dataKey: 'descripcion'},
                {header: 'Ticket Balanza', dataKey: 'ticketBalanza'},
                {header: 'UM', dataKey: 'unidadMedida'},
                {header: 'Cantidad', dataKey: 'cantidad'},
                {header: 'P.Unitario', dataKey: 'tarifa'},
                {header: 'Sub Total', dataKey: 'subTotal'},
              ]
    });


  doc.save('table.pdf');

    // var data = document.getElementById('idLiquidacion');
    // html2canvas(data).then(canvas => {
    //   // Few necessary setting options
    //   var imgWidth = 208;
    //   var pageHeight = 295;
    //   var imgHeight = canvas.height * imgWidth / canvas.width;
    //   var heightLeft = imgHeight;

    //   const contentDataURL = canvas.toDataURL('image/png');
    //   let pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF
    //   var position = 0;
    //   pdf.addImage(contentDataURL, 'PDF', 0, position, imgWidth, imgHeight);
    //   pdf.save('MYPdf.pdf'); // Generated PDF
    // });
  }


}
