import { InlineEditComponent } from './file-upload/inline-edit/inline-edit.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {NgxMaskModule} from 'ngx-mask';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatTabsModule} from '@angular/material/tabs';
import { TablesModule } from '../tables/tables.module';
import { SatPopoverModule } from '@ncstate/sat-popover';


import { 
  MatInputModule,
  MatDatepickerModule, 
  MatNativeDateModule,
  MatListModule,
  MatCardModule,
  MatProgressBarModule,
  MatRadioModule,
  MatTableModule,
  MatPaginatorModule,
  MatCheckboxModule,
  MatButtonModule,
  MatIconModule,
  MatSelectModule,
  MatStepperModule,
  MatChipsModule,
  MatAutocompleteModule,
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { QuillModule } from 'ngx-quill';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';

import { BasicFormComponent } from './basic-form/basic-form.component';
import { RichTextEditorComponent } from './rich-text-editor/rich-text-editor.component';
import { FileUploadComponent } from './file-upload/file-upload.component';

import { FormsRoutes } from "./forms.routing";
import { WizardComponent } from './wizard/wizard.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatGridListModule,
    MatTabsModule,
    TablesModule,
    MatInputModule,
    MatListModule,
    MatCardModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatRadioModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    SatPopoverModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatStepperModule,
    NgxMaskModule.forRoot(),
    FlexLayoutModule,
    QuillModule,
    NgxDatatableModule,
    FileUploadModule,
    RouterModule.forChild(FormsRoutes)
  ],
  declarations: [BasicFormComponent, RichTextEditorComponent, FileUploadComponent, WizardComponent, InlineEditComponent]
})
export class AppFormsModule { }