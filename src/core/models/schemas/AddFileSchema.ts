import { z } from "zod";

export const addFilesSchema = z.object({
  lstArchivos: z
    .array(
      z.object({
        idRequerimientoArchivo: z.number(),
        name: z.string(),
        size: z.number(),
        file: z.instanceof(File),
        idTipoArchivoRq: z.coerce
          .number()
          .min(1, "El tipo de archivo es obligatorio")
          .optional(),
      })
    )
    .refine(
      (archivos) =>
        archivos.some(
          (archivo) => archivo.idRequerimientoArchivo === 0
        ),
      {
        message: "Debe haber al menos un archivo nuevo para agregar",
        path: ["lstArchivos"],
      }
    ),
});

export type AddFilesSchemaType = z.infer<typeof addFilesSchema>;
