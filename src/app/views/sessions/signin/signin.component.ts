import { Component, OnInit, ViewChild, Inject, Optional } from '@angular/core';
import { MatProgressBar, MatButton, MAT_DIALOG_DATA } from '@angular/material';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { Empresa } from '../../../shared/models/empresa.model';
import { EmpresaService } from '../empresa.service';
import { element } from 'protractor';
import { UsuarioForm } from '../../../shared/models/usuarioForm.model';
import { SigninService } from './signin.service';
import { UsuarioService } from './../../../shared/services/auth/usuario.service';
import { Usuario } from '../../../shared/models/usuario.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../../../shared/models/error_response.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  // Definiciones
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;

  // Variables de clase
  listaEmpresas: Empresa[];
  usuarioForm: UsuarioForm;
  signinForm: FormGroup;

  // Retorno de la validacion
  usuario_: Usuario;
  errorResponse_: ErrorResponse;
  returnUrl: String;

  constructor(private empresaService: EmpresaService,
              private signinService: SigninService,
              private userService: UsuarioService,
              private router: Router,
              @Optional() @Inject(MAT_DIALOG_DATA) public data_: any) {
   }


  ngOnInit() {

     // Resetea Login Status
    this.signinService.logout();

    // Carga validaciones de formulario
    this.cargarFormulario();

    // Carga lista de Combos de Empresa
    this.cargarComboEmpresas();

    // Siguiente URL
    this.returnUrl = '/dashboard';
  }

  cargarFormulario() {
    this.signinForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      empresaSelected: new FormControl('', Validators.required),
      rememberMe: new FormControl(false)
    });
  }

  cargarComboEmpresas(){
    this.empresaService.listarComboEmpresas().subscribe(data => {
      this.listaEmpresas = data;
    });
  }


  valor (tagName: any) {
    return this.signinForm.get(tagName).value;
  }

  signin() {
    // Carga Objeto a enviar por POST
    this.usuarioForm = new UsuarioForm(this.valor('username'),
                                        this.valor('password'),
                                        this.valor('empresaSelected').id );

    this.submitButton.disabled = true;
    this.progressBar.mode = 'indeterminate';

    // Manda POST hacia BD AWS
    this.signinService.login(this.usuarioForm)
      .subscribe((data_) => {
        this.userService.setUserLoggedIn(data_);

        // Redirigir a nueva pagina pasando el objeto como usuario
        this.router.navigate([this.returnUrl]);


      }, (error: HttpErrorResponse) => {
        this.progressBar.mode = 'determinate';
        this.submitButton.disabled = false;
        this.errorResponse_ = error.error;
        console.log(this.errorResponse_.errorMessage);
      });

  }

  getUrl() {
    // return "url('http://estringsoftware.com/wp-content/uploads/2017/07/estring-header-lowsat.jpg')";
    return "url('https://www.compromisorse.com/upload/noticias/005/5106/cemex_lh.jpg')";
    
  }


}
