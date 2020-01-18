import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-inline-edit',
  styleUrls: ['inline-edit.component.scss'],
  templateUrl: './inline-edit.component.html',
})
export class InlineEditComponent implements OnInit  {

  value = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
             public dialogRef: MatDialogRef<InlineEditComponent>) { }

  ngOnInit() {
    this.value = this.data.tarifa;
  }

  onSubmit() {
    this.dialogRef.close(this.value);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
