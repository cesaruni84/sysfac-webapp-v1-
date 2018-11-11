import { Usuario } from './../../../shared/models/usuario.model';
import { BalanzaService } from '../../../shared/services/balanza/balanza.service';
import { ChoferService } from '../../../shared/services/chofer/chofer.service';
import { UnidadMedidaService } from '../../../shared/services/unidad-medida/unidad-medida.service';
import { FactoriaService } from '../../../shared/services/factorias/factoria.service';
import { Balanza } from '../../../shared/models/balanza.model';
import { UnidadMedida } from '../../../shared/models/unidad_medida.model';
import { Producto } from '../../../shared/models/producto.model';
import { Factoria } from '../../../shared/models/factoria.model';
import { Component, OnInit, ViewChild, Optional, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Chofer } from '../../../shared/models/chofer.model';
import { ProductoService } from '../../../shared/services/productos/producto.service';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs/internal/observable/throwError';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS, MatDatepickerInputEvent, MatButton, MatProgressBar,
       MAT_DIALOG_DATA } from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { Router, ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../../../shared/services/auth/usuario.service';
import { GuiaRemision } from '../../../shared/models/guia_remision.model';
import { GuiaDetalle } from '../../../shared/models/guia_remision_detalle.model';
import { GuiaRemisionService } from '../../../shared/services/guias/guia-remision.service';
import { ErrorResponse, InfoResponse } from '../../../shared/models/error_response.model';
import { MatSnackBar } from '@angular/material';


@Component({
  selector: 'app-basic-form',
  templateUrl: './basic-form.component.html',
  styleUrls: ['./basic-form.component.css'],
  providers: [
    // The locale would typically be provided on the root module of your application. We do it at
    // the component level here, due to limitations of our example generation script.
    {provide: MAT_DATE_LOCALE, useValue: 'es-ES'},

    // `MomentDateAdapter` and `MAT_MOMENT_DATE_FORMATS` can be automatically provided by importing
    // `MatMomentDateModule` in your applications root module. We provide it at the component level
    // here, due to limitations of our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ],
})

export class BasicFormComponent implements OnInit {

  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;
  
  events: string[] = [];
  roomsFilter: any = {};

  // NgModel
  valorIdGuia_: number;
  valorIdGuiaDetalle_: number;
  valorRucRemitente_: string;
  valorDirRemitente_: string;
  valorRucDestinatario_: string;
  valorDirDestinatario_: string;
  valorChoferSelected_: any;
  valorCertificado_: string;
  valorLicencia_: string;
  valorPlacaTracto_: string;
  valorPlacaBombona_: string;
  valorFechaIniTraslado_:  Date;
  valorFechaEmision_:  Date;
  estadoSelected_: string;
  valorNroSerie_: string;
  valorNroSecuencia_: string;
  inputDisabled: boolean = false;
  valorRemitenteSelected_: any;
  valorDestinatarioSelected_: any;
  valorProductoSelected_: any;
  valorCantidad_: number;
  valorPeso_: number;
  valorUMSelected_: any;

  valorBalanzaSelected_: any;
  valorTicketBalanza_: string;
  valorFechaRecepcion_: Date;
  valorSerieCli_: string;
  valorSecuenciaCli_: string;


  // Usuario sesionado
  usuarioSession: Usuario;
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;

  // Variables para el listado de los Combos
  comboFactorias: Factoria[];
  comboFactoriasDestino: Factoria[];


  comboProductos: Producto[];
  comboUnidadMedida: UnidadMedida[];
  comboChoferes: Chofer[];
  comboBalanzas: Balanza[];
  guiaDetalle_: GuiaDetalle;
  formData = {};
  basicForm: FormGroup;
  serieQuery: string;
  secuenciaQuery: string;
  edicion: boolean = false;

  // Objeto a grabar
  guiaRemision: GuiaRemision;
  public guiaRemisionBD: GuiaRemision;

  constructor(private factoriaService: FactoriaService,
              private productoService: ProductoService,
              private unidadMedidaService: UnidadMedidaService,
              private choferService: ChoferService,
              private balanzaService: BalanzaService,
              private userService: UsuarioService,
              private guiaRemisioService: GuiaRemisionService,
              private route: ActivatedRoute,
              private router: Router,
              public snackBar: MatSnackBar,
              @Optional() @Inject(MAT_DIALOG_DATA) public data_: any ) {

    // Recupera datos de usuario de session
    this.usuarioSession = this.userService.getUserLoggedIn();

    // Valida Save o Update
    this.validarGrabarActualizar();

    // Carga Formulario
    this.defaultForm();
    
    

    // Carga Combos para el Formulario
    this.cargarCombosFormulario();
  }

  ngOnInit() {

    // Si es edicion recuperar datos de BD
    if (this.edicion) {
      this.recuperarDatosGuiaBD();
    }

  }

  validarGrabarActualizar() {
    this.route.queryParams.subscribe(params => {
        this.serieQuery = params._serie;
        this.secuenciaQuery = params._secuencia;
        this.edicion = (this.serieQuery && this.secuenciaQuery) != null ;
        console.log(this.edicion);
      }
    );
  }

  recuperarDatosGuiaBD() {
    this.guiaRemisioService.obtenerGuiaRemisionxNroGuia(
      this.usuarioSession.empresa.id,
      this.serieQuery,
      this.secuenciaQuery
    )
    .subscribe((data_) => {
      // this.initForm(data_);
      console.log(data_);
      this.valorIdGuia_ = data_.id;
      this.estadoSelected_ = data_.estado.toString();
      this.valorFechaEmision_ = data_.fechaRemision;
      this.valorFechaIniTraslado_ = data_.fechaTraslado;
      this.valorNroSerie_ = data_.serie;
      this.valorNroSecuencia_ = data_.secuencia;
      this.valorRemitenteSelected_ = data_.remitente;
      this.valorRucRemitente_ = data_.remitente.cliente.ruc;
      this.valorDirRemitente_ = data_.remitente.cliente.direccion;
      this.valorDestinatarioSelected_ = data_.destinatario;
      this.valorRucDestinatario_ = data_.destinatario.cliente.ruc;
      this.valorDirDestinatario_ = data_.destinatario.cliente.direccion;
      this.valorIdGuiaDetalle_ = data_.guiaDetalle[0].id;
      this.valorProductoSelected_ = data_.guiaDetalle[0].producto;
      this.valorCantidad_ = data_.guiaDetalle[0].cantidad;
      // this.valorPeso_ = data_.guiaDetalle[0].peso;
      this.valorUMSelected_ = data_.guiaDetalle[0].unidadMedida;
      this.valorChoferSelected_ = data_.chofer;
      this.valorPlacaTracto_ = data_.placaTracto;
      this.valorPlacaBombona_ = data_.placaBombona;
      this.valorCertificado_ = data_.chofer.certificado;
      this.valorLicencia_ = data_.chofer.licencia;
      this.valorBalanzaSelected_ = data_.balanza;
      this.valorTicketBalanza_ = data_.ticketBalanza;
      this.valorFechaRecepcion_ = data_.fechaRecepcion;
      this.valorSerieCli_ = data_.serieCliente;
      this.valorSecuenciaCli_ = data_.secuenciaCliente;

    }, (error: HttpErrorResponse) => {
      this.errorResponse_ = error.error;
      this.snackBar.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 20000,  panelClass: ['red-snackbar'] });
      console.log(this.errorResponse_.errorMessage);
    });
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1.name === o2.name && o1.id === o2.id;
  }


  defaultForm() {
    const numberPatern = '^[0-9.,]+$';

    this.basicForm = new FormGroup({
      // empresa_: new FormControl('', [Validators.required]),
      empresa_: new FormControl({value: this.usuarioSession.empresa.razonSocial, disabled: true}, Validators.required),
      direccion_: new FormControl({value: this.usuarioSession.empresa.dirFiscal, disabled: true}, Validators.required),
      rucEmpresa_: new FormControl({value: this.usuarioSession.empresa.ruc, disabled: true}, Validators.required),
      estadoSelected: new FormControl({value: '0'}, Validators.required),
      fechaEmision: new FormControl( '', [
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.required,
        CustomValidators.date
      ]),
      // fechaIniTraslado: new FormControl({value: 'fechaEmision', disabled: true}, Validators.required),
      fechaIniTraslado: new FormControl({value: 'fechaEmision', disabled: true}, Validators.required),
      nroSerie: new FormControl({value: '00000', disabled: this.edicion}, [CustomValidators.digits, Validators.required]),
      nroSecuencia: new FormControl({value: '00000000', disabled: this.edicion} , [CustomValidators.digits, Validators.required]),
      remitenteSelected: new FormControl( '', Validators.required),
      rucRemitente_: new FormControl({value: '', disabled: true}, Validators.required),
      direRemitente_: new FormControl({value: '', disabled: true}, Validators.required),
      destinatarioSelected: new FormControl('', Validators.required),
      rucDestinatario_: new FormControl({value: '', disabled: true}, Validators.required),
      direDestinatario_: new FormControl({value: '', disabled: true}, Validators.required),
      productoSelected: new FormControl('', Validators.required),
      cantidad: new FormControl('', [
        Validators.required,
        Validators.pattern(numberPatern)
      ]),
      // peso: new FormControl('', [
      //   Validators.required,
      //   Validators.pattern(numberPatern)
      // ]),
      unidadMedidaSelected: new FormControl('', Validators.required),
      choferSelected: new FormControl('', Validators.required),
      placaTracto: new FormControl('', [
        Validators.minLength(1),
        Validators.maxLength(30),
        Validators.required
       ]),
      placaBombona: new FormControl('', [
        Validators.minLength(1),
        Validators.maxLength(30),
        Validators.required
      ]),
      nroCertificado_: new FormControl({value: '', disabled: true}, Validators.required),
      nroLicencia_: new FormControl({value: '', disabled: true}, Validators.required),
      balanzaSelected: new FormControl('',),
      nroTicketBal: new FormControl('', [
        Validators.minLength(1),
        Validators.maxLength(30),
        Validators.required
      ]),
      nroSerieClie: new FormControl('', [
        Validators.minLength(1),
        Validators.maxLength(5),
        Validators.required,
        CustomValidators.digits
      ]),
      nroSequenClie: new FormControl('', [
        Validators.minLength(1),
        Validators.maxLength(8),
        Validators.required,
        CustomValidators.digits
      ]),
      fechaRecepcion: new FormControl('', [
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.required,
        CustomValidators.date
      ]),
    });


    this.estadoSelected_ = '0';

  }

  cargarCombosFormulario() {
    // Carga de Combos Factorias- Remitente
    this.factoriaService.listarComboFactorias('O').subscribe(data1 => {
          this.comboFactorias = data1;
    });

    // Carga de Combos Factorias- Destinatario
    this.factoriaService.listarComboFactorias('D').subscribe(data7 => {
      this.comboFactoriasDestino = data7;
});



    // Carga de Combos Productos
    this.productoService.listarComboProductos().subscribe(data2 => {
      this.comboProductos = data2;
    },
    (error: HttpErrorResponse) => { // Error del Server
        this.handleError(error);
    });

    // Carga de Combos Unidades de Medida
    this.unidadMedidaService.listarComboUnidadesMedida().subscribe(data3 => {
      this.comboUnidadMedida = data3;

    });

     // Carga de Combos Choferes
    this.choferService.listarComboChoferes(1).subscribe(data4 => {
      this.comboChoferes = data4;
     });

    // Carga de Combos Balanza
    this.balanzaService.listarComboBalanzas().subscribe(data5 => {
      this.comboBalanzas = data5;
    });
  }

  seleccionarFactoriaRemitente(e: any) {
      this.valorRucRemitente_ = e.value.ruc;
      this.valorDirRemitente_ = e.value.direccion;
  }

  seleccionarFactoriaDestinatario(e: any) {
    this.valorRucDestinatario_ = e.value.ruc;
    this.valorDirDestinatario_ = e.value.direccion;
  }

  seleccionarChofer(e: any) {
    this.valorCertificado_ = e.value.certificado;
    this.valorLicencia_ = e.value.licencia;
    this.valorPlacaTracto_ = e.value.vehiculo.placaTracto;
    this.valorPlacaBombona_ = e.value.vehiculo.placaBombona;
  }

  // Grabar Guia de Remisión
  grabarGuiaRemision(model: any, isValid: boolean, e: Event) {

    console.log(this.basicForm.status);
   if (this.basicForm.invalid) {
      console.log('hay errores aun');
   }else {
      // console.log('Form data are: '+ JSON.stringify(model));
      this.submitButton.disabled = true;
      this.basicForm.disable();
      this.progressBar.mode = 'indeterminate';

      // Prepara objeto a grabar en BD
      this.guiaRemision = new GuiaRemision();
      this.guiaDetalle_ = new GuiaDetalle();
      const listaGuias = [];

      this.guiaRemision.serie = this.basicForm.get('nroSerie').value;
      this.guiaRemision.secuencia = this.basicForm.get('nroSecuencia').value;
      this.guiaRemision.balanza = this.basicForm.get('balanzaSelected').value;
      this.guiaRemision.totalCantidad = this.basicForm.get('cantidad').value;
      // this.guiaRemision.totalPeso = this.basicForm.get('peso').value;
      this.guiaRemision.totalPeso = 0.00;
      this.guiaRemision.motivoTraslado = 2;
      this.guiaDetalle_.id = this.valorIdGuiaDetalle_;
      this.guiaDetalle_.producto = this.basicForm.get('productoSelected').value;
      this.guiaDetalle_.cantidad = this.basicForm.get('cantidad').value;
      // this.guiaDetalle_.peso = this.basicForm.get('peso').value;
      this.guiaDetalle_.peso = 0.00;
      this.guiaDetalle_.unidadMedida = this.basicForm.get('unidadMedidaSelected').value;
      listaGuias [0] = this.guiaDetalle_;
      this.guiaRemision.guiaDetalle = listaGuias;

      this.guiaRemision.tarifa = 0.00;
      this.guiaRemision.ticketBalanza = this.basicForm.get('nroTicketBal').value;
      this.guiaRemision.placaTracto = this.basicForm.get('placaTracto').value;
      this.guiaRemision.placaBombona = this.basicForm.get('placaBombona').value;
      this.guiaRemision.serieCliente = this.basicForm.get('nroSerieClie').value;
      this.guiaRemision.secuenciaCliente = this.basicForm.get('nroSequenClie').value;
      this.guiaRemision.usuarioRegistro = this.usuarioSession.codigo;
      this.guiaRemision.usuarioActualiza = this.usuarioSession.codigo;
      this.guiaRemision.estado = this.basicForm.get('estadoSelected').value;

      console.log(new Date(this.basicForm.get('fechaEmision').value).toLocaleDateString());

      this.guiaRemision.fechaRemision = new Date(this.basicForm.get('fechaEmision').value);

      console.log(this.guiaRemision.fechaRemision);

      this.guiaRemision.fechaTraslado = new Date(this.basicForm.get('fechaIniTraslado').value);
      this.guiaRemision.fechaRecepcion = new Date(this.basicForm.get('fechaRecepcion').value);

      this.guiaRemision.balanza = this.basicForm.get('balanzaSelected').value;
      this.guiaRemision.remitente = this.basicForm.get('remitenteSelected').value;
      this.guiaRemision.destinatario = this.basicForm.get('destinatarioSelected').value;
      this.guiaRemision.empresa = this.usuarioSession.empresa;
      this.guiaRemision.chofer = this.basicForm.get('choferSelected').value;

      // console.log('objeto: ' + this.guiaRemision);
      console.log('Form data are: ' + JSON.stringify(this.guiaRemision));

      if (this.edicion) {
        this.actualizar();
      } else {
        this.insertar();
      }

      // Manda POST hacia BD AWS
      // this.guiaRemisioService.registrarGuiaRemisionBD(this.guiaRemision).subscribe((data_) => {
      //   this.infoResponse_ = data_;
      //   this.progressBar.mode = 'determinate';
      //   console.log('mensaje: ' + this.infoResponse_.alertMessage);
      //   this.snackBar.open(this.infoResponse_.alertMessage, 'cerrar', { duration: 20000 , panelClass: ['green-snackbar'] });

      //   // Resetea Formulario
      //   this.snackBar._openedSnackBarRef.afterDismissed().subscribe(() => {
      //     window.location.reload();
      //   });
      // },
      // (error: HttpErrorResponse) => {
      //   this.progressBar.mode = 'determinate';
      //   this.submitButton.disabled = false;
      //   this.basicForm.enable();
      //   this.errorResponse_ = error.error;
      //   this.snackBar.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 20000,  panelClass: ['red-snackbar'] });
      //   console.log(this.errorResponse_.errorMessage);
      // });

   }
  }

  insertar() {
    // Manda POST hacia BD AWS
    this.guiaRemisioService.registrarGuiaRemisionBD(this.guiaRemision).subscribe((data_) => {
      this.infoResponse_ = data_;
      this.progressBar.mode = 'determinate';
      console.log('mensaje: ' + this.infoResponse_.alertMessage);
      this.snackBar.open(this.infoResponse_.alertMessage, 'cerrar', { duration: 20000 , panelClass: ['green-snackbar'] });

      // Resetea Formulario
      this.snackBar._openedSnackBarRef.afterDismissed().subscribe(() => {
        window.location.reload();
      });
    },
    (error: HttpErrorResponse) => {
      this.progressBar.mode = 'determinate';
      this.submitButton.disabled = false;
      this.basicForm.enable();
      this.errorResponse_ = error.error;
      this.snackBar.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 20000,  panelClass: ['red-snackbar'] });
      console.log(this.errorResponse_.errorMessage);
    });
  }

  actualizar() {
    // Manda PUT hacia BD AWS
    this.guiaRemision.id = this.valorIdGuia_;
    console.log(this.guiaRemision.fechaRemision);

    this.guiaRemisioService.actualizarGuiaRemisionBD(this.guiaRemision).subscribe((data_) => {
      this.infoResponse_ = data_;
      this.progressBar.mode = 'determinate';
      console.log('mensaje: ' + this.infoResponse_.alertMessage);
      this.snackBar.open(this.infoResponse_.alertMessage, 'cerrar', { duration: 20000 , panelClass: ['green-snackbar'] });

      // Resetea Formulario
      this.snackBar._openedSnackBarRef.afterDismissed().subscribe(() => {
        window.location.reload();
      });
    },
    (error: HttpErrorResponse) => {
      this.progressBar.mode = 'determinate';
      this.submitButton.disabled = false;
      this.basicForm.enable();
      this.errorResponse_ = error.error;
      this.snackBar.open(this.errorResponse_.errorMessage, 'cerrar', { duration: 20000,  panelClass: ['red-snackbar'] });
      console.log(this.errorResponse_.errorMessage);
    });
  }


  onChangeFechaEmision(type: string, event: MatDatepickerInputEvent<Date>) {
    this.valorFechaIniTraslado_ = event.value;
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
  completarZerosNroSerie(event) {
    const valorDigitado = event.target.value.toLowerCase();
    this.valorNroSerie_ = this.pad(valorDigitado, 5);
  }

  // Completar Zeros
 completarZerosNroSecuencia(event) {
    const valorDigitado = event.target.value.toLowerCase();
    this.valorNroSecuencia_ = this.pad(valorDigitado, 8);
  }

    // Completar Zeros
    completarZerosNroSerieCli(event) {
      const valorDigitado = event.target.value.toLowerCase();
      this.valorSerieCli_ = this.pad(valorDigitado, 5);
    }

    // Completar Zeros
   completarZerosNroSecuenciaCli(event) {
      const valorDigitado = event.target.value.toLowerCase();
      this.valorSecuenciaCli_ = this.pad(valorDigitado, 8);
    }


 pad(number: string, length: number): string {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}


  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };
}