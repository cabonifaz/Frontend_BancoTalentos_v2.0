import { useEffect, useMemo, useState } from "react";
import { Param } from "../../models/interfaces/Param";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePostHook } from "../../hooks/usePostHook";
import { Tabs } from "../ui/Tabs";
import { RequirementItem } from "../../models/interfaces/RequirementItem";
import { useFetchRequirement } from "../../hooks/useFetchRequirement";
import { format, parseISO } from "date-fns";
import { Client } from "../../models/interfaces/Client";
import { useDeleteHook } from "../../hooks/useDeleteHook";
import {
  addFilesSchema,
  AddFilesSchemaType,
} from "../../models/schemas/AddFileSchema";
import { Utils } from "../../utilities/utils";
import { Loading } from "../ui/Loading";
import {
  UpdateBaseRQSchema,
  UpdateBaseRQSchemaType,
} from "../../models/schemas/UpdateBaseRQSchema";
import { ReqContacto } from "../../models/interfaces/ReqContacto";
import { ModalRQContact } from "./ModalRQContact";
import { DropdownForm } from "../forms";
import { NumberInput } from "../../components/ui/InputNumber";
import { useParams } from "../../context/ParamsContext";
import {
  DURACION_RQ,
  ESTADO_ATENDIDO,
  GRADO_ESTUDIO,
  HABILIDADES_TECNICAS,
  MODALIDAD_RQ,
  TIPO_ARCHIVOS_RQ,
  TIPO_MODALIDAD,
} from "../../utilities/constants";
import { enqueueSnackbar } from "notistack";
import { useFetchTarifario } from "../../hooks/useFetchTarifario";
import { useApi } from "../../hooks/useApi";
import { FileResponse } from "../../models";
import {
  handleError,
  handleResponse,
} from "../../utilities/errorHandler";
import { getCvFile } from "../../services/apiService";
import {
  MODAL_DETAILS_VAC_SKILLS,
  MODAL_DETALLES_RQ,
  MODAL_UPDATE_CAREER,
} from "../../utilities/modalsIds";
import { useModal } from "../../context/ModalContext";
import { NumberInputFMIBase } from "../ui/NumberInputFMIBase";
import { useDownloadRqFile } from "../../hooks/useDownloadRqFile";
import { ModalDetailsVacSkills } from "./ModalDetailVacSkills";
import { ModalDetailsVacCarreras } from "./ModalUpdateCareer";

interface Archivo {
  idRequerimientoArchivo: number;
  name: string;
  size: number;
  file: File;
  link?: string;
  idTipoArchivoRq?: number;
}

interface Props {
  onClose: () => void;
  updateRQData: () => void;
  handleAsignar: (idRequerimiento: number) => void;
  RQ: RequirementItem | null;
  estadoOptions: Param[];
  clientes: Client[];
}

