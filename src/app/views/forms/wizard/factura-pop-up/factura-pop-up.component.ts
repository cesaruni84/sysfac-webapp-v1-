import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-factura-pop-up',
  templateUrl: './factura-pop-up.component.html',
  styleUrls: ['./factura-pop-up.component.scss']
})
export class FacturaPopUpComponent implements OnInit {

  rows = [];
  columns = [];

  messages: any = {
    // Message to show when array is presented
    // but contains no values
    emptyMessage: '-',

    // Footer total message
    totalMessage: 'total',

    // Footer selected message
    selectedMessage: 'selected'
  };

  constructor() { }

  ngOnInit() {
  }

}
