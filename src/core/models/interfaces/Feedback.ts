export interface Feedback {
    idFeedback: number;
    editable: number;
    usuario: string;
    descripcion: string;
    estrellas: number;
}

export interface AddOrUpdateFeedbackParams extends Omit<Feedback, 'editable' | 'idFeedback' | 'usuario'> {
    idFeedback?: number;
    idTalento: number;
}