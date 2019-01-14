import { Injectable } from '@angular/core';
//import { Workbook } from 'exceljs';
import * as ExcelProper from 'exceljs';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import * as fs from 'file-saver';
import { DatePipe } from '@angular/common';


export interface LiquidacionReportExcel {
  item: number;
  nrodoc: string;
  fechaEmision: string;
  ordenServicio: string;
  origen: string;
  destino: string;
  estado: string;
  importeTotal: number;
}

@Injectable()
export class ExcelService {

  constructor(private datePipe: DatePipe) {
    
  }
  
  generateExcel(title: string, filename: string, data_: any) {
    
    //Excel Title, Header, Data
    //const title = 'Reporte  Sell Report';
    const header = ["Year", "Month", "Make", "Model", "Quantity", "Pct"];
    //const header = ["album", "year"];


    const data = [
      [2007, 1, "Volkswagen ", "Volkswagen Passat", 1267, 10],
      [2007, 1, "Toyota ", "Toyota Rav4", 819, 6.5],
      [2007, 1, "Toyota ", "Toyota Avensis", 787, 6.2],
      [2007, 1, "Volkswagen ", "Volkswagen Golf", 720, 5.7],
      [2007, 1, "Toyota ", "Toyota Corolla", 691, 5.4],
      [2007, 1, "Peugeot ", "Peugeot 307", 481, 3.8],
      [2008, 1, "Toyota ", "Toyota Prius", 217, 2.2],
      [2008, 1, "Skoda ", "Skoda Octavia", 216, 2.2],
      [2008, 1, "Peugeot ", "Peugeot 308", 135, 1.4],
      [2008, 2, "Ford ", "Ford Mondeo", 624, 5.9],
      [2008, 2, "Volkswagen ", "Volkswagen Passat", 551, 5.2],
      [2008, 2, "Volkswagen ", "Volkswagen Golf", 488, 4.6],
      [2008, 2, "Volvo ", "Volvo V70", 392, 3.7],
      [2008, 2, "Toyota ", "Toyota Auris", 342, 3.2],
      [2008, 2, "Volkswagen ", "Volkswagen Tiguan", 340, 3.2],
      [2008, 2, "Toyota ", "Toyota Avensis", 315, 3],
      [2008, 2, "Nissan ", "Nissan Qashqai", 272, 2.6],
      [2008, 2, "Nissan ", "Nissan X-Trail", 271, 2.6],
      [2008, 2, "Mitsubishi ", "Mitsubishi Outlander", 257, 2.4],
      [2008, 2, "Toyota ", "Toyota Rav4", 250, 2.4],
      [2008, 2, "Ford ", "Ford Focus", 235, 2.2],
      [2008, 2, "Skoda ", "Skoda Octavia", 225, 2.1],
      [2008, 2, "Toyota ", "Toyota Yaris", 222, 2.1],
      [2008, 2, "Honda ", "Honda CR-V", 219, 2.1],
      [2008, 2, "Audi ", "Audi A4", 200, 1.9],
      [2008, 2, "BMW ", "BMW 3-serie", 184, 1.7],
      [2008, 2, "Toyota ", "Toyota Prius", 165, 1.6],
      [2008, 2, "Peugeot ", "Peugeot 207", 144, 1.4]
    ];

    console.log(data);
    console.log(data_);


    // Create workbook and worksheet
    const workbook: ExcelProper.Workbook = new Excel.Workbook();
    workbook.model = JSON.parse(data_);
    // let workbook = new Workbook();
    const worksheet = workbook.addWorksheet(title);

    // Add Row and formatting
    const titleRow = worksheet.addRow([title]);
    titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
    worksheet.addRow([]);
    const subTitleRow = worksheet.addRow(['Fecha : ' + this.datePipe.transform(new Date(), 'medium')]);


    // Add Image
    // let logo = workbook.addImage({
    //   base64: logoFile.logoBase64,
    //   extension: 'png',
    // });

    // worksheet.addImage(logo, 'E1:F3');
    worksheet.mergeCells('A1:D2');

    // Blank Row
    worksheet.addRow([]);



    // Add Header Row
    const headerRow = worksheet.addRow(header);

    // Cell Style : Fill and Border
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F0F8FF' },
        bgColor: { argb: 'FF0000FF' }
      };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      cell.font = { name: 'Calibri', family: 4, size: 12, bold: true };

    });
    worksheet.addRows(data_);

    // worksheet.addRows([ ['Speak Now', 2010], [{album: 'Red', year: 2012} ]]);


    // Add Data and Conditional Formatting
    // data.forEach(d => {
    //   let row = worksheet.addRow(d);
    //   let qty = row.getCell(5);
    //   let color = 'FF99FF99';
    //   if (+qty.value < 500) {
    //     color = 'FF9999';
    //   }

    //   qty.fill = {
    //     type: 'pattern',
    //     pattern: 'solid',
    //     fgColor: { argb: color }
    //   };
    // }

    // );

    worksheet.getColumn(3).width = 100;
    worksheet.getColumn(4).width = 30;
    worksheet.addRow([]);


    // Footer Row
    // const footerRow = worksheet.addRow(['This is system generated excel sheet.']);
    // footerRow.getCell(1).fill = {
    //   type: 'pattern',
    //   pattern: 'solid',
    //   fgColor: { argb: 'FFCCFFE5' }
    // };
    // footerRow.getCell(1).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }

    // // Merge Cells
    // worksheet.mergeCells(`A${footerRow.number}:F${footerRow.number}`);

    // Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, filename +  new Date().toISOString() + '_.xlsx');
    });

  }

  generarReporteLiquidaciones(headers: any, values: any) {


    const EXTENSION = '_.xlsx';
    const TITLE_REPORTE = 'Reporte de Liquidaciones';
    const FILE_NAME_REPORTE = 'ReporteLiquidaciones_';


    // create workbook & add worksheet
    const workbook: ExcelProper.Workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet(TITLE_REPORTE);

    // Columnas a mostrar
    const header_key = [
      { header: 'Item', key: 'item', width: 50},
      { header: 'Nro. Liquidación', key: 'nrodoc', width: 110},
      { header: 'F. Emisión Liq.', key: 'fechaEmision', width: 100},
      { header: 'Nro Ord. Servicio', key: 'ordenServicio', width: 120},
      { header: 'Origen', key: 'origen', width: 200},
      { header: 'Destino', key: 'destino', width: 200},
      { header: 'Estado', key: 'estado', width: 110},
      { header: 'Total Importe', key: 'importeTotal', width: 150},
    ];

     // Añade Cabecera
     worksheet.columns = headers;

     // Decorar fila de cabeceera
     worksheet.getRow(1).eachCell((cell, number) => {
       cell.fill = {
         type: 'pattern',
         pattern: 'solid',
         fgColor: { argb: 'F0F8FF' },
         bgColor: { argb: 'FF0000FF' }
       };
       cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
       cell.font = { name: 'Calibri', family: 4, size: 12, bold: true };
     });

    // Añade data
    worksheet.addRows(values);

    // Exportar documento
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, FILE_NAME_REPORTE +  new Date().toISOString() + EXTENSION);
    });


  }

}
