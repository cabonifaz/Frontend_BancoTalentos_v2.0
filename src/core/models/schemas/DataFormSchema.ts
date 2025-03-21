import { z } from "zod";
import { validDropdown } from "./Validations";

export const DataFormSchema = z.object({
    nombres: z.string().min(1, "Campo obligatorio"),
    apellidoPaterno: z.string().min(1, "Campo obligatorio"),
    apellidoMaterno: z.string().min(1, "Campo obligatorio"),
    telefono: z.string().min(1, "Campo obligatorio"),
    dni: z.string().min(1, "Campo obligatorio").max(8, "DNI no válido"),
    email: z.string().min(1, "Campo obligatorio").email("Correo no válido"),
    tiempoContrato: z.number().min(1, "Campo obligatorio"),
    idTiempoContrato: validDropdown,
    fechaInicioLabores: z.string().date("Campo obligatorio"),
    cargo: z.string().min(1, "Campo obligatorio"),
    remuneracion: z.number(),
    idMoneda: validDropdown,
    idModalidad: validDropdown,
    ubicacion: z.string().min(1, "Campo obligatorio"),
}).refine((value) => value.remuneracion > 0, { message: "La remuneración debe ser mayor a 0.", path: ["remuneracion"] });

export type DataFormType = z.infer<typeof DataFormSchema>;