import { z } from "zod";

export const EditTalentPersonalSchema = z.object({
  nombres: z.string().min(1, "El nombre es obligatorio"),
  apellidoPaterno: z.string().min(1, "El apellido paterno es obligatorio"),
  apellidoMaterno: z.string().optional(),
  pais: z.string().min(1, "El país es obligatorio"),
  dni: z.string().min(8, "DNI debe tener al menos 8 caracteres"), // Agregado por tu pedido
});

export type EditTalentPersonalSchemaType = z.infer<typeof EditTalentPersonalSchema>;