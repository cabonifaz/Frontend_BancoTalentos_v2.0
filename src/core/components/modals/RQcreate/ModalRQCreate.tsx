import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { CloseModalButton } from "../../ui/CloseModalButton";
import { Tabs } from "../../ui/Tabs";
import {
  newRQSchema,
  newRQSchemaType,
} from "../../../models/schemas/NewRQSchemaV1";
import { zodResolver } from "@hookform/resolvers/zod";
import { TabData } from "./tabs/TabData";
import { TabClients } from "./tabs/TabClients";
import { Client } from "../../../models/interfaces/Client";
import { Param } from "../../../models";
import { format } from "date-fns";
import { TabVacancies } from "./tabs/TabVacancies";
import { Loading } from "../../ui/Loading";
import { useFetchTarifario } from "../../../hooks/useFetchTarifario";
import {
  DURACION_RQ,
  GRADO_ESTUDIO,
  HABILIDADES_TECNICAS,
  MODALIDAD_RQ,
  TIPO_ARCHIVO,
  TIPO_ARCHIVOS_RQ,
  TIPO_MODALIDAD,
  TIPO_MONEDA,
} from "../../../utilities/constants";
import { useParams } from "../../../context/ParamsContext";
import { TabFiles } from "./tabs/TabFiles";
import { TabManagement } from "./tabs/TabManagment";
import { Utils } from "../../../utilities/utils";
import { usePostHook } from "../../../hooks/usePostHook";
import { enqueueSnackbar } from "notistack";

interface TabLabelProps {
  label: string;
  hasError?: boolean;
}

const TabLabel = ({ label, hasError }: TabLabelProps) => (
  <div className="flex items-center gap-2">
    <span>{label}</span>
    {hasError && (
      <span
        className="inline-block w-2 h-2 bg-red-500 rounded-full"
        title="Hay errores en esta sección"
      />
    )}
  </div>
);

interface ModalProps {
  rqStates: Param[];
  clients: Client[];
  onClose: () => void;
  updateRQData: () => void;
}

