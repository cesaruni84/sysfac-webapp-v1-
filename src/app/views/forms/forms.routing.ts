import { Routes } from '@angular/router';

import { BasicFormComponent } from './basic-form/basic-form.component';
import { RichTextEditorComponent } from './rich-text-editor/rich-text-editor.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { WizardComponent } from './wizard/wizard.component';
import { PagingTableComponent } from '../tables/paging-table/paging-table.component';

export const FormsRoutes: Routes = [
  {
    path: '',
    children: [{
      path: 'basic',
      component: BasicFormComponent,
      data: { title: 'Basic', breadcrumb: 'Registro de Guia' }
    }, {
      path: 'paging',
      component: PagingTableComponent,
      data: { title: 'Consulta', breadcrumb: 'Consulta de Guias' }
    }, {
      path: 'upload',
      component: FileUploadComponent,
      data: { title: 'Upload', breadcrumb: 'UPLOAD' }
    }, {
      path: 'wizard',
      component: WizardComponent,
      data: { title: 'Wizard', breadcrumb: 'WIZARD' }
    }]
  }
];