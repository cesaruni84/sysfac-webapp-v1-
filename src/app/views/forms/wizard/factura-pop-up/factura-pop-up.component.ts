import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { Usuario } from '../../../../shared/models/usuario.model';
import { GuiaRemision } from 'app/shared/models/guia_remision.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ErrorResponse, InfoResponse, FiltrosGuiasLiq } from '../../../../shared/models/error_response.model';
import { Factoria } from '../../../../shared/models/factoria.model';
import { FactoriaService } from '../../../../shared/services/factorias/factoria.service';
import { UsuarioService } from '../../../../shared/services/auth/usuario.service';
import { GuiaRemisionService } from '../../../../shared/services/guias/guia-remision.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-factura-pop-up',
  templateUrl: './factura-pop-up.component.html',
  styleUrls: ['./factura-pop-up.component.scss']
})
export class FacturaPopUpComponent implements OnInit {

  rows = [
    { id: 1, tipo: 'Bien' , codigo: 'S023232311' , descripcion: ' Transporte a Granel 01' ,
      cantidad: 0.00, unidadMedida: 'TNL', tarifa: 12.00 , valorIGV: 0.00, importeTotal: 0.00 },
    { id: 2, tipo: 'Bien' , codigo: 'S023232312' , descripcion: ' Transporte a Granel 02' , tarifa: 13.12 },
    { id: 3, tipo: 'Servicio' , codigo: 'S023232313' , descripcion: ' Transporte a Granel 03' , tarifa: 24.00 },
    { id: 4, tipo: 'Servicio' , codigo: 'S023232314' , descripcion: ' Transporte a Granel 04' , tarifa: 12.00 },
    { id: 5, tipo: 'Bien' , codigo: 'S023232315' , descripcion: ' Transporte a Granel 05' , tarifa: 24.22 },
    { id: 6, tipo: 'Bien' , codigo: 'S023232316' , descripcion: ' Transporte a Granel 06' , tarifa: 12.00 },

  ];

  temp = [];
  selected = [];
  columns = [];
  usuarioSession: Usuario;
  listaItemsSelected = [];

  // Ng Model
  formFilter: FormGroup;
  public valorFechaIniTraslado_: Date;
  public valorFechaFinTraslado_: Date;
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
  public comboTipoProducto = [
    { id: 1, codigo: '001' , descripcion: ' Bien' },
    { id: 2, codigo: '002' , descripcion: ' Servicio' },
  ];
  public selected2 = this.comboTipoProducto[1].id;


  constructor(
    @Inject(LOCALE_ID) private locale: string,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FacturaPopUpComponent>,
    private factoriaService: FactoriaService,
    private fb: FormBuilder,
    private userService: UsuarioService,
    private guiaRemisionService: GuiaRemisionService,
    public snackBar: MatSnackBar,
    private loader: AppLoaderService) {
  }

  ngOnInit() {


    this.formFilter = this.fb.group({
      codigo: ['', ],
      indTipoProd: [ '', ],
      descripcion: ['', ],
      fechaIni: ['', ],
      fechaFin: ['', ],
    });


    // Recupera datos de usuario de session
    this.usuarioSession = this.userService.getUserLoggedIn();

    // Carga de Combos Factorias
    this.factoriaService.listarComboFactorias('O').subscribe(data1 => {
      this.comboFactorias = data1;
    });

    this.factoriaService.listarComboFactorias('D').subscribe(data3 => {
      this.comboFactoriasDestino = data3;
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


  buscarItemFactura() {

    // this.selected = [];
    // this.loader.open();

    // const fechaIni = formatDate(this.valorFechaIniTraslado_, 'yyyy-MM-dd', this.locale);
    // const fechaFin = formatDate(this.valorFechaFinTraslado_, 'yyyy-MM-dd', this.locale);

    // this.guiaRemisionService.listarGuiasRemisionPorLiquidar(this.usuarioSession.empresa.id,
    //                             this.valorOrigenSelected_.id,
    //                             this.valorDestinoSelected_.id,
    //                             fechaIni,
    //                             fechaFin).subscribe(data_ => {
    //   this.listadoGuias = data_;
    //   this.rows = data_;
    //   this.loader.close();
    // },
    // (error: HttpErrorResponse) => {
    //   this.loader.close();
    //   this.errorResponse_ = error.error;
    //   this.snackBar.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 5000,  panelClass: ['blue-snackbar'] });
    // });

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
    this.dialogRef.close(this.listaItemsSelected);
  }


}
