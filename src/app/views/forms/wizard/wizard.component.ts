import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { TipoDocumento, TipoOperacion, FormaPago, Moneda, TipoIGV } from '../../../shared/models/tipos_facturacion';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClienteService } from '../../../shared/services/facturacion/cliente.service';
import { Cliente } from '../../../shared/models/cliente.model';
import { TiposGenericosService } from '../../../shared/services/util/tiposGenericos.service';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css']
})
export class WizardComponent implements OnInit, OnDestroy {

  // Formulario
  facturaForm: FormGroup;
  myFormValueChanges$;
  totalSum: number;

  // Valores de Combo de Formulario
  public comboTiposDocumento: TipoDocumento[];
  public comboTiposOperacion: TipoOperacion[];
  public comboFormasPago: FormaPago[];
  public comboMonedas: Moneda[];
  public comboTiposIGV: TipoIGV[];
  public comboClientes: Cliente[];

  constructor(private formBuilder: FormBuilder,
              private tiposGenService: TiposGenericosService,
              private clienteService: ClienteService) { }

  ngOnInit() {
    this.facturaForm = this.formBuilder.group({
      cliente: ['',[Validators.required]],
      direccion: new FormControl({value: '', disabled: true}, ),
      tipoDocumento: [''],
      serieDocumento: [''],
      numeroDocumento: [''],
      tipoOperacion: [''],
      formaPago: [''],
      fechaEmision: [ '' ,
        [ Validators.minLength(10),
          Validators.maxLength(10),
          Validators.required,
          CustomValidators.date
        ]
      ],
      fechaVencimiento: [''],
      estadoDocumento: [''],
      observacion: [''],
      nroOrdenServicio: [''],
      moneda: [''],
      facturaDetalle: this.formBuilder.array([
         this.obtenerFacturaDetalle()
      ])
    });


    // initialize stream on units
    this.myFormValueChanges$ = this.facturaForm.controls['facturaDetalle'].valueChanges;

    // subscribe to the stream so listen to changes on units
    this.myFormValueChanges$.subscribe(facturaDetalle => this.updateTotalUnitPrice(facturaDetalle));

    // Carga Valores de Formulario
    this.cargarValoresFormulario();

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
      tipoDocumento: this.comboTiposDocumento[1],
      formaPago: this.comboFormasPago[0],
      tipoOperacion: this.comboTiposOperacion[0],
      moneda: this.comboMonedas[0],
    });


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

    // Combo Tipos de IGV
    this.comboTiposIGV = this.tiposGenService.retornarTiposIGV();

  }


  submit() {
    // console.log(this.firstFormGroup.value);
    // console.log(this.secondFormGroup.value);
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
   * unsubscribe listener
   */
  ngOnDestroy(): void {
    this.myFormValueChanges$.unsubscribe();
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
   * Add new unit row into form
   */
  private addUnit() {
    const control = <FormArray>this.facturaForm.controls['facturaDetalle'];
    control.push(this.obtenerFacturaDetalle());
  }

  /**
   * Remove unit row from form on click delete button
   */
  private removeUnit(i: number) {
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
