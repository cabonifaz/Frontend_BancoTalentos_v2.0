import { z } from "zod";

export const AddPostulanteSchema = z.object({
    dni: z.string()
        .min(1, { message: "El Doc. de identidad es requerido" })
        .max(30, { message: "El Doc. de identidad no puede tener más de 30 caracteres" })
        .regex(/^\d+$/, { message: "El Doc. de identidad solo puede contener números" }),
    nombres: z.string().min(1, "El nombre es requerido"),
    apellidoPaterno: z.string().min(1, "El apellido paterno es requerido"),
    apellidoMaterno: z.string().optional().nullable(),
    email: z.string().email("Correo electrónico inválido"),
    codigoPais: z.number().min(1, "Seleccione un país"),
    telefono: z.string().min(1, "El número de teléfono es requerido"),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    descripcion: z.string().min(1, "La descripción es requerida"),
    disponibilidad: z.string().min(1, "La disponibilidad es requerida"),
    puesto: z.string().min(1, "El puesto es requerido"),
    idPais: z.number().min(1, "Seleccione un país"),
    idCiudad: z.number().min(1, "Seleccione una ciudad"),
    montoInicialPlanilla: z.number({
        required_error: "El monto inicial planilla es requerido",
        invalid_type_error: "Solo se aceptan números"
    }).default(0).optional(),
    montoFinalPlanilla: z.number({
        required_error: "El monto final planilla es requerido",
        invalid_type_error: "Solo se aceptan números"
    }).default(0).optional(),
    montoInicialRxH: z.number({
        required_error: "El monto inicial RxH es requerido",
        invalid_type_error: "Solo se aceptan números"
    }).default(0).optional(),
    montoFinalRxH: z.number({
        required_error: "El monto final RxH es requerido",
        invalid_type_error: "Solo se aceptan números"
    }).default(0).optional(),
    idMoneda: z.number().default(0).optional().nullable(),
    habilidadesTecnicas: z.array(
        z.object({
            idHabilidad: z.number().min(1, "Seleccione una habilidad técnica"),
            anios: z.number().min(0, "Los años de experiencia son requeridos"),
        })
    ),
    habilidadesBlandas: z.array(
        z.object({
            idHabilidad: z.number().min(1, "Seleccione una habilidad blanda"),
        })
    ),
    experiencias: z.array(
        z.object({
            empresa: z.string().min(1, "La empresa es requerida"),
            puesto: z.string().min(1, "El puesto es requerido"),
            funciones: z.string().min(1, "Las funciones son requeridas"),
            fechaInicio: z.string().min(1, "La fecha de inicio es requerida"),
            fechaFin: z.string().optional(),
            flActualidad: z.boolean().optional(),
        }).refine(
            (data) => {
                return data.flActualidad ? data.flActualidad : !!data.fechaFin;
            },
            {
                message: "La fecha de fin es requerida",
                path: ["fechaFin"],
            }
        )
    ).optional().default([]),
    educaciones: z.array(
        z.object({
            institucion: z.string().min(1, "La institución es requerida"),
            carrera: z.string().min(1, "La carrera es requerida"),
            grado: z.string().min(1, "El grado es requerido"),
            fechaInicio: z.string().min(1, "La fecha de inicio es requerida"),
            fechaFin: z.string().optional(),
            flActualidad: z.boolean(),
        }).refine(
            (data) => {
                return data.flActualidad ? data.flActualidad : !!data.fechaFin;
            },
            {
                message: "La fecha de fin es requerida",
                path: ["fechaFin"],
            }
        )
    ),
    idiomas: z.array(
        z.object({
            idIdioma: z.number().min(1, "Seleccione un idioma"),
            idNivel: z.number().min(1, "Seleccione un nivel"),
            estrellas: z.number().min(0, "Las estrellas son requeridas"),
        })
    ).optional().default([]),
    cv: z.any(),
    foto: z.any(),
    tieneEquipo: z.boolean({
        required_error: "Debe seleccionar si cuenta con equipo",
    }),
});

export type AddPostulanteType = z.infer<typeof AddPostulanteSchema>;