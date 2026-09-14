import {
  DeepPartialSkipArrayKey,
  FormProvider,
  SubmitHandler,
  useForm,
  useWatch,
} from "react-hook-form";
import { CloseModalButton } from "@/core/components/ui/CloseModalButton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/components/ui/shadcn/tabs";
import {
  newRQSchema,
  newRQSchemaType,
} from "@/core/models/schemas/NewRQSchemaV1";
import { zodResolver } from "@hookform/resolvers/zod";
import { TabData } from "./tabs/TabData";
import { TabClients } from "./tabs/TabClients";
import { Client } from "@/core/models/interfaces/Client";
import { Param, SaveRequirementResponse } from "@/core/models";
import { format } from "date-fns";
import { TabVacancies } from "./tabs/TabVacancies";
import { Loading } from "@/core/components/ui/Loading";
import { useFetchTarifario } from "@/core/hooks/requerimientos/useFetchTarifario";
import {
  DURACION_RQ,
  GRADO_ESTUDIO,
  HABILIDADES_TECNICAS,
  MODALIDAD_RQ,
  TIPO_ARCHIVO,
  TIPO_ARCHIVOS_RQ,
  TIPO_MODALIDAD,
  TIPO_MONEDA,
} from "@/core/utilities/constants";
import { useParams } from "@/core/context/ParamsContext";
import { TabFiles } from "./tabs/TabFiles";
import { TabManagement } from "./tabs/TabManagment";
import { Utils } from "@/core/utilities/utils";
import { usePostHook } from "@/core/hooks/usePostHook";
import { uploadFileToS3 } from "@/core/services/s3.service";
import { enqueueSnackbar } from "notistack";
import { Dialog, DialogContent, DialogTitle } from "@/core/components/ui/shadcn/dialog";
import { Button } from "@/core/components/ui/shadcn/button";
import { RQTabLabel } from "@/core/components/requerimientos/rq-ui";

type CreateValues = DeepPartialSkipArrayKey<newRQSchemaType>;

/** Estado de cada pestaña a partir de lo que lleva escrito el formulario. */
const clientDone = (v: CreateValues) => Number(v.idCliente) > 0;

const dataDone = (v: CreateValues) =>
  !!(
    v.titulo &&
    v.codigoRQ &&
    Number(v.idEstado) > 0 &&
    v.fechaSolicitud &&
    v.fechaVencimiento &&
    v.descripcion
  );

/** Personas que se piden en total (suma de cantidades). */
const vacanciesCount = (v: CreateValues) =>
  (v.lstVacantes ?? []).reduce((sum, x) => sum + Number(x?.cantidad || 0), 0);

const filesCount = (v: CreateValues) => v.lstArchivos?.length ?? 0;

const managementDone = (v: CreateValues) =>
  Number(v.idModalidad) > 0 &&
  Number(v.contrato?.duration) > 0 &&
  Number(v.contrato?.idDuration) > 0 &&
  (!v.tieneDuracion || (Number(v.duracion) > 0 && Number(v.idDuracion) > 0));

interface CreateTabLabelProps {
  label: string;
  hasError: boolean;
  done?: (values: CreateValues) => boolean;
  count?: (values: CreateValues) => number;
}

/**
 * Etiqueta de pestaña que observa el formulario por su cuenta: así solo se
 * vuelve a pintar ella al escribir, no el modal entero.
 */
