import { Component, OnInit, LOCALE_ID, Inject, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { MatSnackBar, MatDialog, MatDialogRef, DateAdapter, MAT_DATE_FORMATS, ThemePalette } from '@angular/material';
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
import { Documento, EstadoDocumento } from '../../../../shared/models/facturacion.model';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { throwError, Subject, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TipoDocumento } from '../../../../shared/models/tipos_facturacion';
import { TiposGenericosService } from '../../../../shared/services/util/tiposGenericos.service';

export interface ChipColor {
  name: string;
  color: ThemePalette;
}

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
export class FacturaConsultaComponent implements OnInit, OnDestroy {

  rows = [];
  temp = [];
  selected = [];
  columns = [];
  usuarioSession: Usuario;
  liquidacionesSelected: Liquidacion[];
  chip: ChipColor = {name: 'Primary', color: 'warn'};

  // Ng Model
  formFilter: FormGroup;
  public valorNroSerieLiq_: string;

  // Manejo default de mensajes en grilla
  messages: any = {
    emptyMessage: '-',
    totalMessage: 'total',
    selectedMessage: 'selected'
  };

  // Manejo de respuesta
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;

  // Combos para filtros de búsqueda
  comboClientes: Cliente[];
  comboTiposDocumento: TipoDocumento[];
  facturacionCheck = false;

  protected _onDestroy = new Subject<void>();
  public clientesFiltrados: ReplaySubject<Cliente[]> = new ReplaySubject<Cliente[]>(1);

  constructor(
    private router: Router,
    private userService: UsuarioService,
    private itemFacturaService: ItemFacturaService,
    public snackBar: MatSnackBar,
    public excelService: ExcelService,
    private confirmService: AppConfirmService,
    private tiposGenService: TiposGenericosService,
    private clienteService: ClienteService,
    @Inject(LOCALE_ID) private locale: string,
    private loader: AppLoaderService) {
  }

  ngOnInit() {

    const fechaActual_ = new Date();
    let fechaIniTraslado_ = new Date();
    // fechaIniTraslado_.setDate((fechaIniTraslado_.getDate()) - 90);
    fechaIniTraslado_  =   new Date(fechaActual_.getFullYear(), fechaActual_.getMonth(), 1);


    this.formFilter = new FormGroup({
      tipoDocumento: new FormControl('', ),
      serie: new FormControl('', ),
      secuencial: new FormControl('', CustomValidators.digits),
      fechaIni: new FormControl(fechaIniTraslado_, ),
      fechaFin: new FormControl(fechaActual_, ),
      estado: new FormControl('0', ),
      cliente:  new FormControl('0', ),
      cliente_:  new FormControl('', ),

   });

    // Recupera datos de usuario de session
    this.usuarioSession = this.userService.getUserLoggedIn();

    // Combo Clientes
    this.clienteService.listarClientesPorEmpresa(this.usuarioSession.empresa.id).subscribe(dataClientes => {
      this.comboClientes = dataClientes;
      this.clientesFiltrados.next(dataClientes.slice());
      // listen for search field value changes
      this.formFilter.controls['cliente_'].valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filtrarClientes();
      });
    });


    // Combo Tipos Documento
    this.comboTiposDocumento = this.tiposGenService.retornarTiposDocumento();

    this.formFilter.patchValue({
      tipoDocumento: '0',
    });

  }
  filtrarClientes() {
    if (!this.comboClientes) {
      return;
    }
    // busca palabra clave
    let search = this.formFilter.controls['cliente_'].value;
    if (!search) {
      this.clientesFiltrados.next(this.comboClientes.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filtra
    this.clientesFiltrados.next(
      this.comboClientes.filter(cliente => cliente.razonSocial.toLowerCase().indexOf(search) > -1)
    );
  }


  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
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
    const nroSerie  =  this.formFilter.controls['serie'].value;
    const nroDocumento  =  this.formFilter.controls['secuencial'].value;
    const fechaIni = formatDate(this.formFilter.controls['fechaIni'].value, 'yyyy-MM-dd', this.locale);
    const fechaFin = formatDate(this.formFilter.controls['fechaFin'].value, 'yyyy-MM-dd', this.locale);
    const idCLiente = this.formFilter.controls['cliente'].value;
    const estado  =  this.formFilter.controls['estado'].value;
    const TIPO_DOCUMENTO = this.formFilter.controls['tipoDocumento'].value;
    // const FACTURA = 1; // FACTURA=1

    this.itemFacturaService.listarDocumentosPorFiltro(this.usuarioSession.empresa.id,
                                                        nroSerie || '',
                                                        nroDocumento || '',
                                                        TIPO_DOCUMENTO,
                                                        idCLiente ,
                                                        estado,
                                                        fechaIni, fechaFin).subscribe(data_ => {
      this.rows = data_;
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

  getValueGlosaEstado( value: any) {

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
          return '?';
    }
  }

  getSimboloMoneda( value: Documento): string {
    if (value) {
        return value.moneda.nemonico;
    }
  }

  retornarLiteralTipoDocumento(idTipoDoc: any) {
    if (this.comboTiposDocumento.find(o => o.id === idTipoDoc)) {
      return this.comboTiposDocumento.find(o => o.id === idTipoDoc).descripcion;
    } else {
      return '?';
    }
  }

  retornarSecuencia(value: any) {

    switch (value.estado) {
      case 1:
          this.chip.color = 'primary';
          break;
      case 2:
          this.chip.color = 'accent';
          break;
      case 3:
          this.chip.color = 'warn';
          break;
      default:
          break;
    }
      return value.secuencia;
  }

  // Genera Reporte para Excel
  ExportTOExcel() {
    if (this.rows) {
      this.excelService.generarReporteFacturacion(this.rows);
    }
  }

  // Envia a Página de Consulta de Documento de Facturaciòn
  consultarDocumento(row) {
    const serieDoc = row.serie;
    const secuenciaDoc = row.secuencia;
    const tipoDoc = row.tipoDocumento;

    this.router.navigate(['/forms/facturacion/registro'],
                              { queryParams: { tipoDoc: tipoDoc,
                                                serie: serieDoc ,
                                                secuencia: secuenciaDoc }
                          });
  }


  cancelarDocumento(row: Documento) {
    const documentoCancelado = new Documento();
    const serie = row.serie;
    const secuencia = row.secuencia;
    documentoCancelado.id = row.id;
    documentoCancelado.serie = serie;
    documentoCancelado.secuencia = secuencia;
    documentoCancelado.observacionSunat = 'Cancelado con Fecha ' + new Date().toLocaleDateString();
    documentoCancelado.estado = EstadoDocumento.CANCELADO;

    this.confirmService.confirm({message: `Confirma cancelar el documento ${serie} - ${secuencia} ?`})
      .subscribe(res => {
        if (res) {
          this.loader.open();
          this.itemFacturaService.cancelarDocumentoElectronico(documentoCancelado, this.usuarioSession.empresa.id).subscribe(data_ => {
            this.actualizarRegistroGrilla(row);
            this.loader.close();
            this.snackBar.open(this.infoResponse_.alertMessage, 'OK', { duration: 5000 });
          },
          (error: HttpErrorResponse) => {
            this.handleError(error);
          });
        }
      });
  }

  actualizarRegistroGrilla(row) {
    this.updateEstado(EstadoDocumento.CANCELADO, 'estado', this.getRowIndex(row));
  }

  updateEstado(value, cell, rowIndex) {
    this.rows[rowIndex][cell] = value;
    this.rows = [...this.rows];
  }

  getRowIndex(row: any): number {
    const index = this.rows.findIndex(item => item.id === row.id);
    return index;
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1.name === o2.name && o1.id === o2.id;
  }



  private handleError(error: HttpErrorResponse) {

    this.loader.close();
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      // this.errorResponse_ = error.error;
      this.snackBar.open(this.errorResponse_.errorMessage, 'OK', { duration: 5000 });
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      if (error.error.codeMessage != null ) {
        this.errorResponse_ = error.error;
        this.snackBar.open(this.errorResponse_.errorMessage, 'OK', { duration: 5000 });
      } else {
        this.snackBar.open('Error de comunicación con los servicios. Intenta nuevamente.', 'OK',
                         { duration: 5000 , verticalPosition: 'top', horizontalPosition: 'end'});
        console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${error.error}`);
      }

    }
    // return an observable with a user-facing error message
    return throwError(
      'Ocurrió un error inesperado, volver a intentar.');
  };

}
