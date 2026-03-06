import { z } from "zod";

export const UpdateInterviewSchema = z.object({
  idTalento: z.number().min(1, "El talento es requerido"),
  fecha: z.string().min(1, "La fecha es requerida"),
  hora: z.string().min(1, "La hora es requerida"),
  estado: z.coerce.number().min(1, "Seleccione un estado"),
  etapa: z.coerce.number().min(1, "Seleccione una etapa"),
  idsRqs: z
    .array(z.number(), {
      required_error: "Debe seleccionar al menos un requerimiento",
    })
    .min(1, "Debe seleccionar al menos un requerimiento"),
  enlaceEntrevista: z
    .string()
    .url("El enlace debe ser una URL válida")
    .optional()
    .or(z.literal("")),
  calificacion: z.number().min(0).max(5).optional(),
  notasPersonales: z.string().optional(),
  notasExperiencia: z.string().optional(),
  notasIdiomas: z.string().optional(),
  notasEducacion: z.string().optional(),
});

export type UpdateInterviewType = z.infer<typeof UpdateInterviewSchema>;
