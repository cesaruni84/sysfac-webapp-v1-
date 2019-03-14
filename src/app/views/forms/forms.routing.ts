import { Routes } from '@angular/router';

import { BasicFormComponent } from './basic-form/basic-form.component';
import { RichTextEditorComponent } from './rich-text-editor/rich-text-editor.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { WizardComponent } from './wizard/wizard.component';
import { PagingTableComponent } from '../tables/paging-table/paging-table.component';
import { FacturaConsultaComponent } from './wizard/factura-consulta/factura-consulta.component';

export const FormsRoutes: Routes = [
  {
    path: '',
    children: [{
      path: 'basic',
      component: BasicFormComponent,
      data: { title: 'Registro', breadcrumb: 'REGISTRO DE GUIAS' }
    }, {
      path: 'paging',
      component: PagingTableComponent,
      data: { title: 'Consulta', breadcrumb: 'CONSULTA DE GUIAS' }
    }, {
      path: 'liquidacion',
      component: FileUploadComponent,
      data: { title: 'Liquidación', breadcrumb: 'REGISTRO DE LIQUIDACION' }
    },
    {
      path: 'busquedaLiquidaciones',
      component: RichTextEditorComponent,
      data: { title: 'Liquidación', breadcrumb: 'CONSULTA DE LIQUIDACIONES' }
    },
    {
      path: 'facturacion/registro',
      component: WizardComponent,
      data: { title: 'Facturación', breadcrumb: 'REGISTRO DE FACTURA' }
    },
    {
      path: 'facturacion/consulta',
      component: FacturaConsultaComponent,
      data: { title: 'Facturación', breadcrumb: 'CONSULTA DE FACTURAS' }
    }
  ]
  }
];