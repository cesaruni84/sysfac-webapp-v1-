import { AppDateAdapter, APP_DATE_FORMATS } from '../../../shared/helpers/date.adapter';
import { Liquidacion } from '../../../shared/models/liquidacion.model';
import { LiquidacionService } from '../../../shared/services/liquidacion/liquidacion.service';
import { GuiaRemision, GuiasRemisionPDF } from '../../../shared/models/guia_remision.model';
import { Component, OnInit, Inject, LOCALE_ID, ViewChild, PipeTransform } from '@angular/core';
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
import { formatDate, DatePipe } from '@angular/common';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse, InfoResponse } from '../../../shared/models/error_response.model';
import { ImpuestoService } from '../../../shared/services/liquidacion/impuesto.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import '@progress/kendo-date-math/tz/America/Lima';
import * as jspdf from 'jspdf';
import 'jspdf-autotable';
import { BasicFormComponent } from '../basic-form/basic-form.component';
import { BuscarGuiaLiqComponent } from './buscar-guia-liq/buscar-guia-liq.component';
import { InlineEditComponent } from './inline-edit/inline-edit.component';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { throwError } from 'rxjs';
import { globalCacheBusterNotifier } from 'ngx-cacheable';
import { Documento } from '../../../shared/models/facturacion.model';


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
    ],

})
export class FileUploadComponent implements OnInit {
  // @ViewChild('myTable') table: any;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  console = console;
  filtros: any = {};

  // Usuario sesionado
  usuarioSession: Usuario;
  formLiquidacion: FormGroup;

  guias_remision =[];

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



  // Manejo default de mensajes en grilla
  messages2: any = {
    // Message to show when array is presented
    // but contains no values
    emptyMessage: '-',

    // Footer total message
    totalMessage: 'total',

    // Footer selected message
    selectedMessage: 'seleccionados'
  };

  // Manejo default de mensajes en grilla
  sorts: any = {
    prop: 'serie',
    dir: 'desc'
  };


  sortBy: any = 'idProducto';

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
  valorOrigenSelected_: Factoria[]= [];
  valorDestinoSelected_: Factoria[]= [];
  motivoTrasladoSelected_: any;
  documento: Documento;

  // Manejo de usuario
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;

  // Listado de Guias
  listadoGuias: GuiaRemision[];
  rowsGuias = [];
  rowsSelected = [];
  rows = [];
  // columns = [];

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

