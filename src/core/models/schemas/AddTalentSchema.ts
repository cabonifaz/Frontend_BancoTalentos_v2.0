import { z } from "zod";
import { emptyToNull, emptyToUndef, trim, trimLower } from "./Validations";

export const AddTalentSchema = z.object({
  dni: z.preprocess(
    trim,
    z
      .string()
      .min(1, { message: "El Doc. de identidad es requerido" })
      .max(30, {
        message: "El Doc. de identidad no puede tener más de 30 caracteres",
      })
      .regex(/^[a-zA-Z0-9]+$/, {
        message: "El Doc. de identidad solo puede contener letras y números",
      }),
  ),

  nombres: z.preprocess(trim, z.string().min(1, "El nombre es requerido")),
  apellidoPaterno: z.preprocess(
    trim,
    z.string().min(1, "El apellido paterno es requerido"),
  ),
  apellidoMaterno: z.preprocess(emptyToNull, z.string().optional().nullable()),

  email: z.preprocess(
    trimLower,
    z.string().email("Correo electrónico inválido"),
  ),

  codigoPais: z.coerce.number().min(1, "Seleccione un país"),
  telefono: z.preprocess(
    trim,
    z.string().min(1, "El número de teléfono es requerido"),
  ),

  linkedin: z.preprocess(emptyToUndef, z.string().optional()),
  github: z.preprocess(emptyToUndef, z.string().optional()),

  descripcion: z.preprocess(
    trim,
    z.string().min(1, "La descripción es requerida"),
  ),
  disponibilidad: z.preprocess(
    trim,
    z.string().min(1, "La disponibilidad es requerida"),
  ),
  // puesto: z.preprocess(trim, z.string().min(1, "El puesto es requerido")),

  idPais: z.coerce.number().min(1, "Seleccione un país"),
  idCiudad: z.coerce.number().min(1, "Seleccione una ciudad"),

  montoInicial: z.coerce
    .number({
      required_error: "El monto inicial es requerido",
      invalid_type_error: "Solo se aceptan números",
    })
    .min(1, "El monto inicial es requerido"),

  montoFinal: z.coerce
    .number({
      required_error: "El monto final es requerido",
      invalid_type_error: "Solo se aceptan números",
    })
    .min(1, "El monto final es requerido"),

  idMoneda: z.coerce.number().min(1, "Seleccione una moneda"),
  idModalidadFacturacion: z.coerce
    .number()
    .min(1, "Seleccione una modalidad de facturación"),

  habilidadesTecnicas: z.array(
    z.object({
      idHabilidad: z.coerce
        .number({
          invalid_type_error: "Seleccione una habilidad técnica",
          required_error: "Seleccione una habilidad técnica",
        })
        .min(0, "Seleccione una habilidad técnica"),
      anios: z.coerce
        .number({
          invalid_type_error: "Los años de experiencia son requeridos",
        })
        .min(1, "Los años de experiencia son requeridos"),
      habilidad: z.preprocess(
        emptyToNull,
        z.string({
          invalid_type_error: "Seleccione una habilidad técnica",
          required_error: "Seleccione una habilidad técnica",
        }),
      ),
    }),
  ),

  habilidadesBlandas: z.array(
    z.object({
      idHabilidad: z.coerce
        .number({
          invalid_type_error: "Seleccione una habilidad blanda",
          required_error: "Seleccione una habilidad blanda",
        })
        .min(0, "Seleccione una habilidad blanda"),
      habilidad: z.preprocess(
        emptyToNull,
        z.string({
          invalid_type_error: "Seleccione una habilidad blanda",
          required_error: "Seleccione una habilidad blanda",
        }),
      ),
    }),
  ),

  experiencias: z
    .array(
      z
        .object({
          empresa: z.preprocess(
            trim,
            z.string().min(1, "La empresa es requerida"),
          ),
          puesto: z.preprocess(
            trim,
            z.string().min(1, "El puesto es requerido"),
          ),
          funciones: z.preprocess(
            trim,
            z.string().min(1, "Las funciones son requeridas"),
          ),
          fechaInicio: z.preprocess(
            trim,
            z.string().min(1, "La fecha de inicio es requerida"),
          ),
          fechaFin: z.preprocess(emptyToUndef, z.string().optional()),
          flActualidad: z.coerce.boolean().optional().default(false),
        })
        .refine((data) => data.flActualidad || !!data.fechaFin, {
          message: "La fecha de fin es requerida",
          path: ["fechaFin"],
        }),
    )
    .optional()
    .default([]),

  educaciones: z.array(
    z
      .object({
        institucion: z.preprocess(
          trim,
          z.string().min(1, "La institución es requerida"),
        ),
        carrera: z.preprocess(
          trim,
          z.string().min(1, "La carrera es requerida"),
        ),
        grado: z.preprocess(trim, z.string().min(1, "El grado es requerido")),
        fechaInicio: z.preprocess(
          trim,
          z.string().min(1, "La fecha de inicio es requerida"),
        ),
        fechaFin: z.preprocess(emptyToUndef, z.string().optional()),
        flActualidad: z.coerce.boolean(),
      })
      .refine((data) => data.flActualidad || !!data.fechaFin, {
        message: "La fecha de fin es requerida",
        path: ["fechaFin"],
      }),
  ),

  idiomas: z
    .array(
      z.object({
        idIdioma: z.coerce.number().min(1, "Seleccione un idioma"),
        idNivel: z.coerce.number().min(1, "Seleccione un nivel"),
        estrellas: z.coerce.number().min(0, "Las estrellas son requeridas"),
      }),
    )
    .optional()
    .default([]),

  cv: z.any(),
  foto: z.any(),

  tieneEquipo: z
    .union([
      z.boolean({
        required_error: "Debe seleccionar si cuenta con equipo",
        invalid_type_error: "Debe seleccionar una opción válida",
      }),
      z.undefined(),
    ])
    .refine((val) => val !== undefined, {
      message: "Debe seleccionar si cuenta con equipo",
    }),
});

export type AddTalentType = z.infer<typeof AddTalentSchema>;
