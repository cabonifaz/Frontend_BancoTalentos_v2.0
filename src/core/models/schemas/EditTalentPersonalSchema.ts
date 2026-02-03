import { z } from "zod";

export const EditTalentPersonalSchema = z.object({
  dni: z.string().min(1, "El DNI es requerido"),
  nombres: z.string().min(1, "El nombre es requerido"),
  apellidoPaterno: z.string().min(1, "El apellido paterno es requerido"),
  apellidoMaterno: z.string().optional(),
  idPais: z.coerce.number().optional(),
  idCiudad: z.coerce.number().optional(),
}).refine((data) => {
  if (data.idPais && data.idPais > 0) {
    return !!data.idCiudad && data.idCiudad > 0;
  }
  return true;
}, {
  message: "Seleccione una ciudad", 
  path: ["idCiudad"],              
});

export type EditTalentPersonalSchemaType = z.infer<typeof EditTalentPersonalSchema>;