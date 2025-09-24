import { z } from "zod";

export const AddRQContactSchema = z.object({
  nombres: z.string().min(1, "Los nombres son obligatorios"),
  apellidoPaterno: z.string().min(1, "El apellido paterno es obligatorio"),
  apellidoMaterno: z.string().optional().nullable(),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  telefono2: z.string().optional(),
  asignado: z.boolean(),
  correo: z.string().email("El correo electrónico no es válido"),
  // optional but if provided must be a valid email refine it
  correo2: z
    .string()
    .optional()
    .refine(
      (val) =>
        val === "" ||
        z.string().email("El correo electrónico no es válido").safeParse(val)
          .success,
      {
        message: "El correo electrónico 2 no es válido",
      }
    ),
  cargo: z.string().min(1, "El cargo es obligatorio"),
});

export type AddRQContactSchemaType = z.infer<typeof AddRQContactSchema>;
