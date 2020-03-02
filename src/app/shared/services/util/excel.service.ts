import { Injectable } from '@angular/core';
import * as ExcelProper from 'exceljs';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import * as fs from 'file-saver';
import { Liquidacion, EstadoLiquidacion } from '../../models/liquidacion.model';
import { Documento, TipoFactura } from '../../models/facturacion.model';
import { TiposGenericosService } from './tiposGenericos.service';
import { GLOSA_TRANSPORTE } from '../../helpers/var.constant';

export class LiquidacionReportExcel {
  item?: number;
  nrodoc?: string ;
  fechaEmision?: Date;
  factura?: string;
  origen?: string;
  destino?: string;
  estado?: string;
  importeTotal?: number;
  constructor() {

  }
}

export interface DocumentosReportExcel {
  tipoDoc?: string;
  serie?: string ;
  secuencia?: string ;
  cliente?: string;
  fechaEmision?: Date;
  fechaVencimiento?: Date;
  estado?: string;
  moneda?: string;
  totalDocumento?: number;
  observacion?: string;
}

@Injectable()
export class ExcelService {

  // Variables
  listaLiquidaciones: Liquidacion[];
  listaDocumentos: Documento[];
  estadosDocumento = [];
  tiposDocumento = [];

  constructor(private tiposGenericos: TiposGenericosService) {

  }

