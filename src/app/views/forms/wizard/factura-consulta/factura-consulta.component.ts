import { Component, OnInit, LOCALE_ID, Inject } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { MatSnackBar, MatDialog, MatDialogRef, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { FactoriaService } from '../../../../shared/services/factorias/factoria.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../../../shared/services/auth/usuario.service';
import { LiquidacionService } from '../../../../shared/services/liquidacion/liquidacion.service';
import { ExcelService } from '../../../../shared/services/util/excel.service';
import { ErrorResponse, InfoResponse } from '../../../../shared/models/error_response.model';
import { Factoria } from '../../../../shared/models/factoria.model';
import { Usuario } from '../../../../shared/models/usuario.model';
import { Liquidacion } from '../../../../shared/models/liquidacion.model';
import { CustomValidators } from 'ng2-validation';
import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { OrdenesServicioComponent } from '../../ordenes-servicio/ordenes-servicio.component';
import { Cliente } from '../../../../shared/models/cliente.model';
import { ClienteService } from 'app/shared/services/facturacion/cliente.service';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../shared/helpers/date.adapter';
import { ItemFacturaService } from '../../../../shared/services/facturacion/item-factura.service';

@Component({
  selector: 'app-factura-consulta',
  templateUrl: './factura-consulta.component.html',
  styleUrls: ['./factura-consulta.component.scss'],
  providers: [
    {
        provide: DateAdapter, useClass: AppDateAdapter
    },
    {
        provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
    ],
})
export class FacturaConsultaComponent implements OnInit {

  rows = [];
  temp = [];
  selected = [];
  columns = [];
  usuarioSession: Usuario;
  liquidacionesSelected: Liquidacion[];

  // Ng Model
  formFilter: FormGroup;
  public valorNroSerieLiq_: string;
  
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
  comboClientes: Cliente[];
  facturacionCheck = false;


  constructor(
    private factoriaService: FactoriaService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UsuarioService,
    private itemFacturaService: ItemFacturaService,
    public snackBar: MatSnackBar,
    public excelService: ExcelService,
    private clienteService: ClienteService,
    private dialog: MatDialog,
    @Inject(LOCALE_ID) private locale: string,
    private loader: AppLoaderService) {
  }

  ngOnInit() {

    const fechaActual_ = new Date();
    const fechaIniTraslado_ = new Date();
    fechaIniTraslado_.setDate((fechaIniTraslado_.getDate()) - 90);

    this.formFilter = new FormGroup({
      serie: new FormControl('',),
      secuencial: new FormControl('', CustomValidators.digits),
      fechaIni: new FormControl(fechaIniTraslado_, ),
      fechaFin: new FormControl(fechaActual_, ),
      estado: new FormControl('0', ),
      cliente:  new FormControl('0',),
   });

    // Recupera datos de usuario de session
    this.usuarioSession = this.userService.getUserLoggedIn();

    // Combo Clientes
    this.clienteService.listarClientesPorEmpresa(this.usuarioSession.empresa.id).subscribe(dataClientes => {
      this.comboClientes = dataClientes;
    });

  }


  // Completar Zeros
  completarZerosNroSerieLiq(event) {
    const valorDigitado = event.target.value.toLowerCase();
    this.valorNroSerieLiq_ = this.pad(valorDigitado, 12);
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

  buscarDocumento() {
    this.loader.open();
    this.rows = [];

    // Obtiene valores de parametros para la búsqueda
    let nroSerie  =  this.formFilter.controls['serie'].value;
    let nroDocumento  =  this.formFilter.controls['secuencial'].value;
    const fechaIni = formatDate(this.formFilter.controls['fechaIni'].value, 'yyyy-MM-dd', this.locale);
    const fechaFin = formatDate(this.formFilter.controls['fechaFin'].value, 'yyyy-MM-dd', this.locale);
    const idCLiente = this.formFilter.controls['cliente'].value;
    const estado  =  this.formFilter.controls['estado'].value;
    const FACTURA = 1; // FACTURA=1

    this.itemFacturaService.listarDocumentosPorFiltro(this.usuarioSession.empresa.id,
                                                        nroSerie || '',
                                                        nroDocumento || '',
                                                        FACTURA,
                                                        idCLiente ,
                                                        estado,
                                                        fechaIni, fechaFin).subscribe(data_ => {
      this.rows = data_;
      console.log(this.rows);
      this.loader.close();
    },
    (error: HttpErrorResponse) => {
      this.loader.close();
      this.rows = [];
      this.errorResponse_ = error.error;
      this.snackBar.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 3000 });
    });

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
  consultarDocumento(row) {
    this.router.navigate(['/forms/facturacion/registro'], { queryParams: { nroDocLiq: row.nrodoc } });
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1.ruc === o2.ruc && o1.id === o2.id;
  }

}
