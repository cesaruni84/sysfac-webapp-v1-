import { Component, OnInit, Inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UsuarioService } from '../../../../../shared/services/auth/usuario.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { Usuario } from '../../../../../shared/models/usuario.model';
import { ErrorResponse, InfoResponse } from '../../../../../shared/models/error_response.model';
import { throwError } from 'rxjs/internal/observable/throwError';
import { Producto, Categoria } from '../../../../../shared/models/producto.model';
import { ProductoService } from '../../../../../shared/services/productos/producto.service';

@Component({
  selector: 'app-productos-popup',
  templateUrl: './productos-popup.component.html',
  styleUrls: ['./productos-popup.component.scss']
})
export class ProductosPopupComponent implements OnInit {

  public itemForm_: FormGroup;
  public itemProducto: Producto;

  public comboTipoProducto = [
    { id: 1, codigo: '001' , descripcion: ' BIEN' },
    { id: 2, codigo: '002' , descripcion: ' SERVICIO' },
  ];

  usuarioSession: Usuario;
  errorResponse_: ErrorResponse;
  infoResponse_: InfoResponse;
  idCategoria: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ProductosPopupComponent>,
    private fb: FormBuilder,
    private productoService: ProductoService,
    private userService: UsuarioService,
    private loader: AppLoaderService,
    private snack: MatSnackBar,
  ) { }

  ngOnInit() {
    this.usuarioSession = this.userService.getUserLoggedIn();
    this.buildItemForm(this.data.payload);
  }


  buildItemForm(item: Producto) {
    this.idCategoria = 0;
    if (item.categoria) {
      this.idCategoria = item.categoria.id;
    }

    this.itemForm_ = this.fb.group({
      tipoProducto: [{value: this.idCategoria || 1 , disabled: false}, Validators.required],
      codigo: [{value: item.codigo || '', disabled: false}, Validators.required],
      nombre: [{value: item.nombre || '', disabled: false}, Validators.required],
      descripcion: [{value: item.descripcion || '', disabled: false}],
      stock: [{ value: item.stock || 0.00, disabled: false }, CustomValidators.number],
      precio: [{ value: item.precio || 0.00, disabled: false }, CustomValidators.number]
    });

  }


  compareObjects(o1: any, o2: any): boolean {
    return  o1.id === o2.id;
  }

     /**
   * Getters de campos de formulario
   */
  get tipoProducto_ (): FormControl {
    return this.itemForm_.get('tipoProducto') as FormControl;
  }

  get codigo_ (): FormControl {
    return this.itemForm_.get('codigo') as FormControl;
  }

  get nombre_ (): FormControl {
    return this.itemForm_.get('nombre') as FormControl;
  }

  get descripcion_ (): FormControl {
    return this.itemForm_.get('descripcion') as FormControl;
  }

  get stock_ (): FormControl {
    return this.itemForm_.get('stock') as FormControl;
  }

  get precio_ (): FormControl {
    return this.itemForm_.get('precio') as FormControl;
  }



  submit() {
    if (!this.itemForm_.invalid) {
      this.itemProducto = new Producto();
      const tipoProd = new Categoria();
      tipoProd.id = this.tipoProducto_.value;
      this.itemProducto.categoria = tipoProd ;
      this.itemProducto.codigo = this.codigo_.value;
      this.itemProducto.nombre = this.nombre_.value;
      this.itemProducto.descripcion = this.descripcion_.value;
      this.itemProducto.stock = this.stock_.value;
      this.itemProducto.precio = this.precio_.value;
      if (this.data.isNew) {
        this.registrar();
      } else {
        this.actualizar();
      }

    }
  }

  registrar() {
    this.loader.open();
    this.productoService.registrarProducto(this.itemProducto).subscribe((data_) => {
       this.infoResponse_ = data_;
       this.loader.close();
       this.dialogRef.close(this.itemForm_.getRawValue());
    },
    (error: HttpErrorResponse) => {
      this.handleError(error);
    });
  }

  actualizar() {
    this.itemProducto.id = this.data.payload.id;
    this.loader.open();
    this.productoService.actualizarProducto(this.itemProducto).subscribe((data_) => {
       this.infoResponse_ = data_;
       this.loader.close();
       this.dialogRef.close(this.itemForm_.getRawValue());
    },
    (error: HttpErrorResponse) => {
      this.handleError(error);
    });
  }


  private handleError(error: HttpErrorResponse) {

    this.loader.close();
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      // this.errorResponse_ = error.error;
      this.snack.open(this.errorResponse_.errorMessage, 'OK', { duration: 3000 });
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      if (error.error.codeMessage != null ) {
        this.errorResponse_ = error.error;
        this.snack.open(this.errorResponse_.errorMessage, 'OK', { duration: 3000 });
      } else {
        this.snack.open('Ocurrió un error inesperado!!, intenta nuevamente.', 'OK', { duration: 3000 });
        console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${error.error}`);
      }

    }
    // return an observable with a user-facing error message
    return throwError(
      'Ocurrió un error inesperado, volver a intentar.');
  };


}