const CreateTabLabel = ({ label, hasError, done, count }: CreateTabLabelProps) => {
  const values = useWatch<newRQSchemaType>();
  return (
    <RQTabLabel
      label={label}
      hasError={hasError}
      done={done?.(values)}
      count={count?.(values)}
    />
  );
};

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
      // Antes lo inicializaba el registro del checkbox nativo (false) y nunca
      // cambiaba después; con el Checkbox de Radix hace falta darlo aquí.
      autogenRQ: false,
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

      // 2. Transformar los archivos: solo metadata (sin base64). El archivo se
      //    subirá directo a S3 con la URL pre-firmada que devuelve el backend.
      const lstArchivos = (data.lstArchivos || []).map((f) => {
        const { nombreArchivo, extensionArchivo } =
          Utils.getFileNameAndExtension(f.name);
        const idTipoArchivo = Utils.getTipoArchivoId(
          extensionArchivo,
          fileExtensionsParams,
        );
        return {
          nombreArchivo,
          extensionArchivo,
          idTipoArchivo,
          idTipoArchivoRQ: f.idTipoArchivoRQ,
          contentType: f.file.type,
        };
      });

      /** Modalidad fact */
      const modalidadFact = data.idModalidadFact?.join(",");

      // Mapea vacantes a formato esperado
      const lstVacantes = data.lstVacantes.map((vacante) => ({
        tempVacancyId: vacante.tempVacancyId,
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

      // 4. Enviar los datos al servidor. La respuesta trae las URLs PUT
      //    pre-firmadas de los archivos (mismo orden que lstArchivos).
      const response = (await postData(
        "/fmi/requirement/save",
        payload,
      )) as SaveRequirementResponse;

      if (response.idTipoMensaje === 2) {
        // 5. Subir cada archivo (en memoria) a S3 con su URL pre-firmada.
        const urls = response.archivos || [];
        const failed: string[] = [];

        for (let i = 0; i < urls.length; i++) {
          const target = urls[i];
          const localFile = data.lstArchivos?.[i]?.file;
          if (!target?.url || !localFile) continue;

          // Reintento simple (hasta 2 intentos) por archivo.
          let uploaded = false;
          for (let attempt = 0; attempt < 2 && !uploaded; attempt++) {
            try {
              const res = await uploadFileToS3(target.url, localFile);
              uploaded = res.ok;
            } catch {
              uploaded = false;
            }
          }
          if (!uploaded) failed.push(target.fileName);
        }

        // 6. El RQ ya está creado; si algún archivo falló, se notifica aparte.
        if (failed.length > 0) {
          enqueueSnackbar({
            message: `El RQ se creó, pero no se pudieron subir ${failed.length} archivo(s): ${failed.join(
              ", ",
            )}. Puedes reintentar desde el detalle del RQ.`,
            variant: "warning",
          });
        }

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

  const isSubmitting = methods.formState.isSubmitting;

  return (
    <>
      {(loadingTariff || loadingParams || postloading) && (
        <Loading opacity="opacity-10" />
      )}
      {/* Escape cierra como la X (sin confirmar, igual que ella); un clic fuera no. */}
      <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent
          className="flex w-[calc(100%-2rem)] max-w-none md:w-[90%] lg:w-[1200px] h-[calc(100vh-2rem)] max-h-[720px] min-h-0 flex-col gap-0 overflow-hidden p-0"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <header className="flex shrink-0 items-center justify-between gap-4 px-6 pb-4 pt-5">
            <DialogTitle className="text-lg font-bold text-gray-800 dark:text-slate-100">
              Nuevo requerimiento
            </DialogTitle>
            <CloseModalButton onClick={onClose} />
          </header>
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="flex min-h-0 flex-1 flex-col"
            >
              {/* forceMount en cada panel: el formulario está repartido entre
                  pestañas y sin él se perdería lo escrito al cambiar de una a
                  otra. TabsContent oculta las inactivas. */}
              <Tabs
                defaultValue="cliente"
                className="flex min-h-0 flex-1 flex-col"
              >
                <TabsList className="px-4">
                  <TabsTrigger value="cliente">
                    <CreateTabLabel
                      label="Cliente"
                      hasError={clientHasErrors()}
                      done={clientDone}
                    />
                  </TabsTrigger>
                  <TabsTrigger value="datos">
                    <CreateTabLabel
                      label="Datos RQ"
                      hasError={rqHasErrors()}
                      done={dataDone}
                    />
                  </TabsTrigger>
                  <TabsTrigger value="vacantes">
                    <CreateTabLabel
                      label="Vacantes"
                      hasError={vacantesHasErrors()}
                      count={vacanciesCount}
                    />
                  </TabsTrigger>
                  <TabsTrigger value="archivos">
                    <CreateTabLabel
                      label="Archivos"
                      hasError={filesHasErrors()}
                      count={filesCount}
                    />
                  </TabsTrigger>
                  <TabsTrigger value="gestion">
                    <CreateTabLabel
                      label="Gestión"
                      hasError={managementHasErrors()}
                      done={managementDone}
                    />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="cliente" forceMount className="mt-0 min-h-0 flex-1">
                  <TabClients
                    clients={clients}
                    fetchTarifario={fetchTarifario}
                  />
                </TabsContent>
                <TabsContent value="datos" forceMount className="mt-0 min-h-0 flex-1">
                  <TabData rqStates={rqStates} />
                </TabsContent>
                <TabsContent value="vacantes" forceMount className="mt-0 min-h-0 flex-1">
                  <TabVacancies
                    tarifario={tarifario}
                    techSkills={techSkills}
                    availableDegrees={availableDegrees}
                    refetchParams={refetchParams}
                  />
                </TabsContent>
                <TabsContent value="archivos" forceMount className="mt-0 min-h-0 flex-1">
                  <TabFiles
                    fileOptions={fileOptions}
                    filesParms={fileExtensionsParams}
                  />
                </TabsContent>
                <TabsContent value="gestion" forceMount className="mt-0 min-h-0 flex-1">
                  <TabManagement
                    rqDuration={rqDuration}
                    rqModes={rqModes}
                    factModes={factModes}
                    currencyTypes={currencyOptions}
                  />
                </TabsContent>
              </Tabs>
              {/* Pie fijo: el mismo en todas las pestañas. */}
              <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-slate-700">
                <Button variant="outline" onClick={onClose} className="font-medium">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="font-medium"
                >
                  {isSubmitting ? "Guardando…" : "Agregar RQ"}
                </Button>
              </footer>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
};
