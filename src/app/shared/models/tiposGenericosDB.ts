export class TiposGenericosDB {

public tiposDocumentoDB = [
    { id: 1, codigo: '001' , descripcion: 'Boleta' , nemonico: '1 - Boleta' },
    { id: 2, codigo: '002' , descripcion: 'Factura' , nemonico: '2 - Factura' },
    { id: 3, codigo: '003' , descripcion: 'Nota Crédito' , nemonico: '3 - Nota Crédito' },
    { id: 4, codigo: '004' , descripcion: 'Nota Débito' , nemonico: '4 - Nota Débito' },
];

public tiposOperacionDB = [
    { id: 1, codigo: '001' , descripcion: 'Venta Interna' , nemonico: '1 - Venta Interna' },
    { id: 2, codigo: '002' , descripcion: 'Exportación' , nemonico: '2 - Exportación' },
    { id: 3, codigo: '003' , descripcion: 'Venta Interna - Anticipos' , nemonico: '3 - Venta Interna - Anticipos' },
    { id: 4, codigo: '004' , descripcion: 'Venta Itinerante' , nemonico: '4 - Venta Itinerante' },
];

public formasPagoDB = [
    { id: 1, codigo: '001' , descripcion: 'Contado' , nemonico: '1 - Contado' },
    { id: 2, codigo: '002' , descripcion: 'Pago a 30 dias' , nemonico: '2 - Pago a 30 dias' },
    { id: 3, codigo: '003' , descripcion: 'Pago a 60 dias' , nemonico: '3 - Pago a 60 dias' },
    { id: 4, codigo: '004' , descripcion: 'Pago a 90 dias' , nemonico: '4 - Pago a 90 dias' },
];

public monedaDB = [
    { id: 1, codigo: '001' , descripcion: 'Soles' , nemonico: 'S/' },
    { id: 2, codigo: '002' , descripcion: 'Dólares' , nemonico: '$' },
];

public tiposIgvDB = [
    { id: 1, codigo: '001' , descripcion: 'Gravado' , nemonico: '1 - Gravado' },
    { id: 2, codigo: '002' , descripcion: 'Exonerado' , nemonico: '2 - Exonerado' },
    { id: 3, codigo: '003' , descripcion: 'Inafecto' , nemonico: '3 - Inafecto' },
];
} 
