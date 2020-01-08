import { FactoriaService } from '../../../shared/services/factorias/factoria.service';
import { UsuarioService } from '../../../shared/services/auth/usuario.service';
import { Component, OnInit, ViewChild, LOCALE_ID, Inject } from '@angular/core';
import { TablesService } from '../tables.service';
import { GuiaRemisionService } from '../../../shared/services/guias/guia-remision.service';
import { Usuario } from '../../../shared/models/usuario.model';
import { Factoria } from '../../../shared/models/factoria.model';
import { Chofer } from '../../../shared/models/chofer.model';
import { ChoferService } from '../../../shared/services/chofer/chofer.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../shared/helpers/date.adapter';
import { FormGroup, FormControl} from '@angular/forms';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { CustomValidators } from 'ng2-validation';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { GrillaGuiaRemision } from '../../../shared/models/guia_remision.model';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { ExcelService } from '../../../shared/services/util/excel.service';
import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../../../shared/models/error_response.model';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-paging-table',
  templateUrl: './paging-table.component.html',
  styleUrls: ['./paging-table.component.css'],
  providers: [ TablesService,
    {
        provide: DateAdapter, useClass: AppDateAdapter
    },
    {
        provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
    ],
})


export class PagingTableComponent implements OnInit {

  rows = [];
  temp = [];
  total_rows_bd = [];
  columns = [];
  usuarioSession: Usuario;
  listaGrillaGuias: GrillaGuiaRemision[];
  formFilter: FormGroup;
  errorResponse_: ErrorResponse;


  // Ng Model
  public valorNroSerie_: string;
  public valorNroSecuencia_: string;
  public valorNroSerieCli_: string;
  public valorNroSecuenciaCli_: string;
  public fechaIniTraslado_: Date;
  public fechaFinTraslado_: Date;
  public estadoSelected_: string;
  public choferSelected_: any;
  public destinatarioSelected_: any;
  public facturado: boolean = false;

  messages: any = {
    // Message to show when array is presented
    // but contains no values
    emptyMessage: '-',

    // Footer total message
    totalMessage: 'total',

    // Footer selected message
    selectedMessage: 'selected'
  };

  // Combos para filtros de búsqueda
  comboFactorias: Factoria[];
  comboChoferes: Chofer[];
  facturacionCheck = false;

  @ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(private service: TablesService,
    private guiaRemisionService: GuiaRemisionService,
    private choferService: ChoferService,
    private factoriaService: FactoriaService,
    private router: Router,
    private excelService: ExcelService,
    private userService: UsuarioService,
    public snackBar: MatSnackBar,
    @Inject(LOCALE_ID) private locale: string,
    private loader: AppLoaderService) {


  }

  ngOnInit() {

    this.initForm();

    // Recupera datos de usuario de session
    this.usuarioSession = this.userService.getUserLoggedIn();

    // Carga de Combos Factorias
    this.factoriaService.listarComboFactorias('D').subscribe(data1 => {
      this.comboFactorias = data1;
    });

    // Carga de Combos Choferes
    this.choferService.listarComboChoferes(this.usuarioSession.empresa.id).subscribe(data4 => {
      this.comboChoferes = data4;
    });

    // Carga de Grilla Principal
    // this.busquedaInicial();

    // this.guiaRemisionService.listarGrillaGuias(this.usuarioSession.empresa.id).subscribe(data => {
    //   this.listaGrillaGuias = data;
    //   this.rows = this.temp = this.total_rows_bd = data;
    //   this.loader.close();
    // });
  }


