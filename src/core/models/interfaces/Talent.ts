export interface Talent {
  idTalento: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  imagen: string;
  photoUrl: string;
  puesto: string;
  pais: string;
  ciudad: string;
  idModalidadFacturacion: number;
  montoInicialPlanilla: number;
  montoFinalPlanilla: number;
  montoInicialRxH: number;
  montoFinalRxH: number;
  moneda: string;
  estrellas: number;
  esFavorito: number;

  // Moneda por modalidad
  idMonedaPlan: number;
  idMonedaRxh: number;
}
