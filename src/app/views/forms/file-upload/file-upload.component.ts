import { GuiaRemision } from '../../../shared/models/guia_remision.model';
import { Component, OnInit, Inject, LOCALE_ID, ViewChild } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsuarioService } from '../../../shared/services/auth/usuario.service';
import { Usuario } from '../../../shared/models/usuario.model';
import { TablesService } from '../../tables/tables.service';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { MomentDateAdapter, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { CustomValidators } from 'ng2-validation';
import { FactoriaService } from '../../../shared/services/factorias/factoria.service';
import { Factoria } from '../../../shared/models/factoria.model';
import { MotivoTrasladoService } from '../../../shared/services/motivos-traslado/motivo-traslado.service';
import { MotivoTraslado } from '../../../shared/models/motivo_traslado.model';
import { GuiaRemisionService } from '../../../shared/services/guias/guia-remision.service';
import { MatSort, MatTableDataSource, MatSnackBar, MatPaginator } from '@angular/material';
import { formatDate } from '@angular/common';


@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
  providers: [TablesService, {provide: MAT_DATE_LOCALE, useValue: 'es-ES'},
  {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
  {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ]
})
export class FileUploadComponent implements OnInit {

  displayedColumns = ['acciones', 'item', 'fechaTraslado', 'nroguia', 'nroguia2', 'producto', 'ticketBalanza'
                      , 'totalCantidad', 'unidadMedida', 'tarifa', 'subTotal'];

 displayedColumnsFooter = ['ticketBalanza', 'totalCantidad', 'unidadMedida' , 'tarifa', 'subTotal'];

  dataSource: MatTableDataSource<GuiaRemision>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  public uploader: FileUploader = new FileUploader({ url: 'https://evening-anchorage-315.herokuapp.com/api/' });
  public hasBaseDropZoneOver: boolean = false;

  console = console;

  // Usuario sesionado
  usuarioSession: Usuario;
  formLiquidacion: FormGroup;

  // Combos de Formularios
  comboFactorias: Factoria[];
  comboFactoriasDestino: Factoria[];
  comboMotivosTraslado: MotivoTraslado[];


  // Ng Model
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

  // Listado de Guias
  listadoGuias: GuiaRemision[];
  rows = [];

  constructor(private userService: UsuarioService,
              private factoriaService: FactoriaService,
              private motivoTrasladoService: MotivoTrasladoService,
              private guiaRemisionService: GuiaRemisionService,
              @Inject(LOCALE_ID) private locale: string,
              ) {

  }

  ngOnInit() {
    // Recupera datos de usuario de session
    this.usuarioSession = this.userService.getUserLoggedIn();
    this.initForm();
    this.cargarCombosFormulario();
    this.defaultValues();

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
        Validators.required
       ]),
    });

  }

  defaultValues() {
    this.valorNroDocumentoLiq_ = '000000000000';
    this.estadoLiquidacion_ = '0';
    this.situacionLiquidacion_ = '0';
    this.monedaLiquidacion_ = '0';
    this.valorFechaIniTraslado_ = new Date();
    this.valorFechaFinTraslado_ = new Date();
    this.valorFechaRegistro_ = new Date();
    this.valorFechaIniTraslado_.setDate((this.valorFechaIniTraslado_ .getDate()) - 30);
    this.valorOrigenSelected_ = 8;
    this.valorDestinoSelected_ = 1;
    this.motivoTrasladoSelected_ = 2;

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

    const fechaIni = formatDate(this.valorFechaIniTraslado_, 'yyyy-MM-dd', this.locale);
    const fechaFin = formatDate(this.valorFechaFinTraslado_, 'yyyy-MM-dd', this.locale);

    this.guiaRemisionService.listarGuiasRemisionPorLiquidar(this.usuarioSession.empresa.id,
                                this.valorOrigenSelected_,
                                this.valorDestinoSelected_,
                                fechaIni,
                                fechaFin).subscribe(data_ => {
      this.listadoGuias = data_;
      this.dataSource = new MatTableDataSource(data_);
     // this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.rows = data_;
      console.log(data_);
    });

  }


  /** Gets the total cost of all transactions. */
  sumTotalCantidad() {
    return this.rows.map(t => t.totalCantidad).reduce((acc, value) => acc + value, 0);
  }

  /** Gets the total cost of all transactions. */
  sumSubTotalImporte() {
    return this.rows.map(t => t.subTotal).reduce((acc, value) => acc + value, 0);
  }

  calcularImporteIGV() {
    return 18.00;
  }

  calcularImporteTotal() {
    return 2300.35;
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }
}
