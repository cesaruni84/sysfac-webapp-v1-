import { Routes } from '@angular/router';

import { BasicFormComponent } from './basic-form/basic-form.component';
import { RichTextEditorComponent } from './rich-text-editor/rich-text-editor.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { WizardComponent } from './wizard/wizard.component';
import { PagingTableComponent } from '../tables/paging-table/paging-table.component';
import { FacturaConsultaComponent } from './wizard/factura-consulta/factura-consulta.component';
import { MaestroFactoriaComponent } from './configuracion/maestro-factoria/maestro-factoria.component';
import { MaestroVehiculosComponent } from './configuracion/maestro-vehiculos/maestro-vehiculos.component';
import { MaestroChoferesComponent } from './configuracion/maestro-choferes/maestro-choferes.component';
import { MaestroTarifasComponent } from './configuracion/maestro-tarifas/maestro-tarifas.component';
import { MaestroClientesComponent } from './configuracion/maestro-clientes/maestro-clientes.component';
import { MaestroProductosComponent } from './configuracion/maestro-productos/maestro-productos.component';
import { FacturaAuditoriaComponent } from './wizard/factura-auditoria/factura-auditoria.component';

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
    },
    {
      path: 'facturacion/auditoria',
      component: FacturaAuditoriaComponent,
      data: { title: 'Facturación', breadcrumb: 'FACTURA CON ERRORES' }
    },

    {
      path: 'configuracion/factorias',
      component: MaestroFactoriaComponent,
      data: { title: 'Plantas', breadcrumb: 'MANTENIMIENTO DE PLANTAS' }
    },

    {
      path: 'configuracion/vehiculos',
      component: MaestroVehiculosComponent,
      data: { title: 'Vehículos', breadcrumb: 'MANTENIMIENTO DE VEHICULOS' }
    },

    {
      path: 'configuracion/choferes',
      component: MaestroChoferesComponent,
      data: { title: 'Chofer', breadcrumb: 'MANTENIMIENTO DE CHOFERES' }
    }
    ,

    {
      path: 'configuracion/tarifas',
      component: MaestroTarifasComponent,
      data: { title: 'Tarifas', breadcrumb: 'MANTENIMIENTO DE TARIFAS' }
    }
  ,
    {
      path: 'configuracion/clientes',
      component: MaestroClientesComponent,
      data: { title: 'Clientes', breadcrumb: 'MANTENIMIENTO DE CLIENTES' }
    }
   ,
   {
    path: 'configuracion/productos',
    component: MaestroProductosComponent,
    data: { title: 'Productos', breadcrumb: 'MANTENIMIENTO DE PRODUCTOS' }
  }

  ]
  }
];