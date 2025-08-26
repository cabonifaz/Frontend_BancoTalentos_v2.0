import { z } from "zod";
import { validDropdown } from "./Validations";

export const EntryFormSchema = z
  .object({
    idModalidadContrato: validDropdown,
    nombres: z
      .string({
        invalid_type_error: "Campo obligatorio",
      })
      .min(1, "Campo obligatorio"),
    apellidos: z
      .string({
        invalid_type_error: "Campo obligatorio",
      })
      .min(1, "Campo obligatorio"),
    idArea: validDropdown,
    idCliente: validDropdown.optional(),
    idMotivo: validDropdown,
    cargo: z
      .string({
        invalid_type_error: "Campo obligatorio",
      })
      .min(1, "Campo obligatorio"),
    horario: z.string().min(1, "Campo obligatorio"),
    montoBase: z.number({
      required_error: "Campo obligatorio",
      invalid_type_error: "Monto base debe tener 2 decimales",
    }),
    montoMovilidad: z
      .number({
        required_error: "Campo obligatorio",
        invalid_type_error: "Monto movilidad debe tener 2 decimales",
      })
      .optional(),
    montoTrimestral: z
      .number({
        required_error: "Campo obligatorio",
        invalid_type_error: "Monto trimestral debe tener 2 decimales",
      })
      .optional(),
    montoSemestral: z
      .number({
        required_error: "Campo obligatorio",
        invalid_type_error: "Monto Semestral debe tener 2 decimales",
      })
      .optional(),
    fchInicioContrato: z
      .string({
        invalid_type_error: "Campo obligatorio",
      })
      .date("Campo obligatorio"),
    fchTerminoContrato: z
      .string({
        invalid_type_error: "Campo obligatorio",
      })
      .date("Campo obligatorio"),
    proyectoServicio: z
      .string({
        invalid_type_error: "Campo obligatorio",
      })
      .min(1, "Campo obligatorio"),
    objetoContrato: z
      .string({
        invalid_type_error: "Campo obligatorio",
      })
      .min(1, "Campo obligatorio"),
    declararSunat: validDropdown,
    idSedeDeclarar: validDropdown,
    ubicacion: z
      .string({
        invalid_type_error: "Campo obligatorio",
      })
      .min(1, "Campo obligatorio"),
    tieneEquipo: z.boolean({
      required_error: "Debe seleccionar si cuenta con equipo",
    }),
  })
  .refine(
    (data) => {
      if (!data.fchInicioContrato || !data.fchTerminoContrato) {
        return true;
      }
      const inicio = new Date(data.fchInicioContrato);
      const fin = new Date(data.fchTerminoContrato);
      return inicio <= fin;
    },
    {
      message: "La fecha de inicio no puede ser mayor que la fecha de fin",
      path: ["fchInicioContrato"],
    },
  )
  .refine(
    (data) => {
      if (!data.fchInicioContrato || !data.fchTerminoContrato) {
        return true;
      }
      const inicio = new Date(data.fchInicioContrato);
      const fin = new Date(data.fchTerminoContrato);
      return fin >= inicio;
    },
    {
      message: "La fecha de fin no puede ser menor que la fecha de inicio",
      path: ["fchTerminoContrato"],
    },
  )
  .refine((data) => data.montoBase > 0, {
    message: "El monto base debe ser mayor a 0.",
    path: ["montoBase"],
  });

export type EntryFormType = z.infer<typeof EntryFormSchema>;