export const ModalRQCreate = ({
  rqStates,
  clients,
  onClose,
  updateRQData,
}: ModalProps) => {
  // @marker params
  const {
    paramsByMaestro,
    refetchParams,
    loading: loadingParams,
  } = useParams();

  const skillsByParams = paramsByMaestro[HABILIDADES_TECNICAS] || [];
  const paramsDegrees = paramsByMaestro[GRADO_ESTUDIO] || [];
  const fileTypes = paramsByMaestro[TIPO_ARCHIVOS_RQ] || [];
  const rqDuration = paramsByMaestro[DURACION_RQ] || [];
  const rqModes = paramsByMaestro[MODALIDAD_RQ] || [];
  const factModes = paramsByMaestro[TIPO_MODALIDAD] || [];
  const fileExtensionsParams = paramsByMaestro[TIPO_ARCHIVO] || [];
  const currencyOptions = paramsByMaestro[TIPO_MONEDA] || [];

  // @marker base states
  const techSkills = skillsByParams.map((s) => ({
    id: s.num1,
    label: s.string1,
  }));
  const availableDegrees = paramsDegrees.map((param) => ({
    id: param.num1,
    label: param.string1,
  }));
  const fileOptions = fileTypes.map((type) => ({
    id: type.num1,
    label: type.string1,
  }));

  const {
    tarifario,
    fetchTarifario,
    loading: loadingTariff,
  } = useFetchTarifario();

  const { postData, postloading } = usePostHook();

  const methods = useForm<newRQSchemaType>({
    resolver: zodResolver(newRQSchema),
    defaultValues: {
      idCliente: 0,
      fechaSolicitud: format(new Date(), "yyyy-MM-dd"),
      descripcion: "",
      idEstado: 0,
      lstVacantes: [],
      lstArchivos: [],
      duracion: 1,
      idDuracion: 0,
      idModalidad: 0,
      idModalidadFact: [],
      contrato: {
        duration: 1,
        idDuration: 0,
      },
      tieneDuracion: true,
      lstFacturacion: [],
    },
  });

  const onSubmit: SubmitHandler<newRQSchemaType> = async (data) => {
    try {
      // 1. Transformar el estado a número
      const idCliente = Number(data.idCliente);

      // 2. Transformar los archivos
      const lstArchivos = await Promise.all(
        data.lstArchivos?.map(async (f) => {
          const base64 = await Utils.fileToBase64(f.file);
          const { nombreArchivo, extensionArchivo } =
            Utils.getFileNameAndExtension(f.name);
          const idTipoArchivo = Utils.getTipoArchivoId(
            extensionArchivo,
            fileExtensionsParams,
          );
          return {
            string64: base64,
            nombreArchivo,
            extensionArchivo,
            idTipoArchivo,
            idTipoArchivoRQ: f.idTipoArchivoRQ,
          };
        }) || [],
      );

      /** Modalidad fact */
      const modalidadFact = data.idModalidadFact?.join(",");

      // Mapea vacantes a formato esperado
      const lstVacantes = data.lstVacantes.map((vacante) => ({
        idPerfil: Number(vacante.idPerfil),
        cantidad: Number(vacante.cantidad),
      }));

      const lstVacanteSkills = data.lstVacanteSkills || [];
      const lstCareers = data.lstCarreras || [];

      const client = clients.find((c) => c.idCliente === idCliente);
      const contacts = data.lstContactos?.join(",") || "";

      // Flat de duración de contrato
      const { duration, idDuration } = data.contrato;

      // 3. Crear el objeto final para enviar
      const payload = {
        ...data,
        idCliente: idCliente,
        codigoRQ: data.codigoRQ,
        cliente: client?.razonSocial,
        estado: data.idEstado,
        duracion: Number(data.duracion),
        lstVacantes: lstVacantes,
        lstContactos: contacts,
        lstArchivos,
        idModalidadFact: modalidadFact === "" ? undefined : modalidadFact,
        lstVacanteSkills,
        lstCarreras: lstCareers,
        duracionContrato: duration,
        idDuracionContrato: idDuration,
      };

      /* if (true) {
        console.log("Payload to submit: ", payload);
        return;
      } */

      // 4. Enviar los datos al servidor
      const response = await postData("/fmi/requirement/save", payload);

      if (response.idTipoMensaje === 2) {
        onClose();
        updateRQData();
      }
    } catch (error) {
      console.error("Error al transformar los datos:", error);
      enqueueSnackbar({
        message: "Ha ocurrido un error inesperado",
        variant: "error",
      });
    }
  };

  const managementHasErrors = () => {
    const { errors } = methods.formState;

    // Validamos errores en campos directos y objetos anidados (contrato)
    const hasBaseErrors =
      !!errors.idDuracion ||
      !!errors.tieneDuracion ||
      !!errors.duracion ||
      !!errors.idModalidad ||
      !!errors.idModalidadFact ||
      !!errors.contrato?.duration ||
      !!errors.contrato?.idDuration;

    // Validamos errores en el arreglo lstFacturacion
    const hasFacturacionErrors = !!errors.lstFacturacion;

    return hasBaseErrors || hasFacturacionErrors;
  };

  const vacantesHasErrors = () => {
    const errors = methods.formState.errors;

    return (
      (!!methods.getValues("idCliente") &&
        methods.getValues("lstVacantes").length === 0) ||
      !!errors.lstCarreras ||
      !!errors.lstVacanteSkills ||
      !!errors.lstVacantes
    );
  };

  const rqHasErrors = () => {
    const { errors } = methods.formState;

    return !!(
      errors.codigoRQ ||
      errors.descripcion ||
      errors.idEstado ||
      errors.titulo ||
      errors.fechaSolicitud ||
      errors.fechaVencimiento
    );
  };

  const filesHasErrors = () => {
    const { errors } = methods.formState;
    return !!errors.lstArchivos;
  };

  const clientHasErrors = () => {
    const { errors } = methods.formState;
    return !!(errors.idCliente || errors.lstContactos);
  };

  return (
    <>
      {(loadingTariff || loadingParams || postloading) && (
        <Loading opacity="opacity-10" />
      )}
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[60] p-4">
        <div className="bg-white rounded-lg shadow-lg p-4 w-full md:w-[90%] lg:w-[1200px] h-[calc(100vh-2rem)] max-h-[720px] min-h-0 overflow-hidden relative flex flex-col">
          <header className="flex shrink-0 items-center justify-between">
            <h2 className="text-lg font-bold mb-2">Agregar Nuevo RQ</h2>
            <CloseModalButton onClick={onClose} />
          </header>
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <Tabs
                isDataLoading={false}
                tabs={[
                  {
                    label: (
                      <TabLabel label="Cliente" hasError={clientHasErrors()} />
                    ),
                    children: (
                      <TabClients
                        clients={clients}
                        fetchTarifario={fetchTarifario}
                      />
                    ),
                  },
                  {
                    label: (
                      <TabLabel label="Datos RQ" hasError={rqHasErrors()} />
                    ),
                    children: <TabData rqStates={rqStates} />,
                  },

                  {
                    label: (
                      <TabLabel
                        label="Vacantes"
                        hasError={vacantesHasErrors()}
                      />
                    ),
                    children: (
                      <TabVacancies
                        tarifario={tarifario}
                        techSkills={techSkills}
                        availableDegrees={availableDegrees}
                        refetchParams={refetchParams}
                      />
                    ),
                  },
                  {
                    label: (
                      <TabLabel label="Archivos" hasError={filesHasErrors()} />
                    ),
                    children: (
                      <TabFiles
                        fileOptions={fileOptions}
                        filesParms={fileExtensionsParams}
                      />
                    ),
                  },
                  {
                    label: (
                      <TabLabel
                        label="Gestión"
                        hasError={managementHasErrors()}
                      />
                    ),
                    children: (
                      <TabManagement
                        rqDuration={rqDuration}
                        rqModes={rqModes}
                        factModes={factModes}
                        currencyTypes={currencyOptions}
                      />
                    ),
                  },
                ]}
              />
              {/* Botones de acción */}
              <div className="flex shrink-0 justify-end space-x-4 mt-4 me-1">
                <button type="submit" className="btn btn-primary">
                  Agregar RQ
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </>
  );
};
