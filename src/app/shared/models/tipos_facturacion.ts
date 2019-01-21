export class TipoGenerico {
    id?: number;
    codigo?: string;
    descripcion?: string;
    nemonico?: string;
}

export interface CargaDB {
    cargaDB();
}

export class TipoDocumento extends TipoGenerico {
    constructor() {
        super();    
    }
}

export class TipoOperacion extends TipoGenerico {
    constructor() {
        super();
    }
}

export class FormaPago extends TipoGenerico {
    constructor() {
        super();
    }
}

export class Moneda extends TipoGenerico {
    constructor() {
        super();
    }
}

export class TipoIGV extends TipoGenerico {
    constructor() {
        super();
    }
}
