import { InlineEditComponent } from './file-upload/inline-edit/inline-edit.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import {NgxMaskModule} from 'ngx-mask';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS, MatTooltipModule } from '@angular/material';
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
  MatExpansionModule,
  MatPaginatorModule,
  MatCheckboxModule,
  MatButtonModule,
  MatIconModule,
  MatSelectModule,
  MatStepperModule,
  MatChipsModule,
  MatAutocompleteModule,
  MatSlideToggleModule,
  MatToolbarModule,

} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { QuillModule } from 'ngx-quill';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';
import { BasicFormComponent } from './basic-form/basic-form.component';
import { RichTextEditorComponent } from './rich-text-editor/rich-text-editor.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { FormsRoutes } from './forms.routing';
import { WizardComponent } from './wizard/wizard.component';
import { FacturaPopUpComponent } from './wizard/factura-pop-up/factura-pop-up.component';
import { OrdenesServicioComponent } from './ordenes-servicio/ordenes-servicio.component';
import { BuscarGuiaLiqComponent } from './file-upload/buscar-guia-liq/buscar-guia-liq.component';
import { FacturaItemComponent } from './wizard/factura-item/factura-item.component';
import { FacturaConsultaComponent } from './wizard/factura-consulta/factura-consulta.component';
import { MaestroFactoriaComponent } from './configuracion/maestro-factoria/maestro-factoria.component';
import { MaestroFactoriaPopupComponent } from './configuracion/maestro-factoria/maestro-factoria-popup/maestro-factoria-popup.component';
import { MaestroVehiculosComponent } from './configuracion/maestro-vehiculos/maestro-vehiculos.component';
import { MaestroChoferesComponent } from './configuracion/maestro-choferes/maestro-choferes.component';
import { MaestroTarifasComponent } from './configuracion/maestro-tarifas/maestro-tarifas.component';
import { MaestroClientesComponent } from './configuracion/maestro-clientes/maestro-clientes.component';
import { MaestroProductosComponent } from './configuracion/maestro-productos/maestro-productos.component';
import { MaestroVehiculosPopupComponent } from './configuracion/maestro-vehiculos/maestro-vehiculos-popup/maestro-vehiculos-popup.component';
import { MaestroChoferesPopupComponent } from './configuracion/maestro-choferes/maestro-choferes-popup/maestro-choferes-popup.component';
import { MaestroTarifasPopupComponent } from './configuracion/maestro-tarifas/maestro-tarifas-popup/maestro-tarifas-popup.component';
import { FacturaItemGuiasComponent } from './wizard/factura-item-guias/factura-item-guias.component';
import { TableDetailComponent } from './wizard/table-detail/table-detail.component';
import { ClientePopupComponent } from './configuracion/maestro-clientes/cliente-popup/cliente-popup.component';
import { ProductosPopupComponent } from './configuracion/maestro-productos/productos-popup/productos-popup.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

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
    NgxMatSelectSearchModule,
    MatToolbarModule,
    MatTooltipModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatRadioModule,
    MatTableModule,
    MatExpansionModule,
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
  declarations: [BasicFormComponent,
                RichTextEditorComponent,
                FileUploadComponent,
                WizardComponent,
                InlineEditComponent,
                FacturaPopUpComponent,
                OrdenesServicioComponent,
                BuscarGuiaLiqComponent,
                FacturaItemComponent,
                FacturaConsultaComponent,
                MaestroFactoriaComponent,
                MaestroFactoriaPopupComponent,
                MaestroVehiculosComponent,
                MaestroChoferesComponent,
                MaestroTarifasComponent,
                MaestroClientesComponent,
                MaestroProductosComponent,
                MaestroVehiculosPopupComponent,
                MaestroChoferesPopupComponent,
                MaestroTarifasPopupComponent,
                FacturaItemGuiasComponent,
                TableDetailComponent,
                ClientePopupComponent,
                ProductosPopupComponent],
   entryComponents: [FacturaPopUpComponent,
                      FacturaItemComponent,
                      FacturaItemGuiasComponent,
                      OrdenesServicioComponent,
                      BuscarGuiaLiqComponent,
                      MaestroFactoriaPopupComponent,
                      MaestroVehiculosPopupComponent,
                      ClientePopupComponent,
                      MaestroChoferesPopupComponent,
                      MaestroTarifasPopupComponent,
                      ProductosPopupComponent,
                      InlineEditComponent]
})
export class AppFormsModule {

}