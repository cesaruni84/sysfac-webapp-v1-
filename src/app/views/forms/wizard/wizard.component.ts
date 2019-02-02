import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { TipoDocumento, TipoOperacion, FormaPago, Moneda, TipoIGV } from '../../../shared/models/tipos_facturacion';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClienteService } from '../../../shared/services/facturacion/cliente.service';
import { Cliente } from '../../../shared/models/cliente.model';
import { TiposGenericosService } from '../../../shared/services/util/tiposGenericos.service';
import { GetValueByKeyPipe } from '../../../shared/pipes/get-value-by-key.pipe';
import { DateAdapter, MAT_DATE_FORMATS, MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../shared/helpers/date.adapter';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { FacturaPopUpComponent } from './factura-pop-up/factura-pop-up.component';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css'],
  providers: [
    {
        provide: DateAdapter, useClass: AppDateAdapter
    },
    {
        provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
    ],
})
export class WizardComponent implements OnInit {

  // Formulario
  facturaForm: FormGroup;
  totalSum: number;

  // Totales
  simbolo: string;
  subTotal: number;
  anticipos: number;
  descuentos: number;
  valorVenta: number;
  valorIGV: number;
  otrosCargos: number;
  otrosTributos: number;
  importeTotal: number;


  // Manejos
  rows = [];
  temp = [];
  columns = [];

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

  // Valores de Combo de Formulario
  public comboTiposDocumento: TipoDocumento[];
  public comboTiposOperacion: TipoOperacion[];
  public comboFormasPago: FormaPago[];
  public comboMonedas: Moneda[];
  public comboTiposIGV: TipoIGV[];
  public comboClientes: Cliente[];
  public comboEstadosFactura = [
    { id: 1, codigo: '001' , descripcion: 'Registrado' },
    { id: 2, codigo: '002' , descripcion: 'Enviado a Facturador SUNAT'},
    { id: 3, codigo: '003' , descripcion: 'Enviado y Aceptado SUNAT'},
    { id: 4, codigo: '004' , descripcion: 'Observada SUNAT'},
    { id: 5, codigo: '005' , descripcion: 'Anulada'},
  ];

  constructor(private formBuilder: FormBuilder,
              private tiposGenService: TiposGenericosService,
              private loader: AppLoaderService,
              private dialog: MatDialog,
              private snack: MatSnackBar,
              private clienteService: ClienteService) { }

  ngOnInit() {
    this.facturaForm = this.formBuilder.group({
      cliente: ['', [Validators.required]],
      direccion: new FormControl({value: '', disabled: true}, ),
      tipoDocumento: [{value: '', disabled: true}],
      serieDocumento: ['', [Validators.required]],
      numeroDocumento: ['', [Validators.required]],
      tipoOperacion: [''],
      tipoAfectacionIGV: [''],
      formaPago: [''],
      fechaEmision: [ '' ,
        [ Validators.minLength(10),
          Validators.maxLength(10),
          Validators.required,
          CustomValidators.date
        ]
      ],
      fechaVencimiento: [ '' ,
        [ Validators.minLength(10),
          Validators.maxLength(10),
          CustomValidators.date
        ]
      ],
      estado: [{value: '', disabled: true}],
      observacion: [''],
      nroOrdenServicio: [{value: '', disabled: true}],
      moneda: [''],
    });


    // Carga Valores de Formulario
    this.cargarValoresFormulario();

    // Carga valores de Totales
    this.cargaValoresTotales();

  }

    /**
   * Update prices as soon as something changed on units group
   */
  private updateTotalUnitPrice(units: any) {
    // get our units group controll
    const control = <FormArray>this.facturaForm.controls['facturaDetalle'];
    // before recount total price need to be reset.
    this.totalSum = 0;

    for (let i = 0; i < units.length; i++) {

    // for ( var i in units) {
      let totalUnitPrice = (units[i].cantidad * units[i].unitPrice);
      // now format total price with angular currency pipe
      // let totalUnitPriceFormatted = this.currencyPipe.transform(totalUnitPrice, 'USD', 'symbol-narrow', '1.2-2');
      // update total sum field on unit and do not emit event myFormValueChanges$ in this case on units
      control.at(+i).get('unitTotalPrice').setValue(totalUnitPrice, {onlySelf: true, emitEvent: false});
      // update total price for all units
      this.totalSum += totalUnitPrice;
    }
  }

