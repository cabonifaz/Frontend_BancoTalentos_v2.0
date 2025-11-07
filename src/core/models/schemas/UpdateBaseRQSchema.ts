import { z } from "zod";

const vacanteSchema = z.object({
  idRequerimientoVacante: z.number(),
  idPerfil: z.number().min(1, "Selecione un perfil válido"),
  cantidad: z.coerce
    .number({
      required_error: "La cantidad es obligatoria",
      invalid_type_error: "La cantidad debe ser un número",
    })
    .min(1, "La cantidad debe ser mayor a 0"),
  idEstado: z.number(),
  tarifa: z.string().optional().nullable(),
});

// Subschema: Duración de contrato
const contractDurationSchema = z
  .object({
    idDuration: z
      .number({
        required_error: "Elija una duración",
        invalid_type_error: "Elija una duración",
      })
      .min(1, "Elige una duración"),
    duration: z.coerce
      .number({
        invalid_type_error:
          "La duración de contrato debe ser un número",
      })
      .min(1, "La duración de contrato debe ser mayor a 0"),
  })
  .optional();

// Subschema: Facturación por modalidad de contrato
const rqFacturacionSchema = z.object({
  idModalidad: z.coerce.number().default(0),
  idGrupoModalidad: z.coerce.number().default(0),
  declaraSunat: z.coerce.boolean().default(false),
  sedeSunat: z.string().default("sede-principal"),
  montoBase: z.coerce
    .number()
    .min(0, "El monto base no puede ser negativo")
    .default(0),
  montoMovilidad: z.coerce
    .number()
    .min(0, "El monto de movilidad no puede ser negativo")
    .default(0),
  montoMensual: z.coerce
    .number()
    .min(0, "El monto mensual no puede ser negativo")
    .default(0),
  montoTrimestral: z.coerce
    .number()
    .min(0, "El monto trimestral no puede ser negativo")
    .default(0),
  montoSemestral: z.coerce
    .number()
    .min(0, "El monto semestral no puede ser negativo")
    .default(0),
  idEstadoRegistro: z.coerce.number().default(1),
});

export const UpdateBaseRQSchema = z
  .object({
    idCliente: z.number().min(1, "El cliente es obligatorio"),
    codigoRQ: z.string().optional(),
    fechaSolicitud: z
      .string()
      .min(1, "La fecha de solicitud es obligatoria"),
    descripcion: z
      .string()
      .min(1, "La descripción es obligatoria")
      .max(255, "La descripción no puede exceder los 255 caracteres"),
    titulo: z.string().min(1, "El título es obligatorio"),
    idEstadoRQ: z.number().min(1, "El estado es obligatorio"),
    autogenRQ: z.boolean().optional(),
    tieneDuracion: z.boolean(),
    duracion: z.coerce
      .number({
        required_error: "La duración es obligatoria",
        invalid_type_error: "La duración debe ser un número",
      })
      .min(1, "La duración debe ser mayor a 0")
      .optional(),
    idDuracion: z
      .number({
        required_error: "Elija una duración",
        invalid_type_error: "Elija una duración",
      })
      .min(1, "Elija una duración")
      .optional(),
    contrato: contractDurationSchema,
    idModalidad: z
      .number({
        required_error: "Elija una modalidad",
        invalid_type_error: "Elija una modalidad",
      })
      .min(1, "Elija una modalidad"),
    idModalidadFact: z
      .array(
        z.coerce.number({
          required_error: "Elija una modalidad de pago",
          invalid_type_error: "Elija una modalidad de pago",
        })
      )
      .optional(),
    fechaVencimiento: z
      .string()
      .min(1, "La fecha de vencimiento es obligatoria"),
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

    // Facturación en base a las modalidades de contrato
    lstFacturacion: z.array(rqFacturacionSchema).optional(),
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

    // Validación condicional de duración
    if (data.tieneDuracion) {
      if (!data.duracion) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La duración es obligatoria",
          path: ["duracion"],
        });
      }
      if (!data.idDuracion) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Elija una duración",
          path: ["idDuracion"],
        });
      }
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

export type UpdateBaseRQSchemaType = z.infer<
  typeof UpdateBaseRQSchema
>;
