import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "El usuario debe tener entre 3 y 20 caracteres.")
  .max(20, "El usuario debe tener entre 3 y 20 caracteres.")
  .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guion bajo.");

export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.");

export const registerSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});
