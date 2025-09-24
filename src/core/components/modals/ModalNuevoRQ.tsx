import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { Param } from "../../models/interfaces/Param";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newRQSchema,
  newRQSchemaType,
} from "../../models/schemas/NewRQSchemaV1";
import { Utils } from "../../utilities/utils";
import { usePostHook } from "../../hooks/usePostHook";
import { Client } from "../../models/interfaces/Client";
import { Loading } from "../ui/Loading";
import { NumberInput } from "../../components/ui/InputNumber";
import { Tabs } from "../ui/Tabs";
import { useFetchClientContacts } from "../../hooks/useFetchClientContacts";
import { ReqContacto } from "../../models/interfaces/ReqContacto";
import { ModalRQContact } from "./ModalRQContact";
import { DropdownForm } from "../forms";
import { DURACION_RQ, MODALIDAD_RQ } from "../../utilities/constants";
import { useParams } from "../../context/ParamsContext";
import { useFetchTarifario } from "../../hooks/useFetchTarifario";
import { format } from "date-fns";

interface Archivo {
  name: string;
  size: number;
  file: File;
}

interface Props {
  onClose: () => void;
  updateRQData: () => void;
  estadoOptions: Param[];
  clientes: Client[];
}

export const AgregarRQModal = ({
  onClose,
  updateRQData,
  estadoOptions,
  clientes,
}: Props) => {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const { postData, postloading } = usePostHook();
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [autogenRQ, setAutogenRQ] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const {
    contactos,
    loading: loadingContacts,
    fetchContacts,
  } = useFetchClientContacts();
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [isModalRQContactOPen, setIsModalRQContactOPen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [contactToEdit, setContactToEdit] = useState<ReqContacto | null>(null);
  const { paramsByMaestro } = useParams(`${DURACION_RQ}, ${MODALIDAD_RQ}`);

  const {
    tarifario,
    fetchTarifario,
    loading: loadingTarifario,
  } = useFetchTarifario();

  const duracionRQ = paramsByMaestro[DURACION_RQ] || [];
  const modalidadRQ = paramsByMaestro[MODALIDAD_RQ] || [];

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    control,
    trigger,
    watch,
    getValues,
    setError,
    formState: { errors },
  } = useForm<newRQSchemaType>({
    resolver: zodResolver(newRQSchema),
    reValidateMode: "onChange",
    mode: "onChange",
    defaultValues: {
      idCliente: 0,
      fechaSolicitud: format(new Date(), "yyyy-MM-dd"),
      descripcion: "",
      idEstado: 0,
      lstVacantes: [],
      lstArchivos: [],
      duracion: 1,
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

  const getAvailableProfiles = (currentIndex: number) => {
    if (getValues("idCliente") === 0) return [];

    const selectedProfiles = currentVacantes
      .filter((_, index) => index !== currentIndex)
      .map((v) => v.idPerfil)
      .filter((id) => id !== 0);

    return tarifario.filter(
      (perfil) => !selectedProfiles.includes(perfil.idPerfil)
    );
  };

  const handleProfileChange = (index: number, value: string) => {
    const idPerfil = Number(value);
    setValue(`lstVacantes.${index}.idPerfil`, idPerfil);

    const tarifa =
      tarifario.find((item) => item.idPerfil === idPerfil)?.tarifa.toFixed(2) ||
      "-";
    const moneda =
      tarifario.find((item) => item.idPerfil === idPerfil)?.moneda || "S/.";

    setValue(`lstVacantes.${index}.tarifa`, `${moneda} ${tarifa}`);
    clearErrors(`lstVacantes.${index}.idPerfil`);
  };

  const handleAddVacante = () => {
    append({ idPerfil: 0, cantidad: 1 });
    setCantidadesVacantes((prev) => [...prev, 1]);
    clearErrors("lstVacantes");
  };

  const handleRemoveVacante = (index: number) => {
    remove(index);
    setCantidadesVacantes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const nuevosArchivos = Array.from(event.target.files).map((file) => ({
        name: file.name,
        size: file.size,
        file,
      }));
      setArchivos((prevArchivos) => [...prevArchivos, ...nuevosArchivos]);
      setValue("lstArchivos", nuevosArchivos, { shouldValidate: true });
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedArchivos = archivos.filter((_, i) => i !== index);
    setArchivos(updatedArchivos);
    setValue("lstArchivos", updatedArchivos, { shouldValidate: true });
  };

  const handleClienteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClienteId = Number(event.target.value);
    const selectedClienteText =
      clientes.find(
        (cliente) => cliente.idCliente === Number(selectedClienteId)
      )?.razonSocial || "";
    setClienteSeleccionado(selectedClienteText);
    setValue("idCliente", selectedClienteId);
    clearErrors();

    setSelectedContacts([]);
    fetchContacts(selectedClienteId);
    // Cargar tarifario para el cliente seleccionado
    // Limpiar lista de vacantes
    if (selectedClienteId > 0) {
      fetchTarifario(selectedClienteId);
      setValue("lstVacantes", []);
      setCantidadesVacantes([]);
    }
  };

  useEffect(() => {
    const currentIdCliente = getValues("idCliente");
    if (currentIdCliente > 0) {
      fetchTarifario(currentIdCliente);
    }
  }, [fetchTarifario, getValues]);

  const handleContactToggle = (contactId: number) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const onSubmit: SubmitHandler<newRQSchemaType> = async (data) => {
    try {
      // 1. Transformar el estado a número
      const idCliente = Number(data.idCliente);

      // 2. Transformar los archivos
      const lstArchivos = await Promise.all(
        data.lstArchivos?.map(async (archivo) => {
          const base64 = await Utils.fileToBase64(archivo.file);
          const { nombreArchivo, extensionArchivo } =
            Utils.getFileNameAndExtension(archivo.name);
          const idTipoArchivo = Utils.getTipoArchivoId(extensionArchivo);
          return {
            string64: base64,
            nombreArchivo,
            extensionArchivo,
            idTipoArchivo,
          };
        }) || []
      );

      // 3. Crear el objeto final para enviar
      const payload = {
        ...data,
        idCliente: idCliente,
        codigoRQ: data.codigoRQ,
        cliente: clienteSeleccionado,
        estado: data.idEstado,
        duracion: Number(data.duracion),
        lstVacantes: data.lstVacantes.map((vacante) => ({
          idPerfil: Number(vacante.idPerfil),
          cantidad: Number(vacante.cantidad),
        })),
        lstContactos: selectedContacts.join(","),
        lstArchivos,
      };

      // 4. Enviar los datos al servidor
      const response = await postData("/fmi/requirement/save", payload);

      if (response.idTipoMensaje === 2) {
        onClose();
        updateRQData();
      }
    } catch (error) {
      console.error("Error al transformar los datos:", error);
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setShowValidationErrors(true);

    const isValid = await trigger();
    if (isValid) {
      await handleSubmit(onSubmit)();
    }
  };

  const hasVacantesErrors = (errors: any) => {
    if (errors.lstVacantes?.message) return true;
    if (totalVacantes <= 0 && errors.idCliente?.message !== undefined)
      return true;
    if (currentVacantes.length <= 0) return true;

    if (errors.lstVacantes && Array.isArray(errors.lstVacantes)) {
      return errors.lstVacantes.some((vacanteError: any) => vacanteError);
    }

    return false;
  };

  const getVacantesErrorMessage = (errors: any) => {
    if (errors.lstVacantes?.message) return errors.lstVacantes.message;
    if (totalVacantes <= 0 && errors.idCliente?.message !== undefined)
      return "Agrega al menos una vacante.";
    if (currentVacantes.length <= 0) return "Agrega al menos una vacante.";
    return "Revisa los campos de vacantes.";
  };

  const [cantidadesVacantes, setCantidadesVacantes] = useState<number[]>([]);
  const [totalVacantes, setTotalVacantes] = useState(0);

  useEffect(() => {
    setTotalVacantes(
      cantidadesVacantes.reduce(
        (sum, n) => sum + (Number.isFinite(n) ? n : 0),
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
    fetchContacts(getValues("idCliente"));
    setIsModalRQContactOPen(false);
    setContactToEdit(null);
    setModalMode("add");
    setSelectedContacts([]);
  };

  const handleContactUpdated = () => {
    fetchContacts(getValues("idCliente"));
    setIsModalRQContactOPen(false);
    setContactToEdit(null);
    setModalMode("add");
    setSelectedContacts([]);
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

  const hasGestionErrors =
    errors.duracion?.message !== undefined ||
    errors.idModalidad?.message !== undefined ||
    errors.idDuracion?.message !== undefined;

  return (
    <>
      {(postloading || loadingTarifario) && <Loading opacity="opacity-60" />}
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
        <div className="bg-white rounded-lg shadow-lg p-4 w-full md:w-[90%] lg:w-[1200px] min-h-[570px] overflow-y-auto relative">
          <h2 className="text-lg font-bold mb-2">Agregar Nuevo RQ</h2>
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
            showErrors={showValidationErrors}
            isDataLoading={loadingContacts}
            tabs={[
              {
                label: "Datos RQ",
                children: (
                  <div>
                    <form
                      onSubmit={handleFormSubmit}
                      className="flex flex-col flex-1"
                    >
                      <div className="overflow-y-auto pr-2">
                        <div className="space-y-4 flex-1">
                          {/* Título RQ */}
                          <div className="flex items-center">
                            <label className="w-1/3 text-sm font-medium text-gray-700">
                              Título:
                            </label>
                            <input
                              {...register("titulo")}
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
                              disabled={autogenRQ}
                              className={`w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5] ${
                                autogenRQ ? "text-zinc-500" : ""
                              }`}
                            />
                          </div>
                          {errors.codigoRQ && (
                            <p className="text-red-500 text-sm mt-1 ml-[33%]">
                              {errors.codigoRQ.message}
                            </p>
                          )}

                          {/* Auto Gen RQ */}
                          <div className="flex items-center">
                            <label className="w-1/3 text-sm font-medium text-gray-700">
                              Autogenerar RQ:
                            </label>
                            <input
                              {...register("autogenRQ")}
                              type="checkbox"
                              onChange={(e) => {
                                setAutogenRQ(e.target.checked);
                                setValue(
                                  "codigoRQ",
                                  e.target.checked ? "Autogenerado" : ""
                                );
                                clearErrors("codigoRQ");
                              }}
                              className="input-checkbox"
                            />
                          </div>
                          {errors.autogenRQ && (
                            <p className="text-red-500 text-sm mt-1 ml-[33%]">
                              {errors.autogenRQ.message}
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
                              {...register("idEstado", { valueAsNumber: true })}
                              className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
                            >
                              {estadoOptions.map((option) => (
                                <option key={option.num1} value={option.num1}>
                                  {option.string1}
                                </option>
                              ))}
                            </select>
                          </div>
                          {errors.idEstado && (
                            <p className="text-red-500 text-sm mt-1 ml-[33%]">
                              {errors.idEstado.message}
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
                              className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
                            />
                          </div>
                          {errors.fechaVencimiento && (
                            <p className="text-red-500 text-sm mt-1 ml-[33%]">
                              {errors.fechaVencimiento.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex justify-end space-x-4 mt-6 me-1">
                        <button type="submit" className="btn btn-primary">
                          Agregar RQ
                        </button>
                      </div>
                    </form>
                  </div>
                ),
              },
              {
                label: "Cliente",
                hasError: errors.idCliente?.message !== undefined,
                errorMessage: errors.idCliente?.message,
                children: (
                  <div className="flex flex-col h-[calc(570px-120px)]">
                    {/* Cliente */}
                    <div className="flex items-center">
                      <label className="w-1/3 text-sm font-medium text-gray-700">
                        Cliente:
                      </label>
                      <select
                        {...register("idCliente", { valueAsNumber: true })}
                        onChange={handleClienteChange}
                        className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
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

                    <div className="flex items-center justify-between my-4">
                      <h2 className="text-sm font-medium text-gray-700">
                        Lista de Contactos
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

                    <div className="flex-1 overflow-y-auto">
                      <div className="table-container">
                        <div className="table-wrapper">
                          <table className="table">
                            <thead>
                              <tr className="table-header">
                                <th scope="col" className="table-header-cell">
                                  ID
                                </th>
                                <th scope="col" className="table-header-cell">
                                  Nombres
                                </th>
                                <th scope="col" className="table-header-cell">
                                  Apellidos
                                </th>
                                <th scope="col" className="table-header-cell">
                                  Celular
                                </th>
                                <th scope="col" className="table-header-cell">
                                  Correo
                                </th>
                                <th scope="col" className="table-header-cell">
                                  Cargo
                                </th>
                                <th scope="col" className="table-header-cell">
                                  Asignado
                                </th>
                                <th
                                  scope="col"
                                  className="table-header-cell"
                                ></th>
                              </tr>
                            </thead>
                            <tbody>
                              {contactos.length <= 0 ? (
                                <tr>
                                  <td colSpan={8} className="table-empty">
                                    No hay contactos disponibles.
                                  </td>
                                </tr>
                              ) : (
                                contactos?.map((contacto) => (
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
                                        className="input-checkbox"
                                        name={`contact-${contacto.idClienteContacto}`}
                                        id={`contact-${contacto.idClienteContacto}`}
                                        checked={selectedContacts.includes(
                                          contacto.idClienteContacto
                                        )}
                                        onChange={() =>
                                          handleContactToggle(
                                            contacto.idClienteContacto
                                          )
                                        }
                                      />
                                    </td>
                                    <td className="table-cell">
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleEditContact(contacto)
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
                                ))
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
                hasError:
                  hasVacantesErrors(errors) &&
                  errors.idCliente?.message === undefined,
                errorMessage: getVacantesErrorMessage(errors),
                children: (
                  <div className="flex flex-col h-[calc(570px-120px)]">
                    <div className="mb-1 text-end">
                      <button
                        type="button"
                        className="btn btn-blue"
                        onClick={handleAddVacante}
                      >
                        Agregar
                      </button>
                    </div>
                    <div className="p-1 flex-1 overflow-y-auto">
                      <div className="table-container">
                        <div className="table-wrapper">
                          <table className="table">
                            <thead>
                              <tr className="table-header">
                                <th scope="col" className="table-header-cell">
                                  Perfil profesional
                                </th>
                                <th scope="col" className="table-header-cell">
                                  Cantidad
                                </th>
                                <th scope="col" className="table-header-cell">
                                  Tarifa
                                </th>
                                <th scope="col" className="table-header-cell">
                                  Tipo Tarifa
                                </th>
                                <th
                                  scope="col"
                                  className="table-header-cell"
                                ></th>
                              </tr>
                            </thead>
                            <tbody>
                              {fields.length <= 0 ? (
                                <tr>
                                  <td colSpan={4} className="table-empty">
                                    No hay vacantes disponibles.
                                  </td>
                                </tr>
                              ) : (
                                fields.map((field, index) => {
                                  const availableProfiles =
                                    getAvailableProfiles(index);
                                  const currentProfile =
                                    currentVacantes[index]?.idPerfil;
                                  const showCurrentProfile =
                                    currentProfile === 0 ||
                                    availableProfiles.some(
                                      (p) => p.idPerfil === currentProfile
                                    ) ||
                                    !tarifario.some(
                                      (p) => p.idPerfil === currentProfile
                                    );

                                  const optionsToShow = showCurrentProfile
                                    ? [...availableProfiles]
                                    : [
                                        ...availableProfiles,
                                        ...tarifario.filter(
                                          (p) => p.idPerfil === currentProfile
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
                                    <tr key={field.id} className="table-row">
                                      <td className="table-cell">
                                        <select
                                          {...register(
                                            `lstVacantes.${index}.idPerfil`,
                                            { valueAsNumber: true }
                                          )}
                                          onChange={(e) =>
                                            handleProfileChange(
                                              index,
                                              e.target.value
                                            )
                                          }
                                          className="h-10 px-4 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]"
                                          value={currentProfile}
                                        >
                                          <option value={0}>
                                            Seleccione un perfil
                                          </option>
                                          {optionsToShow.map((perfil) => (
                                            <option
                                              key={perfil.idPerfil}
                                              value={perfil.idPerfil}
                                            >
                                              {perfil.perfil}
                                            </option>
                                          ))}
                                        </select>
                                        {errors.lstVacantes?.[index]
                                          ?.idPerfil && (
                                          <p className="text-red-500 text-xs mt-1">
                                            {
                                              errors.lstVacantes[index]
                                                ?.idPerfil?.message
                                            }
                                          </p>
                                        )}
                                      </td>
                                      <td className="table-cell">
                                        <div className="flex">
                                          <div className="flex flex-col gap-1 relative">
                                            <NumberInput<newRQSchemaType>
                                              control={control}
                                              name={`lstVacantes.${index}.cantidad`}
                                              error={
                                                errors.lstVacantes?.[index]
                                                  ?.cantidad?.message
                                              }
                                            />
                                            {errors.lstVacantes?.[index]
                                              ?.cantidad && (
                                              <p className="text-red-500 text-xs mt-1 absolute -bottom-5">
                                                {
                                                  errors.lstVacantes[index]
                                                    ?.cantidad?.message
                                                }
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="table-cell">
                                        <input
                                          {...register(
                                            `lstVacantes.${index}.tarifa`
                                          )}
                                          defaultValue={"S/. -"}
                                          type="text"
                                          id="v-tarifa"
                                          className="input-readonly-text"
                                          readOnly
                                        />
                                      </td>
                                      <td className="table-cell">
                                        <p>{tipoTarifa}</p>
                                      </td>
                                      <td className="table-cell">
                                        <button
                                          type="button"
                                          className="ms-4 text-xl text-red-500 hover:text-red-700"
                                          onClick={() =>
                                            handleRemoveVacante(index)
                                          }
                                        >
                                          <img
                                            src="/assets/ic_remove_filter.svg"
                                            alt="icon remove"
                                            className="w-6 h-6"
                                          />
                                        </button>
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
                  </div>
                ),
              },
              {
                label: "Archivos",
                children: (
                  <div className="flex flex-col h-[calc(570px-120px)]">
                    {/* Archivos */}
                    <div className="mx-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Archivos elegidos:
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            document.getElementById("fileInput")?.click()
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
                    </div>
                    <div className="mt-2 flex-1 overflow-y-auto">
                      {archivos.map((archivo, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-md mb-1"
                        >
                          <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                            {archivo.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="text-red-500 hover:text-red-600 focus:outline-none"
                          >
                            <img
                              src="/assets/ic_delete_bdt.svg"
                              alt="icon close"
                              className="w-5 h-5"
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                    {errors.lstArchivos && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lstArchivos.message}
                      </p>
                    )}
                  </div>
                ),
              },
              {
                label: "Gestión",
                hasError: hasGestionErrors,
                errorMessage: "Completa los campos de gestión",
                children: (
                  <div className="p-4 space-y-4">
                    <div className="flex items-center">
                      <label className="w-1/3 text-sm font-medium text-gray-700">
                        Duración:
                      </label>
                      <div className="flex gap-4 w-2/3">
                        <div className="flex flex-col gap-1">
                          <NumberInput<newRQSchemaType>
                            control={control}
                            name="duracion"
                            error={errors?.descripcion?.message}
                          />
                          {errors.duracion && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.duracion.message}
                            </p>
                          )}
                        </div>
                        <DropdownForm
                          name="idDuracion"
                          control={control}
                          error={errors.idDuracion}
                          required={false}
                          flex={true}
                          clearErrors={clearErrors}
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
                        clearErrors={clearErrors}
                        options={modalidadRQ.map((modalidad) => ({
                          value: modalidad.num1,
                          label: modalidad.string1,
                        }))}
                      />
                    </div>
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
          RQState="new"
          onContactAdded={handleContactAdded}
          onContactUpdated={handleContactUpdated}
          modalMode={modalMode}
          contact={contactToEdit}
          idCliente={getValues("idCliente")}
        />
      )}
    </>
  );
};