  initForm() {
    const fechaActual_ = new Date();
    const fechaIniTraslado_ = new Date();
    fechaIniTraslado_.setDate((fechaIniTraslado_.getDate()) - 90);

    this.formFilter = new FormGroup({
      nroSerie: new FormControl('', CustomValidators.digits),
      nroSecuencia: new FormControl('', CustomValidators.digits),
      nroSerieCli: new FormControl('', CustomValidators.digits),
      nroSecuenciaCli: new FormControl('', CustomValidators.digits),
      fechaIniTraslado: new FormControl(fechaIniTraslado_, ),
      fechaFinTraslado: new FormControl(fechaActual_, ),
      estadoSelected: new FormControl('99', ),
      choferSelected: new FormControl('0', ),
      origenSelected: new FormControl('0', ),
      destinatarioSelected: new FormControl('0', ),
      esFacturado: new FormControl(this.facturado, ),
   });
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
      this.valorNroSerie_ = this.pad(valorDigitado, 5);
    };
  }

  // Completar Zeros
 completarZerosNroSecuencia(event) {
    const valorDigitado = event.target.value.toLowerCase();
    if (!(valorDigitado === '')) {
      this.valorNroSecuencia_ = this.pad(valorDigitado, 8);
    }
  }

  // Completar Zeros
  completarZerosNroSerieCli(event) {
    const valorDigitado = event.target.value.toLowerCase();
    if (!(valorDigitado === '')) {
      this.valorNroSerieCli_ = this.pad(valorDigitado, 5);
    }
  }

  // Completar Zeros
  completarZerosNroSecuenciaCli(event) {
    const valorDigitado = event.target.value.toLowerCase();
    if (!(valorDigitado === '')) {
      this.valorNroSecuenciaCli_ = this.pad(valorDigitado, 8);
    }
  }

  pad(number: string, length: number): string {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
  }



  // Filtros para busqueda
  seleccionarFactoriaDestinatario(event) {
    const val = event.value.toLowerCase();
    const columns = Object.keys(this.temp[0]);
    // Removes last "$$index" from "column"
    columns.splice(columns.length - 1);
    if (!columns.length) {
      return;
    }

    const rows = this.temp.filter(function(d) {
      for (let i = 0; i <= columns.length; i++) {
        const column = columns[i];
        // console.log(d[column]);
        if (d[column] && d[column].toString().toLowerCase().indexOf(val) > -1) {
          return true;
        }
      }
    });

    this.rows = rows;

  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    const rows = this.temp.filter(function(d) {
    return d.nroguia.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rows = rows;
    this.table.offset = 0;
  }


  busquedaInicial() {
    this.loader.open();

    // Obtiene valores de parametros para la búsqueda
    const nroSerie  =  this.formFilter.controls['nroSerie'].value;
    const nroSecuencia  =  this.formFilter.controls['nroSecuencia'].value;
    const fechaIni = formatDate(this.formFilter.controls['fechaIniTraslado'].value, 'yyyy-MM-dd', this.locale);
    const fechaFin = formatDate(this.formFilter.controls['fechaFinTraslado'].value, 'yyyy-MM-dd', this.locale);
    const chofer = this.formFilter.controls['choferSelected'].value;
    const destino = this.formFilter.controls['destinatarioSelected'].value;
    const estado  =  this.formFilter.controls['estadoSelected'].value;

    this.guiaRemisionService.listarGuiasConFiltrosCache(this.usuarioSession.empresa.id,
                                                        nroSerie || '',
                                                        nroSecuencia || '',
                                                        estado,
                                                        chofer,
                                                        destino ,
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

  filtrar() {
    if (this.formFilter.controls['nroSerie'].value || this.formFilter.controls['nroSecuencia'].value ) {
      this.buscarGuiasConFiltro();
    } else {
      if (this.formFilter.controls['nroSerieCli'].value || this.formFilter.controls['nroSecuenciaCli'].value) {
        this.buscarPorGuiaCliente();
      } else {
        this.buscarGuiasConFiltro();
      }
    }
  }

  buscarGuiasConFiltro() {
    this.loader.open();

    if (this.formFilter.get('nroSerie').value) {
      this.formFilter.controls['nroSerie'].setValue(this.pad(this.formFilter.get('nroSerie').value, 5));
    }

    if (this.formFilter.get('nroSecuencia').value) {
      this.formFilter.controls['nroSecuencia'].setValue(this.pad(this.formFilter.get('nroSecuencia').value, 8));
    }

    // Obtiene valores de parametros para la búsqueda
    const nroSerie  =  this.formFilter.controls['nroSerie'].value;
    const nroSecuencia  =  this.formFilter.controls['nroSecuencia'].value;
    const estado  =  this.formFilter.controls['estadoSelected'].value;
    const chofer = this.formFilter.controls['choferSelected'].value;
    const origen = this.formFilter.controls['origenSelected'].value;
    const destino = this.formFilter.controls['destinatarioSelected'].value;
    const formateo = true ; // para grilla
    const guiasSinLiqFact = false;  // todo guias facturadas y no facturadas
    const soloFacturadas = this.formFilter.controls['esFacturado'].value;   // depende del check de la pantalla de filtros
    const fechaIni = formatDate(this.formFilter.controls['fechaIniTraslado'].value, 'yyyy-MM-dd', this.locale);
    const fechaFin = formatDate(this.formFilter.controls['fechaFinTraslado'].value, 'yyyy-MM-dd', this.locale);


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
    if (this.formFilter.get('nroSerieCli').value) {
      this.formFilter.controls['nroSerieCli'].setValue(this.pad(this.formFilter.get('nroSerieCli').value, 5));
    }
    if (this.formFilter.get('nroSecuenciaCli').value) {
      this.formFilter.controls['nroSecuenciaCli'].setValue(this.pad(this.formFilter.get('nroSecuenciaCli').value, 8));
    }

    // Obtiene valores de parametros para la búsqueda
    const nroSerieCli  =  this.formFilter.controls['nroSerieCli'].value;
    const nroSecuenciaCli  =  this.formFilter.controls['nroSecuenciaCli'].value;
    const estado  =  this.formFilter.controls['estadoSelected'].value;
    const chofer = this.formFilter.controls['choferSelected'].value;
    const origen = this.formFilter.controls['origenSelected'].value;
    const destino = this.formFilter.controls['destinatarioSelected'].value;
    const formateo = true ; // para grilla
    const guiasSinLiqFact = false;  // todo guias facturadas y no facturadas
    const soloFacturadas = this.formFilter.controls['esFacturado'].value;   // depende del check de la pantalla de filtros
    const fechaIni = formatDate(this.formFilter.controls['fechaIniTraslado'].value, 'yyyy-MM-dd', this.locale);
    const fechaFin = formatDate(this.formFilter.controls['fechaFinTraslado'].value, 'yyyy-MM-dd', this.locale);

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




  filtrarGuias() {
    this.temp =  this.total_rows_bd;
    const valorNroSerie_  =  this.formFilter.controls['nroSerie'].value;
    const valorNroSecuencia_  =  this.formFilter.controls['nroSecuencia'].value;
    const fechaIniTraslado_  =  new Date(this.formFilter.controls['fechaIniTraslado'].value);
    const fechaFinTraslado_  =  new Date(this.formFilter.controls['fechaFinTraslado'].value);
    const estadoSelected_  =  this.formFilter.controls['estadoSelected'].value;
    const choferSelected_  =  this.formFilter.controls['choferSelected'].value;
    const destinatarioSelected_  =  this.formFilter.controls['destinatarioSelected'].value;
    const mostrarGuiasFacturadas  =  this.formFilter.controls['esFacturado'].value;
    const rows2 = this.temp.filter(function(d) {
    const mostrarSerie = (d.nroguia.toLowerCase().indexOf(valorNroSerie_) !== -1) || !valorNroSerie_;
    const mostrarSecuencia = (d.nroSecuencia.toLowerCase().indexOf(valorNroSecuencia_) !== -1) || !valorNroSecuencia_ ;
    const fechaEmisionRow = new Date(d.fechaEmision);
    fechaEmisionRow.setTime(fechaEmisionRow.getTime() + fechaEmisionRow.getTimezoneOffset() * 60 * 1000);
    const mostrarFechaRow = ((fechaEmisionRow <=  fechaFinTraslado_) && (fechaEmisionRow >=  fechaIniTraslado_) ) ;
    const mostrarEstado = (d.estado.indexOf(estadoSelected_) !== -1) ;
    const mostrarChofer = (d.chofer.indexOf(choferSelected_) !== -1);
    const mostrarDestinatario = (d.destinatario.indexOf(destinatarioSelected_) !== -1) ;
    const guiaFacturada = d.ordenServicio.toLowerCase() !== '---------' ;
    const guiaNoFacturada = d.ordenServicio.toLowerCase() === '---------' ;

      let mostrarRegistro = false;
      if (!mostrarGuiasFacturadas) {
        if (guiaNoFacturada) {
          mostrarRegistro = true;
        }
      } else {
        if (guiaFacturada) {
          mostrarRegistro = true;
        }
      }


      // return d.nroguia.toLowerCase().indexOf(val) !== -1 || !val;
      // return true;
       return  mostrarSerie &&
               mostrarSecuencia &&
               mostrarFechaRow &&
               mostrarEstado &&
               mostrarChofer &&
               mostrarDestinatario &&
               mostrarRegistro;
    });

    this.rows = rows2;
    this.table.offset = 0;

  }


  private handleError(error: HttpErrorResponse) {

    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      // this.errorResponse_ = error.error;
      this.snackBar.open(this.errorResponse_.errorMessage, 'OK', { duration: 10000 });
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      if (error.error.codeMessage != null ) {
        this.errorResponse_ = error.error;
        this.snackBar.open(this.errorResponse_.errorMessage, 'OK', { duration: 10000 });
      } else {
        this.snackBar.open('Error de comunicación con los servicios. Intenta nuevamente.', 'OK',
                         { duration: 10000 , verticalPosition: 'top', horizontalPosition: 'end'});
        console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${error.error}`);
      }

    }
    // return an observable with a user-facing error message
    return throwError(
      'Ocurrió un error inesperado, volver a intentar.');
  };

  ExportTOExcel() {

    this.excelService.generarReporteGuiasRemision(this.rows);

    // const wscols = [ {wch: 10},{wch: 20},{wch: 20},{wch: 20},{wch: 20},{wch: 20},
    //       {wch: 20},{wch: 20}, {wch: 20},{wch: 20}, {wch: 20},{wch: 20},{wch: 20},
    //   ];

    // const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.rows);
    // const wb: XLSX.WorkBook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(wb, ws, 'ReporteGuias_');
    // ws['!cols'] = wscols;

    // /* save to file */
    // XLSX.writeFile(wb, 'ReporteGuias_' +  new Date().toISOString() + '_.xlsx', { cellStyles: true });
  }



  consultarGuia(row) {
    // const array = row.nroguia.split('-');
    const _nroSerie = row.nroguia;
    const _nroSecuencia = row.nroSecuencia;

    // Envia a Página de Edición de Guia
    this.router.navigate(['/forms/basic'], { queryParams: { _serie: _nroSerie , _secuencia: _nroSecuencia } });
  }

}
