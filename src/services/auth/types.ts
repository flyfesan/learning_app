import type { AuthError, Session, User } from "@supabase/supabase-js";
import { z } from "zod";

export type CurrentUser = {
    metadata: {
        email: string;
        fullName: string;
        avatarUrl?: string | null;
    };
} & User;


const PasswordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const SignUpSchema = z.object({
    email: z.email(),
    password: PasswordSchema,
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

export type SignUpForm = z.infer<typeof SignUpSchema>;

export const SignInSchema = z.object({
    email: z.email(),
    password: z.string().min(1, 'Password is required'),
});
export type SignInForm = z.infer<typeof SignInSchema>;

export const ResetPasswordSchema = z.object({
    email: z.email(),
});
export type ResetPasswordEmail = z.infer<typeof ResetPasswordSchema>;

export const UpdatePasswordSchema = z.object({
    password: PasswordSchema,
});
export type UpdatePasswordForm = z.infer<typeof UpdatePasswordSchema>;

export const UpdateProfileSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
    avatarUrl: z.url().optional().nullable(),
});
export type UpdateProfileForm = z.infer<typeof UpdateProfileSchema>;

export type AuthResult = {
    kind: "success"
    user?: User;
    session?: Session;
} | {
    kind: "error"
    error: AuthError | string;
}