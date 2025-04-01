import { z } from "zod";

export const newRQSchema = z.object({
    idCliente: z.string().min(1, "El cliente es obligatorio"),
    codigoRQ: z.string().min(1, "El RQ es obligatorio"),
    fechaSolicitud: z.string().min(1, "La fecha de solicitud es obligatoria"),
    descripcion: z.string().min(1, "La descripción es obligatoria"),
    idEstado: z.number().min(1, "El estado es obligatorio"),
    vacantes: z.number().min(1, "Debe haber al menos una vacante"),
    lstArchivos: z
        .array(
            z.object({
                name: z.string(),
                size: z.number(),
                file: z.instanceof(File),
            })
        )
        .optional(),
});

export type newRQSchemaType = z.infer<typeof newRQSchema>;