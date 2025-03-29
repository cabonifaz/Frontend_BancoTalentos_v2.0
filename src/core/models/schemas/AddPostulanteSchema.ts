import { z } from "zod";

export const AddPostulanteSchema = z.object({
    dni: z
        .string()
        .min(1, "El documento de identidad es requerido"),
    nombres: z.string().min(1, "El nombre es requerido"),
    apellidoPaterno: z.string().min(1, "El apellido paterno es requerido"),
    apellidoMaterno: z.string().min(1, "El apellido materno es requerido"),
    email: z.string().email("Correo electrónico inválido"),
    telefono: z.string().min(1, "El número de celular es requerido"),
    disponibilidad: z.string().min(1, "La disponibilidad es requerida"),
    tiempoContrato: z.number({
        required_error: "El tiempo contrato es requerido",
        invalid_type_error: "Solo se aceptan números enteros"
    }).int().min(1, "no puede ser negativo").positive("no se permiten números negativos"),
    idTiempoContrato: z.number().int().min(1, "El tiempo de contrato es requerido"),
    fechaInicioLabores: z.string().min(1, "La fecha de inicio de labores es requerida"),
    cargo: z.string().min(1, "La moneda es requerida"),
    remuneracion: z.number({
        required_error: "La remuneración es requerida",
        invalid_type_error: ""
    })
        .positive("No se permiten valores negativos")
        .refine(val => {
            const str = val.toString();
            return !str.includes('.') || str.split('.')[1].length <= 2;
        }, {
            message: "Máximo 2 decimales permitidos"
        }),
    idMoneda: z.number().int().min(1, "La moneda es requerida"),
    idModalidad: z.number().int().min(1, "La modalidad es requerida"),
    ubicacion: z.string().min(1, "La ubicación es requerida"),
    tieneEquipo: z.boolean({
        required_error: "Debe seleccionar si cuenta con equipo",
    }),
});

export type AddPostulanteType = z.infer<typeof AddPostulanteSchema>;