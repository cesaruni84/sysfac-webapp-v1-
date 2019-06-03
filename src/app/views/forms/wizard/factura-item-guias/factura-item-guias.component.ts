import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { Usuario } from '../../../../shared/models/usuario.model';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { TipoIGV, TipoItem } from '../../../../shared/models/tipos_facturacion';
import { UnidadMedida } from '../../../../shared/models/unidad_medida.model';
import { DocumentoItem } from '../../../../shared/models/facturacion.model';
import { ErrorResponse, InfoResponse } from '../../../../shared/models/error_response.model';
import { Factoria } from '../../../../shared/models/factoria.model';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { UnidadMedidaService } from '../../../../shared/services/unidad-medida/unidad-medida.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { TiposGenericosService } from '../../../../shared/services/util/tiposGenericos.service';
import { GuiaRemisionService } from '../../../../shared/services/guias/guia-remision.service';
import { OrdenServicioService } from '../../../../shared/services/liquidacion/orden-servicio.service';
import { UsuarioService } from '../../../../shared/services/auth/usuario.service';
import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Producto } from '../../../../shared/models/producto.model';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../shared/helpers/date.adapter';
import { FactoriaService } from '../../../../shared/services/factorias/factoria.service';

@Component({
  selector: 'app-factura-item-guias',
  templateUrl: './factura-item-guias.component.html',
  styleUrls: ['./factura-item-guias.component.scss'],
  providers: [
    {
        provide: DateAdapter, useClass: AppDateAdapter
    },
    {
        provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
    ]
})
export class FacturaItemGuiasComponent implements OnInit {

  rows = [];
  temp = [];
  selected = [];
  columns = [];
  usuarioSession: Usuario;
  listaItemsSelected = [];
  listaItems = [];


  // Ng Model
  formFilter: FormGroup;
  public comboTiposIGV: TipoIGV[]= [];
  public comboTiposItem: TipoItem[]= [];
  public comboUnidades: UnidadMedida[]= [];
  public comboFactorias: Factoria[] = [];
  public comboFactoriasDestino: Factoria[] = [];
  public itemFactura: DocumentoItem;
  public listaItemsFactura: DocumentoItem[] = [];
  public valorOrigenSelected_: any;
  public valorDestinoSelected_: any;

  // Manejo default de mensajes en grilla
  messages: any = {
    // Message to show when array is presented
    // but contains no values
    emptyMessage: '-',

    // Footer total message
    totalMessage: 'total',

    // Footer selected message
    selectedMessage: 'seleccionado'
  };

  // Manejo de respuesta
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;


  constructor(
    @Inject(LOCALE_ID) private locale: string,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FacturaItemGuiasComponent>,
    private fb: FormBuilder,
    private userService: UsuarioService,
    private ordenServicioService: OrdenServicioService,
    private factoriaService: FactoriaService,
    private guiaRemisionService: GuiaRemisionService,
    private unidadMedidaService: UnidadMedidaService,
    private tiposGenService: TiposGenericosService,
    public snackBar: MatSnackBar,
    private loader: AppLoaderService) {
  }

  ngOnInit() {
    const fechaActual_ = new Date();
    const fechaIniTraslado_ = new Date();
    fechaIniTraslado_.setDate((fechaIniTraslado_.getDate()) - 30);

    this.formFilter = this.fb.group({
      filtroOrigen: ['', ],
      filtroDestino: ['', ],
      filtroFechaIni: new FormControl(fechaIniTraslado_, ),
      filtroFechaFin: new FormControl(fechaActual_, ),
    });


    // Recupera datos de usuario de session
    this.usuarioSession = this.userService.getUserLoggedIn();

    this.factoriaService.listarComboFactorias('O').subscribe(data1 => {
      this.comboFactorias = data1;
    });

    this.factoriaService.listarComboFactorias('D').subscribe(data3 => {
      this.comboFactoriasDestino = data3;
    });

    this.unidadMedidaService.listarComboUnidadesMedida().subscribe(data3 => {
      this.comboUnidades = data3;
    });

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

  buscarGuiasPorFacturar() {

    this.loader.open();
    const origen = this.formFilter.controls['filtroOrigen'].value || 0;
    const destino = this.formFilter.controls['filtroDestino'].value || 0;
    const fechaIni = formatDate(this.formFilter.controls['filtroFechaIni'].value, 'yyyy-MM-dd', this.locale);
    const fechaFin = formatDate(this.formFilter.controls['filtroFechaFin'].value, 'yyyy-MM-dd', this.locale);

    this.guiaRemisionService.listarGuiasRemisionPorFacturar(this.usuarioSession.empresa.id,
                                origen,
                                destino,
                                fechaIni,
                                fechaFin).subscribe(data_ => {
      this.rows = data_;
      this.loader.close();
    },
    (error: HttpErrorResponse) => {
      this.loader.close();
      this.errorResponse_ = error.error;
      this.snackBar.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 5000 });
    });

  }


  compareObjects(o1: any, o2: any): boolean {
    return o1.codigo === o2.codigo && o1.id === o2.id;
  }

  onSelect({ selected }) {
    this.listaItemsSelected = selected;
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  submit() {

    // Tipos de Afectación IGV
    this.comboTiposIGV = this.tiposGenService.retornarTiposIGV();
    this.comboTiposItem = this.tiposGenService.retornarTiposItemFactura();

    //
    this.listaItemsSelected.forEach(element => {
     let item: DocumentoItem = new DocumentoItem();
     item.id = element.id;
     item.codigo = element.serie + '-' + element.secuencia;
     item.descripcion = element.guiaDetalle[0].producto.nombre ;
     item.cantidad = element.totalCantidad;
     item.descuentos = 0.00;
     item.factorDescuento = 0;
     item.productos = element.guiaDetalle[0].producto;
     item.subTotal = element.totalCantidad * element.tarifa;
     item.tipoDescuento = 0;
     item.valorIGV = 0.18 * (item.subTotal); // CALCULAR
     item.valorISC = 0.00;
     item.tipoIGV = 1;  // VALOR POR DEFECTO : 10-OPERACION ONEROSA
     item.tipo = this.comboTiposItem[0].id; // VALOR POR DEFECTO
     item.total = element.totalCantidad * element.tarifa;  // CALCULAR
     item.unidadMedida = this.comboUnidades[0]; // VALOR POR DEFECTO
     item.tarifa = element.tarifa;
     this.itemFactura = item;
     this.listaItemsFactura.push(this.itemFactura);
    });
    this.dialogRef.close(this.listaItemsFactura);
  }

}
