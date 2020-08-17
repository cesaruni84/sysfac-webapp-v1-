import { Component, OnInit, OnDestroy, LOCALE_ID, Inject } from '@angular/core';
import { ErrorResponse, InfoResponse } from '../../../../shared/models/error_response.model';
import { UsuarioService } from '../../../../shared/services/auth/usuario.service';
import { MatSnackBar, DateAdapter, MAT_DATE_FORMATS, ThemePalette } from '@angular/material';
import { Router } from '@angular/router';
import { ItemFacturaService } from '../../../../shared/services/facturacion/item-factura.service';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { FormGroup, FormControl } from '@angular/forms';
import { Usuario } from '../../../../shared/models/usuario.model';
import { Liquidacion } from '../../../../shared/models/liquidacion.model';
import { Documento, TipoFactura, EstadoDocumento } from '../../../../shared/models/facturacion.model';
import { TipoDocumento } from '../../../../shared/models/tipos_facturacion';
import { TiposGenericosService } from '../../../../shared/services/util/tiposGenericos.service';
import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { GLOSA_TRANSPORTE } from '../../../../shared/helpers/var.constant';
import { throwError } from 'rxjs/internal/observable/throwError';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../shared/helpers/date.adapter';


export interface ChipColor {
  name: string;
  color: ThemePalette;
}

@Component({
  selector: 'app-factura-auditoria',
  templateUrl: './factura-auditoria.component.html',
  styleUrls: ['./factura-auditoria.component.scss'],
  providers: [
    {
        provide: DateAdapter, useClass: AppDateAdapter
    },
    {
        provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
    ],
})
export class FacturaAuditoriaComponent implements OnInit {

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
  comboTiposDocumento: TipoDocumento[];

  // Combos para filtros de búsqueda
  facturacionCheck = false;



  constructor(
    private router: Router,
    private userService: UsuarioService,
    private itemFacturaService: ItemFacturaService,
    public snackBar: MatSnackBar,
    private confirmService: AppConfirmService,
    private tiposGenService: TiposGenericosService,
    @Inject(LOCALE_ID) private locale: string,
    private loader: AppLoaderService) {
  }

  ngOnInit() {

    const fechaActual_ = new Date();
    let fechaIniTraslado_ = new Date();
    // fechaIniTraslado_.setDate((fechaIniTraslado_.getDate()) - 180);
    fechaIniTraslado_  =   new Date(fechaActual_.getFullYear(), 0, 1);


    this.formFilter = new FormGroup({
      fechaIni: new FormControl(fechaIniTraslado_, ),
      fechaFin: new FormControl(fechaActual_, ),
   });

    // Recupera datos de usuario de session
    this.usuarioSession = this.userService.getUserLoggedIn();
    this.comboTiposDocumento = this.tiposGenService.retornarTiposDocumento();


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

  buscarDocumentoErrores() {
    this.loader.open();
    this.rows = [];

    // Obtiene valores de parametros para la búsqueda
    const fechaIni = formatDate(this.formFilter.controls['fechaIni'].value, 'yyyy-MM-dd', this.locale);
    const fechaFin = formatDate(this.formFilter.controls['fechaFin'].value, 'yyyy-MM-dd', this.locale);
    const SUBTIPO_DOCUMENTO = TipoFactura.CON_LIQUIDACION;


    this.itemFacturaService.listarDocumentosConErrores(this.usuarioSession.empresa.id,
                                                        SUBTIPO_DOCUMENTO,
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

  retornarGlosa(factura: Documento) {
    let value: any;

    switch (factura.notas) {
      case TipoFactura.ITEM:
          value = factura.observacion;
          break;
      case TipoFactura.CON_LIQUIDACION:
      case TipoFactura.CON_GUIAREMISION:
          if (factura.estado === EstadoDocumento.ANULADO) {
            value = factura.observacion + ' / ' +  GLOSA_TRANSPORTE;
          } else {
            value = GLOSA_TRANSPORTE;
          }

          break;
      default:
          break;
    }
    return value;
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