  filtroDestino_: Factoria;
  filtroOrigen_: Factoria;
  filtroFechaIni_: Date;
  filtroFechaFin_: Date;
  inserto: any;
  actualiza: any;

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



  }

  ngOnInit() {

    // Recupera datos de usuario de session
    this.validarGrabarActualizar();
    this.usuarioSession = this.userService.getUserLoggedIn();
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

  }

  initForm() {
    this.formLiquidacion = new FormGroup({
      empresa_: new FormControl({value: this.usuarioSession.empresa.razonSocial, disabled: true},),
      nroDocumentoLiq: new FormControl( ' ', [CustomValidators.digits, Validators.required]),
      fechaRegistro: new FormControl({value: '', disabled: true}),
      estado: new FormControl({value: '0', disabled: false}, ),
      situacion: new FormControl({value: '0', disabled: true}, ),
      moneda: new FormControl({value: '0', disabled: false}, ),
      origen: new FormControl({value: '', disabled: false}, Validators.required),
      destino: new FormControl({value: '', disabled: false}, Validators.required ),
      motivoTraslado: new FormControl({value: '', disabled: true}, ),
      fechaIniTraslado: new FormControl({value: '', disabled: false}, [
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.required,
        CustomValidators.date
      ]),
      fechaFinTraslado: new FormControl({value: '', disabled: false}, [
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
      // this.valorOrigenSelected_.push(this.comboFactorias[0]);
      this.filtroOrigen_ = this.comboFactorias[0];

    });

    this.factoriaService.listarComboFactorias('D').subscribe(data3 => {
      this.comboFactoriasDestino = data3;
      // this.valorDestinoSelected_.push(this.comboFactoriasDestino[1]);
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

  agregarGuias() {
      this.rowsSelected.forEach(element => {
        let registroRepetido: boolean = false;
        if (this.rows.length > 0) {
          this.rows.forEach(element2 => {
              if (element.id === element2.id) {
                registroRepetido = true;
              }
          });
        }
        if (!registroRepetido) {
          let rowData = { ...element};
          this.rows.splice(this.rows.length, 0, rowData);
          this.rows = [...this.rows];
          let rowDataorigen = { ...rowData.remitente};
          this.valorOrigenSelected_.splice(this.valorOrigenSelected_.length, 0, rowDataorigen);
          this.valorOrigenSelected_ = [...this.valorOrigenSelected_];

          let rowDataDestino = { ...rowData.destinatario};
          this.valorDestinoSelected_.splice(this.valorDestinoSelected_.length, 0, rowDataDestino);
          this.valorDestinoSelected_ = [...this.valorDestinoSelected_];

        }
      });


      // Elimina duplicados
      this.valorOrigenSelected_ = this.valorOrigenSelected_.filter((test, index, array) =>
          index === array.findIndex((findTest) =>
             findTest.id === test.id
          )
      );

      this.valorDestinoSelected_ = this.valorDestinoSelected_.filter((test, index, array) =>
          index === array.findIndex((findTest) =>
             findTest.id === test.id
          )
      );

      this.formLiquidacion.patchValue({
         origen: this.valorOrigenSelected_[0],
         destino: this.valorDestinoSelected_[0],
      });

      this.valorFechaIniTraslado_ = this.filtroFechaIni_;
      this.valorFechaFinTraslado_ = this.filtroFechaFin_;
  }


  onSelect({ selected }) {
    this.rowsSelected = selected;
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
      this.valorFechaIniTraslado_ = this.calcularFechaHoraLocal(data_.fecIniTraslado);
      this.valorFechaFinTraslado_ = this.calcularFechaHoraLocal(data_.fecFinTraslado) ;
      this.valorFechaRegistro_ = this.calcularFechaHoraLocal(data_.fechaEmision);
      this.motivoTrasladoSelected_ = data_.motivo.id;
      this.valorGlosa_ = data_.glosa;

      if (data_.notas1) {
        const valuesOrigen: number[] = data_.notas1.split(',').map(origen => {
          return parseInt(origen);
        } );
        this.valorOrigenSelected_ = this.comboFactorias.filter(factoria => valuesOrigen.includes(factoria.id));
        this.formLiquidacion.patchValue({
          origen: this.valorOrigenSelected_[0],
        });
      } else {
        this.valorOrigenSelected_ = this.comboFactorias.filter(factoria =>  factoria.id  === data_.origen.id);
        this.formLiquidacion.patchValue({
          origen: this.valorOrigenSelected_[0],
        });
      }

      if (data_.notas2) {
        const valuesDestino: number[] = data_.notas2.split(',').map(destino => {
          return parseInt(destino);
        } );

        this.valorDestinoSelected_ = this.comboFactorias.filter(factoria => valuesDestino.includes(factoria.id));
        this.formLiquidacion.patchValue({
          destino: this.valorDestinoSelected_[0],
        });
      }else {
        this.valorDestinoSelected_ = this.comboFactorias.filter(factoria =>  factoria.id  === data_.destino.id);
        this.formLiquidacion.patchValue({
          destino: this.valorDestinoSelected_[0],
        });
      }


      // Valores de Filtro
      this.filtroOrigen_ = data_.origen;
      this.filtroDestino_ = data_.destino;
      this.filtroFechaFin_ = new Date();
      this.filtroFechaIni_ = new Date(this.filtroFechaFin_.getFullYear(), this.filtroFechaFin_.getMonth(), 1);

      // Guias asociadas
      this.rows = data_.guias;
      this.documento = data_.documento;

      // Obtiene % impuesto I.G.V - 1
      this.impuestoService.obtenerValorImpuesto(1).subscribe(data2 => {
        this.IGV_DEFAULT = data2.valor;
      });

      this.loader.close();


    }, (error: HttpErrorResponse) => {
      this.handleError(error);
    });
  }

  defaultValues( ) {
    this.estadoLiquidacion_ = '1';
    this.situacionLiquidacion_ = '1';
    this.monedaLiquidacion_ = '0';
    this.valorFechaIniTraslado_ = new Date();
    this.valorFechaFinTraslado_ = new Date();
    this.valorFechaRegistro_ = new Date();
    // this.valorFechaIniTraslado_.setDate((this.valorFechaIniTraslado_ .getDate()) - 30);
    this.valorFechaIniTraslado_  =   new Date(this.valorFechaIniTraslado_.getFullYear(), this.valorFechaIniTraslado_.getMonth(), 1);

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
    this.filtroFechaFin_ = new Date();
    // this.filtroFechaIni_.setDate((this.filtroFechaIni_ .getDate()) - 30);
    this.filtroFechaIni_  =   new Date(this.filtroFechaFin_.getFullYear(), this.filtroFechaFin_.getMonth(), 1);
    this.rowsGuias = [];
  }


  buscarGuiasXLiquidar_() {

    this.rowsGuias = [];
    this.loader.open();

    const fechaIni = formatDate(this.filtroFechaIni_, 'yyyy-MM-dd', this.locale);
    const fechaFin = formatDate(this.filtroFechaFin_, 'yyyy-MM-dd', this.locale);

    this.guiaRemisionService.listarGuiasRemisionPorLiquidar(this.usuarioSession.empresa.id,
                                this.filtroOrigen_.id,
                                this.filtroDestino_.id,
                                fechaIni,
                                fechaFin).subscribe(data_ => {
      this.listadoGuias = data_;
      this.rowsGuias = data_;
      this.loader.close();
    },
    (error: HttpErrorResponse) => {
      this.handleError(error);
    });

  }


 /**
   * Abre Pop-up para Añadir Guia de Remisión
   */
  mostrarPopUpGuias (data3: any = {}, isNew?) {
    this.rowsSelected = [];
    let title2 = isNew ? 'Seleccionar Guia de Remisión' : 'Actualizar Item';
    let dialogRef2: MatDialogRef<any> = this.dialog.open(BuscarGuiaLiqComponent, {
        width: '1280px',
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
            this.rowsSelected.splice(this.rowsSelected.length, 0, rowData);
            this.rowsSelected = [...this.rowsSelected];
          });

          this.agregarGuias();
          this.recalcularTotales();
          this.snackBar.open(item.length + ' Guia(s) añadido(s)!!', 'OK', { duration: 1000 });
          // this.subTipoFactura = '3';
        } else {
          return;
        }
      });
  }


  consultarGuia(row) {
    // Envia a Página de Edición de Guia
      let dialogRef: MatDialogRef<any> = this.dialog.open(BasicFormComponent, {
        width: '1640px',
        height: '580px',
        disableClose: true,
        data: { title: '', payload: this.filtros}
      });
      dialogRef.afterClosed()
        .subscribe(res => {
          if (!res) {
            // If user press cancel
            return;
          }
        });
  }

      /**
   * Elimina item de grilla
   */
  eliminarGuia(row: GuiaRemision , rowindex) {
    this.confirmService.confirm({message: `Descartar guia:  ${row.serie + '-' + row.secuencia} ?`})
      .subscribe(res => {
        if (res) {
          let i = this.rows.indexOf(row);


          this.rows.splice(i, 1);
          this.recalcularTotales();

          if (this.edicion) {
            this.loader.open();
            this.guiaRemisionService.actualizarGuiaRemisionLiquidacion(row, this.idNroDocLiq).subscribe(data_ => {
              this.snackBar.open('Item eliminado!', 'OK', { duration: 1000 });
              this.loader.close();
            },
            (error: HttpErrorResponse) => {
              this.loader.close();
              this.errorResponse_ = error.error;
              this.snackBar.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 5000});
            });

          } else {
            this.snackBar.open('Item eliminado!', 'OK', { duration: 1000 });
          }

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
    // Modificaciones
    this.totalImpGuiasLiq_ = (parseFloat(this.subTotalImpGuiasLiq_.toFixed(2)) + parseFloat(this.igvAplicado_.toFixed(2)));
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
    this.guias_remision = [];
    const documento_ = new Documento();

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
            this.snackBar.open('Tarifa es igual a 0.00, configurar valor para la ruta seleccionada.', 'OK', { duration: 5000 });
            this.loader.close();
          } else {
            this.liquidacionModel.tipocod = 'LST';
           //  this.valorNroDocumentoLiq_ = this.pad(this.valorNroDocumentoLiq_, 12) ;
           //  this.liquidacionModel.nrodoc = this.valorNroDocumentoLiq_;
            this.liquidacionModel.nrodoc = this.pad(this.nroDocumentoLiq.value, 12);

            const fr = new Date(this.formLiquidacion.get('fechaRegistro').value);
            // fr.setTime(fr.getTime() + fr.getTimezoneOffset() * 60 * 1000);
            this.liquidacionModel.fechaEmision = this.calcularFechaHora(fr);

            this.liquidacionModel.estado = this.formLiquidacion.get('estado').value;
            this.liquidacionModel.situacion = this.formLiquidacion.get('situacion').value;


            const fini = new Date(this.formLiquidacion.get('fechaIniTraslado').value);
            // fini.setTime(fini.getTime() + fini.getTimezoneOffset() * 60 * 1000);
            this.liquidacionModel.fecIniTraslado =  this.calcularFechaHora(fini);

            const ffin = new Date(this.formLiquidacion.get('fechaFinTraslado').value);
            // ffin.setTime(ffin.getTime() + ffin.getTimezoneOffset() * 60 * 1000);
            this.liquidacionModel.fecFinTraslado =  this.calcularFechaHora(ffin);


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

            // ORIGEN
            this.liquidacionModel.origen = this.formLiquidacion.get('origen').value;
            let arrayOrigen: number[] = [];
            this.valorOrigenSelected_.forEach(item => {
              arrayOrigen.push(item.id);
            });
            this.liquidacionModel.notas1 = arrayOrigen.join();

            // DESTINO
            this.liquidacionModel.destino = this.formLiquidacion.get('destino').value;
            let arrayDestino: number[] = [];
            this.valorDestinoSelected_.forEach(item => {
              arrayDestino.push(item.id);
            });
            this.liquidacionModel.notas2 = arrayDestino.join();

            this.rows.forEach(element => {
                let guia: GuiaRemision = new GuiaRemision();
                guia.id = element.id;
                this.guias_remision.push(guia);
            });

            this.liquidacionModel.guias = this.guias_remision;

            if (this.documento) {
              documento_.id = this.documento.id;
              this.liquidacionModel.documento = documento_;
            }
            // console.log('Form data are: ' + JSON.stringify(this.liquidacionModel));

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
    this.liquidacionService.registrarLiquidacionBD(this.liquidacionModel, this.usuarioSession.empresa.id ).subscribe((data_) => {
      this.infoResponse_ = data_;
      this.loader.close();
      this.snackBar.open(this.infoResponse_.alertMessage, 'OK', { duration: 5000 });
      this.inserto = true;
      this.snackBar._openedSnackBarRef.afterDismissed().subscribe(() => {
        this.nuevaLiquidacion();
      });
    },
    (error: HttpErrorResponse) => {
      this.handleError(error);
    });
  }

  actualizarLiquidacion() {

    this.liquidacionModel.id = this.idNroDocLiq;

    // Manda POST hacia BD AWS
    this.liquidacionService.actualizarLiquidacionBD(this.liquidacionModel, this.usuarioSession.empresa.id ).subscribe((data_) => {
      this.infoResponse_ = data_;
      this.loader.close();
      this.snackBar.open(this.infoResponse_.alertMessage, 'cerrar', { duration: 5000 });
      this.actualiza = true;
    },
    (error: HttpErrorResponse) => {
        this.handleError(error);
    });
  }

  calcularFechaHora(fecha: Date): Date {
    const fechaLocal = fecha.toLocaleDateString();  // fecha local
    const fechFormt = fechaLocal.split('/').reverse().join('-');  // fecha en formato YYYY-mm-DDD
    return new Date(fechFormt);
  }

  calcularFechaHora2(fecha: Date): Date {
    const offset = (fecha.getTimezoneOffset() / 60) * -1.00;
    const utc = fecha.getTime() + (fecha.getTimezoneOffset() * 60000);
    // console.log('offset: ' + offset);
    return new Date(utc + (3600000 * offset));
  }


  regresar() {
    if (this.inserto || this.actualiza) {
      globalCacheBusterNotifier.next();
    }
    this.redirectTo('/forms/busquedaLiquidaciones');

  }

  nuevaLiquidacion() {
    this.redirectTo('/forms/liquidacion');
  }

  cancelarLiquidacion() {
      this.router.navigate(['/dashboard']);
  }

  redirectTo(uri: string) {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
    this.router.navigate([uri]));
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
    // return o1.name === o2.name && o1.id === o2.id;
    return o1 && o2 ? o2.id === o2.id : o1 === o2;

  }

      // Completar Zeros
  completarZerosNroDoc(event) {
    const valorDigitado = event.target.value.toLowerCase();
    // this.valorNroDocumentoLiq_ = this.pad(valorDigitado, 12);
    if (!(valorDigitado === '')) {
      this.formLiquidacion.patchValue({
        nroDocumentoLiq: this.pad(valorDigitado, 12),
      });
      this.validarNroLiquidacion(this.nroDocumentoLiq.value);
    }

  }

  validarNroLiquidacion( nroLiq: any) {
    this.liquidacionService.validarLiquidacionPorNroDoc(this.usuarioSession.empresa.id, nroLiq ).subscribe((data_) => {
      this.infoResponse_ = data_;
      if (this.infoResponse_.codeMessage === 'MFA1001') {
        this.snackBar.open(this.infoResponse_.alertMessage, 'cerrar', {
          verticalPosition: 'top',
          horizontalPosition: 'right',
          duration: 5000
        });
        this.snackBar._openedSnackBarRef.afterDismissed().subscribe(() => {
          this.formLiquidacion.patchValue({
            nroDocumentoLiq: '',
          });
        });
      }
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

  calcularFechaHoraLocal(fechaString: Date): Date {
    if (fechaString) {
      const fe = new Date(fechaString.toString());
      fe.setTime(fe.getTime() + fe.getTimezoneOffset() * 60 * 1000);
      return fe;
    }

  }



  // Pop -up para Actualizar Tarifa
  openDialog(value, row) {
    const dialogRef = this.dialog.open(InlineEditComponent, {
     width: '250px',
     data: {tarifa: value },
     position: {top: '30%', right: '20%'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.getRowIndex(row);

        this.updateTarifa(result, 'tarifa', index);
        this.actuliarTarifaGuia(result, row);
      }
    });

  }


  updateTarifa(value, cell, rowIndex) {
    this.editing[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = value;
    this.rows = [...this.rows];
    this.updateSubTotalRow('subTotal', rowIndex);
    this.recalcularTotales();
  }


  actuliarTarifaGuia(value, row: GuiaRemision) {
    const guia: GuiaRemision = new GuiaRemision();
    guia.id = row.id;
    row.tarifa = value;
    row.usuarioActualiza = this.usuarioSession.codigo;
    this.guiaRemisionService.actualizarTarifaGuiaRemision(row).subscribe(data_ => {
      // this.snackBar.open('Item eliminado!', 'OK', { duration: 1000 });
      // this.loader.close();
    },
    (error: HttpErrorResponse) => {
      this.handleError(error);
    });

  }

  onDetailToggle(event) {
    // console.log('Detail Toggled', event);
  }

  toggleExpandGroup(group) {
    this.table.groupHeader.toggleExpandGroup(group);
  };


  toggleExpandRow(row) {
    this.table.rowDetail.toggleExpandRow(row);
  }

  sumTotalGrupoCantidad(groupValue: any, column: string) {
    let rowsTemp = [];
    rowsTemp = groupValue.value;
    return rowsTemp.map(t => t.totalCantidad).reduce((acc, value) => acc + value, 0);
  };

  sumTotalGrupoImporte(groupValue: any, column: string) {
    let rowsTemp = [];
    rowsTemp = groupValue.value;
    return rowsTemp.map(t => t.subTotal).reduce((acc, value) => acc + value, 0);
  };

   getRowIndex(row: any): number {
    const index = this.rows.findIndex(item => item.id === row.id);
    return index;
  }

  getGroupRowHeight(group, rowHeight) {
    let style = {};

    style = {
      height: (group.length * 40) + 'px',
      width: '100%'
    };

    return style;
  }


  updateSubTotalRow(cell, rowIndex) {
    // console.log('inline editing rowIndex', rowIndex);
    this.editing[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = this.ajustarDecimales(this.rows[rowIndex]['tarifa'], 2) *
                                this.ajustarDecimales(this.rows[rowIndex]['totalCantidad'], 2) ;
    this.rows = [...this.rows];
    // console.log('UPDATED!', this.rows[rowIndex][cell]);
    this.recalcularTotales();
  };


  ajustarDecimales (value: number , decimales: number) {
    return parseFloat(value.toFixed(decimales));
  }

  validarGuias() {
    let resultado = true;

    this.rows.forEach((item, i) => {
      // this.subTotal += (item.product.price.sale * item.data.quantity);
       if (this.rows[i]['tarifa'] === 0.00) {
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

  get origen_ (): FormControl {
    return this.formLiquidacion.get('origen') as FormControl;
  }


  get moneda (): FormControl {
    return this.formLiquidacion.get('moneda') as FormControl;
  }

  get estado (): FormControl {
    return this.formLiquidacion.get('estado') as FormControl;
  }

  get situacion (): FormControl {
    return this.formLiquidacion.get('situacion') as FormControl;
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

  captureScreen() {
    const documento = new jspdf('Landscape');
    this.listadoGuias = this.rows;

    const lista: Array<GuiasRemisionPDF> = new Array<GuiasRemisionPDF>();

    this.listadoGuias.forEach(function(itemGuias, index){
      const guiaPDF: GuiasRemisionPDF = new GuiasRemisionPDF();
        guiaPDF.id = index + 1;
        guiaPDF.fechaTraslado = itemGuias.fechaTraslado.toString();
        guiaPDF.guiaRemision = itemGuias.serie + '-' + itemGuias.secuencia;
        guiaPDF.guiaCliente = itemGuias.serieCliente + '-' + itemGuias.secuenciaCliente;
        guiaPDF.descripcion = itemGuias.guiaDetalle[0].producto.nemonico;
        guiaPDF.ticketBalanza = itemGuias.ticketBalanza;
        guiaPDF.unidadMedida = itemGuias.guiaDetalle[0].unidadMedida.valor;
        guiaPDF.cantidad = itemGuias.totalCantidad.toFixed(2);
        guiaPDF.tarifa = itemGuias.tarifa.toFixed(2);
        guiaPDF.subTotal = itemGuias.subTotal.toFixed(2);
        lista.push(guiaPDF);
    }, this);

    let finalY = documento.lastAutoTable.finalY || 0 ;

    // documento.setFontSize(18);
    // documento.setFontSize(11);
    // documento.text('With content', 50, 40);
    // documento.setFontSize(11);
    // documento.setTextColor(100);


    documento.autoTable({
      // headStyles: {fillColor: [155, 89, 182]}, // Purple
      // columnStyles: {id: {halign: 'center'}, text: {cellWidth: 'auto'}},
      body:  [
        [this.usuarioSession.empresa.razonSocial, '2020/10/01'],
      ],
      bodyStyles: {
        font: 'helvetica', fontSize: 9, overflow: 'ellipsize'
      },
      // styles: {overflow: 'ellipsize', cellWidth: 'wrap', fontSize: 10},
      theme: 'plain',
      startY: finalY + 10,
      showHead: 'firstPage',
      columns: [{header: 'EMPRESA:',  columnWidth: 200},
                {header: 'FECHA REGISTRO:', columnWidth: 10},
              ],
      columnStyles: {
            empresa: {
                columnWidth: 200, fontSize: 10
            },
            fechaRegistro: {
                columnWidth: 10, fontSize: 10, halign: 'right'
            }
       },
    });

    finalY = documento.lastAutoTable.finalY;

    documento.autoTable({
      // headStyles: {fillColor: [155, 89, 182]}, // Purple
      // columnStyles: {id: {halign: 'center'}, text: {cellWidth: 'auto'}},
      body:  [
        [this.nroDocumentoLiq.value, 'Soles', 'Vigente', 'Pendiente'],
      ],
      bodyStyles: {
        font: 'helvetica', fontSize: 10, overflow: 'ellipsize'
      },
      // styles: {overflow: 'ellipsize', cellWidth: 'wrap', fontSize: 10},
      theme: 'plain',
      startY: finalY + 10,
      showHead: 'firstPage',
      columns: [{header: 'NRO LIQUIDACION:',  columnWidth: 100},
                {header: 'MONEDA:', columnWidth: 10},
                {header: 'ESTADO:', columnWidth: 10},
                {header: 'SITUACION:', columnWidth: 10},
              ],
      columnStyles: {
            //empresa: {
             //   columnWidth: 200, fontSize: 10
            //},
            //fechaRegistro: {
              //  columnWidth: 10, fontSize: 10, halign: 'right'
            //}
       },
    });

    finalY = documento.lastAutoTable.finalY;

        // jsPDF 1.4+ uses getWidth, <1.4 uses .width
    // var pageSize = documento.internal.pageSize;
    // var pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
    // var text = documento.splitTextToSize('mucho texto', pageWidth - 35, {});
    // documento.text(text, 14, 30);

    documento.autoTable({
      // headStyles: {fillColor: [155, 89, 182]}, // Purple
      columnStyles: {id: {halign: 'center'}, text: {cellWidth: 'auto'}},
      body: lista,
      styles: {overflow: 'ellipsize', cellWidth: 'wrap', fontSize: 8},
      theme: 'striped',
      startY: finalY + 10,
      showHead: 'firstPage',
      columns: [{header: 'Item', dataKey: 'id'},
                {header: 'F.Traslado', dataKey: 'fechaTraslado'},
                {header: 'Guia de Remisión', dataKey: 'guiaRemision'},
                {header: 'Guia Rem. Cliente', dataKey: 'guiaCliente'},
                {header: 'Descripción', dataKey: 'descripcion'},
                {header: 'UM', dataKey: 'unidadMedida'},
                {header: 'Cantidad', dataKey: 'cantidad'},
                {header: 'P.Unitario', dataKey: 'tarifa'},
                {header: 'Sub Total', dataKey: 'subTotal'},
              ]
    });
    documento.text("hola", 28, documento.lastAutoTable.finalY + 10);
    documento.save('table.pdf');


  }


}