   // Reporte para Guias de Remisión
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
      { header: 'Nro. de Liquidación', key: 'nroLiq', width: 22},
      { header: 'Factura', key: 'factura', width: 20},
      { header: 'Estado Factura', key: 'nemonicoEstadoFactura', width: 17},
      { header: 'Estado Guia', key: 'estado', width: 17},
      { header: 'Remitente', key: 'remitente', width: 40},
      { header: 'Destinatario', key: 'destinatario', width: 40},
      { header: 'Producto', key: 'producto', width: 40},
      { header: 'Cantidad', key: 'cantidad', width: 20},
      { header: 'Chofer', key: 'chofer', width: 40},
      { header: 'Nro.Guia Cliente', key: 'nroGuiaCliente', width: 20},
      { header: 'Fecha Recepción', key: 'fechaRecepcion', width: 20, style: { numFmt: 'dd/mm/yyyy' }},
    ];

     // Añade Cabecera
    worksheet.columns = header_key;

    // Añade valores
    worksheet.addRows(values);

    // Decorar las filas
    worksheet.eachRow((cell, number) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      cell.font = { name: 'Calibri Light', family: 4, size: 11, bold: false };
    });

    // Decorar primera fila - cabeceera
    worksheet.getRow(1).eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E2EFDA' },
        bgColor: { argb: 'FF0000FF' }
      };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      cell.font = { name: 'Calibri Light', family: 4, size: 11, bold: true };
    });

    // Exportar a Excel
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, FILE_NAME_REPORTE +  new Date().toLocaleDateString() + EXTENSION);
    });

  }
  getValueGlosaEstadoFactura( value: any): string {

    switch (value) {
      case 1:
        // this.chip.color = 'primary';
        return 'Registrado';
      case 2:
        return 'Cancelado';
      case 3:
        // this.chip.color = 'warn';
        return 'Anulado';
      default:
          return '-';
    }
  }

   // Reporte para Liquidaciones
  generarReporteLiquidaciones(values: Liquidacion[]) {

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
      { header: 'Factura', key: 'factura', width: 20},
      { header: 'Origen', key: 'origen', width: 43},
      { header: 'Destino', key: 'destino', width: 43},
      { header: 'Estado', key: 'estado', width: 14},
      { header: 'Total Importe', key: 'importeTotal', width: 25, style: { numFmt: '"S/"#,##0.00;[Red]\-"£"#,##0.00'}},
    ];

     // Añade Cabecera
    worksheet.columns = header_key;
    this.listaLiquidaciones = values;

    // Añade data
    this.listaLiquidaciones.forEach(function(itemLiquidacion, index){
      // tslint:disable-next-line:prefer-const
      let reporteLiquidaciones: LiquidacionReportExcel =  new LiquidacionReportExcel();
      reporteLiquidaciones.item = index + 1;
      reporteLiquidaciones.nrodoc = itemLiquidacion.nrodoc;
      reporteLiquidaciones.fechaEmision = new Date(itemLiquidacion.fechaEmision.toString());
      if (itemLiquidacion.documento) {
        reporteLiquidaciones.factura = itemLiquidacion.documento.serie + '-' + itemLiquidacion.documento.secuencia;
      }
      reporteLiquidaciones.origen = itemLiquidacion.origen.refLarga1;
      reporteLiquidaciones.destino = itemLiquidacion.destino.refLarga1;
      reporteLiquidaciones.estado = EstadoLiquidacion[itemLiquidacion.estado];
      reporteLiquidaciones.importeTotal = itemLiquidacion.importeTotal;
      worksheet.addRow(reporteLiquidaciones).commit();

    });
    // worksheet.addRows(this.listaLiquidaciones);


    // Decorar las filas
    worksheet.eachRow((cell, number) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      cell.font = { name: 'Calibri Light', family: 4, size: 11, bold: false };
    });

    // Decorar primera fila - cabeceera
    worksheet.getRow(1).eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E2EFDA' },
        bgColor: { argb: 'FF0000FF' }
      };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      cell.font = { name: 'Calibri Light', family: 4, size: 11, bold: true };
    });

    // Exportar a Excel
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, FILE_NAME_REPORTE +  new Date().toLocaleDateString() + EXTENSION);
    });


  }

   // Reporte para Facturas
   generarReporteFacturacion(values: Documento[]) {

    // Constantes
    const EXTENSION = '_.xlsx';
    const TITLE_REPORTE = 'Reporte de Facturaciones';
    const FILE_NAME_REPORTE = 'ReporteFacturacion_';


    // create workbook & add worksheet
    const workbook: ExcelProper.Workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet(TITLE_REPORTE);

    // Columnas a mostrar
    const header_key = [
      { header: 'Tipo Documento', key: 'tipoDoc', width: 20},
      { header: 'Serie Doc.', key: 'serie', width: 20},
      { header: 'Secuencia Doc', key: 'secuencia', width: 20},
      { header: 'Cliente', key: 'cliente', width: 50},
      { header: 'F. Emisión', key: 'fechaEmision', width: 16, style: { numFmt: 'dd/mm/yyyy' }},
      { header: 'F. Vencimiento', key: 'fechaVencimiento', width: 16, style: { numFmt: 'dd/mm/yyyy' }},
      { header: 'Estado', key: 'estado', width: 16},
      { header: 'Moneda', key: 'moneda', width: 16},
      { header: 'Importe', key: 'totalDocumento', width: 25, style: { numFmt: '#,##0.00;[Red]\-"£"#,##0.00'}},
      { header: 'Glosa/Observación', key: 'observacion', width: 50},
    ];

     // Añade Cabecera
    worksheet.columns = header_key;

    this.listaDocumentos = values;
    this.estadosDocumento =  this.tiposGenericos.retornarEstadosDocumento();
    this.tiposDocumento =  this.tiposGenericos.retornarTiposDocumento();

    // Prepara Datos para el Reporte
    this.listaDocumentos.forEach(documento => {
      const reporteFacturacion: DocumentosReportExcel = {};
      reporteFacturacion.tipoDoc = this.tiposDocumento.find(o => o.id === documento.tipoDocumento).descripcion || '?';
      reporteFacturacion.serie = documento.serie;
      reporteFacturacion.secuencia = documento.secuencia;
      reporteFacturacion.cliente = documento.cliente.razonSocial;
      reporteFacturacion.fechaEmision = new Date(documento.fechaEmision.toString());

      if (documento.fechaVencimiento) {
        reporteFacturacion.fechaVencimiento = new Date(documento.fechaVencimiento.toString());
      }

      reporteFacturacion.estado = this.estadosDocumento.find(o => o.id === documento.estado).descripcion || '?';
      reporteFacturacion.moneda = documento.moneda.descripcion;
      reporteFacturacion.totalDocumento = documento.totalDocumento;
      if (documento.notas === TipoFactura.CON_LIQUIDACION || documento.notas === TipoFactura.CON_GUIAREMISION ) {
        reporteFacturacion.observacion = GLOSA_TRANSPORTE;
      } else {
        reporteFacturacion.observacion = documento.observacion;
      }


      worksheet.addRow(reporteFacturacion).commit();
    });

    // worksheet.addRows(this.listaLiquidaciones);
    // Decorar las filas
    worksheet.eachRow((cell, number) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      cell.font = { name: 'Calibri Light', family: 4, size: 11, bold: false };
    });

    // Decorar primera fila - cabeceera
    worksheet.getRow(1).eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E2EFDA' },
        bgColor: { argb: 'FF0000FF' }
      };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      cell.font = { name: 'Calibri Light', family: 4, size: 11, bold: true };
    });

        // Decorar las filas
    worksheet.eachRow((cell, number) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      cell.font = { name: 'Calibri Light', family: 4, size: 11, bold: false };
    });

    // Decorar primera fila - cabeceera
    worksheet.getRow(1).eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E2EFDA' },
        bgColor: { argb: 'FF0000FF' }
      };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      cell.font = { name: 'Calibri Light', family: 4, size: 11, bold: true };
    });

    // Exportar a Excel
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, FILE_NAME_REPORTE +  new Date().toLocaleDateString() + EXTENSION);
    });

  }

}
