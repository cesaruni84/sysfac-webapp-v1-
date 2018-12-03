import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../../shared/models/usuario.model';
import { FormGroup, FormControl } from '@angular/forms';
import { Factoria } from '../../../shared/models/factoria.model';
import { CustomValidators } from 'ng2-validation';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../shared/services/auth/usuario.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { FactoriaService } from '../../../shared/services/factorias/factoria.service';

@Component({
  selector: 'app-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: [
    './rich-text-editor.component.css'
  ]
})
export class RichTextEditorComponent implements OnInit {

  rows = [];
  temp = [];
  total_rows_bd = [];
  columns = [];
  usuarioSession: Usuario;
 // listaGrillaGuias: GrillaGuiaRemision[];
  formFilter: FormGroup;

  // Ng Model
  public valorNroSerieLiq_: string;
  public fechaIniTraslado_: Date;
  public fechaFinTraslado_: Date;
  public estadoSelected_: string;
  public valorOrigenSelected_: any;
  public valorDestinoSelected_: any;
  public facturado: boolean = false;

  // Combos para filtros de búsqueda
  comboFactorias: Factoria[];
  comboFactoriasDestino: Factoria[];
  facturacionCheck = false;


  constructor(
    private factoriaService: FactoriaService,
    private router: Router,
    private userService: UsuarioService,
    private loader: AppLoaderService) {


  }

  ngOnInit() {

    const fechaActual_ = new Date();
    const fechaIniTraslado_ = new Date();
    fechaIniTraslado_.setDate((fechaIniTraslado_.getDate()) - 90);

    this.formFilter = new FormGroup({
      nroSerieLiq: new FormControl('', CustomValidators.digits),
      fechaIniLiq: new FormControl(fechaIniTraslado_, ),
      fechaFinLiq: new FormControl(fechaActual_, ),
      origenSelected: new FormControl('', ),
      destinoSelected: new FormControl('', ),
      estadoSelected: new FormControl('', ),
      esFacturado: new FormControl(this.facturado, ),
   });


    // Recupera datos de usuario de session
    this.usuarioSession = this.userService.getUserLoggedIn();
    // this.loader.open();

    // Carga de Combos Factorias
    this.factoriaService.listarComboFactorias('O').subscribe(data1 => {
      this.comboFactorias = data1;
    });

    this.factoriaService.listarComboFactorias('D').subscribe(data3 => {
      this.comboFactoriasDestino = data3;
    });


    // Carga de Grilla Principal
    // this.guiaRemisionService.listarGrillaGuias(this.usuarioSession.empresa.id).subscribe(data => {
    //   this.listaGrillaGuias = data;
    //   this.rows = this.temp = this.total_rows_bd = data;
    //   this.loader.close();

    // });


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
  onContentChanged() { }
  onSelectionChanged() { }
}