  cargarValoresFormulario() {
    this.cargarCombos();
    this.facturaForm.patchValue({
      fechaEmision: new Date(),
      estado: this.comboEstadosFactura[0],
      tipoDocumento: this.comboTiposDocumento[0],
      formaPago: this.comboFormasPago[0],
      tipoOperacion: this.comboTiposOperacion[0],
      tipoAfectacionIGV: this.comboTiposIGV[0],
      moneda: this.comboMonedas[0],
    });
  }

  cargaValoresTotales() {
    this.simbolo = 'S/';
    this.subTotal = 0.00;
    this.anticipos = 0.00;
    this.descuentos = 0.00;
    this.valorVenta = 0.00;
    this.valorIGV = 0.00;
    this.otrosCargos = 0.00;
    this.otrosTributos = 0.00;
    this.importeTotal = 0.00;
  }

  selecccionarSimbolo() {
      this.simbolo = (this.moneda.value as Moneda).nemonico;
  }

  get moneda (): FormControl {
    return this.facturaForm.get('moneda') as FormControl;
  }



    /**
   * Carga Todos los valores de los combos de la página
   */
  cargarCombos() {

    // Combo Clientes
    this.clienteService.listarClientesPorEmpresa(1).subscribe(dataClientes => {
      this.comboClientes = dataClientes;
    });


    // Combo Tipos Documento
    this.comboTiposDocumento = this.tiposGenService.retornarTiposDocumento();

    // Combo Tipos de Operacion
    this.comboTiposOperacion = this.tiposGenService.retornarTiposOperacion();

    // Combo Formas de Pago
    this.comboFormasPago = this.tiposGenService.retornarFormasPago();

    // Combo Monedas
    this.comboMonedas = this.tiposGenService.retornarMonedas();

    // Combo Tipos de Afectación IGV
    this.comboTiposIGV = this.tiposGenService.retornarTiposIGV();

  }


  submit(a:any, b:any, c:any) {
    // console.log(this.firstFormGroup.value);
    // console.log(this.secondFormGroup.value);
  }

  getControls(frmGrp: FormGroup, key: string) {
    return (<FormArray>frmGrp.controls[key]).controls;
  }

    /**
   * Create form unit
   */
  private obtenerFacturaDetalle() {
    const numberPatern = '^[0-9.,]+$';
    return this.formBuilder.group({
      codigo: ['', [Validators.required, ]],
      descripcion: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.pattern(numberPatern)]],
      unidadMedida: ['', Validators.required],
      unitPrice: ['', [Validators.required, Validators.pattern(numberPatern)]],
      tipoIGV: [ {value: '', disabled: false} , [Validators.required]],
      valorIGV: ['', [Validators.required, Validators.pattern(numberPatern)]],
      unitTotalPrice: [{value: 0.00, disabled: true}]
    });
  }



   /**
   * Completar Campo Dirección
   */
  seleccionarCliente(event: any) {
    this.facturaForm.patchValue({
      direccion: event.value.direccion,
    });
  }


    /**
   * Buscar Item en base de datos
   */

  buscarItem(data: any = {}, isNew?) {
    let title = isNew ? 'Añadir Item' : 'Actualizar Item';
    let dialogRef: MatDialogRef<any> = this.dialog.open(FacturaPopUpComponent, {
      width: '840px',
      height: '640px',
      disableClose: true,
      data: { title: title, payload: data }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
        this.loader.open();
        if (isNew) {
          // this.crudService.addItem(res)
          //   .subscribe(data => {
          //     this.items = data;
          //     this.loader.close();
          //     this.snack.open('Member Added!', 'OK', { duration: 4000 });
          //   });
        } else {
          // this.crudService.updateItem(data._id, res)
          //   .subscribe(data => {
          //     this.items = data;
          //     this.loader.close();
          //     this.snack.open('Member Updated!', 'OK', { duration: 4000 });
          //   });
        }
      });
  }


    /**
   * Add new unit row into form
   */
   addUnit() {
    const control = <FormArray>this.facturaForm.controls['facturaDetalle'];
    control.push(this.obtenerFacturaDetalle());
  }

  /**
   * Remove unit row from form on click delete button
   */
   removeUnit(i: number) {
    const control = <FormArray>this.facturaForm.controls['facturaDetalle'];
    control.removeAt(i);
  }

    /************
   * UTILITARIOS
   *************/

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

  compareObjects(o1: any, o2: any): boolean {
    return o1.name === o2.name && o1.id === o2.id;
  }
}
