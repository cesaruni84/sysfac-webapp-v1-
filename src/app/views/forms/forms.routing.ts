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
      data: { title: 'Registro', breadcrumb: 'Registro de Guias' }
    }, {
      path: 'paging',
      component: PagingTableComponent,
      data: { title: 'Consulta', breadcrumb: 'Consulta de Guias' }
    }, {
      path: 'liquidacion',
      component: FileUploadComponent,
      data: { title: 'Liquidación', breadcrumb: 'Registro de Liquidación' }
    },
    {
      path: 'busquedaLiquidaciones',
      component: RichTextEditorComponent,
      data: { title: 'Liquidación2', breadcrumb: 'Consulta de Liquidaciones' }
    },
    {
      path: 'facturacion',
      component: WizardComponent,
      data: { title: 'Facturación', breadcrumb: 'Registro de Factura' }
    }]
  }
];