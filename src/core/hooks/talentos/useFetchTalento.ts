import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { axiosInstanceFMI } from '@/core/services/axiosService';
import { TalentoDetailFMI, TalentoResponseFMI } from '@/core/models';

const useFetchTalento = (talentoId: number) => {
    const [talentoDetails, setTalentoDetails] = useState<TalentoDetailFMI | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const fetchTalentos = async () => {
            setLoading(true);
            try {
                const response = await axiosInstanceFMI.get<TalentoResponseFMI>(`/fmi/talent/data?idTalento=${talentoId}`);

                if (response.data.idTipoMensaje === 2) {
                    setTalentoDetails(response.data.talento);
                    return;
                }
                enqueueSnackbar(response.data.mensaje, { variant: 'error' });
            } catch (error) { }
            finally {
                setLoading(false);
            }
        };

        fetchTalentos();
    }, [enqueueSnackbar, talentoId]);

    return { talentoDetails, loading };
};

export default useFetchTalento;
