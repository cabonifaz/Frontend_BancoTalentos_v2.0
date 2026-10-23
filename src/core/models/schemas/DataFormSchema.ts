import { z } from "zod";

// Solo datos personales: los de colaborador se completan en el modal de confirmación de AsignarTalento
export const DataFormSchema = z.object({
  nombres: z.string().min(1, "Campo obligatorio"),
  apellidoPaterno: z.string().min(1, "Campo obligatorio"),
  apellidoMaterno: z.string().optional().nullable(),
  telefono: z.string().min(1, "Campo obligatorio"),
  dni: z
    .string()
    .min(1, { message: "El Doc. de identidad es requerido" })
    .max(30, {
      message: "El Doc. de identidad no puede tener más de 30 caracteres",
    })
    .regex(/^\d+$/, {
      message: "El Doc. de identidad solo puede contener números",
    }),
  email: z.string().min(1, "Campo obligatorio").email("Correo no válido"),
  ubicacion: z.string().min(1, "Campo obligatorio"),
});

export type DataFormType = z.infer<typeof DataFormSchema>;
