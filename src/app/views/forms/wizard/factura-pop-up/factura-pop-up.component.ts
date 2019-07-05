import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { Usuario } from '../../../../shared/models/usuario.model';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ErrorResponse, InfoResponse, FiltrosGuiasLiq } from '../../../../shared/models/error_response.model';
import { Factoria } from '../../../../shared/models/factoria.model';
import { FactoriaService } from '../../../../shared/services/factorias/factoria.service';
import { UsuarioService } from '../../../../shared/services/auth/usuario.service';
import { GuiaRemisionService } from '../../../../shared/services/guias/guia-remision.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { OrdenServicioService } from '../../../../shared/services/liquidacion/orden-servicio.service';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../shared/helpers/date.adapter';
import { DocumentoItem } from '../../../../shared/models/facturacion.model';
import { TiposGenericosService } from '../../../../shared/services/util/tiposGenericos.service';
import { TipoIGV, TipoItem } from '../../../../shared/models/tipos_facturacion';
import { UnidadMedida } from '../../../../shared/models/unidad_medida.model';
import { UnidadMedidaService } from '../../../../shared/services/unidad-medida/unidad-medida.service';
import { LiquidacionService } from '../../../../shared/services/liquidacion/liquidacion.service';

@Component({
  selector: 'app-factura-pop-up',
  templateUrl: './factura-pop-up.component.html',
  styleUrls: ['./factura-pop-up.component.scss'],
  providers: [
    {
        provide: DateAdapter, useClass: AppDateAdapter
    },
    {
        provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
    ]
})
export class FacturaPopUpComponent implements OnInit {

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

  // Combos para filtros de búsqueda
  comboFactorias: Factoria[];
  comboFactoriasDestino: Factoria[];

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FacturaPopUpComponent>,
    private factoriaService: FactoriaService,
    private fb: FormBuilder,
    private userService: UsuarioService,
    private ordenServicioService: OrdenServicioService,
    private liquidacionService: LiquidacionService,
    private guiaRemisionService: GuiaRemisionService,
    private unidadMedidaService: UnidadMedidaService,
    private tiposGenService: TiposGenericosService,
    public snackBar: MatSnackBar,
    private loader: AppLoaderService) {
  }

  ngOnInit() {
    const fechaActual_ = new Date();
    const fechaIni = new Date(fechaActual_.getFullYear(), fechaActual_.getMonth(), 1);

    this.formFilter = this.fb.group({
      nroSerieLiq: ['', ],
      fechaIniLiq: new FormControl(fechaIni, ),
      fechaFinLiq: new FormControl(fechaActual_, ),
    });


    // Recupera datos de usuario de session
    this.usuarioSession = this.userService.getUserLoggedIn();

    this.factoriaService.listarComboFactorias('O').subscribe(data1 => {
      this.comboFactorias = data1;
    });

    this.factoriaService.listarComboFactorias('D').subscribe(data3 => {
      this.comboFactoriasDestino = data3;
    });

    this.unidadMedidaService.listarComboUnidadesMedida().subscribe(data4 => {
      this.comboUnidades = data4;
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

  // Completar Zeros
  completarZerosNroDoc(event) {
    const valorDigitado = event.target.value.toLowerCase();
    this.formFilter.patchValue({
      nroSerieLiq: this.pad(valorDigitado, 12),
    });
  }


  buscarLiquidacionesPorFacturar() {

    this.selected = [];
    this.loader.open();
    let nroDocLiq  =  this.formFilter.controls['nroSerieLiq'].value;
    const fechaIniLiq = formatDate(this.formFilter.controls['fechaIniLiq'].value, 'yyyy-MM-dd', this.locale);
    const fechaFinLiq = formatDate(this.formFilter.controls['fechaFinLiq'].value, 'yyyy-MM-dd', this.locale);
    const origen = 0; // TODOS
    const destino = 0; // TODOS
    const estado  =  1; // REGISTRADO
    const valorConFactura = 0; // SIN FACTURAR

    this.liquidacionService.listarLiquidacionesPorFiltro(this.usuarioSession.empresa.id,
                                                            nroDocLiq || '',
                                                            origen,
                                                            destino,
                                                            estado ,
                                                            valorConFactura,
                                                            fechaIniLiq, fechaFinLiq).subscribe(data_ => {
      this.rows = data_;
      this.loader.close();
    },
    (error: HttpErrorResponse) => {
      this.loader.close();
      this.errorResponse_ = error.error;
      this.snackBar.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 5000});
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
     item.id = element.id;   // temporal
     item.codigo = element.nrodoc;
     item.descripcion = element.glosa;
     item.cantidad = element.totalCantidad;
     item.descuentos = 0.00;
     item.factorDescuento = 0; // VALOR POR DEFECTO
     item.subTotal = element.subTotalLiq;
     item.tipoDescuento = 0; // VALOR POR DEFECTO
     item.valorIGV = element.IGV;
     item.valorISC = 0.00;
     item.tipoIGV = 1;  // VALOR POR DEFECTO
     item.tipo = this.comboTiposItem[0].id; // VALOR POR DEFECTO
     item.total = element.subTotalLiq;   // VALOR DE COMPRA PARA APLICAR DESCUENTO
     item.unidadMedida = this.comboUnidades[0]; // VALOR POR DEFECTO
     item.tarifa = element.subTotalLiq / element.totalCantidad ;
     this.itemFactura = item;
     this.listaItemsFactura.push(this.itemFactura);
    });
    this.dialogRef.close(this.listaItemsFactura);
  }




}
