import { Component, OnInit, LOCALE_ID, Inject } from '@angular/core';
import { Usuario } from '../../../../shared/models/usuario.model';
import { Liquidacion } from '../../../../shared/models/liquidacion.model';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ErrorResponse, InfoResponse, FiltrosGuiasLiq } from '../../../../shared/models/error_response.model';
import { Factoria } from '../../../../shared/models/factoria.model';
import { FactoriaService } from '../../../../shared/services/factorias/factoria.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LiquidacionService } from '../../../../shared/services/liquidacion/liquidacion.service';
import { UsuarioService } from '../../../../shared/services/auth/usuario.service';
import { MatSnackBar, MatDialog, MAT_DIALOG_DATA, MatDialogRef, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { CustomValidators } from 'ng2-validation';
import { HttpErrorResponse } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { OrdenesServicioComponent } from '../../ordenes-servicio/ordenes-servicio.component';
import { GuiaRemision } from '../../../../shared/models/guia_remision.model';
import { GuiaRemisionService } from '../../../../shared/services/guias/guia-remision.service';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../shared/helpers/date.adapter';

@Component({
  selector: 'app-buscar-guia-liq',
  templateUrl: './buscar-guia-liq.component.html',
  styleUrls: ['./buscar-guia-liq.component.scss'],
  providers: [
    {
        provide: DateAdapter, useClass: AppDateAdapter
    },
    {
        provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
    ]
})
export class BuscarGuiaLiqComponent implements OnInit {

  rows = [];
  temp = [];
  selected = [];
  columns = [];
  usuarioSession: Usuario;
  listadoGuiasSelected: GuiaRemision[];
  listadoGuias: GuiaRemision[];

  // Ng Model
  formFilter: FormGroup;
  public valorFechaIniTraslado_: Date;
  public valorFechaFinTraslado_: Date;
  public valorOrigenSelected_: any;
  public valorDestinoSelected_: any;
  
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

  // Manejo de respuesta
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;
  filtros: FiltrosGuiasLiq;

  // Combos para filtros de búsqueda
  comboFactorias: Factoria[];
  comboFactoriasDestino: Factoria[];
  facturacionCheck = false;


  constructor(
    @Inject(LOCALE_ID) private locale: string,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<BuscarGuiaLiqComponent>,
    private factoriaService: FactoriaService,
    private fb: FormBuilder,
    private userService: UsuarioService,
    private guiaRemisionService: GuiaRemisionService,
    public snackBar: MatSnackBar,
    private loader: AppLoaderService) {
  }

  ngOnInit() {


    this.formFilter = this.fb.group({
      fechaIniTraslado: ['', [Validators.required]],
      fechaFinTraslado: ['', [Validators.required]],
      origenSelected: ['', [Validators.required]],
      destinoSelected: ['', [Validators.required]],
    });


    // Recupera datos de usuario de session
    this.usuarioSession = this.userService.getUserLoggedIn();

    // Carga de Combos Factorias
    this.factoriaService.listarComboFactorias('O').subscribe(data1 => {
      this.comboFactorias = data1;
    });

    this.factoriaService.listarComboFactorias('D').subscribe(data3 => {
      this.comboFactoriasDestino = data3;
    });

    this.valorFechaIniTraslado_ = this.data.payload.fechaIni;
    this.valorFechaFinTraslado_ = this.data.payload.fechaFin;
    this.valorOrigenSelected_ = this.data.payload.origen;
    this.valorDestinoSelected_ = this.data.payload.destino;

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


  buscarGuiasXLiquidar() {
    
    this.selected = [];
    this.loader.open();

    const fechaIni = formatDate(this.valorFechaIniTraslado_, 'yyyy-MM-dd', this.locale);
    const fechaFin = formatDate(this.valorFechaFinTraslado_, 'yyyy-MM-dd', this.locale);

    this.guiaRemisionService.listarGuiasRemisionPorLiquidar(this.usuarioSession.empresa.id,
                                this.valorOrigenSelected_.id,
                                this.valorDestinoSelected_.id,
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

  compareObjects(o1: any, o2: any): boolean {
    return o1.name === o2.name && o1.id === o2.id;
  }

  onSelect({ selected }) {
    this.listadoGuiasSelected = selected;
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  submit() {
    this.dialogRef.close(this.listadoGuiasSelected);
  }

}
