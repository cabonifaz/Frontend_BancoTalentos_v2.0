import { z } from "zod";
import { validDropdown } from "./Validations";

export const DataFormSchema = z.object({
    nombres: z.string().min(1, "Campo obligatorio"),
    apellidoPaterno: z.string().min(1, "Campo obligatorio"),
    apellidoMaterno: z.string().min(1, "Campo obligatorio"),
    telefono: z.string().min(1, "Campo obligatorio"),
    dni: z.string().min(1, "Campo obligatorio").max(8, "DNI no válido"),
    email: z.string().min(1, "Campo obligatorio").email("Correo no válido"),
    tiempoContrato: z.number({
        required_error: "Campo obligatorio",
        invalid_type_error: "Debe ser un número"
    }).min(1, "No válido").nullable(),
    idTiempoContrato: validDropdown,
    fechaInicioLabores: z.string().date("Campo obligatorio"),
    cargo: z.string().min(1, "Campo obligatorio"),
    remuneracion: z.number({
        required_error: "Campo obligatorio",
        invalid_type_error: "Debe ser un número"
    }).min(0, "No puede ser negativo").nullable(),
    idMoneda: validDropdown,
    idModalidad: validDropdown,
    ubicacion: z.string().min(1, "Campo obligatorio"),
}).refine((value) => value.remuneracion !== null && value.remuneracion > 0, {
    message: "Debe ser mayor a 0",
    path: ["remuneracion"]
}).refine((value) => value.tiempoContrato !== null && value.tiempoContrato > 0, {
    message: "Debe ser mayor a 0",
    path: ["tiempoContrato"]
});

export type DataFormType = z.infer<typeof DataFormSchema>;