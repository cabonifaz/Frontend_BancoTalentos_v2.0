import { z } from "zod";

export const AddPostulanteSchema = z.object({
    dni: z
        .string()
        .min(8, "El DNI debe tener 8 dígitos")
        .max(8, "El DNI debe tener 8 dígitos")
        .refine(
            (value) => {
                if (!value) return true;
                return /^\d{8}$/.test(value);
            },
            {
                message: "El DNI debe tener exactamente 8 dígitos",
            }
        ),
    nombres: z.string().min(1, "El nombre es requerido"),
    apellidoPaterno: z.string().min(1, "El apellido paterno es requerido"),
    apellidoMaterno: z.string().min(1, "El apellido materno es requerido"),
    email: z.string().email("Correo electrónico inválido"),
    celular: z.string().min(1, "El número de celular es requerido"),
    disponibilidad: z.string().min(1, "La disponibilidad es requerida"),
    tiempoContrato: z.number().int().min(1, "El tiempo de contrato es requerido"),
    idTiempoContrato: z.number().int().min(1, "El tiempo de contrato es requerido"),
    fechaInicioLabores: z.string().min(1, "La fecha de inicio de labores es requerida"),
    cargo: z.string().min(1, "La moneda es requerida"),
    remuneracion: z.number().int().min(1, "La remuneración es requerida"),
    idMoneda: z.number().int().min(1, "La moneda es requerida"),
    idModalidad: z.number().int().min(1, "La modalidad es requerida"),
    ubicacion: z.string().min(1, "La ubicación es requerida"),
});

export type AddPostulanteType = z.infer<typeof AddPostulanteSchema>;