import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { 
  MatIconModule,
  MatDialogModule,
  MatButtonModule,
  MatCardModule,
  MatListModule,
  MatToolbarModule,
  MatInputModule,
  MatDatepickerModule,
  MatNativeDateModule
 } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CalendarModule } from 'angular-calendar';
import { ColorPickerModule } from 'ngx-color-picker';
import { AppCalendarComponent } from './app-calendar.component';
import { CalendarRoutes } from "./app-calendar.routing";
import { CalendarFormDialogComponent } from './calendar-form-dialog/calendar-form-dialog.component';
import { AppCalendarService } from './app-calendar.service';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    FlexLayoutModule,
    ColorPickerModule,
    CalendarModule.forRoot(),
    RouterModule.forChild(CalendarRoutes)
  ],
  providers: [AppCalendarService],
  entryComponents: [CalendarFormDialogComponent],
  declarations: [
    AppCalendarComponent, 
    CalendarFormDialogComponent
  ]
})
export class AppCalendarModule { }
