import { Component, Input, Optional, Host, Inject } from '@angular/core';
import { SatPopover } from '@ncstate/sat-popover';
import { filter } from 'rxjs/operators/filter';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-inline-edit',
  styleUrls: ['inline-edit.component.scss'],
  templateUrl: './inline-edit.component.html',
})
export class InlineEditComponent {

  value = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
             public dialogRef: MatDialogRef<InlineEditComponent>) { }

  ngOnInit() {
    this.value = this.data.tarifa;
    console.log();
  }

  onSubmit() {
    this.dialogRef.close(this.value);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
