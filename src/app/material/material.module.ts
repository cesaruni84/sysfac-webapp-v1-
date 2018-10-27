// import { MatPaginatorImpl } from './../_shared/mat-paginator';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressBarModule, MatAutocompleteModule, MatNativeDateModule,
    MatExpansionModule, MatListModule, MatDatepickerModule, MatSelectModule,
     MatDialogModule, MatSnackBarModule, MatCardModule, MatInputModule, MatButtonModule,
     MatIconModule, MatMenuModule, MatSidenavModule, MatDividerModule, MatToolbarModule,
     MatFormFieldModule, MatTableModule, MatPaginatorModule, MatSortModule, MatPaginatorIntl } from '@angular/material';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatSidenavModule,
        MatDividerModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatInputModule,
        MatCardModule,
        MatSnackBarModule,
        MatDialogModule,
        MatSelectModule,
        MatListModule,
        MatNativeDateModule,
    ],
    exports: [
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatSidenavModule,
        MatDividerModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatInputModule,
        MatCardModule,
        MatSnackBarModule,
        MatDialogModule,
        MatSelectModule,
        MatDatepickerModule,
        MatListModule,
        MatExpansionModule,
        MatNativeDateModule,
        MatAutocompleteModule,
        MatProgressBarModule
    ],
    // providers: [  { provide: MatPaginatorIntl, useClass: MatPaginatorImpl }],
    declarations: []
})
export class MaterialModule { }
