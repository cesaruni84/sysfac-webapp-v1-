import { Liquidacion } from '../../../shared/models/liquidacion.model';
import { LiquidacionService } from '../../../shared/services/liquidacion/liquidacion.service';
import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { Usuario } from '../../../shared/models/usuario.model';
import { FormGroup, FormControl } from '@angular/forms';
import { Factoria } from '../../../shared/models/factoria.model';
import { CustomValidators } from 'ng2-validation';
import { Router, ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../../../shared/services/auth/usuario.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { FactoriaService } from '../../../shared/services/factorias/factoria.service';
import { HttpErrorResponse } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { ErrorResponse, InfoResponse } from '../../../shared/models/error_response.model';
import { MatSnackBar, DateAdapter, MAT_DATE_FORMATS, MatDialogRef, MatDialog } from '@angular/material';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../shared/helpers/date.adapter';
import { ExcelService } from '../../../shared/services/util/excel.service';
import { OrdenesServicioComponent } from '../ordenes-servicio/ordenes-servicio.component';

@Component({
  selector: 'app-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.css'],
  providers: [
    {
        provide: DateAdapter, useClass: AppDateAdapter
    },
    {
        provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
    ]
})
export class RichTextEditorComponent implements OnInit {

  rows = [];
  temp = [];
  selected = [];
  columns = [];
  usuarioSession: Usuario;
  liquidacionesSelected: Liquidacion[];

  // Ng Model
  formFilter: FormGroup;
  public valorNroSerieLiq_: string;
  public fechaIniTraslado_: Date;
  public fechaFinTraslado_: Date;
  public valorEstadoSelected_: any = '0';
  public valorOrigenSelected_: any = '0';
  public valorDestinoSelected_: any = '0';
  public facturado: boolean = false;
  
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

  // Manejo de respuesta
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;

  // Combos para filtros de búsqueda
  comboFactorias: Factoria[];
  comboFactoriasDestino: Factoria[];
  facturacionCheck = false;


  constructor(
    private factoriaService: FactoriaService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UsuarioService,
    private liquidacionService: LiquidacionService,
    public snackBar: MatSnackBar,
    public excelService: ExcelService,
    private dialog: MatDialog,
    @Inject(LOCALE_ID) private locale: string,
    private loader: AppLoaderService) {
  }

  ngOnInit() {
    const fechaActual_ = new Date();
    let fechaIniTraslado_ = new Date();
    // fechaIniTraslado_.setDate((fechaIniTraslado_.getDate()) - 90);
    fechaIniTraslado_  =   new Date(fechaActual_.getFullYear(), fechaActual_.getMonth(), 1);


    this.formFilter = new FormGroup({
      nroSerieLiq: new FormControl('', CustomValidators.digits),
      fechaIniLiq: new FormControl(fechaIniTraslado_, ),
      fechaFinLiq: new FormControl(fechaActual_, ),
      origenSelected: new FormControl('', ),
      destinoSelected: new FormControl('', ),
      estadoSelected: new FormControl('0', ),
      esFacturado: new FormControl(this.facturado, ),
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

    // this.loader.open();
    // this.liquidacionService.listarLiquidacionesPorEmpresa(this.usuarioSession.empresa.id).subscribe(liquidaciones => {
    //   this.rows = liquidaciones;
    //   this.loader.close();
    // });


  }


  // Completar Zeros
  completarZerosNroSerieLiq(event) {
    const valorDigitado = event.target.value.toLowerCase();
    if (!(valorDigitado === '')) {
      this.valorNroSerieLiq_ = this.pad(valorDigitado, 12);
    };

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

  filtrarLiquidaciones() {
    this.loader.open();
    this.selected = [];

    // Obtiene valores de parametros para la búsqueda
    let nroDocLiq  =  this.formFilter.controls['nroSerieLiq'].value;
    const fechaIniLiq = formatDate(this.formFilter.controls['fechaIniLiq'].value, 'yyyy-MM-dd', this.locale);
    const fechaFinLiq = formatDate(this.formFilter.controls['fechaFinLiq'].value, 'yyyy-MM-dd', this.locale);
    const origen = this.formFilter.controls['origenSelected'].value;
    const destino = this.formFilter.controls['destinoSelected'].value;
    const estado  =  this.formFilter.controls['estadoSelected'].value;

    const conFactura  =  this.formFilter.controls['esFacturado'].value;
    let valorConFactura = 0;
    if (conFactura) {
      valorConFactura = 1;
    }
    const buscarLiqSinFactura = false;
    this.liquidacionService.listarLiquidacionesPorFiltro(this.usuarioSession.empresa.id,
                                                        nroDocLiq || '',
                                                        origen,
                                                        destino,
                                                        estado ,
                                                        buscarLiqSinFactura,
                                                        valorConFactura,
                                                        fechaIniLiq, fechaFinLiq).subscribe(data_ => {
      this.rows = data_;
      this.loader.close();
    },
    (error: HttpErrorResponse) => {
      this.loader.close();
      this.rows = [];
      this.errorResponse_ = error.error;
      this.snackBar.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 5000,  panelClass: ['blue-snackbar'] });
    });

  }


  asignarOrdenServicio(data: any = {}, isNew?) {

    if (this.selected.length > 0) {
      let title = isNew ? 'ASIGNAR ORDEN DE SERVICIO' : 'Actualizar Item';
      let dialogRef: MatDialogRef<any> = this.dialog.open(OrdenesServicioComponent, {
        width: '840px',
        height: '640px',
        disableClose: true,
        data: { title: title, payload: this.liquidacionesSelected }
      });
      dialogRef.afterClosed()
        .subscribe(res => {
          if (!res) {
            // If user press cancel
            this.loader.close();
            return;
          }
          if (isNew) {
            this.filtrarLiquidaciones();
            this.loader.close();

            // this.crudService.addItem(res)
            //   .subscribe(data => {
            //     this.items = data;
            //     this.loader.close();
            //     this.snack.open('Member Added!', 'OK', { duration: 4000 });
            //   });
          } else {
            this.loader.close();

            // this.crudService.updateItem(data._id, res)
            //   .subscribe(data => {
            //     this.items = data;
            //     this.loader.close();
            //     this.snack.open('Member Updated!', 'OK', { duration: 4000 });
            //   });
          }
        });
    } else {
      this.loader.close();
      return;
    }
  }


  onSelect({ selected }) {

    this.liquidacionesSelected = selected;
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }


  // Genera Reporte para Excel
  ExportTOExcel() {
    this.excelService.generarReporteLiquidaciones(this.rows);
  }

  // Envia a Página de Consulta de Documento de Liquidación
  consultarLiquidacion(row) {
    this.router.navigate(['/forms/liquidacion'], { queryParams: { nroDocLiq: row.nrodoc } });
  }


}