export const ModalDetallesRQV2 = ({
  onClose,
  updateRQData,
  estadoOptions,
  RQ,
  clientes,
  handleAsignar,
}: Props) => {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [isEditingRQData, setIsEditingRQData] = useState(false);
  const [isEditingGestionData, setIsEditingGestionData] =
    useState(false);
  const [isEditingVacantesData, setIsEditingVacantesData] =
    useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");

  const { postData, postloading } = usePostHook();
  const {
    requirement,
    loading: reqLoading,
    fetchRequirement,
  } = useFetchRequirement(RQ?.idRequerimiento || null);
  const { deleteData, deleteLoading } = useDeleteHook();

  const [isModalRQContactOPen, setIsModalRQContactOPen] =
    useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [contactToEdit, setContactToEdit] =
    useState<ReqContacto | null>(null);

  const [cantidadesVacantes, setCantidadesVacantes] = useState<
    string[]
  >([]);
  const [originalVacantes, setOriginalVacantes] = useState<
    Array<any>
  >([]);
  const [originalCantidades, setOriginalCantidades] = useState<
    string[]
  >([]);
  const [restoreKey, setRestoreKey] = useState(0);
  const [idClienteForTarifario, setIdClienteForTarifario] = useState<
    number | null
  >(null);

  const { paramsByMaestro, refetchParams } = useParams(
    `${DURACION_RQ}, ${MODALIDAD_RQ}, ${TIPO_MODALIDAD}, ${HABILIDADES_TECNICAS},${GRADO_ESTUDIO}, 
    ${TIPO_ARCHIVOS_RQ}`
  );
  const {
    tarifario,
    fetchTarifario,
    loading: loadingTarifario,
  } = useFetchTarifario();

  // @marker params
  const duracionRQ = paramsByMaestro[DURACION_RQ] || [];
  const modalidadRQ = paramsByMaestro[MODALIDAD_RQ] || [];
  const modalidadesFact = paramsByMaestro[TIPO_MODALIDAD] || [];
  const techSkillsParams =
    paramsByMaestro[HABILIDADES_TECNICAS] || [];
  const paramsDegrees = paramsByMaestro[GRADO_ESTUDIO] || [];
  const fileTypes = paramsByMaestro[TIPO_ARCHIVOS_RQ] || [];
  const fileOptions = fileTypes.map((type) => ({
    id: type.num1,
    label: type.string1,
  }));

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    clearErrors,
    control,
    setError,
    watch,
    formState: { errors },
  } = useForm<UpdateBaseRQSchemaType>({
    resolver: zodResolver(UpdateBaseRQSchema),
    defaultValues: {
      idCliente: 0,
      fechaSolicitud: "",
      descripcion: "",
      idEstadoRQ: 0,
      lstVacantes: [],
      lstArchivos: [],
      duracion: 1,
      idModalidadFact: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "lstVacantes",
  });

  const currentVacantes = watch("lstVacantes");

  // Agregar watchers para las fechas
  const fechaSolicitud = watch("fechaSolicitud");
  const fechaVencimiento = watch("fechaVencimiento");

  // Efecto para validar cuando cambian las fechas
  useEffect(() => {
    if (fechaSolicitud && fechaVencimiento) {
      const fechaSolicitudDate = new Date(fechaSolicitud);
      const fechaVencimientoDate = new Date(fechaVencimiento);

      if (fechaVencimientoDate < fechaSolicitudDate) {
        requestAnimationFrame(() => {
          setError("fechaVencimiento", {
            type: "manual",
            message:
              "La fecha de vencimiento no puede ser menor a la fecha de solicitud",
          });
        });
      } else {
        requestAnimationFrame(() => {
          clearErrors("fechaVencimiento");
        });
      }
    }
  }, [fechaSolicitud, fechaVencimiento, setError, clearErrors]);

  const restoreVacantesList = () => {
    setValue("lstVacantes", [...originalVacantes]);
    setCantidadesVacantes([...originalCantidades]);
    setRestoreKey((prev) => prev + 1);
  };

  const getAvailableProfiles = (currentIndex: number) => {
    if (!tarifario || tarifario.length === 0) return [];

    const selectedProfiles = currentVacantes
      .filter((_, index) => index !== currentIndex)
      .map((v) => v.idPerfil)
      .filter((id) => id !== 0);

    return tarifario.filter(
      (perfil) => !selectedProfiles.includes(perfil.idPerfil)
    );
  };

  const { closeModal, isModalOpen, openModal } = useModal();

  const handleProfileChange = (index: number, value: string) => {
    const currentValue = getValues(`lstVacantes.${index}`);
    if (
      currentValue.idRequerimientoVacante > 0 &&
      currentValue.idEstado === 0
    ) {
      setValue(`lstVacantes.${index}.idEstado`, 2);
    }

    const idPerfil = Number(value);

    setValue(`lstVacantes.${index}.idPerfil`, idPerfil);

    // Verificar si hay tarifario disponible
    if (tarifario && tarifario.length > 0) {
      const tarifa =
        tarifario
          .find((item) => item.idPerfil === idPerfil)
          ?.tarifa.toFixed(2) || "-";

      const moneda =
        tarifario.find((item) => item.idPerfil === idPerfil)
          ?.moneda || "S/.";

      setValue(
        `lstVacantes.${index}.tarifa`,
        `${moneda} ${Utils.formatCoin(Number(tarifa))}`
      );
    } else {
      setValue(`lstVacantes.${index}.tarifa`, "S/. -");
    }

    clearErrors(`lstVacantes.${index}.idPerfil`);
  };

  const handleAddVacante = () => {
    append({
      idPerfil: 0,
      cantidad: 1,
      idEstado: 1,
      idRequerimientoVacante: 0,
    });
    setCantidadesVacantes((prev) => [...prev, "1"]);
    clearErrors("lstVacantes");
  };

  const handleRemoveVacante = (index: number) => {
    const vacantes = getValues("lstVacantes").filter(
      (vacante) => vacante.idEstado !== 3
    );

    if (vacantes.length === 1) {
      enqueueSnackbar(
        "El Requerimiento debe tener al menos un vacante.",
        {
          variant: "warning",
        }
      );
      return;
    }

    const vacante = getValues(`lstVacantes.${index}`);

    if (vacante.idRequerimientoVacante > 0) {
      update(index, {
        ...vacante,
        idEstado: 3,
        idPerfil: 0,
        cantidad: 0,
      });

      setCantidadesVacantes((prev) => {
        const newCantidades = [...prev];
        newCantidades[index] = "0";
        return newCantidades;
      });
    } else {
      remove(index);
      setCantidadesVacantes((prev) =>
        prev.filter((_, i) => i !== index)
      );
    }
  };

  const hasVacantesErrors = (errors: any) => {
    if (errors.lstVacantes?.message) return true;
    if (totalVacantes <= 0 && errors.idCliente?.message !== undefined)
      return true;
    if (currentVacantes.length <= 0) return true;

    if (errors.lstVacantes && Array.isArray(errors.lstVacantes)) {
      return errors.lstVacantes.some(
        (vacanteError: any) => vacanteError
      );
    }

    return false;
  };

  const getVacantesErrorMessage = (errors: any) => {
    if (errors.lstVacantes?.message)
      return errors.lstVacantes.message;
    if (totalVacantes <= 0 && errors.idCliente?.message !== undefined)
      return "Agrega al menos una vacante.";
    if (currentVacantes.length <= 0)
      return "Agrega al menos una vacante.";
    return "Revisa los campos de vacantes.";
  };

  const {
    handleSubmit: handleSubmitFiles,
    setValue: setValueFiles,
    register: registerFile,
    getValues: getValuesFiles,
    formState: { errors: fileErrors },
  } = useForm<AddFilesSchemaType>({
    resolver: zodResolver(addFilesSchema),
    defaultValues: {
      lstArchivos: [],
    },
  });

  useEffect(() => {
    if (requirement) {
      const clienteId = requirement.requerimiento.idCliente;
      setValue("idCliente", clienteId);
      setIdClienteForTarifario(clienteId);
      setValue("idCliente", requirement.requerimiento.idCliente);
      setValue("codigoRQ", requirement.requerimiento.codigoRQ);
      setValue("titulo", requirement.requerimiento.titulo);
      setValue(
        "fechaSolicitud",
        format(
          parseISO(requirement.requerimiento.fechaSolicitud),
          "yyyy-MM-dd"
        )
      );
      setValue(
        "fechaVencimiento",
        format(
          parseISO(requirement.requerimiento.fechaVencimiento),
          "yyyy-MM-dd"
        )
      );
      setValue("duracion", requirement.requerimiento.duracion);
      setValue("idDuracion", requirement.requerimiento.idDuracion);
      setValue("idModalidad", requirement.requerimiento.idModalidad);
      setValue("descripcion", requirement.requerimiento.descripcion);
      setValue("idEstadoRQ", requirement.requerimiento.idEstado);
      setClienteSeleccionado(requirement.requerimiento.cliente);

      const archivosFormateados =
        requirement.requerimiento.lstRqArchivo.map((archivo) => ({
          idRequerimientoArchivo: archivo.idRequerimientoArchivo,
          name: archivo.nombreArchivo,
          size: 0,
          file: new File([], archivo.nombreArchivo),
          idTipoArchivoRq: archivo.idTipoArchivoRq,
        }));

      setArchivos(archivosFormateados);
      setValueFiles("lstArchivos", archivosFormateados);

      // Asegura que cada campo individual también esté sincronizado
      archivosFormateados.forEach((archivo, index) => {
        setValueFiles(
          `lstArchivos.${index}.idTipoArchivoRq`,
          archivo.idTipoArchivoRq
        );
      });

      const vacantesIniciales =
        requirement.requerimiento.lstRqVacantes.map((vacante) => {
          const tarifa =
            tarifario
              .find((item) => item.idPerfil === vacante.idPerfil)
              ?.tarifa.toFixed(2) || "-";
          const moneda =
            tarifario.find(
              (item) => item.idPerfil === vacante.idPerfil
            )?.moneda || "S/.";

          return {
            idRequerimientoVacante: vacante.idRequerimientoVacante,
            idPerfil: vacante.idPerfil,
            cantidad: String(vacante.cantidad),
            idEstado: 0,
            tarifa: `${moneda} ${Utils.formatCoin(Number(tarifa))}`,
          };
        });

      setValue(
        "lstVacantes",
        vacantesIniciales.map((v) => ({
          ...v,
          cantidad: Number(v.cantidad),
        }))
      );
      setOriginalVacantes(vacantesIniciales);

      const cantidadesIniciales =
        requirement.requerimiento.lstRqVacantes.map((vacante) =>
          String(vacante.cantidad)
        );
      setCantidadesVacantes(cantidadesIniciales);
      setOriginalCantidades(cantidadesIniciales);
      setRestoreKey((prev) => prev + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    requirement,
    setValue,
    setValueFiles,
    tarifario,
    setIdClienteForTarifario,
  ]);

  useEffect(() => {
    if (idClienteForTarifario && idClienteForTarifario > 0) {
      fetchTarifario(idClienteForTarifario);
    }
  }, [idClienteForTarifario, fetchTarifario]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const nuevosArchivos = Array.from(event.target.files).map(
        (file) => ({
          idRequerimientoArchivo: 0,
          name: file.name,
          size: file.size,
          file,
          idTipoArchivoRq: 0,
        })
      );

      const currentFormArchivos = getValuesFiles("lstArchivos") || [];
      setArchivos((prevArchivos) => [
        ...prevArchivos,
        ...nuevosArchivos,
      ]);
      setValueFiles(
        "lstArchivos",
        [...currentFormArchivos, ...nuevosArchivos],
        {
          shouldValidate: true,
        }
      );
      event.target.value = "";
    }
  };

  const handleRemoveFile = async (
    index: number,
    idArchivo: number
  ) => {
    const updatedArchivos = archivos.filter((_, i) => i !== index);

    if (idArchivo !== 0) {
      const deleteResponse = await deleteData(
        `/fmi/requirement/file/remove?idRqFile=${idArchivo}`
      );

      if (deleteResponse.idTipoMensaje === 2) {
        fetchRequirement();
      }
      return;
    }
    setArchivos(updatedArchivos);
    setValueFiles("lstArchivos", updatedArchivos, {
      shouldValidate: true,
    });
  };

  const handleClienteChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedClienteId = Number(event.target.value);
    const selectedClienteText =
      clientes.find(
        (cliente) => cliente.idCliente === Number(selectedClienteId)
      )?.razonSocial || "";
    setClienteSeleccionado(selectedClienteText);
    setValue("idCliente", selectedClienteId);
    fetchRequirement();
  };

  const onSubmitAddFiles: SubmitHandler<AddFilesSchemaType> = async (
    data
  ) => {
    if (RQ) {
      // new files only
      const nuevosArchivos = data.lstArchivos.filter(
        (archivo) => archivo.idRequerimientoArchivo === 0
      );

      const lstArchivos = await Promise.all(
        nuevosArchivos.map(async (archivo) => {
          const base64 = await Utils.fileToBase64(archivo.file);
          const { nombreArchivo, extensionArchivo } =
            Utils.getFileNameAndExtension(archivo.name);
          const idTipoArchivo =
            Utils.getTipoArchivoId(extensionArchivo);
          return {
            string64: base64,
            nombreArchivo,
            extensionArchivo,
            idTipoArchivo,
            idTipoArchivoRQ: archivo.idTipoArchivoRq,
          };
        }) || []
      );

      const payload = {
        idRequerimiento: RQ.idRequerimiento,
        lstArchivos,
      };

      const response = await postData(
        "/fmi/requirement/file/save",
        payload
      );
      if (response.idTipoMensaje === 2) {
        fetchRequirement();
      }
    }
  };

  const onSubmit: SubmitHandler<UpdateBaseRQSchemaType> = async (
    data
  ) => {
    try {
      const idCliente = Number(data.idCliente);
      const { lstArchivos, lstVacantes, autogenRQ, ...cleanData } =
        data;

      const vacantesParaEnviar = data.lstVacantes
        .filter((vacante) => vacante.idEstado !== 0)
        .map((vacante) => ({
          idRequerimientoVacante: vacante.idRequerimientoVacante,
          idPerfil: vacante.idPerfil,
          cantidad: vacante.cantidad,
          idEstado: vacante.idEstado,
        }));

      if (RQ) {
        const payload = {
          ...cleanData,
          idRequerimiento: RQ.idRequerimiento,
          idCliente: idCliente,
          cliente: clienteSeleccionado,
          estado: data.idEstadoRQ,
          duracion: Number(data.duracion),
          lstVacantes: vacantesParaEnviar,
          idModalidadFact: data.idModalidadFact?.join(","),
        };

        const response = await postData(
          "/fmi/requirement/update",
          payload
        );

        if (response.idTipoMensaje === 2) {
          fetchRequirement();
          updateRQData();
          setIsEditingGestionData(false);
          setIsEditingRQData(false);
          setIsEditingVacantesData(false);
        }
      }
    } catch (error) {
      console.error("Error al transformar los datos:", error);
    }
  };

  const handleEditClick = () => {
    setIsEditingRQData((prev) => !prev);
  };

  const handleEditGestionClick = () => {
    setIsEditingGestionData((prev) => !prev);
  };

  const handleEditVacantesClick = () => {
    if (isEditingVacantesData) {
      restoreVacantesList();
    }
    setIsEditingVacantesData((prev) => !prev);

    getValues(`lstVacantes`).map((vacante, index) => {
      const tarifa =
        tarifario
          .find((item) => item.idPerfil === vacante.idPerfil)
          ?.tarifa.toFixed(2) || "-";
      const moneda =
        tarifario.find((item) => item.idPerfil === vacante.idPerfil)
          ?.moneda || "S/.";

      setValue(
        `lstVacantes.${index}.tarifa`,
        `${moneda} ${Utils.formatCoin(Number(tarifa))}`
      );
    });
  };

  const handleCancelClick = () => {
    setIsEditingRQData(false);
    onClose();
  };

  const newFiles = archivos.some(
    (archivo) => archivo.idRequerimientoArchivo === 0
  );
  const [totalVacantes, setTotalVacantes] = useState(0);

  useEffect(() => {
    setTotalVacantes(
      cantidadesVacantes.reduce(
        (sum, cantidad) => sum + Number(cantidad),
        0
      )
    );
  }, [cantidadesVacantes]);

  const circleClass = useMemo(() => {
    if (totalVacantes > 99) return "w-8 h-8 text-xs";
    if (totalVacantes > 9) return "w-7 h-7 text-sm";
    return "w-6 h-6 text-sm";
  }, [totalVacantes]);

  const handleContactAdded = () => {
    fetchRequirement();
    setIsModalRQContactOPen(false);
    setContactToEdit(null);
    setModalMode("add");
  };

  const handleContactUpdated = () => {
    fetchRequirement();
    setIsModalRQContactOPen(false);
    setContactToEdit(null);
    setModalMode("add");
  };

  const handleAddContact = () => {
    setModalMode("add");
    setContactToEdit(null);
    setIsModalRQContactOPen(true);
  };

  const handleEditContact = (contact: ReqContacto) => {
    setModalMode("edit");
    setContactToEdit(contact);
    setIsModalRQContactOPen(true);
  };

  /** Deserealizar las modalidades de facturacion */
  useEffect(() => {
    const rqResponse = requirement?.requerimiento;
    if (rqResponse?.modalidadFact) {
      const modalidadesSeleccionadas = rqResponse?.modalidadFact
        .split(",")
        .map((m: string) => Number(m.trim()))
        .filter((m: any) => !isNaN(m));
      setValue("idModalidadFact", modalidadesSeleccionadas);
    }
  }, [requirement, setValue]);

  /**
   * Fetch CV file for talent
   */
  const { loading: downloadingFile, fetch } = useApi<
    FileResponse,
    number
  >(getCvFile, {
    onError: (error) => handleError(error, enqueueSnackbar),
    onSuccess: (response) =>
      handleResponse({
        response: response,
        showSuccessMessage: false,
        enqueueSnackbar: enqueueSnackbar,
      }),
  });

  const openFile = (index: number) => {
    if (requirement?.requerimiento.lstRqTalento[index].idCvFile) {
      fetch(
        requirement?.requerimiento.lstRqTalento[index].idCvFile
      ).then((response) => {
        if (response.data.result.idMensaje === 2) {
          const archivoB64 = response.data.archivo;
          Utils.openPdfDocument(archivoB64);
        }
      });
    }
  };
  const [isLoading, downloadFile] = useDownloadRqFile();

  const handleDownloadRqFile = (rqFile: number) => {
    downloadFile(rqFile);
  };

  /** Validate rol */
  const isRecruiter = (): boolean => {
    const token = localStorage.getItem("token");
    const rol = Utils.decodeJwt(token ?? "").roles[0];
    return rol === "RECLUTADOR";
  };

  // @marker modal skills
  /** Get the initial values  Tech skills for each profile */
  const [idVac, setIdVac] = useState<number | undefined>();
  const availableTechSkills = techSkillsParams.map((skill) => ({
    id: skill.num1,
    label: skill.string1,
  }));

  /**Modal Skills close */
  const handleCloseModalSkills = () => {
    closeModal(MODAL_DETAILS_VAC_SKILLS);
    setIdVac(undefined);
    fetchRequirement();
  };

  const handleOpenModal = (idVac: number) => {
    if (!idVac || idVac === 0) {
      enqueueSnackbar({
        message:
          "Selecciona una y/o guarda la vacante para agregar habilidades técnicas.",
        variant: "warning",
      });
      return;
    }
    setIdVac(idVac);
    openModal(MODAL_DETAILS_VAC_SKILLS);
  };

  const getTotalSkillsForVacancy = (vacancyId: number) => {
    const vacancy = requirement?.requerimiento.lstRqVacantes.find(
      (v) => v.idRequerimientoVacante === vacancyId
    );
    if (!vacancy) return 0;
    return vacancy.totalHabilidades;
  };

  /** Handle ModalUpdate Careers */
  const availableDegrees = paramsDegrees.map((param) => ({
    id: param.num1,
    label: param.string1,
  }));

  const openModalCareers = (idVac: number) => {
    if (!idVac || idVac === 0) {
      enqueueSnackbar({
        message:
          "Selecciona una y/o guarda vacante para agregar habilidades técnicas.",
        variant: "warning",
      });
      return;
    }
    setIdVac(idVac);
    openModal(MODAL_UPDATE_CAREER);
  };

  const closeModalCareers = () => {
    setIdVac(undefined);
    closeModal(MODAL_UPDATE_CAREER);
    fetchRequirement();
  };

  const getTotalCareersForVacancy = (vacancyId: number) => {
    const vacancy = requirement?.requerimiento.lstRqVacantes.find(
      (v) => v.idRequerimientoVacante === vacancyId
    );
    if (!vacancy) return 0;
    return vacancy.totalCarreras;
  };

  return (
    <>
      {(postloading ||
        deleteLoading ||
        downloadingFile ||
        isLoading) && <Loading opacity="opacity-60" />}
      {isModalOpen(MODAL_DETAILS_VAC_SKILLS) && (
        <ModalDetailsVacSkills
          onClose={handleCloseModalSkills}
          availableSkills={availableTechSkills}
          refetchAvailableSkills={() =>
            refetchParams(`${HABILIDADES_TECNICAS}`)
          }
          idVac={idVac ?? 0}
        />
      )}

      {isModalOpen(MODAL_UPDATE_CAREER) && (
        <ModalDetailsVacCarreras
          idVac={idVac ?? 0}
          onClose={closeModalCareers}
          availableDegrees={availableDegrees}
        />
      )}

      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
        <div className="bg-white rounded-lg shadow-lg p-4 w-full md:w-[90%] lg:w-[1200px] min-h-[570px] overflow-y-auto relative">
          <h2 className="text-lg font-bold mb-2">Detalles RQ</h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 focus:outline-none"
          >
            <img
              src="/assets/ic_close_x.svg"
              alt="icon close"
              className="w-6 h-6"
            />
          </button>
          <Tabs
            isDataLoading={reqLoading}
            tabs={[
              {
                label: "Datos RQ",
                children: (
                  <div>
                    {reqLoading ? (
                      <p className="text-gray-500 text-center">
                        Cargando Requerimiento...
                      </p>
                    ) : (
                      <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col flex-1"
                      >
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleEditClick}
                            className="focus:outline-none"
                          >
                            <img
                              src="/assets/ic_edit.svg"
                              alt="Editar"
                              className="w-7 h-7"
                            />
                          </button>
                        </div>

                        {/* Campos del formulario */}
                        <div className="space-y-4 flex-1">
                          {/* Título RQ */}
                          <div className="flex items-center">
                            <label className="w-1/3 text-sm font-medium text-gray-700">
                              Título:
                            </label>
                            <input
                              {...register("titulo")}
                              disabled={!isEditingRQData}
                              className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
                            />
                          </div>
                          {errors.titulo && (
                            <p className="text-red-500 text-sm mt-1 ml-[33%]">
                              {errors.titulo.message}
                            </p>
                          )}
                          {/* Código RQ */}
                          <div className="flex items-center">
                            <label className="w-1/3 text-sm font-medium text-gray-700">
                              Código RQ:
                            </label>
                            <input
                              {...register("codigoRQ")}
                              disabled={!isEditingRQData}
                              className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
                            />
                          </div>
                          {errors.codigoRQ && (
                            <p className="text-red-500 text-sm mt-1 ml-[33%]">
                              {errors.codigoRQ.message}
                            </p>
                          )}

                          {/* Fecha de Solicitud */}
                          <div className="flex items-center">
                            <label className="w-1/3 text-sm font-medium text-gray-700">
                              Fecha de Solicitud:
                            </label>
                            <input
                              type="date"
                              {...register("fechaSolicitud")}
                              disabled={!isEditingRQData}
                              className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
                            />
                          </div>
                          {errors.fechaSolicitud && (
                            <p className="text-red-500 text-sm mt-1 ml-[33%]">
                              {errors.fechaSolicitud.message}
                            </p>
                          )}

                          {/* Descripción */}
                          <div className="flex items-center">
                            <label className="w-1/3 text-sm font-medium text-gray-700">
                              Descripción:
                            </label>
                            <textarea
                              {...register("descripcion")}
                              disabled={!isEditingRQData}
                              className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5] resize-none"
                            />
                          </div>
                          {errors.descripcion && (
                            <p className="text-red-500 text-sm mt-1 ml-[33%]">
                              {errors.descripcion.message}
                            </p>
                          )}

                          {/* Estado */}
                          <div className="flex items-center">
                            <label className="w-1/3 text-sm font-medium text-gray-700">
                              Estado:
                            </label>
                            <select
                              {...register("idEstadoRQ", {
                                valueAsNumber: true,
                              })}
                              disabled={!isEditingRQData}
                              className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
                            >
                              {estadoOptions.map((option) => (
                                <option
                                  key={option.num1}
                                  value={option.num1}
                                >
                                  {option.string1}
                                </option>
                              ))}
                            </select>
                          </div>
                          {errors.idEstadoRQ && (
                            <p className="text-red-500 text-sm mt-1 ml-[33%]">
                              {errors.idEstadoRQ.message}
                            </p>
                          )}

                          {/* Fecha Vencimiento */}
                          <div className="flex items-center">
                            <label className="w-1/3 text-sm font-medium text-gray-700">
                              Fecha Vencimiento:
                            </label>
                            <input
                              type="date"
                              {...register("fechaVencimiento")}
                              id="fechaVencimiento"
                              className="input w-2/3"
                              disabled={!isEditingRQData}
                            />
                          </div>
                          {errors.fechaVencimiento && (
                            <p className="text-red-500 text-sm mt-1 ml-[33%]">
                              {errors.fechaVencimiento.message}
                            </p>
                          )}
                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-end space-x-4 mt-4">
                          <button
                            type="submit"
                            disabled={!isEditingRQData}
                            className={`btn ${
                              isEditingRQData
                                ? "btn-primary"
                                : "btn-disabled"
                            }`}
                          >
                            Actualizar
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ),
              },
              {
                label: "Cliente",
                children: (
                  <div className="flex flex-col h-[calc(570px-120px)]">
                    {/* Cliente */}
                    <div className="flex items-center">
                      <label className="text-sm font-medium text-gray-700">
                        Cliente:
                      </label>
                      <select
                        {...register("idCliente", {
                          valueAsNumber: true,
                        })}
                        disabled={true}
                        aria-readonly={true}
                        className="px-3 py-2 border-none outline-none appearance-none"
                      >
                        {clientes.map((cliente) => (
                          <option
                            key={cliente.idCliente}
                            value={cliente.idCliente}
                          >
                            {cliente.razonSocial}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.idCliente && (
                      <p className="text-red-500 text-sm mt-1 ml-[33%]">
                        {errors.idCliente.message}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-medium text-gray-700">
                        Lista de contactos
                      </h2>
                      <button
                        type="button"
                        onClick={handleAddContact}
                        disabled={getValues("idCliente") === 0}
                        className={`btn text-sm font-medium ${
                          getValues("idCliente") === 0
                            ? "btn-disabled"
                            : "btn-blue"
                        }`}
                      >
                        Añadir contacto
                      </button>
                    </div>

                    <div className="mt-4 flex-1 overflow-y-auto custom-scroll">
                      <div className="table-container">
                        <div className="table-wrapper">
                          <table className="table">
                            <thead>
                              <tr className="table-header">
                                <th
                                  scope="col"
                                  className="table-header-cell"
                                >
                                  ID
                                </th>
                                <th
                                  scope="col"
                                  className="table-header-cell"
                                >
                                  Nombres
                                </th>
                                <th
                                  scope="col"
                                  className="table-header-cell"
                                >
                                  Apellidos
                                </th>
                                <th
                                  scope="col"
                                  className="table-header-cell"
                                >
                                  Celular
                                </th>
                                <th
                                  scope="col"
                                  className="table-header-cell"
                                >
                                  Correo
                                </th>
                                <th
                                  scope="col"
                                  className="table-header-cell"
                                >
                                  Cargo
                                </th>
                                <th
                                  scope="col"
                                  className="table-header-cell"
                                >
                                  Asignado
                                </th>
                                <th
                                  scope="col"
                                  className="table-header-cell"
                                ></th>
                              </tr>
                            </thead>
                            <tbody>
                              {(
                                requirement?.requerimiento
                                  ?.lstRqContactos || []
                              ).length <= 0 ? (
                                <tr>
                                  <td
                                    colSpan={8}
                                    className="table-empty"
                                  >
                                    No hay contactos disponibles.
                                  </td>
                                </tr>
                              ) : (
                                requirement?.requerimiento?.lstRqContactos?.map(
                                  (contacto) => (
                                    <tr
                                      key={contacto.idClienteContacto}
                                      className="table-row"
                                    >
                                      <td className="table-cell">
                                        {contacto.idClienteContacto}
                                      </td>
                                      <td className="table-cell">
                                        {contacto.nombre}
                                      </td>
                                      <td className="table-cell">
                                        {contacto.apellidoPaterno +
                                          " " +
                                          contacto.apellidoMaterno}
                                      </td>
                                      <td className="table-cell">
                                        {contacto.telefono}
                                      </td>
                                      <td className="table-cell">
                                        {contacto.correo}
                                      </td>
                                      <td className="table-cell">
                                        {contacto.cargo}
                                      </td>
                                      <td className="table-cell">
                                        <input
                                          type="checkbox"
                                          name="contact-asig"
                                          id="contact-asig"
                                          checked={
                                            contacto.asignado === 1
                                          }
                                          readOnly={true}
                                          className="input-checkbox-readonly"
                                        />
                                      </td>
                                      <td className="table-cell">
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleEditContact(
                                                contacto
                                              )
                                            }
                                            className="w-7 h-7"
                                          >
                                            <img
                                              src="/assets/ic_edit.svg"
                                              alt="edit icon"
                                            />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                hasError:
                  hasVacantesErrors(errors) &&
                  errors.idCliente?.message === undefined,
                errorMessage: getVacantesErrorMessage(errors),
                onBlur: () => {
                  restoreVacantesList();
                  setIsEditingVacantesData(false);
                },
                label: (
                  <p className="flex gap-2">
                    Vacantes
                    <span
                      className={`flex items-center justify-center rounded-full bg-[var(--color-blue)] text-white ${circleClass}`}
                    >
                      {totalVacantes}
                    </span>
                  </p>
                ),
                children: (
                  <div>
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="flex flex-col h-[calc(570px-120px)]"
                    >
                      <div className="flex items-center justify-between my-2">
                        <button
                          type="button"
                          onClick={handleEditVacantesClick}
                          className="focus:outline-none ms-2"
                        >
                          <img
                            src="/assets/ic_edit.svg"
                            alt="Editar"
                            className="w-7 h-7"
                          />
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className={`focus:outline-none text-sm min-w-24 h-8 rounded-lg py-1 px-2 mx-1 ${
                              isEditingVacantesData
                                ? "btn-blue cursor-pointer"
                                : "btn-disabled"
                            }`}
                            onClick={handleAddVacante}
                            disabled={!isEditingVacantesData}
                          >
                            Agregar
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scroll">
                        <div className="table-container">
                          <div className="table-wrapper">
                            <table className="table">
                              <thead>
                                <tr className="table-header">
                                  <th className="table-header-cell">
                                    Perfil profesional
                                  </th>
                                  <th className="table-header-cell">
                                    Cantidad
                                  </th>

                                  <th
                                    className="table-header-cell"
                                    style={{
                                      display: isRecruiter()
                                        ? "none"
                                        : "table-header-cell",
                                    }}
                                  >
                                    Tarifa
                                  </th>

                                  <th
                                    className="table-header-cell"
                                    style={{
                                      display: isRecruiter()
                                        ? "none"
                                        : "table-header-cell",
                                    }}
                                  >
                                    Tipo tarifa
                                  </th>
                                  <th className="table-header-cell text-center">
                                    Otros
                                  </th>
                                  <th className="table-header-cell"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {fields.length <= 0 ? (
                                  <tr>
                                    <td
                                      colSpan={4}
                                      className="table-empty"
                                    >
                                      No hay vacantes disponibles.
                                    </td>
                                  </tr>
                                ) : (
                                  fields.map((field, index) => {
                                    if (field.idEstado === 3) {
                                      return (
                                        <tr
                                          key={`hidden-${field.id}-${index}`}
                                          className="hidden"
                                        >
                                          {/* Campos ocultos pero presentes en el formulario */}
                                          <input
                                            type="hidden"
                                            {...register(
                                              `lstVacantes.${index}.idEstado`
                                            )}
                                            value={3}
                                          />
                                          <input
                                            type="hidden"
                                            {...register(
                                              `lstVacantes.${index}.idPerfil`
                                            )}
                                            value={0}
                                          />
                                          <input
                                            type="hidden"
                                            {...register(
                                              `lstVacantes.${index}.cantidad`
                                            )}
                                            value={0}
                                          />
                                          {field.idRequerimientoVacante && (
                                            <input
                                              type="hidden"
                                              {...register(
                                                `lstVacantes.${index}.idRequerimientoVacante`
                                              )}
                                              value={
                                                field.idRequerimientoVacante
                                              }
                                            />
                                          )}
                                        </tr>
                                      );
                                    }

                                    const availableProfiles =
                                      getAvailableProfiles(index);
                                    const currentProfile =
                                      currentVacantes[index]
                                        ?.idPerfil;
                                    const showCurrentProfile =
                                      currentProfile === 0 ||
                                      availableProfiles.some(
                                        (p) =>
                                          p.idPerfil ===
                                          currentProfile
                                      ) ||
                                      !tarifario.some(
                                        (p) =>
                                          p.idPerfil ===
                                          currentProfile
                                      );

                                    const optionsToShow =
                                      showCurrentProfile
                                        ? [...availableProfiles]
                                        : [
                                            ...availableProfiles,
                                            ...tarifario.filter(
                                              (p) =>
                                                p.idPerfil ===
                                                currentProfile
                                            ),
                                          ];

                                    const tipoTarifa =
                                      tarifario.find(
                                        (item) =>
                                          item.idPerfil ===
                                          getValues(
                                            `lstVacantes.${index}.idPerfil`
                                          )
                                      )?.tipoTarifa || "-";

                                    return (
                                      <tr
                                        key={index}
                                        className="table-row"
                                      >
                                        <td className="table-cell">
                                          <select
                                            {...register(
                                              `lstVacantes.${index}.idPerfil`,
                                              {
                                                valueAsNumber: true,
                                              }
                                            )}
                                            onChange={(e) =>
                                              handleProfileChange(
                                                index,
                                                e.target.value
                                              )
                                            }
                                            className="h-10 px-4 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]"
                                            value={currentProfile}
                                            disabled={
                                              !isEditingVacantesData ||
                                              loadingTarifario
                                            }
                                          >
                                            <option value={0}>
                                              {loadingTarifario
                                                ? "Cargando perfiles..."
                                                : "Seleccione un perfil"}
                                            </option>
                                            {optionsToShow.map(
                                              (perfil) => (
                                                <option
                                                  key={
                                                    perfil.idPerfil
                                                  }
                                                  value={
                                                    perfil.idPerfil
                                                  }
                                                >
                                                  {perfil.perfil}
                                                </option>
                                              )
                                            )}
                                          </select>
                                          {errors.lstVacantes?.[index]
                                            ?.idPerfil && (
                                            <p className="text-red-500 text-xs mt-1">
                                              {
                                                errors.lstVacantes[
                                                  index
                                                ]?.idPerfil?.message
                                              }
                                            </p>
                                          )}
                                        </td>
                                        <td className="table-cell">
                                          <div className="flex">
                                            <div className="flex flex-col gap-1 relative">
                                              <NumberInputFMIBase<UpdateBaseRQSchemaType>
                                                register={register}
                                                control={control}
                                                name={`lstVacantes.${index}.cantidad`}
                                                defaultValue={Number(
                                                  originalCantidades[
                                                    index
                                                  ] || 1
                                                )}
                                                disabled={
                                                  !isEditingVacantesData
                                                }
                                                onChange={(value) => {
                                                  const numValue =
                                                    Number(value) ||
                                                    0;
                                                  const currentValue =
                                                    getValues(
                                                      `lstVacantes.${index}`
                                                    );
                                                  if (
                                                    currentValue.idRequerimientoVacante >
                                                      0 &&
                                                    currentValue.idEstado ===
                                                      0
                                                  ) {
                                                    setValue(
                                                      `lstVacantes.${index}.idEstado`,
                                                      2
                                                    );
                                                  }
                                                  setCantidadesVacantes(
                                                    (prev) => {
                                                      const newCantidades =
                                                        [...prev];
                                                      newCantidades[
                                                        index
                                                      ] =
                                                        String(
                                                          numValue
                                                        );
                                                      return newCantidades;
                                                    }
                                                  );
                                                  clearErrors(
                                                    `lstVacantes.${index}.cantidad`
                                                  );
                                                }}
                                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
                                              />
                                              {errors.lstVacantes?.[
                                                index
                                              ]?.cantidad && (
                                                <p className="text-red-500 text-xs mt-1 absolute -bottom-5">
                                                  {
                                                    errors
                                                      .lstVacantes[
                                                      index
                                                    ]?.cantidad
                                                      ?.message
                                                  }
                                                </p>
                                              )}
                                            </div>
                                            <div className="ms-4 flex items-center">
                                              {field.idEstado ===
                                              1 ? (
                                                <span className="text-sm w-fit px-2 py-1 rounded-lg bg-green-100 text-green-700 truncate mr-2">
                                                  Nuevo
                                                </span>
                                              ) : null}
                                            </div>
                                          </div>
                                        </td>

                                        <td
                                          className="table-cell"
                                          style={{
                                            display: isRecruiter()
                                              ? "none"
                                              : "table-cell",
                                          }}
                                        >
                                          <input
                                            {...register(
                                              `lstVacantes.${index}.tarifa`
                                            )}
                                            defaultValue={
                                              Utils.formatCoin(
                                                Number(
                                                  getValues(
                                                    `lstVacantes.${index}.tarifa`
                                                  )
                                                )
                                              )?.toString() || "-"
                                            }
                                            type="text"
                                            id="v-tarifa"
                                            className="input-readonly-text"
                                            readOnly
                                          />
                                        </td>

                                        <td
                                          className="table-cell"
                                          style={{
                                            display: isRecruiter()
                                              ? "none"
                                              : "table-cell",
                                          }}
                                        >
                                          {tipoTarifa}
                                        </td>

                                        <td className="table-cell text-center relative group">
                                          <div className="flex items-center gap-3 justify-center">
                                            <button
                                              type="button"
                                              className="relative bg-white p-2 rounded rounded-full shadow-sm shadow-gray-400"
                                              title="Agregar carreras"
                                              onClick={() => {
                                                const idVacante =
                                                  field.idRequerimientoVacante;
                                                openModalCareers(
                                                  idVacante
                                                );
                                              }}
                                            >
                                              <img
                                                className="w-6 h-6"
                                                src="/assets/ic_student.png"
                                                alt="admin-settings-male"
                                              />
                                              <span className="absolute -top-1 -right-1 bg-blue-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                                {getTotalCareersForVacancy(
                                                  field.idRequerimientoVacante
                                                )}
                                              </span>
                                            </button>
                                            <button
                                              type="button"
                                              className="relative bg-white p-2 rounded rounded-full shadow-sm shadow-gray-400"
                                              title="Agregar habilidades"
                                              onClick={() => {
                                                const idVacante =
                                                  field.idRequerimientoVacante;
                                                handleOpenModal(
                                                  idVacante
                                                );
                                              }}
                                            >
                                              <img
                                                src="/assets/ic_skills.png"
                                                alt="icon add"
                                                className="w-6 h-6"
                                              />
                                              <span className="absolute -top-1 -right-1 bg-blue-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                                {getTotalSkillsForVacancy(
                                                  field.idRequerimientoVacante
                                                )}
                                              </span>
                                            </button>
                                          </div>
                                        </td>

                                        <td className="table-cell">
                                          {isEditingVacantesData && (
                                            <button
                                              type="button"
                                              disabled={
                                                !isEditingVacantesData
                                              }
                                              className="bg-white p-2 rounded rounded-full shadow-sm shadow-gray-400"
                                              onClick={() =>
                                                handleRemoveVacante(
                                                  index
                                                )
                                              }
                                            >
                                              <img
                                                src="/assets/ic_remove.png"
                                                alt="icon remove"
                                                className="w-6 h-6"
                                              />
                                            </button>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 self-end">
                        <button
                          type="submit"
                          disabled={!isEditingVacantesData}
                          className={`focus:outline-none text-sm min-w-24 h-8 rounded-lg py-1 px-2 mx-1 ${
                            isEditingVacantesData
                              ? "btn-primary cursor-pointer"
                              : "btn-disabled"
                          }`}
                        >
                          Actualizar
                        </button>
                      </div>
                    </form>
                  </div>
                ),
              },
              {
                label: "Archivos",
                children: (
                  <form
                    onSubmit={handleSubmitFiles(onSubmitAddFiles)}
                    className="p-4 h-full flex flex-col"
                  >
                    <div className="flex flex-col h-[calc(570px-120px)]">
                      {/* Encabezado */}
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Archivos elegidos:
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById("fileInput")
                              ?.click()
                          }
                          className="btn btn-text"
                        >
                          Elegir archivos
                        </button>
                      </div>

                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="fileInput"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                      />

                      {/* Lista de archivos */}
                      <div className="mt-2 flex-1 overflow-y-auto mb-4">
                        {/**@marker files maps */}
                        {archivos.map((archivo, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-md mb-1"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                handleDownloadRqFile(
                                  archivo.idRequerimientoArchivo
                                );
                              }}
                              className="text-blue-500 hover:text-blue-600 focus:outline-none"
                            >
                              <img
                                src="/assets/ic_preview_file.png"
                                alt="icon preview"
                                className="w-5 h-5"
                              />
                            </button>
                            <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                              {archivo.name}
                            </span>
                            {archivo.idRequerimientoArchivo === 0 && (
                              <span className="text-sm w-fit px-2 py-1 rounded-lg bg-green-100 text-green-700 truncate mr-2">
                                Nuevo
                              </span>
                            )}
                            <div className="flex flex-col">
                              <select
                                {...registerFile(
                                  `lstArchivos.${index}.idTipoArchivoRq`,
                                  {
                                    valueAsNumber: true,
                                  }
                                )}
                                onChange={(e) => {
                                  const value = Number(
                                    e.target.value
                                  );

                                  // Actualiza react-hook-form
                                  setValueFiles(
                                    `lstArchivos.${index}.idTipoArchivoRq`,
                                    value,
                                    {
                                      shouldValidate: true,
                                    }
                                  );

                                  // Actualiza el estado local
                                  setArchivos((prev) => {
                                    const updated = [...prev];
                                    updated[index] = {
                                      ...updated[index],
                                      idTipoArchivoRq: value,
                                    };
                                    return updated;
                                  });
                                }}
                                value={
                                  getValuesFiles(
                                    `lstArchivos.${index}.idTipoArchivoRq`
                                  ) || 0
                                }
                                className="w-60 px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 cursor-pointer"
                                disabled={
                                  archivo.idRequerimientoArchivo !== 0
                                }
                              >
                                <option value={0} disabled>
                                  Elija un tipo
                                </option>
                                {fileOptions.map((option) => (
                                  <option
                                    value={option.id}
                                    key={option.id}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              {fileErrors.lstArchivos?.[index]
                                ?.idTipoArchivoRq && (
                                <p className="text-red-500 text-xs mt-1">
                                  {
                                    fileErrors.lstArchivos?.[index]
                                      ?.idTipoArchivoRq?.message
                                  }
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveFile(
                                  index,
                                  archivo.idRequerimientoArchivo || 0
                                )
                              }
                              className="text-red-500 hover:text-red-600 focus:outline-none"
                            >
                              <img
                                src="/assets/ic_remove.png"
                                alt="icon close"
                                className="w-5 h-5"
                              />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto flex justify-end">
                        <button
                          type="submit"
                          disabled={!newFiles}
                          className={`btn w-fit text-sm ${
                            newFiles ? "btn-primary" : "btn-disabled"
                          }`}
                        >
                          Agregar archivos nuevos
                        </button>
                      </div>
                    </div>
                  </form>
                ),
              },
              {
                label: "Postulantes",
                children: (
                  <>
                    <div className="text-end">
                      {RQ && RQ.idEstado !== ESTADO_ATENDIDO && (
                        <button
                          type="button"
                          className="focus:outline-none text-sm rounded-lg py-1 px-2 mx-1 my-2 btn-blue cursor-pointer"
                          onClick={() => {
                            if (isModalOpen(MODAL_DETALLES_RQ)) {
                              closeModal(MODAL_DETALLES_RQ);
                            }
                            handleAsignar(RQ?.idRequerimiento);
                          }}
                        >
                          Asignar
                        </button>
                      )}
                    </div>
                    <div className="p-1 custom-scroll">
                      <div className="table-container custom-scroll">
                        <div className="table-wrapper custom-scroll">
                          <table className="table custom-scroll">
                            <thead>
                              <tr className="table-header">
                                <th
                                  scope="col"
                                  className="table-header-cell"
                                >
                                  CV
                                </th>
                                <th
                                  scope="col"
                                  className="table-header-cell"
                                >
                                  Nombres y apellidos
                                </th>
                                <th
                                  scope="col"
                                  className="table-header-cell"
                                >
                                  Doc. Identidad
                                </th>
                                <th
                                  scope="col"
                                  className="table-header-cell"
                                >
                                  Celular
                                </th>
                                <th
                                  scope="col"
                                  className="table-header-cell"
                                >
                                  Correo
                                </th>
                                <th
                                  scope="col"
                                  className="table-header-cell"
                                >
                                  Situación
                                </th>
                                <th
                                  scope="col"
                                  className="table-header-cell"
                                >
                                  Estado
                                </th>
                                <th
                                  scope="col"
                                  className="table-header-cell"
                                >
                                  Perfil
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {requirement?.requerimiento.lstRqTalento
                                .length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={7}
                                    className="table-empty"
                                  >
                                    No hay postulantes disponibles.
                                  </td>
                                </tr>
                              ) : (
                                requirement?.requerimiento.lstRqTalento.map(
                                  (talento, index) => (
                                    <tr
                                      key={talento.idTalento}
                                      className="table-row"
                                    >
                                      <td className="text-center">
                                        <button
                                          type="button"
                                          className="hover:shadow-lg hover:rounded-full hover:bg-gray-100"
                                          onClick={() =>
                                            openFile(index)
                                          }
                                        >
                                          <img
                                            src="/assets/ic_show_pass.svg"
                                            alt="icon eye"
                                            className="w-5 h-5"
                                          />
                                        </button>
                                      </td>
                                      <td className="table-cell">
                                        {talento.nombresTalento}{" "}
                                        {talento.apellidosTalento}
                                      </td>
                                      <td className="table-cell">
                                        {talento.dni}
                                      </td>
                                      <td className="table-cell">
                                        {talento.celular}
                                      </td>
                                      <td className="table-cell">
                                        {talento.email}
                                      </td>
                                      <td className="table-cell">
                                        {talento.situacion}
                                      </td>
                                      <td className="table-cell">
                                        <span
                                          className={`badge ${
                                            talento.estado?.toUpperCase() ===
                                            "DATOS COMPLETOS"
                                              ? "badge-green"
                                              : talento.estado?.toUpperCase() ===
                                                "OBSERVADO"
                                              ? "badge-yellow"
                                              : ""
                                          }`}
                                        >
                                          {(
                                            talento.estado ||
                                            (talento.idEstado === 1
                                              ? "DATOS COMPLETOS"
                                              : "OBSERVADO")
                                          ).toUpperCase()}
                                        </span>
                                      </td>
                                      <td className="table-cell">
                                        {talento.perfil}
                                      </td>
                                    </tr>
                                  )
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </>
                ),
              },
              {
                label: "Gestión",
                children: (
                  <div className="h-full flex flex-col px-4">
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="flex flex-col h-[calc(570px-120px)]"
                    >
                      {/* Contenido del formulario */}
                      <div className="flex justify-end mb-1">
                        <button
                          type="button"
                          onClick={handleEditGestionClick}
                          className="focus:outline-none"
                        >
                          <img
                            src="/assets/ic_edit.svg"
                            alt="Editar"
                            className="w-7 h-7"
                          />
                        </button>
                      </div>

                      <div className="flex items-center mb-6">
                        <label className="w-1/3 text-sm font-medium text-gray-700">
                          Duración:
                        </label>
                        <div className="flex gap-4 w-2/3">
                          <div className="flex flex-col gap-1">
                            <NumberInput<UpdateBaseRQSchemaType>
                              control={control}
                              name="duracion"
                              isDisabled={!isEditingGestionData}
                              error={errors?.duracion?.message}
                            />
                          </div>
                          <DropdownForm
                            name="idDuracion"
                            control={control}
                            error={errors.idDuracion}
                            required={false}
                            flex={true}
                            disabled={!isEditingGestionData}
                            options={duracionRQ.map((duracion) => ({
                              value: duracion.num1,
                              label: duracion.string1,
                            }))}
                          />
                        </div>
                      </div>

                      <div className="flex items-center">
                        <label className="w-1/3 text-sm font-medium text-gray-700">
                          Modalidad:
                        </label>
                        <DropdownForm
                          name="idModalidad"
                          control={control}
                          error={errors.idModalidad}
                          required={false}
                          flex={true}
                          disabled={!isEditingGestionData}
                          options={modalidadRQ.map((modalidad) => ({
                            value: modalidad.num1,
                            label: modalidad.string1,
                          }))}
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="w-1/3 text-sm font-medium text-gray-700">
                          Modalidad de facturación:
                        </label>
                        <Controller
                          name="idModalidadFact"
                          control={control}
                          render={({ field }) => (
                            <div className="mt-4 flex flex-col gap-2">
                              {modalidadesFact.map((modalidad) => (
                                <label
                                  key={modalidad.num1}
                                  className="inline-flex items-center space-x-2"
                                >
                                  <input
                                    type="checkbox"
                                    value={modalidad.num1}
                                    disabled={!isEditingGestionData}
                                    checked={
                                      field.value?.includes(
                                        modalidad.num1
                                      ) || false
                                    }
                                    onChange={(e) => {
                                      const checked =
                                        e.target.checked;
                                      const value = modalidad.num1;

                                      if (checked) {
                                        field.onChange([
                                          ...(field.value || []),
                                          value,
                                        ]);
                                      } else {
                                        field.onChange(
                                          field.value?.filter(
                                            (v: number) => v !== value
                                          )
                                        );
                                      }
                                    }}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                  />
                                  <span>{modalidad.string1}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        />

                        {errors.idModalidadFact && (
                          <span className="text-red-500 text-xs">
                            {errors.idModalidadFact.message}
                          </span>
                        )}
                      </div>

                      <div className="flex-1"></div>

                      <div className="flex justify-end mt-4">
                        <button
                          type="submit"
                          disabled={!isEditingGestionData}
                          className={`btn text-sm ${
                            isEditingGestionData
                              ? "btn-primary"
                              : "btn-disabled"
                          }`}
                        >
                          Actualizar
                        </button>
                      </div>
                    </form>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      {isModalRQContactOPen && (
        <ModalRQContact
          onClose={() => setIsModalRQContactOPen(false)}
          RQState="existing"
          onContactAdded={handleContactAdded}
          onContactUpdated={handleContactUpdated}
          modalMode={modalMode}
          contact={contactToEdit}
          idRQ={RQ?.idRequerimiento}
          idCliente={getValues("idCliente")}
        />
      )}
    </>
  );
};
