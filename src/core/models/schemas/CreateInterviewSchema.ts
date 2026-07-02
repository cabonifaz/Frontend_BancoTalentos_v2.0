import { z } from "zod";

export const CreateInterviewSchema = z.object({
  idTalento: z.number().min(1, "El talento es requerido"),
  fecha: z.string().min(1, "La fecha es requerida"),
  hora: z.string().min(1, "La hora es requerida"),
  estado: z.coerce.number().min(1, "Seleccione un estado"),
  etapa: z.coerce.number().min(1, "Seleccione una etapa"), // stage ID must be >= 1
  idsRqs: z
    .array(z.number(), {
      required_error: "Debe seleccionar al menos un requerimiento",
    })
    .min(1, "Debe seleccionar al menos un requerimiento"),
  perfil: z.string().min(1, "Seleccione un perfil"),
  enlaceEntrevista: z
    .string()
    .min(1, "El enlace de la entrevista es requerido")
    .url("El enlace debe ser una URL válida"),
  entrevistadores: z.array(
    z.object({
      fullname: z.string().min(1, "El nombre completo es requerido"),
      email: z.string().email("Email inválido").optional().or(z.literal("")),
      notificacion: z.boolean(),
    }).superRefine((val, ctx) => {
      if (val.notificacion && (!val.email || val.email.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El email es requerido cuando las notificaciones están activadas.",
          path: ["email"],
        });
      }
    })
  ).optional(),
});

export type CreateInterviewType = z.infer<typeof CreateInterviewSchema>;

/**
 * Esquema que exige al menos un entrevistador cuando la etapa seleccionada
 * es distinta a "Entrevista con el equipo de R&S".
 *
 * @param rsStageNum1 num1 de la etapa R&S (entrevistadores opcionales).
 *                    Si es null (parámetros aún no cargados) no se exige.
 */
export const createCreateInterviewSchema = (rsStageNum1: number | null) =>
  CreateInterviewSchema.superRefine((data, ctx) => {
    const etapa = Number(data.etapa);
    const isRS = rsStageNum1 != null && etapa === rsStageNum1;
    if (etapa >= 1 && !isRS && (!data.entrevistadores || data.entrevistadores.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe agregar al menos un entrevistador para esta etapa.",
        path: ["entrevistadores"],
      });
    }
  });
