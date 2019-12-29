import { FactoriaService } from '../../../shared/services/factorias/factoria.service';
import { UsuarioService } from '../../../shared/services/auth/usuario.service';
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { ExcelService } from '../../../shared/services/util/excel.service';

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

  // Ng Model
  public valorNroSerie_: string;
  public valorNroSecuencia_: string;
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
    private loader: AppLoaderService) {


  }

  ngOnInit() {

    const fechaActual_ = new Date();
    const fechaIniTraslado_ = new Date();
    fechaIniTraslado_.setDate((fechaIniTraslado_.getDate()) - 90);

    this.formFilter = new FormGroup({
      nroSerie: new FormControl('', CustomValidators.digits),
      nroSecuencia: new FormControl('', CustomValidators.digits),
      fechaIniTraslado: new FormControl(fechaIniTraslado_, ),
      fechaFinTraslado: new FormControl(fechaActual_, ),
      estadoSelected: new FormControl('', ),
      choferSelected: new FormControl('', ),
      destinatarioSelected: new FormControl('', ),
      esFacturado: new FormControl(this.facturado, ),

   });




   // this.columns = this.service.getDataConf();
    // this.rows = this.service.getAll();
    // Recupera datos de usuario de session
    this.usuarioSession = this.userService.getUserLoggedIn();
    this.loader.open();

    // Carga de Combos Factorias
    this.factoriaService.listarComboFactorias('D').subscribe(data1 => {
      this.comboFactorias = data1;
    });

    // Carga de Combos Choferes
    this.choferService.listarComboChoferes(this.usuarioSession.empresa.id).subscribe(data4 => {
      this.comboChoferes = data4;
    });

    // Carga de Grilla Principal
    this.guiaRemisionService.listarGrillaGuias(this.usuarioSession.empresa.id).subscribe(data => {
      this.listaGrillaGuias = data;
      this.rows = this.temp = this.total_rows_bd = data;
      this.loader.close();
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
    this.valorNroSerie_ = this.pad(valorDigitado, 5);
  }

  // Completar Zeros
 completarZerosNroSecuencia(event) {
    const valorDigitado = event.target.value.toLowerCase();
    this.valorNroSecuencia_ = this.pad(valorDigitado, 8);
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
