import { z } from "zod";

export const PasswordSchema = z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[A-Z])(?=.*\d)/, { message: "Password must contain at least one uppercase letter and one number" }).brand("Password");
export const EmailSchema = z.email({ message: "Invalid email address" }).brand("Email");
export const FullNameSchema = z.string().min(1, { message: "Full name is required" }).brand("FullName");

export type Password = z.infer<typeof PasswordSchema>;
export type Email = z.infer<typeof EmailSchema>;
export type FullName = z.infer<typeof FullNameSchema>;

export const RegisterFormSchema = z.object({
    fullName: FullNameSchema,
    email: EmailSchema,
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
});

export const LogInFormSchema = z.object({
    email: EmailSchema,
    password: PasswordSchema,
});

export type RegisterFormInfo = z.infer<typeof RegisterFormSchema>;
export type LogInForm = z.infer<typeof LogInFormSchema>;

export type FormState = { kind: "error"; message: string } | { kind: "idle" };