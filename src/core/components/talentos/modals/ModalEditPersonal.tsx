import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useApi } from "@/core/hooks/useApi";
import { getTalent, updatePersonalDetails } from "@/core/services/talents.service";
import { useParams } from "@/core/context/ParamsContext";
import { useModal } from "@/core/context/ModalContext";
import { handleError, handleResponse } from "@/core/utilities/errorHandler";
import { useSnackbar } from "notistack";
import {
  EditTalentPersonalSchema,
  EditTalentPersonalSchemaType,
} from "@/core/models/schemas/EditTalentPersonalSchema";

import { Modal } from "@/core/components/modals/Modal";
import { useEffect, useMemo } from "react";
import { AddTalentParams } from "@/core/models";
import { Loading } from "@/core/components/ui/Loading";
import { PROCEDENCIA_OPTIONS } from "@/core/utilities/constants";
import { Input } from "@/core/components/ui/shadcn/input";
import { Label } from "@/core/components/ui/shadcn/label";
import { AppSelect } from "@/core/components/ui/AppSelect";

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

  const labelStyle = "text-[11px] font-medium text-gray-500 dark:text-slate-400";
  const inputStyle =
    "px-3 py-2 border-gray-200 rounded-md text-sm placeholder:text-gray-300 bg-white dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-600";
  const selectStyle =
    "h-auto px-3 py-2 border-gray-200 rounded-md text-sm bg-white dark:border-slate-700 dark:bg-slate-800";

  return (
    <>
      {isParamsLoading || (isUpdating && <Loading opacity="opacity-70" />)}
      <Modal
        id="modalEditPersonal"
        title="Editar perfil"
        confirmationLabel="Guardar"
        onConfirm={handleSubmit(onSubmit)}
      >
        {/* 16 px entre campos: antes quedaban pegados uno debajo de otro. */}
        <div className="mt-4 flex flex-col gap-4">
        {/* Doc. Identidad */}

        <div className="flex flex-col gap-1">
          <Label htmlFor="edit-personal-dni" className={labelStyle}>
            Doc. Identidad
          </Label>
          <Input
            id="edit-personal-dni"
            {...register("dni")}
            type="text"
            className={inputStyle}
            placeholder="Doc. Identidad"
          />
        </div>

        {/* Nombres */}

        <div className="flex flex-col gap-1">
          <Label htmlFor="edit-personal-nombres" className={labelStyle}>
            Nombres
          </Label>
          <Input
            id="edit-personal-nombres"
            {...register("nombres")}
            type="text"
            className={inputStyle}
          />
        </div>

        {/* Apellido Paterno */}

        <div className="flex flex-col gap-1">
          <Label htmlFor="edit-personal-paterno" className={labelStyle}>
            Apellido paterno
          </Label>
          <Input
            id="edit-personal-paterno"
            {...register("apellidoPaterno")}
            type="text"
            className={inputStyle}
          />
        </div>

        {/* Apellido Materno */}

        <div className="flex flex-col gap-1">
          <Label htmlFor="edit-personal-materno" className={labelStyle}>
            Apellido materno
          </Label>
          <Input
            id="edit-personal-materno"
            {...register("apellidoMaterno")}
            type="text"
            className={inputStyle}
          />
        </div>

        {/* PAÍS */}

        <div className="flex flex-col gap-1">
          <Label htmlFor="edit-personal-pais" className={labelStyle}>
            País
          </Label>
          <Controller
            name="idPais"
            control={control}
            render={({ field }) => (
              <AppSelect
                ref={field.ref}
                id="edit-personal-pais"
                name={field.name}
                onBlur={field.onBlur}
                value={field.value ?? 0}
                onChange={(v) => field.onChange(v === "" ? 0 : Number(v))}
                options={paises.map((p) => ({
                  value: p.num1,
                  label: p.string1,
                }))}
                placeholder="Seleccione un país"
                className={selectStyle}
              />
            )}
          />
          {errors.idPais && (
            <p className="text-red-500 text-sm">{errors.idPais.message}</p>
          )}
        </div>

        {/* CIUDAD */}

        <div className="flex flex-col gap-1">
          <Label htmlFor="edit-personal-ciudad" className={labelStyle}>
            Ciudad
          </Label>
          <Controller
            name="idCiudad"
            control={control}
            render={({ field }) => (
              <AppSelect
                ref={field.ref}
                id="edit-personal-ciudad"
                name={field.name}
                onBlur={field.onBlur}
                value={field.value ?? 0}
                onChange={(v) => field.onChange(v === "" ? 0 : Number(v))}
                options={ciudadesFiltradas.map((c) => ({
                  value: c.num1,
                  label: c.string1,
                }))}
                placeholder="Seleccione una ciudad"
                className={selectStyle}
                disabled={ciudadesFiltradas.length === 0}
              />
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
          <Label htmlFor="edit-personal-procedencia" className={labelStyle}>
            Procedencia
          </Label>
          <Controller
            name="procedencia"
            control={control}
            render={({ field }) => (
              <AppSelect
                ref={field.ref}
                id="edit-personal-procedencia"
                name={field.name}
                onBlur={field.onBlur}
                value={field.value}
                onChange={field.onChange}
                options={PROCEDENCIA_OPTIONS.map((op) => ({
                  value: op,
                  label: op,
                }))}
                placeholder="Seleccione una procedencia"
                className={selectStyle}
              />
            )}
          />
          {errors.procedencia && (
            <p className="text-red-500 text-sm">
              {errors.procedencia.message}
            </p>
          )}
        </div>
        </div>
      </Modal>
    </>
  );
};
