import { Component, OnInit, ViewChild } from '@angular/core';

import { TablesService } from '../tables.service';
import { DatatableComponent } from '../../../../../node_modules/@swimlane/ngx-datatable';
import { write } from 'xlsx-style';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-filter-table',
  templateUrl: './filter-table.component.html',
  styleUrls: ['./filter-table.component.css'],
  providers: [TablesService]
})
export class FilterTableComponent implements OnInit {
  rows = [];
  columns = [];
  dataFiltrada = [];
  filteredData = [];
  filteredDataTemporal = [];

  filtro1: string ;
  filtro2: string ;


  @ViewChild(DatatableComponent) table: DatatableComponent;
  
  constructor(private service: TablesService) { }

  ngOnInit() {
    this.columns = this.service.getDataConf();
    this.rows = this.dataFiltrada = this.service.getAll();
  }

  updateFilter(event) {
    console.log('temp: '+ this.dataFiltrada);
    const val = event.target.value.toLowerCase();
    this.filtro1 = val ;
    console.log('filtro1: ' + this.filtro1);




    var columns = Object.keys(this.dataFiltrada[0]);
    // Removes last "$$index" from "column"
    columns.splice(columns.length - 1);

    console.log('columnas: '+ columns[0]);
    if (!columns.length)
      return;

    const rows2 = this.dataFiltrada.filter(function(d) {
       return d.nroguia.toLowerCase().indexOf(val) !== -1 || !val;
    });



    this.rows = rows2;
    if (rows2.length > 0 ) {
      //this.dataFiltrada = rows2;
    } else  {
      console.log('datos ok no hacer nada');
      console.log('const rows: ' + rows2.length);
    }

    this.table.offset = 0;
  }

  updateFilter2(event) {

    console.log('dataFiltrada: ' + this.dataFiltrada);
    const val = event.target.value.toLowerCase();
    this.filtro2 = val ;
    const val_filtro1 = this.filtro1;
    console.log('val : ' + val);
    var columns = Object.keys(this.dataFiltrada[0]);
    // Removes last "$$index" from "column"
    columns.splice(columns.length - 1);

    if (!columns.length){
      return;
    }

    const rows2 = this.dataFiltrada.filter(function(d) {
      console.log(d);
      console.log('eval estado: ' +  (d.estado.toLowerCase().indexOf(val) !== -1));
      console.log('eval nroguia: ' +  (d.nroguia.toLowerCase().indexOf(val_filtro1) !== -1));
      console.log('val ' +  (val));
      console.log('val_filtro1 ' +  (val_filtro1));

      return (d.estado.toLowerCase().indexOf(val) !== -1) &&
             (d.nroguia.toLowerCase().indexOf(val_filtro1) !== -1 ) &&
             (val_filtro1 || val);
    });

    this.rows = rows2;
    this.table.offset = 0;

  }


  updateFilterOriginal(event) {
    console.log('temp: '+ this.dataFiltrada);
    const val = event.target.value.toLowerCase();
    this.filtro1 = val ;


    var columns = Object.keys(this.dataFiltrada[0]);
    // Removes last "$$index" from "column"
    columns.splice(columns.length - 1);

    console.log('columnas: '+ columns[0]);
    if (!columns.length)
      return;

    const rows2 = this.dataFiltrada.filter(function(d) {
      console.log(d);
      for (let i = 0; i <= columns.length; i++) {
        let column = columns[i];
        // console.log(d[column]);
        if (d[column] && d[column].toString().toLowerCase().indexOf(val) > -1) {
          return true;
        }
      }
    });

    this.rows = rows2;
    if (rows2.length > 0 ) {
      this.dataFiltrada = rows2;
    } else  {
      console.log('datos ok no hacer nada');
      console.log('const rows: ' + rows2.length);
    }

    this.table.offset = 0;
  }


  ExportTOExcel() {
    console.log('export');

    // const cell_styles = { s:
    //     { patternType: 'solid',
    //       fgColor: { theme: 8, tint: 0.3999755851924192, rgb: '9ED2E0' },
    //       bgColor: { indexed: 64 , rgb: 'FFFFAA00'} }
    //     };
    const defaultCellStyle = { font:
                               { name: 'Verdana',
                                   sz: 12,
                                   color: 'FF00FF88'
                                },
                                fill: {
                                  patternType: 'solid',
                                  fgColor:
                                   {rgb: '86BC25'}
                                }
                              };

    const cell_styles = { s:  defaultCellStyle
      };

    const wscols = [
          {wch: 10},
          {wch: 20},
          {wch: 20},
          {wch: 20},
          {wch: 20},
          {wch: 20},
          {wch: 20},
          {wch: 20},
          {wch: 20},
          {wch: 20},
          {wch: 20},
          {wch: 20},
          {wch: 20},
      ];
    // this.table.nativeElement.style.background = "red";
    // const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);
    // const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.rows,{header:["A","B","C","D","E","F","G","G","G","G","G","G"], skipHeader:true});
    
    
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.rows);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    ws['F1'].s = defaultCellStyle;

    XLSX.utils.book_append_sheet(wb, ws, 'ReporteGuias_');
    ws['!cols'] = wscols;
    // ws['A1'] = cell_styles;

    /* if an A1-style address is needed, encode the address */
    console.log(ws['F1']);
    console.log(ws);
    console.log(wb);

    const wopts = { bookType:'xlsx', bookSST:false, type:'binary' };

    /* save to file */
    XLSX.writeFile(wb, 'ReporteGuias_.xlsx', { cellStyles: true });
  }


}
