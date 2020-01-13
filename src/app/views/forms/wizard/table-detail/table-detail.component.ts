import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-table-detail',
  templateUrl: './table-detail.component.html',
  styleUrls: ['./table-detail.component.scss']
})
export class TableDetailComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Input() data: any;
  rows = [];
  sortBy: any = 'idProducto';

  constructor() { }

  ngOnInit() {
    // this.rows.splice(this.rows.length, 0, { ...this.data.guiasRemision});
    // this.rows = [...this.rows];
    if (this.data.guiasRemision) {
      this.rows = this.data.guiasRemision;
    };
  }

  onDetailToggle(event) {
    console.log('Detail Toggled', event);
  }

  toggleExpandGroup(group) {
    this.table.groupHeader.toggleExpandGroup(group);
  };

  toggleExpandRow(row) {
    this.table.rowDetail.toggleExpandRow(row);
  }

  getHeight(row: any, index: number): number {
    return row.someHeight;
  }

  sumTotalGrupoCantidad(groupValue: any, column: string) {
    let rowsTemp = [];
    rowsTemp = groupValue.value;
    return rowsTemp.map(t => t.totalCantidad).reduce((acc, value) => acc + value, 0);
  };

  sumTotalGrupoImporte(groupValue: any, column: string) {
    let rowsTemp = [];
    rowsTemp = groupValue.value;
    return rowsTemp.map(t => t.subTotal).reduce((acc, value) => acc + value, 0);
  };

}
