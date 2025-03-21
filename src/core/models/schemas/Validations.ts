import { z } from "zod";

export const validDropdown = z
    .number()
    .refine(value => value !== 0, { message: "Opción no válida" });