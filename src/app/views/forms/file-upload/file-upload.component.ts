import { AppDateAdapter, APP_DATE_FORMATS } from './../../../shared/helpers/date.adapter';
import { Liquidacion } from './../../../shared/models/liquidacion.model';
import { LiquidacionService } from './../../../shared/services/liquidacion/liquidacion.service';
import { GuiaRemision } from '../../../shared/models/guia_remision.model';
import { Component, OnInit, Inject, LOCALE_ID, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsuarioService } from '../../../shared/services/auth/usuario.service';
import { Usuario } from '../../../shared/models/usuario.model';
import { TablesService } from '../../tables/tables.service';
import { MAT_DATE_LOCALE, NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { MomentDateAdapter, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { CustomValidators } from 'ng2-validation';
import { FactoriaService } from '../../../shared/services/factorias/factoria.service';
import { Factoria } from '../../../shared/models/factoria.model';
import { MotivoTrasladoService } from '../../../shared/services/motivos-traslado/motivo-traslado.service';
import { MotivoTraslado } from '../../../shared/models/motivo_traslado.model';
import { GuiaRemisionService } from '../../../shared/services/guias/guia-remision.service';
import { MatSort, MatTableDataSource, MatSnackBar, MatPaginator } from '@angular/material';
import { formatDate } from '@angular/common';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse, InfoResponse } from '../../../shared/models/error_response.model';
import { ImpuestoService } from '../../../shared/services/liquidacion/impuesto.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';


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

  // Usuario sesionado
  usuarioSession: Usuario;
  formLiquidacion: FormGroup;

  // Combos de Formularios
  comboFactorias: Factoria[];
  comboFactoriasDestino: Factoria[];
  comboMotivosTraslado: MotivoTraslado[];

  // Manejo insert o update
  idNroDocLiq: number;
  nroDocLiqQuery: string;
  edicion: boolean = false;

  // Ng Model
  liquidacionModel: Liquidacion;
  valorNroDocumentoLiq_: string;
  estadoLiquidacion_: string;
  situacionLiquidacion_: string;
  monedaLiquidacion_: string;
  valorFechaIniTraslado_: Date;
  valorFechaFinTraslado_: Date;
  valorFechaRegistro_: Date;
  valorOrigenSelected_: number;
  valorDestinoSelected_: number;
  motivoTrasladoSelected_: number;
  valorGlosa_: string;

  // Manejo de usuario
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;

  // Listado de Guias
  listadoGuias: GuiaRemision[];
  rows = [];

  // Variables Totales
  totalCantidadGuiasLiq_: number;
  subTotalImpGuiasLiq_: number;
  IGV_DEFAULT: number;
  igvAplicado_: number;
  totalImpGuiasLiq_: number;
  editing = {};

  constructor(private userService: UsuarioService,
              private factoriaService: FactoriaService,
              private motivoTrasladoService: MotivoTrasladoService,
              private impuestoService: ImpuestoService,
              private guiaRemisionService: GuiaRemisionService,
              private liquidacionService: LiquidacionService,
              private confirmService: AppConfirmService,
              private route: ActivatedRoute,
              private router: Router,
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
    this.cargarCombosFormulario();

    // Si es edicion recuperar datos de BD
    if (this.edicion) {
      this.recuperarLiquidacionBD();
    } else {
      this.defaultValues();
    }


  }

  validarGrabarActualizar() {
    this.route.queryParams.subscribe(params => {
        this.nroDocLiqQuery = params.nroDocLiq;
        this.edicion = (this.nroDocLiqQuery) != null ;
        console.log(this.edicion);
      }
    );
  }

  initForm() {

    this.formLiquidacion = new FormGroup({
      empresa_: new FormControl({value: this.usuarioSession.empresa.razonSocial, disabled: true},),
      nroDocumentoLiq: new FormControl( '', Validators.required),
      fechaRegistro: new FormControl({value: '', disabled: true}),
      estado: new FormControl({value: '0', disabled: true}, ),
      situacion: new FormControl({value: '0', disabled: true}, ),
      moneda: new FormControl({value: '0', disabled: false}, ),
      origen: new FormControl('', Validators.required),
      destino: new FormControl('', Validators.required ),
      motivoTraslado: new FormControl('', ),
      fechaIniTraslado: new FormControl('', [
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.required,
        CustomValidators.date
      ]),
      fechaFinTraslado: new FormControl('', [
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

  // Obtiene datos de base de datos
  recuperarLiquidacionBD()  {
    this.loader.open();
    this.liquidacionService.obtenerLiquidacionPorNroDoc(this.usuarioSession.empresa.id,
                                                        this.nroDocLiqQuery).subscribe((data_) => {
      // this.initForm(data_);
      console.log(data_);

      // Datos de cabeceras
      this.idNroDocLiq = data_.id;
      this.valorNroDocumentoLiq_ = this.nroDocLiqQuery;
      this.estadoLiquidacion_ = data_.estado.toString();
      this.situacionLiquidacion_ = data_.situacion.toString();
      this.monedaLiquidacion_ = data_.moneda.toString();
      this.valorFechaIniTraslado_ = data_.fecIniTraslado;
      this.valorFechaFinTraslado_ = data_.fecFinTraslado;
      this.valorFechaRegistro_ = data_.fechaEmision;
      this.valorOrigenSelected_ = data_.origen.id;
      this.valorDestinoSelected_ = data_.destino.id;
      this.motivoTrasladoSelected_ = data_.motivo.id;
      this.valorGlosa_ = data_.glosa;

      // Guias asociadas
      this.rows = data_.guias;

      // Obtiene % impuesto I.G.V - 1
      this.impuestoService.obtenerValorImpuesto(1).subscribe(data2 => {
        this.IGV_DEFAULT = data2.valor;
      });

      this.loader.close();


    }, (error: HttpErrorResponse) => {
      this.loader.close();
      this.errorResponse_ = error.error;
      this.snackBar.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 10000,  panelClass: ['blue-snackbar'] });
      console.log(this.errorResponse_.errorMessage);

    });
  }

  defaultValues() {
    this.valorNroDocumentoLiq_ = '000000000000';
    this.estadoLiquidacion_ = '1';
    this.situacionLiquidacion_ = '1';
    this.monedaLiquidacion_ = '0';
    this.valorFechaIniTraslado_ = new Date();
    this.valorFechaFinTraslado_ = new Date();
    this.valorFechaRegistro_ = new Date();
    this.valorFechaIniTraslado_.setDate((this.valorFechaIniTraslado_ .getDate()) - 30);
    this.valorOrigenSelected_ = 8;
    this.valorDestinoSelected_ = 1;
    this.motivoTrasladoSelected_ = 2;

    // Obtiene % impuesto I.G.V - 1
    this.impuestoService.obtenerValorImpuesto(1).subscribe(data2 => {
      this.IGV_DEFAULT = data2.valor;
    });

  }

  cargarCombosFormulario() {

    this.factoriaService.listarComboFactorias('O').subscribe(data1 => {
      this.comboFactorias = data1;
    });

    this.factoriaService.listarComboFactorias('D').subscribe(data3 => {
      this.comboFactoriasDestino = data3;
    });

    this.motivoTrasladoService.listarComboMotivosTraslado().subscribe(data2 => {
      this.comboMotivosTraslado = data2;
    });

  }





  buscarGuiasXLiquidar() {

    this.loader.open();

    const fechaIni = formatDate(this.valorFechaIniTraslado_, 'yyyy-MM-dd', this.locale);
    const fechaFin = formatDate(this.valorFechaFinTraslado_, 'yyyy-MM-dd', this.locale);

    this.guiaRemisionService.listarGuiasRemisionPorLiquidar(this.usuarioSession.empresa.id,
                                this.valorOrigenSelected_,
                                this.valorDestinoSelected_,
                                fechaIni,
                                fechaFin).subscribe(data_ => {
      this.listadoGuias = data_;
      this.rows = data_;
      this.loader.close();
    },
    (error: HttpErrorResponse) => {
      this.loader.close();
      this.errorResponse_ = error.error;
      this.snackBar.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 20000,  panelClass: ['blue-snackbar'] });
    });

  }


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
            this.snackBar.open('Importe de tarifa es igual a 0.00, configurar la tarifa para la ruta seleccionada.', 'OK', { duration: 10000 });
            this.loader.close();
          } else {
            console.log(this.rows);
            this.liquidacionModel.tipocod = 'LST';
            this.valorNroDocumentoLiq_ = this.pad(this.valorNroDocumentoLiq_, 12) ;
            this.liquidacionModel.nrodoc = this.valorNroDocumentoLiq_;
            this.liquidacionModel.fechaEmision = this.valorFechaRegistro_;
            this.liquidacionModel.estado = this.formLiquidacion.get('estado').value;
            this.liquidacionModel.situacion = this.formLiquidacion.get('situacion').value;
            console.log(this.valorFechaIniTraslado_);
            this.liquidacionModel.fecIniTraslado =  this.valorFechaIniTraslado_;
            console.log(this.valorFechaFinTraslado_);
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
  
            const origenTemp = new Factoria();
            origenTemp.id = this.formLiquidacion.get('origen').value;
            this.liquidacionModel.origen = origenTemp;
  
            const destinoTemp = new Factoria();
            destinoTemp.id = this.formLiquidacion.get('destino').value;
            this.liquidacionModel.destino = destinoTemp;
  
            this.liquidacionModel.guias = this.rows;
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
      this.snackBar.open(this.infoResponse_.alertMessage, 'cerrar', { duration: 20000 });

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
        this.snackBar.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 20000 });
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
  completarZerosNroDoc(event) {
    const valorDigitado = event.target.value.toLowerCase();
    this.valorNroDocumentoLiq_ = this.pad(valorDigitado, 12);
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
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
    console.log('UPDATED!', this.rows[rowIndex][cell]);

    this.updateSubTotalRow('subTotal', rowIndex);
    this.recalcularTotales();
  }


  updateSubTotalRow(cell, rowIndex) {
    console.log('inline editing rowIndex', rowIndex);
    this.editing[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = this.rows[rowIndex]['tarifa'] * this.rows[rowIndex]['totalCantidad'] ;
    this.rows = [...this.rows];
    console.log('UPDATED!', this.rows[rowIndex][cell]);
    this.recalcularTotales();
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


}
