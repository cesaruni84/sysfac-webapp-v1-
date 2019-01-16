import { Injectable } from '@angular/core';
import * as ExcelProper from 'exceljs';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import * as fs from 'file-saver';
import { DatePipe } from '@angular/common';
import { Liquidacion } from '../../models/liquidacion.model';

export class LiquidacionReportExcel {
  item?: number;
  nrodoc?: string ;
  fechaEmision?: string;
  ordenServicio?: string;
  origen?: string;
  destino?: string;
  estado?: string;
  importeTotal?: number;
  constructor() {

  }
}

enum EstadoLiquidacion {
  Vigente = 1,
  Vencido = 2,
}

@Injectable()
export class ExcelService {

  // Grilla
  public listaLiquidaciones: Liquidacion[];

  constructor(private datePipe: DatePipe) {

  }


   // Reporte para Liquidaciones
   generarReporteGuiasRemision(values: any) {

    // Constantes
    const EXTENSION = '_.xlsx';
    const TITLE_REPORTE = 'Reporte de Guias';
    const FILE_NAME_REPORTE = 'ReporteGuias_';


    // create workbook & add worksheet
    const workbook: ExcelProper.Workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet(TITLE_REPORTE);

    // Columnas a mostrar
    const header_key = [
      { header: 'Item', key: 'id', width: 10},
      { header: 'Serie Guia', key: 'nroguia', width: 15},
      { header: 'Secuencia Guia', key: 'nroSecuencia', width: 20},
      { header: 'Fecha Emisión', key: 'fechaEmision', width: 20, style: { numFmt: 'dd/mm/yyyy' }},
      { header: 'Usuario Registra', key: 'usuarioRegistra', width: 20},
      { header: 'Nro. de Liquidación', key: 'ordenServicio', width: 22},
      { header: 'Nro. Ord. Servicio', key: 'ordenServicio', width: 22},
      { header: 'Remitente', key: 'remitente', width: 40},
      { header: 'Destinatario', key: 'destinatario', width: 40},
      { header: 'Estado', key: 'estado', width: 15},
      { header: 'Producto', key: 'producto', width: 40},
      { header: 'Cantidad', key: 'cantidad', width: 20},
      { header: 'Chofer', key: 'chofer', width: 40},
      { header: 'Nro.Guia Cliente', key: 'nroGuiaCliente', width: 20},
      { header: 'Fecha Recepción', key: 'fechaRecepcion', width: 20, style: { numFmt: 'dd/mm/yyyy' }},
    ];

     // Añade Cabecera
    worksheet.columns = header_key;

     // Decorar fila de cabeceera
    worksheet.getRow(1).eachCell((cell, number) => {
       cell.fill = {
         type: 'pattern',
         pattern: 'solid',
         fgColor: { argb: 'E2EFDA' },
         bgColor: { argb: 'FF0000FF' }
       };
       cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
       cell.font = { name: 'Calibri', family: 4, size: 12, bold: true };
     });

    // this.listaLiquidaciones = values;

    // // Añade data
    // this.listaLiquidaciones.forEach(function(itemLiquidacion, index){
    //   // tslint:disable-next-line:prefer-const
    //   let reporteLiquidaciones: LiquidacionReportExcel =  new LiquidacionReportExcel();
    //   reporteLiquidaciones.item = index + 1;
    //   reporteLiquidaciones.nrodoc = itemLiquidacion.nrodoc;
    //   reporteLiquidaciones.fechaEmision = itemLiquidacion.fechaEmision.toString();
    //   reporteLiquidaciones.ordenServicio = '-';
    //   reporteLiquidaciones.origen = itemLiquidacion.origen.refLarga1;
    //   reporteLiquidaciones.destino = itemLiquidacion.destino.refLarga1;
    //   reporteLiquidaciones.estado = EstadoLiquidacion[itemLiquidacion.estado];
    //   reporteLiquidaciones.importeTotal = itemLiquidacion.importeTotal;
    //   worksheet.addRow(reporteLiquidaciones);

    // });
    worksheet.addRows(values);


    // Exportar a Excel
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, FILE_NAME_REPORTE +  new Date().toISOString() + EXTENSION);
    });


  }


   // Reporte para Liquidaciones
  generarReporteLiquidaciones(values: any) {

    // Constantes
    const EXTENSION = '_.xlsx';
    const TITLE_REPORTE = 'Reporte de Liquidaciones';
    const FILE_NAME_REPORTE = 'ReporteLiquidaciones_';


    // create workbook & add worksheet
    const workbook: ExcelProper.Workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet(TITLE_REPORTE);

    // Columnas a mostrar
    const header_key = [
      { header: 'Item', key: 'item', width: 10},
      { header: 'Nro. Liquidación', key: 'nrodoc', width: 20},
      { header: 'F. Emisión Liq.', key: 'fechaEmision', width: 16, style: { numFmt: 'dd/mm/yyyy' }},
      { header: 'Nro Ord. Servicio', key: 'ordenServicio', width: 20},
      { header: 'Origen', key: 'origen', width: 43},
      { header: 'Destino', key: 'destino', width: 43},
      { header: 'Estado', key: 'estado', width: 14},
      { header: 'Total Importe', key: 'importeTotal', width: 25, style: { numFmt: '"S/"#,##0.00;[Red]\-"£"#,##0.00'}},
    ];

     // Añade Cabecera
    worksheet.columns = header_key;

     // Decorar fila de cabeceera
    worksheet.getRow(1).eachCell((cell, number) => {
       cell.fill = {
         type: 'pattern',
         pattern: 'solid',
         fgColor: { argb: 'E2EFDA' },
         bgColor: { argb: 'FF0000FF' }
       };
       cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
       cell.font = { name: 'Calibri', family: 4, size: 12, bold: true };
     });

    this.listaLiquidaciones = values;

    // Añade data
    this.listaLiquidaciones.forEach(function(itemLiquidacion, index){
      // tslint:disable-next-line:prefer-const
      let reporteLiquidaciones: LiquidacionReportExcel =  new LiquidacionReportExcel();
      reporteLiquidaciones.item = index + 1;
      reporteLiquidaciones.nrodoc = itemLiquidacion.nrodoc;
      reporteLiquidaciones.fechaEmision = itemLiquidacion.fechaEmision.toString();
      reporteLiquidaciones.ordenServicio = '-';
      reporteLiquidaciones.origen = itemLiquidacion.origen.refLarga1;
      reporteLiquidaciones.destino = itemLiquidacion.destino.refLarga1;
      reporteLiquidaciones.estado = EstadoLiquidacion[itemLiquidacion.estado];
      reporteLiquidaciones.importeTotal = itemLiquidacion.importeTotal;
      worksheet.addRow(reporteLiquidaciones);

    });
    // worksheet.addRows(this.listaLiquidaciones);


    // Exportar a Excel
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, FILE_NAME_REPORTE +  new Date().toISOString() + EXTENSION);
    });


  }

}
