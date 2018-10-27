import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  MatInputModule, MatDatepickerModule, MatSelectModule, MatCardModule, MatSlideToggleModule,
   MatCheckboxModule, MatFormFieldModule, MatButtonModule
 } from '@angular/material';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FilterTableComponent } from './filter-table/filter-table.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FullscreenTableComponent } from './fullscreen-table/fullscreen-table.component';
import { PagingTableComponent } from './paging-table/paging-table.component';

import { TablesRoutes } from './tables.routing';

@NgModule({
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatInputModule,
    NgxDatatableModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    FlexLayoutModule,
    MatCardModule,
    MatCheckboxModule,
    MatSelectModule,
    RouterModule.forChild(TablesRoutes)
  ],
  declarations: [FilterTableComponent, FullscreenTableComponent, PagingTableComponent]
})
export class TablesModule { }
