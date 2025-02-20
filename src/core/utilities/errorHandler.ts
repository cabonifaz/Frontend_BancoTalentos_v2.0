import { AxiosResponse } from 'axios';
import { OptionsObject, SnackbarMessage } from 'notistack';

export const handleError = (
    error: Error,
    enqueueSnackbar: (message: SnackbarMessage, options?: OptionsObject) => void
) => {
    enqueueSnackbar(error.message || "Error en la solicitud", { variant: 'error' });
};

export const handleResponse = (
    response: AxiosResponse,
    enqueueSnackbar: (message: SnackbarMessage, options?: OptionsObject) => void
) => {
    const code = response.data.result?.idMensaje ?? response.data.idMensaje;
    const message = response.data.result?.mensaje ?? response.data.mensaje;

    switch (code) {
        case 1: enqueueSnackbar(message, { variant: 'warning' }); break;
        case 2: break;
        case 3: enqueueSnackbar(message, { variant: 'error' }); break;
        default: enqueueSnackbar("Error al consultar API", { variant: 'error' }); break;
    }
};