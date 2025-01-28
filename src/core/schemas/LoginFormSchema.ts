import { z } from "zod";

export const LoginFormSchema = z.object({
    username: z.string().min(1, "El usuario es obligatorio."),
    password: z.string().min(1, "La contraseña es obligatoria."),
});

export type LoginFormType = z.infer<typeof LoginFormSchema>;