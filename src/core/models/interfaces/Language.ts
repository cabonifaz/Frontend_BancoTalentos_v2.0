export interface Language {
    idTalentoIdioma: number;
    idIdioma: number;
    nombreIdioma: string;
    idNivel: number;
    nivelIdioma: string;
    estrellas: number;
}

export type AddLanguage = Omit<Language, 'idTalentoIdioma' | 'nombreIdioma' | 'nivelIdioma'>;

export interface AddOrUpdateLanguageParams extends Omit<Language, 'idTalentoIdioma' | 'nombreIdioma' | 'nivelIdioma'> {
    idTalentoIdioma?: number;
    idTalento: number;
}