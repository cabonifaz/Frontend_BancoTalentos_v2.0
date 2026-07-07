import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useApi } from "../../hooks/useApi";
import { getTalent, updatePersonalDetails } from "../../services/apiService";
import { useParams } from "../../context/ParamsContext";
import { useModal } from "../../context/ModalContext";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { useSnackbar } from "notistack";
import {
  EditTalentPersonalSchema,
  EditTalentPersonalSchemaType,
} from "../../models/schemas/EditTalentPersonalSchema";

import { Modal } from "./Modal";
import { useEffect, useMemo } from "react";
import { AddTalentParams } from "../../models";
import { Loading } from "../ui/Loading";
import { PROCEDENCIA_OPTIONS } from "../../utilities/constants";

interface Props {
  idTalento?: number;
  onUpdate: (idTalento: number) => void;
  updateTalentList?: (idTalento: number, fields: any) => void;
}

export const ModalEditPersonal = ({
  idTalento,
  onUpdate,
  updateTalentList,
}: Props) => {
  const { fetch: fetchTalent } = useApi(getTalent);
  const { paramsByMaestro, loading: isParamsLoading } = useParams();

  const paises = useMemo(() => paramsByMaestro[12] || [], [paramsByMaestro]);
  const ciudades = useMemo(() => paramsByMaestro[13] || [], [paramsByMaestro]);

  const { closeModal } = useModal();
  const { enqueueSnackbar } = useSnackbar();
  const { fetch: executeUpdate, loading: isUpdating } = useApi(
    updatePersonalDetails,
    {
      onError: (error) => handleError(error, enqueueSnackbar),
      onSuccess: (response) => {
        handleResponse({
          response: response,
          showSuccessMessage: true,
          enqueueSnackbar: enqueueSnackbar,
        });
      },
    },
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<EditTalentPersonalSchemaType>({
    resolver: zodResolver(EditTalentPersonalSchema),
    defaultValues: {
      dni: "",
      nombres: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      procedencia: "",
      idPais: 0,
      idCiudad: 0,
    },
  });

  useEffect(() => {
    if (!idTalento) return;
    if (paises.length === 0 || ciudades.length === 0) return;

    fetchTalent(idTalento).then((response) => {
      if (response?.data) {
        const data = response.data as unknown as AddTalentParams;
        // Validar que el idPais existe en las opciones
        const paisValido = paises.find((p) => p.num1 === data.idPais);

        reset({
          nombres: data.nombres || "",
          apellidoPaterno: (data as any).apellidos?.split(" ")[0] || "",
          apellidoMaterno: (data as any).apellidos?.split(" ")[1] || "",
          dni: data.dni || "",
          procedencia: data.procedencia || "",
          idPais: paisValido ? data.idPais : 0,
          idCiudad: data.idCiudad || 0,
        });
      }
    });
  }, [idTalento, fetchTalent, reset, paises, ciudades]);

  //Lógica de filtrado

  const watchCountry = watch("idPais");
  //const paises = paramsByMaestro[12] || [];
  //const ciudades = paramsByMaestro[13] || [];
  const ciudadesFiltradas = ciudades.filter(
    (c) => Number(c.num2) === Number(watchCountry),
  );

  const onSubmit = async (data: EditTalentPersonalSchemaType) => {
    const updateRequest: Partial<AddTalentParams> & {
      idTalento: number;
    } = {
      idTalento: idTalento!,
      dni: data.dni,
      nombres: data.nombres,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno || null,
      procedencia: data.procedencia,
      idPais: Number(data.idPais),
      idCiudad: Number(data.idCiudad),
    };

    try {
      const response = await executeUpdate(updateRequest);
      if (response.data.idMensaje === 2) {
        if (onUpdate && idTalento) {
          closeModal("modalEditPersonal");
          onUpdate(idTalento);

          if (updateTalentList) {
            const paisNombre =
              paises.find((p) => p.num1 === Number(data.idPais))?.string1 || "";
            const ciudadNombre =
              ciudades.find((c) => c.num1 === Number(data.idCiudad))?.string1 ||
              "";
            updateTalentList(idTalento, {
              nombres: data.nombres,
              apellidoPaterno: data.apellidoPaterno,
              apellidoMaterno: data.apellidoMaterno,
              pais: paisNombre,
              ciudad: ciudadNombre,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  const inputStyle =
    "w-full px-3 py-2 border border-gray-200 rounded-md outline-none transition-all focus:border-blue-600 text-sm placeholder:text-gray-300 bg-white";

  return (
    <>
      {isParamsLoading || (isUpdating && <Loading opacity="opacity-70" />)}
      <Modal
        id="modalEditPersonal"
        title="Editar perfil"
        confirmationLabel="Guardar"
        onConfirm={handleSubmit(onSubmit)}
      >
        {/* Doc. Identidad */}

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-500">
            Doc. Identidad
          </label>
          <input
            {...register("dni")}
            type="text"
            className={inputStyle}
            placeholder="Doc. Identidad"
          />
        </div>

        {/* Nombres */}

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-500">
            Nombres
          </label>
          <input {...register("nombres")} type="text" className={inputStyle} />
        </div>

        {/* Apellido Paterno */}

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-500">
            Apellido paterno
          </label>
          <input
            {...register("apellidoPaterno")}
            type="text"
            className={inputStyle}
          />
        </div>

        {/* Apellido Materno */}

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-500">
            Apellido materno
          </label>
          <input
            {...register("apellidoMaterno")}
            type="text"
            className={inputStyle}
          />
        </div>

        {/* PAÍS */}

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-500">País</label>
          <Controller
            name="idPais"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                key={`pais-${field.value}`}
                value={field.value ?? 0}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className={inputStyle}
              >
                <option value={0}>Seleccione un país</option>
                {paises.map((p) => (
                  <option key={p.idParametro} value={p.num1}>
                    {p.string1}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.idPais && (
            <p className="text-red-500 text-sm">{errors.idPais.message}</p>
          )}
        </div>

        {/* CIUDAD */}

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-500">
            Ciudad
          </label>
          <Controller
            name="idCiudad"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                key={`ciudad-${field.value}`}
                value={field.value ?? 0}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className={inputStyle}
                disabled={ciudadesFiltradas.length === 0}
              >
                <option value={0}>Seleccione una ciudad</option>
                {ciudadesFiltradas.map((c) => (
                  <option key={c.idParametro} value={c.num1}>
                    {c.string1}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.idCiudad && (
            <p className="text-red-500 text-sm">
              {String(errors.idCiudad.message)}
            </p>
          )}
        </div>

        {/* PROCEDENCIA */}

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-500">
            Procedencia
          </label>
          <select {...register("procedencia")} className={inputStyle}>
            <option value="">Seleccione una procedencia</option>
            {PROCEDENCIA_OPTIONS.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
          {errors.procedencia && (
            <p className="text-red-500 text-sm">
              {errors.procedencia.message}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
};
