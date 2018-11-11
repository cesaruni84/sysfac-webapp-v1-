import { FactoriaService } from './../../../shared/services/factorias/factoria.service';
import { UsuarioService } from './../../../shared/services/auth/usuario.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { TablesService } from '../tables.service';
import { GuiaRemisionService } from '../../../shared/services/guias/guia-remision.service';
import { Usuario } from '../../../shared/models/usuario.model';
import { Factoria } from '../../../shared/models/factoria.model';
import { Chofer } from '../../../shared/models/chofer.model';
import { ChoferService } from '../../../shared/services/chofer/chofer.service';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { MomentDateAdapter, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { write } from 'xlsx-style';
import * as XLSX from 'xlsx';
import { CustomValidators } from 'ng2-validation';
import { DatatableComponent } from '../../../../../node_modules/@swimlane/ngx-datatable';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { formatDate } from '../../../../../node_modules/@angular/common';
import { GrillaGuiaRemision } from '../../../shared/models/guia_remision.model';
import { Router } from '@angular/router';


@Component({
  selector: 'app-paging-table',
  templateUrl: './paging-table.component.html',
  styleUrls: ['./paging-table.component.css'],
  providers: [TablesService, {provide: MAT_DATE_LOCALE, useValue: 'es-ES'},
  {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
  {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ]
})


export class PagingTableComponent implements OnInit {

  rows = [];
  temp = [];
  total_rows_bd = [];
  columns = [];
  usuarioSession: Usuario;
  listaGrillaGuias: GrillaGuiaRemision[];
  formFilter: FormGroup;
  estadoSelected: string;
  fechaIniTraslado_: Date;


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
    private userService: UsuarioService,
    private loader: AppLoaderService) {


  }

  ngOnInit() {

    const fechaActual_ = new Date();
    const fechaIniTraslado_ = new Date();
    fechaIniTraslado_.setDate((fechaIniTraslado_.getDate()) - 30);
    
    // const dateFormatPipeFilter = new DateFormatPipe();
    // console.log(fechaIniTraslado_);
    // console.log(dateFormatPipeFilter.transform(fechaIniTraslado_));

    // const nueva_fecha = new Intl.DateTimeFormat().format(fechaIniTraslado_);
    // console.log(nueva_fecha);
    // this.fechaIniTraslado_ = fechaIniTraslado_;
  
  
    // const fechaActual2_ = Date.parse(formatDate(new Date(), 'yyyy/MM/dd', 'en'));
    // console.log(fechaActual2_);

    this.formFilter = new FormGroup({
      nroSerie: new FormControl('', CustomValidators.digits),
      nroSecuencia: new FormControl('', CustomValidators.digits),
      fechaIniTraslado: new FormControl(fechaIniTraslado_, ),
      fechaFinTraslado: new FormControl(fechaActual_, ),
      estadoSelected: new FormControl({value: '', disabled: false}, ),
      choferSelected: new FormControl('', ),
      destinatarioSelected: new FormControl('', ),
      esFacturado: new FormControl('', ),
   });




    this.columns = this.service.getDataConf();
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

  // Filtros para busqueda
  updateFilterEstado(event) {
    console.log(this.rows);
    const val = event.value.toLowerCase();

    console.log('val: ' + val);
    const columns = Object.keys(this.temp[0]);
    // Removes last "$$index" from "column"
    columns.splice(columns.length - 1);

    console.log('columnas: ' + columns[0]);
    if (!columns.length)
      return;

    const rows = this.temp.filter(function(d) {
      for (let i = 0; i <= columns.length; i++) {
        let column = columns[i];
        // console.log(d[column]);
        if (d[column] && d[column].toString().toLowerCase().indexOf(val) > -1) {
          return true;
        }
      }
    });

    this.rows = rows;
    if (rows != null) {
      console.log('paso estado');
    } else  {
      this.temp = this.rows = this.total_rows_bd;
    }
  }

  seleccionarChofer(event) {
    console.log(event);
    //const val = event.target.value.toLowerCase();
    const val = event.value.toLowerCase();

    console.log('val: ' + val);
    var columns = Object.keys(this.temp[0]);
    // Removes last "$$index" from "column"
    columns.splice(columns.length - 1);

    console.log('columnas: '+ columns[0]);
    if (!columns.length)
      return;

    const rows = this.temp.filter(function(d) {
      for (let i = 0; i <= columns.length; i++) {
        let column = columns[i];
        // console.log(d[column]);
        if (d[column] && d[column].toString().toLowerCase().indexOf(val) > -1) {
          return true;
        }
      }
    });

    this.rows = rows;

  }

  seleccionarFactoriaDestinatario(event) {
    console.log(event);
    //const val = event.target.value.toLowerCase();
    const val = event.value.toLowerCase();

    console.log('val: ' + val);
    var columns = Object.keys(this.temp[0]);
    // Removes last "$$index" from "column"
    columns.splice(columns.length - 1);

    console.log('columnas: '+ columns[0]);
    if (!columns.length)
      return;

    const rows = this.temp.filter(function(d) {
      for (let i = 0; i <= columns.length; i++) {
        let column = columns[i];
        // console.log(d[column]);
        if (d[column] && d[column].toString().toLowerCase().indexOf(val) > -1) {
          return true;
        }
      }
    });

    this.rows = rows;

  }

  updateFilter(event) {
    console.log(event);
    // this.guiaRemision.serie = this.formFilter.get('nroSerie').value;
    const val = event.target.value.toLowerCase();
    console.log(val);
    const rows = this.temp.filter(function(d) {

      // console.log(d);
      // console.log('eval estado: ' +  (d.estado.toLowerCase().indexOf(val) !== -1));
      // console.log('val ' +  (val));
      return d.nroguia.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rows = rows;
    this.table.offset = 0;
  }


  updateFilter2(event) {

    // this.guiaRemision.serie = this.formFilter.get('nroSerie').value;

    const val = event.target.value.toLowerCase();

    console.log('val : ' + val);
    const columns = Object.keys(this.temp[0]);
    // Removes last "$$index" from "column"
    columns.splice(columns.length - 1);

    if (!columns.length) {
      return;
    }

    console.log('formulario: ' + this.formFilter);

    const rows2 = this.temp.filter(function(d) {

      console.log(d);
      console.log('eval estado: ' +  (d.estado.toLowerCase().indexOf(val) !== -1));
      console.log('val ' +  (val));
      console.log('fechaEmision: ' + d.fechaEmision);
      

      return d.nroguia.toLowerCase().indexOf(val) !== -1 || !val;

      // return (d.estado.toLowerCase().indexOf(val) !== -1) &&
      //        (d.nroguia.toLowerCase().indexOf(val_filtro1) !== -1 ) &&
      //        (d.nroguia.toLowerCase().indexOf(val_filtro1) !== -1 ) &&
      //        (d.nroguia.toLowerCase().indexOf(val_filtro1) !== -1 ) &&
      //        (d.nroguia.toLowerCase().indexOf(val_filtro1) !== -1 ) &&
      //        (d.nroguia.toLowerCase().indexOf(val_filtro1) !== -1 ) &&
      //        (d.nroguia.toLowerCase().indexOf(val_filtro1) !== -1 )

            // (val_filtro1 || val);
    });

    this.rows = rows2;
    this.table.offset = 0;

  }





  updateFilter4(event) {
    const val = event.target.value.toLowerCase();
    var columns = Object.keys(this.temp[0]);
    // Removes last "$$index" from "column"
    columns.splice(columns.length - 1);

    if (!columns.length)
      return;

    const rows = this.temp.filter(function(d) {
      for (let i = 0; i <= columns.length; i++) {
        let column = columns[i];
        // console.log(d[column]);
        if (d[column] && d[column].toString().toLowerCase().indexOf(val) > -1) {
          return true;
        }
      }
    });
    console.log(rows);
    this.rows = rows;
    if (rows != null) {
      console.log('paso update');
    } else  {
      this.temp = this.rows = this.total_rows_bd;
    }

  }

  ExportTOExcel() {

    const wscols = [ {wch: 10},{wch: 20},{wch: 20},{wch: 20},{wch: 20},{wch: 20},
          {wch: 20},{wch: 20}, {wch: 20},{wch: 20}, {wch: 20},{wch: 20},{wch: 20},
      ];

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.rows);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ReporteGuias_');
    ws['!cols'] = wscols;

    /* save to file */
    XLSX.writeFile(wb, 'ReporteGuias_.xlsx', { cellStyles: true });
  }

  onSelect({ selected }) {
    console.log('Select Event', selected, );

  }

  onActivate($event) {
     if ($event.type === 'dblclick'){
       console.log('doble click');
     }


  }



  seleccionarChofer4(event) {


  }

  seleccionarFactoriaDestinatario4(event) {


  }
  consultarGuia(row) {
    // const array = row.nroguia.split('-');
    const _nroSerie = row.nroguia;
    const _nroSecuencia = row.nroSecuencia;

    // Envia a Página de Edición de Guia
    this.router.navigate(['/forms/basic'], { queryParams: { _serie: _nroSerie , _secuencia: _nroSecuencia } });
  }




}
