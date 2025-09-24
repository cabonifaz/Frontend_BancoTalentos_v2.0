import { z } from "zod";

const vacanteSchema = z.object({
  idPerfil: z
    .number({ invalid_type_error: "Debe seleccionar un perfil" })
    .min(1, "Debe seleccionar un perfil"),
  cantidad: z.coerce
    .number({
      required_error: "La cantidad es obligatoria",
      invalid_type_error: "La cantidad debe ser un número",
    })
    .min(1, "La cantidad debe ser mayor a 0"),
  tarifa: z.string().optional().nullable(),
});

export const newRQSchema = z
  .object({
    idCliente: z
      .number({
        invalid_type_error: "Debe elegir un cliente",
      })
      .min(1, "Debe elegir un cliente"),
    titulo: z.string().min(1, "El título es obligatorio"),
    codigoRQ: z.string().optional(),
    fechaSolicitud: z
      .string({
        required_error: "La fecha de solicitud es obligatoria",
      })
      .min(1, "La fecha de solicitud es obligatoria"),
    descripcion: z.string().min(1, "La descripción es obligatoria"),
    idEstado: z.number().min(1, "El estado es obligatorio"),
    autogenRQ: z.boolean(),
    fechaVencimiento: z
      .string({
        required_error: "La fecha de vencimiento es obligatoria",
      })
      .min(1, "La fecha de vencimiento es obligatoria"),
    duracion: z.coerce
      .number({
        required_error: "La duración es obligatoria",
        invalid_type_error: "La duración debe ser un número",
      })
      .min(1, "La duración debe ser mayor a 0"),
    idDuracion: z
      .number({
        required_error: "Elija una duración",
        invalid_type_error: "Elija una duración",
      })
      .min(1, "elige una duración"),
    idModalidad: z
      .number({
        required_error: "Elija una modalidad",
        invalid_type_error: "Elija una modalidad",
      })
      .min(1, "Elija una modalidad"),
    lstVacantes: z
      .array(vacanteSchema)
      .min(1, "Debe agregar 1 vacante como mínimo"),
    lstArchivos: z
      .array(
        z.object({
          name: z.string(),
          size: z.number(),
          file: z.instanceof(File),
        })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Validación de autogenRQ
    if (!data.autogenRQ && !data.codigoRQ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El RQ es obligatorio",
        path: ["codigoRQ"],
      });
    }

    // Validación de fechas (COMO EN TU EQUIPOFORMSCHEMA)
    if (data.fechaSolicitud && data.fechaVencimiento) {
      const fechaSolicitud = new Date(data.fechaSolicitud);
      const fechaVencimiento = new Date(data.fechaVencimiento);

      if (fechaVencimiento < fechaSolicitud) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "La fecha de vencimiento no puede ser menor a la fecha de solicitud",
          path: ["fechaVencimiento"],
        });
      }
    }
  });

export type newRQSchemaType = z.infer<typeof newRQSchema>;
