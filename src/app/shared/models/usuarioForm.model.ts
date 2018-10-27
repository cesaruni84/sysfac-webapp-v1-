import { Empresa } from './empresa.model';

export class UsuarioForm {
    public txtCodigoUsuario: String ;
    public txtClaveUsuario: String ;
    public txtCodigoEmpresa: Number ;

    constructor (usuario: String, clave: String, numEmpresa: Number){
        this.txtCodigoUsuario = usuario;
        this.txtClaveUsuario = clave;
        this.txtCodigoEmpresa = numEmpresa;
    }

}