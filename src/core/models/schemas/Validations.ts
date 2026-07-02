import { z } from "zod";

export const validDropdown = z
  .number()
  .int()
  .refine((value) => value !== 0, { message: "Opción no válida" });

export const validDropdownOptional = validDropdown.optional();

/** Helpers de normalización */
export const trim = (v: unknown) => (typeof v === "string" ? v.trim() : v);
export const trimLower = (v: unknown) =>
  typeof v === "string" ? v.trim().toLowerCase() : v;
/** "" -> undefined (para optional) */
export const emptyToUndef = (v: unknown) => {
  if (v == null) return v;
  if (typeof v === "string") {
    const t = v.trim();
    return t === "" ? undefined : t;
  }
  return v;
};
/** "" -> null (para campos nullable) */
export const emptyToNull = (v: unknown) => {
  if (v == null) return v;
  if (typeof v === "string") {
    const t = v.trim();
    return t === "" ? null : t;
  }
  return v;
};
