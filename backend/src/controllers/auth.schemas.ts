import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email("A valid email is required"),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(8, { message: "Min 8 characters" })
      .max(24, { message: "Max 24 characters" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Password is required" })
      .min(8, { message: "Min 8 characters" })
      .max(24, { message: "Max 24 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
