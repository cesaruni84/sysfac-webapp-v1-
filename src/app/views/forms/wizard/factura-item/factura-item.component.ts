import { FacturaItem } from './../../../../shared/models/facturacion.model';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UnidadMedida } from '../../../../shared/models/unidad_medida.model';
import { UnidadMedidaService } from '../../../../shared/services/unidad-medida/unidad-medida.service';

@Component({
  selector: 'app-factura-item',
  templateUrl: './factura-item.component.html',
  styleUrls: ['./factura-item.component.scss']
})
export class FacturaItemComponent implements OnInit {

  public itemForm: FormGroup;
  tipo_: any = 2;
  unidadMedida_: any = {};


  comboTipoProducto = [
    { id: 1, codigo: '001' , descripcion: ' Bien' },
    { id: 2, codigo: '002' , descripcion: ' Servicio' },
  ];

  comboUnidades: UnidadMedida[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FacturaItemComponent>,
    private fb: FormBuilder,
    private unidadMedidaService: UnidadMedidaService,
  ) { }

  ngOnInit() {
    this.cargaCombos();
    this.buildItemForm(this.data.payload);
  }
  buildItemForm(itemFactura: FacturaItem) {
    this.itemForm = this.fb.group({
      tipo: [itemFactura.tipo.id || '' , Validators.required],
      codigo: [itemFactura.codigo || ''],
      descripcion: [itemFactura.descripcion || ''],
      cantidad: [itemFactura.cantidad || '1.00'],
      unidadMedida: [itemFactura.unidadMedida || ''],
      tarifa: [itemFactura.tarifa || 0.00],
      descuentos: [itemFactura.descuentos || 0.00],
      tipoIGV: [itemFactura.tipoIGV || ''],
      valorIGV: [itemFactura.valorIGV || 0.00],
      total: [itemFactura.total || 0.00],
    });
  }

  cargaCombos() {
      // Carga de Combos Unidades de Medida
      this.unidadMedidaService.listarComboUnidadesMedida().subscribe(data3 => {
        this.comboUnidades = data3;
      });
  }

  submit() {
    this.dialogRef.close(this.itemForm.value);
  }

}
