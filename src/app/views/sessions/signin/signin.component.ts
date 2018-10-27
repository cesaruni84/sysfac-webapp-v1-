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

  constructor(private empresaService: EmpresaService,
              private signinService: SigninService,
              private userService: UsuarioService,
              private router: Router,
              @Optional() @Inject(MAT_DIALOG_DATA) public data_: any) {
   }


  ngOnInit() {

    this.signinForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      empresaSelected: new FormControl('', Validators.required),
      rememberMe: new FormControl(false)
    });
    this.empresaService.listarComboEmpresas().subscribe(data => {
      console.log(data);
      this.listaEmpresas = data;
    });

  }

  signin() {

    // Obtiene Datos de formulario
    const txtCodigoUsuario_ = this.signinForm.get('username').value;
    const txtClaveUsuario_ = this.signinForm.get('password').value;
    const idEmpresa_ = this.signinForm.get('empresaSelected').value.id;

    // Carga Objeto a enviar por POST
    this.usuarioForm = new UsuarioForm(txtCodigoUsuario_, txtClaveUsuario_, idEmpresa_ );
    this.submitButton.disabled = true;
    this.progressBar.mode = 'indeterminate';

    // Manda POST hacia BD AWS
    this.signinService.validarLogin(this.usuarioForm)
      .subscribe((data_) => {
        this.usuario_ = data_;
        this.progressBar.mode = 'determinate';
        this.userService.setUserLoggedIn(this.usuario_);
        
        // Redirigir a nueva pagina pasando el objeto como usuario
        this.router.navigate(['/dashboard']);


      }, (error: HttpErrorResponse) => {
        this.progressBar.mode = 'determinate';
        this.submitButton.disabled = false;
        this.errorResponse_ = error.error;
        console.log(this.errorResponse_.errorMessage);
      });

  }

  getUrl()
  {
    return "url('http://estringsoftware.com/wp-content/uploads/2017/07/estring-header-lowsat.jpg')";
  }


}
