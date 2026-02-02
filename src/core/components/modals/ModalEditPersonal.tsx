import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useApi } from "../../hooks/useApi"; 
import { getTalent, updatePersonalDetails } from "../../services/apiService";
import { useFetchParams } from "../../hooks/useFetchParams";
import { useModal } from "../../context/ModalContext";
import {
  EditTalentPersonalSchema,
  EditTalentPersonalSchemaType,
} from "../../models/schemas/EditTalentPersonalSchema";

import { Modal } from "./Modal";
import { useEffect } from "react";
import { AddTalentParams } from "../../models";
import { DropdownForm } from "../forms";

interface Props {
  idTalento?: number;
  onUpdate: () => void;
  onClose: () => void;
}



export const ModalEditPersonal = ({ idTalento, onClose, onUpdate }: Props) => {
    const { fetch: fetchTalent } = useApi(getTalent);
    const { fetch: executeUpdate, loading: isUpdating } = useApi(updatePersonalDetails);
    const { paramsByMaestro, fetchParams } = useFetchParams();
    const { closeModal } = useModal();

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
            idPais: 0,
            idCiudad: 0
        }
    });

    useEffect(() => {

        if (!idTalento) return;

        fetchTalent(idTalento).then((response) => {
            if (response?.data) {
                const data = response.data as unknown as AddTalentParams;
                reset({
                    nombres: data.nombres || "",
                    apellidoPaterno: (data as any).apellidos?.split(' ')[0] || "",
                    apellidoMaterno: (data as any).apellidos?.split(' ')[1] || "",
                    dni: data.dni || "",
                    idPais: data.idPais || 0,
                    idCiudad: data.idCiudad || 0,
                });
            }
        });
    }, [idTalento, fetchTalent, reset]);

    // Carga parámetros (País=12, Ciudad=13)

    useEffect(() => {
    fetchParams("12,13");
    }, [fetchParams]);

    //Lógica de filtrado

    const watchCountry = watch("idPais");
    const paises = paramsByMaestro[12] || [];
    const ciudades = paramsByMaestro[13] || [];
    const ciudadesFiltradas = ciudades.filter(
    (c) => Number(c.num2) === Number(watchCountry)
    );

    const onSubmit = async (data: EditTalentPersonalSchemaType) => {
    const updateRequest: Partial<AddTalentParams> & { idTalento: number } = {
        idTalento: idTalento!, 
        dni: data.dni,
        nombres: data.nombres,
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno || null,
        idPais: Number(data.idPais),
        idCiudad: Number(data.idCiudad),
    };

    try {
        const response = await executeUpdate(updateRequest);
        if (response.data.idMensaje === 2) {
            if (onUpdate && idTalento) {
                onUpdate(); 
            }
            closeModal("modalEditPersonal");
        }
    } catch (error) {
        console.error("Error al actualizar:", error);
    }
    };

    const inputStyle = "w-full px-3 py-2 border border-gray-200 rounded-md outline-none transition-all focus:border-blue-600 text-sm placeholder:text-gray-300 bg-white";

  return (

    <Modal
        key={idTalento}
        id="modalEditPersonal"
        title="Editar perfil"
        confirmationLabel={isUpdating ? "Guardando..." : "Guardar"} 
        onConfirm={handleSubmit(onSubmit)}
    >
    {/* Contenedor con scroll vertical */}
    <div className="flex flex-col gap-4 pt-2 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
        {/* Doc. Identidad */}

        <div className="flex flex-col gap-1">

        <label className="text-[11px] font-medium text-gray-500">Doc. Identidad</label>

        <input {...register("dni")} type="text" className={inputStyle} placeholder="Doc. Identidad" />

        </div>

        {/* Nombres */}

        <div className="flex flex-col gap-1">

        <label className="text-[11px] font-medium text-gray-500">Nombres</label>

        <input {...register("nombres")} type="text" className={inputStyle} />

        </div>



        {/* Apellido Paterno */}

        <div className="flex flex-col gap-1">

        <label className="text-[11px] font-medium text-gray-500">Apellido paterno</label>

        <input {...register("apellidoPaterno")} type="text" className={inputStyle} />

        </div>



        {/* Apellido Materno */}

        <div className="flex flex-col gap-1">

        <label className="text-[11px] font-medium text-gray-500">Apellido materno</label>

        <input {...register("apellidoMaterno")} type="text" className={inputStyle} />

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
                key={`pais-${field.value}`}  // ← AGREGAR
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
        {errors.idPais && <p className="text-red-500 text-sm">{errors.idPais.message}</p>}
        </div>

        {/* CIUDAD */}
        <div className="flex flex-col gap-1">
        <label className="text-[11px] font-medium text-gray-500">Ciudad</label>
        <Controller
            name="idCiudad"
            control={control}
            render={({ field }) => (
            <select
                {...field}
                key={`ciudad-${field.value}`}  // ← AGREGAR
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
    
    </div> 

    </Modal>

  );

};