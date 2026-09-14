import { FormProvider, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { CloseModalButton } from "@/core/components/ui/CloseModalButton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/components/ui/shadcn/tabs";
import { LoadingOverlay } from "@/core/components/ui/LoadingOverlay";
import {
  UpdateBaseRQSchema,
  UpdateBaseRQSchemaType,
} from "@/core/models/schemas/UpdateBaseRQSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Param, RequirementResponse } from "@/core/models";
import { TabRQData } from "./tabs/TabRQData";
import { useFetchRequirement } from "@/core/hooks/requerimientos/useFetchRequirement";
import { formatISODate } from "@/core/utilities/date.utils";
import { Client } from "@/core/models/interfaces/Client";
import { TabClient } from "./tabs/TabClient";
import { useFetchTarifario } from "@/core/hooks/requerimientos/useFetchTarifario";
import { TabVacancies } from "./tabs/TabVacancies";
import { Utils } from "@/core/utilities/utils";
import {
  DURACION_RQ,
  MODALIDAD_RQ,
  TIPO_MODALIDAD,
  HABILIDADES_TECNICAS,
  GRADO_ESTUDIO,
  TIPO_ARCHIVOS_RQ,
  TIPO_ARCHIVO,
  TIPO_MONEDA,
} from "@/core/utilities/constants";
import { useParams } from "@/core/context/ParamsContext";
import { TabFiles } from "./tabs/TabFiles";
import { TabPostulant } from "./tabs/TabPostulant";
import { TabManagment } from "./tabs/TabManagement";
import { Loading } from "@/core/components/ui/Loading";
import { usePostHook } from "@/core/hooks/usePostHook";
import { enqueueSnackbar } from "notistack";
import { Dialog, DialogContent, DialogTitle } from "@/core/components/ui/shadcn/dialog";
import { Button } from "@/core/components/ui/shadcn/button";
import { EstadoBadge } from "@/core/components/requerimientos/EstadoBadge";
import { RQTabLabel, displayDate } from "@/core/components/requerimientos/rq-ui";

/** Pestañas en orden: `initialTab` es el índice de la que se abre. */
const DETAIL_TABS = [
  "cliente",
  "datos",
  "vacantes",
  "archivos",
  "postulantes",
  "gestion",
] as const;

interface ModalProps {
  rqId: number;
  rqStates: Param[];
  clients: Client[];
  onClose: () => void;
  handleAssingPost: (rqId: number) => void;
  updateRQData: () => void;
  initialTab?: number;
}

export const ModalRQDetails = ({
  rqId,
  rqStates,
  clients,
  onClose,
  handleAssingPost,
  updateRQData,
  initialTab = 0,
}: ModalProps) => {
  // @marker params
  const { paramsByMaestro, refetchParams } = useParams();

  // @marker base state
  const [initialFiles, setInitialFiles] = useState<any[]>([]);
  const { postData, postloading } = usePostHook();
  const [isEditing, setIsEditing] = useState(false);

  // @marker params
  const fileTypes = paramsByMaestro[TIPO_ARCHIVOS_RQ] || [];
  const rqDurationOptions = paramsByMaestro[DURACION_RQ] || [];
  const paymentModes = paramsByMaestro[TIPO_MODALIDAD] || [];
  const rqMode = paramsByMaestro[MODALIDAD_RQ] || [];
  const fileExtensionsParams = paramsByMaestro[TIPO_ARCHIVO] || [];
  const currencyOptions = paramsByMaestro[TIPO_MONEDA] || [];

  const techSkillsParams = paramsByMaestro[HABILIDADES_TECNICAS] || [];
  const paramsDegrees = paramsByMaestro[GRADO_ESTUDIO] || [];

  const availableTechSkills = techSkillsParams.map((skill) => ({
    id: skill.num1,
    label: skill.string1,
  }));
  const availableDegrees = paramsDegrees.map((param) => ({
    id: param.num1,
    label: param.string1,
  }));

  // @marker form hadlers
  const methods = useForm<UpdateBaseRQSchemaType>({
    resolver: zodResolver(UpdateBaseRQSchema),
    defaultValues: {
      codigoRQ: "",
      titulo: "",
      descripcion: "",
      fechaSolicitud: "",
      fechaVencimiento: "",
      idEstadoRQ: 0,
      idCliente: 0,
      tieneDuracion: false,
      duracion: 0,
      idDuracion: 0,
      idModalidadFact: [],
      lstVacantes: [],
      lstArchivos: [],
      contrato: undefined,
      lstFacturacion: [],
    },
  });

  const { reset } = methods;

  // @marker requirement
  const {
    requirement: res,
    loading: reqLoading,
    fetchRequirement,
  } = useFetchRequirement(rqId);

  // @marker tarifario
  const {
    tarifario,
    fetchTarifario,
    loading: loadTariff,
  } = useFetchTarifario();

  const mapFacturacion = (res: RequirementResponse) => {
    const req = res.requerimiento;

    const mapped =
      req.lstRqFacturacion?.map((f) => ({
        idModalidad: f.idModalidad ?? 0,
        idGrupoModalidad: f.idGrupoModalidad ?? 0,

        currencyType: f.currencyType,

        minBaseAmount: f.minBaseAmount,
        maxBaseAmount: f.maxBaseAmount,

        minTravelAllowance: f.minTravelAllowance,
        maxTravelAllowance: f.maxTravelAllowance,

        minMonthlyAmount: f.minMonthlyAmount,
        // Antes copiaba el mínimo: el máximo mensual se perdía al guardar.
        maxMonthlyAmount: f.maxMonthlyAmount,

        minQuarterlyAmount: f.minQuarterlyAmount,
        maxQuarterlyAmount: f.maxQuarterlyAmount,

        minSemiAnnualAmount: f.minSemiAnnualAmount,
        maxSemiAnnualAmount: f.maxSemiAnnualAmount,

        idEstadoRegistro: Number(f.idEstadoRegistro ?? 1),
      })) ?? [];

    return mapped;
  };

  // Sync RQ form
  useEffect(() => {
    if (res?.requerimiento) {
      const req = res.requerimiento;

      // Get Tarifario
      const clientId = req?.idCliente;
      if (clientId && clientId > 0) {
        fetchTarifario(clientId);
      }

      // map vacancies
      const mappedVacancies = req.lstRqVacantes.map((v) => {
        const tariffFound = tarifario.find(
          (item) => item.idPerfil === v.idPerfil,
        );

        const tarifa = tariffFound ? tariffFound.tarifa.toFixed(2) : "-";

        const moneda = tariffFound?.moneda || "S/.";

        return {
          idRequerimientoVacante: v.idRequerimientoVacante,
          idPerfil: v.idPerfil,
          cantidad: Number(v.cantidad),
          idEstado: 0,
          tarifa:
            tarifa === "-"
              ? "S/. -"
              : `${moneda} ${Utils.formatCoin(Number(tarifa))}`,
        };
      });

      const mappedFiles = req.lstRqArchivo.map((file) => ({
        idRequerimientoArchivo: file.idRequerimientoArchivo,
        name: file.nombreArchivo,
        size: 0,
        file: new File([], file.nombreArchivo),
        idTipoArchivoRq: file.idTipoArchivoRq,
      }));

      setInitialFiles(mappedFiles);

      // Decode Fact modes
      const factModes = (req?.modalidadFact ?? "")
        .split(",")
        .map((m: string) => Number(m.trim()))
        .filter((m: any) => !isNaN(m));

      // Duracion de contrato, si no tiene duracion de contrato (valores en 0)
      const idDuracionContrato =
        req.idDuracionContrato === null ? undefined : req.idDuracionContrato;
      const duracionContrato =
        req.duracionContrato === null ? undefined : req.duracionContrato;

      // Determinar si tiene duración basado en los valores de duracion e idDuracion
      const hasDuration = !!(
        req.duracion &&
        req.duracion > 0 &&
        req.idDuracion &&
        req.idDuracion > 0
      );

      reset({
        codigoRQ: req.codigoRQ ?? "",
        titulo: req.titulo ?? "",
        descripcion: req.descripcion ?? "",
        tieneDuracion: hasDuration,
        fechaSolicitud: req.fechaSolicitud
          ? formatISODate(req.fechaSolicitud)
          : "",
        fechaVencimiento: req.fechaVencimiento
          ? formatISODate(req.fechaVencimiento)
          : "",
        idEstadoRQ: req.idEstado ?? 0,
        idCliente: req.idCliente ?? 0,
        // Duración condicional
        duracion: hasDuration ? req.duracion : 1,
        idDuracion: hasDuration ? req.idDuracion : 0,
        lstVacantes: mappedVacancies,
        lstArchivos: mappedFiles,
        idModalidad: req.idModalidad,
        idModalidadFact: factModes,
        contrato: {
          idDuration: idDuracionContrato,
          duration: duracionContrato,
        },
        lstFacturacion: mapFacturacion(res),
      });
    }
  }, [res, reset]);

  useEffect(() => {
    const req = res?.requerimiento;
    const clientId = req?.idCliente;
    if (clientId && clientId > 0) {
      fetchTarifario(clientId);
    }
  }, [res]);

  /**
   * Entra y sale del modo edición. Siempre repone los datos guardados, así que
   * "Cancelar" deshace lo que se haya cambiado.
   */
  const handleToggleEdit = () => {
    const req = res?.requerimiento;

    if (!req) return;

    // map vacancies
    const mappedVacancies = req.lstRqVacantes.map((v) => {
      const tariffFound = tarifario.find(
        (item) => item.idPerfil === v.idPerfil,
      );

      const tarifa = tariffFound ? tariffFound.tarifa.toFixed(2) : "-";

      const moneda = tariffFound?.moneda || "S/.";

      return {
        idRequerimientoVacante: v.idRequerimientoVacante,
        idPerfil: v.idPerfil,
        cantidad: Number(v.cantidad),
        idEstado: 0,
        tarifa:
          tarifa === "-"
            ? "S/. -"
            : `${moneda} ${Utils.formatCoin(Number(tarifa))}`,
      };
    });

    const mappedFiles = req.lstRqArchivo.map((file) => ({
      idRequerimientoArchivo: file.idRequerimientoArchivo,
      name: file.nombreArchivo,
      size: 0,
      file: new File([], file.nombreArchivo),
      idTipoArchivoRq: file.idTipoArchivoRq,
    }));

    setInitialFiles(mappedFiles);

    // Decode Fact modes
    const factModes = (req?.modalidadFact ?? "")
      .split(",")
      .map((m: string) => Number(m.trim()))
      .filter((m: any) => !isNaN(m));

    // Duracion de contrato, si no tiene duracion de contrato (valores en 0)
    const idDuracionContrato =
      req.idDuracionContrato === null ? undefined : req.idDuracionContrato;
    const duracionContrato =
      req.duracionContrato === null ? undefined : req.duracionContrato;

    // Determinar si tiene duración basado en los valores de duracion e idDuracion
    const hasDuration = !!(
      req.duracion &&
      req.duracion > 0 &&
      req.idDuracion &&
      req.idDuracion > 0
    );

    reset({
      codigoRQ: req.codigoRQ ?? "",
      titulo: req.titulo ?? "",
      descripcion: req.descripcion ?? "",
      tieneDuracion: hasDuration,
      fechaSolicitud: req.fechaSolicitud
        ? formatISODate(req.fechaSolicitud)
        : "",
      fechaVencimiento: req.fechaVencimiento
        ? formatISODate(req.fechaVencimiento)
        : "",
      idEstadoRQ: req.idEstado ?? 0,
      idCliente: req.idCliente ?? 0,
      idDuracion: hasDuration ? req.idDuracion : 1,
      duracion: hasDuration ? req.duracion : 1,
      lstVacantes: mappedVacancies,
      lstArchivos: mappedFiles,
      idModalidad: req.idModalidad,
      idModalidadFact: factModes,
      contrato: {
        idDuration: idDuracionContrato,
        duration: duracionContrato,
      },
      lstFacturacion: mapFacturacion(res),
    });
    setIsEditing(!isEditing);
  };

  const totalVacs =
    res?.requerimiento.lstRqVacantes.reduce(
      (sum, vacante) => sum + Number(vacante.cantidad || 0),
      0,
    ) ?? 0;

  const onSubmit = async (data: UpdateBaseRQSchemaType) => {
    try {
      const idCliente = Number(data.idCliente);
      const { lstArchivos, lstVacantes, autogenRQ, ...cleanData } = data;

      const vacanciesToSent = data.lstVacantes
        .filter((v) => v.idEstado !== 0)
        .map((vacante) => ({
          idRequerimientoVacante: vacante.idRequerimientoVacante,
          idPerfil: vacante.idPerfil,
          cantidad: vacante.cantidad,
          idEstado: vacante.idEstado,
          tarifaFinal: null, // Para que base de datos no se actualice la tarifa
        }));

      // Flat detalles de duracion de contrato
      const idDuracionContrato = data.contrato?.idDuration;
      const duracionContrato = data.contrato?.duration;

      const { tieneDuracion } = data;

      const payload = {
        ...cleanData,
        idRequerimiento: rqId,
        idCliente: idCliente,
        cliente: res?.requerimiento.cliente,
        estado: data.idEstadoRQ,
        duracion: tieneDuracion ? Number(data.duracion) : undefined,
        idDuracion: tieneDuracion ? Number(data.idDuracion) : undefined,
        lstVacantes: vacanciesToSent,
        idModalidadFact: data.idModalidadFact?.join(","),
        idDuracionContrato: idDuracionContrato,
        duracionContrato: duracionContrato,
        lstFacturacion: data.lstFacturacion,
      };

      const response = await postData("/fmi/requirement/update", payload);

      if (response.idTipoMensaje === 2) {
        fetchRequirement();
        updateRQData();
        setIsEditing(false);
      }
    } catch (error) {
      enqueueSnackbar({
        message: "Ocurrió un error al guardar los nuevos datos",
        variant: "error",
      });
    }
  };

  useEffect(() => {
    console.log("Errors: ", methods.formState.errors);
  }, [methods.formState.errors]);

  // Errores por pestaña: solo pueden aparecer al guardar en modo edición.
  const { errors, isSubmitting } = methods.formState;
  const rqHasErrors = !!(
    errors.codigoRQ ||
    errors.descripcion ||
    errors.idEstadoRQ ||
    errors.titulo ||
    errors.fechaSolicitud ||
    errors.fechaVencimiento
  );
  const vacanciesHaveErrors = !!errors.lstVacantes;
  const managementHasErrors = !!(
    errors.idDuracion ||
    errors.tieneDuracion ||
    errors.duracion ||
    errors.idModalidad ||
    errors.idModalidadFact ||
    errors.contrato ||
    errors.lstFacturacion
  );

  // Cabecera: datos guardados del RQ (no los que se están editando).
  const req = res?.requerimiento;
  const estadoLabel = rqStates.find((s) => s.num1 === req?.idEstado)?.string1;
  const title = req
    ? [req.codigoRQ, req.titulo].filter(Boolean).join(" · ")
    : "Detalle del RQ";
  const meta = req
    ? [
        req.cliente,
        req.fechaSolicitud &&
          `Solicitado el ${displayDate(formatISODate(req.fechaSolicitud))}`,
        req.fechaVencimiento &&
          `Vence el ${displayDate(formatISODate(req.fechaVencimiento))}`,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <>
      {(reqLoading || postloading || loadTariff) && (
        <Loading opacity="opacity-20" />
      )}
      {/* Escape cierra como la X (sin confirmar, igual que ella); un clic fuera no. */}
      <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent
          className="flex w-[calc(100%-2rem)] max-w-none md:w-[95%] lg:w-[1300px] h-[calc(100vh-2rem)] max-h-[720px] min-h-0 flex-col gap-0 overflow-hidden p-0"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <header className="flex shrink-0 items-start justify-between gap-4 px-6 pb-4 pt-5">
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <DialogTitle className="text-lg font-bold text-gray-800 dark:text-slate-100">
                  {title}
                </DialogTitle>
                {req && estadoLabel && (
                  <EstadoBadge idEstado={req.idEstado ?? 0} estado={estadoLabel} />
                )}
              </div>
              {meta && (
                <p className="text-sm text-gray-500 dark:text-slate-400">{meta}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {/* Un solo "Editar" para Datos RQ, Vacantes y Gestión (antes, un
                  lápiz en cada pestaña que activaba la edición de todas). */}
              {isEditing ? (
                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-[var(--color-blue)] dark:bg-sky-400/15 dark:text-sky-300">
                  Editando
                </span>
              ) : (
                <Button
                  variant="outline-blue"
                  onClick={handleToggleEdit}
                  disabled={!req}
                  className="font-medium"
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                  Editar
                </Button>
              )}
              <CloseModalButton onClick={onClose} />
            </div>
          </header>

          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="flex min-h-0 flex-1 flex-col"
            >
              {reqLoading && <LoadingOverlay />}
              {/* forceMount en cada panel: Datos RQ, Vacantes y Gestión son un
                  solo formulario y sin él se perdería lo editado al cambiar de
                  pestaña. TabsContent oculta las inactivas. */}
              <Tabs
                defaultValue={DETAIL_TABS[initialTab] ?? DETAIL_TABS[0]}
                className="flex min-h-0 flex-1 flex-col"
              >
                <TabsList className="px-4">
                  <TabsTrigger value="cliente">
                    <RQTabLabel label="Cliente" />
                  </TabsTrigger>
                  <TabsTrigger value="datos">
                    <RQTabLabel
                      label="Datos RQ"
                      hasError={isEditing && rqHasErrors}
                    />
                  </TabsTrigger>
                  <TabsTrigger value="vacantes">
                    <RQTabLabel
                      label="Vacantes"
                      count={totalVacs}
                      hasError={isEditing && vacanciesHaveErrors}
                    />
                  </TabsTrigger>
                  <TabsTrigger value="archivos">
                    <RQTabLabel
                      label="Archivos"
                      count={req?.lstRqArchivo?.length}
                    />
                  </TabsTrigger>
                  <TabsTrigger value="postulantes">
                    <RQTabLabel
                      label="Postulantes"
                      count={req?.lstRqTalento?.length}
                    />
                  </TabsTrigger>
                  <TabsTrigger value="gestion">
                    <RQTabLabel
                      label="Gestión"
                      hasError={isEditing && managementHasErrors}
                    />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="cliente" forceMount className="mt-0 min-h-0 flex-1">
                  <TabClient
                    rqId={rqId}
                    clients={clients}
                    contacts={res?.requerimiento.lstRqContactos || []}
                    fetchRequirement={fetchRequirement}
                  />
                </TabsContent>
                <TabsContent value="datos" forceMount className="mt-0 min-h-0 flex-1">
                  <TabRQData rqStates={rqStates} isEditing={isEditing} />
                </TabsContent>
                <TabsContent value="vacantes" forceMount className="mt-0 min-h-0 flex-1">
                  <TabVacancies
                    tariff={tarifario}
                    isEditing={isEditing}
                    availableDegrees={availableDegrees}
                    availableTechSkills={availableTechSkills}
                    refetchParams={refetchParams}
                    vacancies={res?.requerimiento.lstRqVacantes || []}
                    fetchRequirement={fetchRequirement}
                  />
                </TabsContent>
                <TabsContent value="archivos" forceMount className="mt-0 min-h-0 flex-1">
                  <TabFiles
                    rqId={rqId}
                    fileOptions={fileTypes}
                    initialFiles={initialFiles}
                    fetchRequirement={fetchRequirement}
                    extensionsParams={fileExtensionsParams}
                  />
                </TabsContent>
                <TabsContent value="postulantes" forceMount className="mt-0 min-h-0 flex-1">
                  <TabPostulant
                    rqId={rqId}
                    idCliente={res?.requerimiento.idCliente || 0}
                    rqState={res?.requerimiento.idEstado || 0}
                    handleAssign={handleAssingPost}
                    talents={res?.requerimiento.lstRqTalento || []}
                  />
                </TabsContent>
                <TabsContent value="gestion" forceMount className="mt-0 min-h-0 flex-1">
                  <TabManagment
                    isEditing={isEditing}
                    rqDurationOptions={rqDurationOptions}
                    paymentModes={paymentModes}
                    rqMode={rqMode}
                    currencyOptions={currencyOptions}
                  />
                </TabsContent>
              </Tabs>

              {/* Pie solo en modo edición: guarda Datos RQ, Vacantes y Gestión. */}
              {isEditing && (
                <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-slate-700">
                  <Button
                    variant="outline"
                    onClick={handleToggleEdit}
                    disabled={isSubmitting}
                    className="font-medium"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="font-medium"
                  >
                    {isSubmitting ? "Guardando…" : "Guardar cambios"}
                  </Button>
                </footer>
              )}
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
};
