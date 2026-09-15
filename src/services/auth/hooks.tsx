import { createSupabaseClient } from "@/lib/supabase";
import type { SignInForm, AuthResult, SignUpForm, ResetPasswordForm, UpdatePasswordForm, UpdateProfileForm } from "./types";
import { ResetPasswordSchema, SignInSchema, SignUpSchema, UpdatePasswordSchema, UpdateProfileSchema } from "./types";
import type { Session } from "@supabase/supabase-js";

export const useAuthService = () => {
    const supabase = createSupabaseClient();
    const signUp = async (form: SignUpForm, logIn?: (session: Session) => void): Promise<AuthResult> => {
        const parsedData = SignUpSchema.parse(form);
        const { email, password, fullName } = parsedData;

        const { data: signUpResponse, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (signUpError) {
            return {
                kind: "error",
                error: signUpError
            }
        }

        if (!signUpResponse.user || !signUpResponse.session) {
            return {
                kind: "error",
                error: "User not found"
            }
        }

        if (typeof logIn !== 'undefined') {
            logIn(signUpResponse.session);
        }

        return {
            kind: "success",
            user: signUpResponse.user,
            session: signUpResponse.session,
        };
    }

    const signIn = async (form: SignInForm): Promise<AuthResult> => {
        const parsedData = SignInSchema.parse(form);
        const { email, password } = parsedData;

        const { data: signInResponse, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            return {
                kind: "error",
                error: signInError
            }
        }

        if (!signInResponse.user || !signInResponse.session) {
            return {
                kind: "error",
                error: "User not found"
            }
        }

        return {
            kind: "success",
            user: signInResponse.user,
            session: signInResponse.session,
        };
    }

    const signOut = async (): Promise<AuthResult> => {
        const { error: signOutError } = await supabase.auth.signOut();

        if (signOutError) {
            return { kind: "error", error: signOutError };
        }

        return {
            kind: "success"
        }
    }


    const resetPassword = async (form: ResetPasswordForm): Promise<AuthResult> => {
        const { email } = ResetPasswordSchema.parse(form);
        const { error: resetPasswordError } = await supabase.auth.resetPasswordForEmail(email);

        if (resetPasswordError) {
            return {
                kind: "error",
                error: resetPasswordError,
            }
        }

        return {
            kind: "success",
        }
    }

    const updatePassword = async (form: UpdatePasswordForm): Promise<AuthResult> => {
        const parsedData = UpdatePasswordSchema.parse(form);
        const { password } = parsedData;

        const { error: updatePasswordError } = await supabase.auth.updateUser({
            password,
        });

        if (updatePasswordError) {
            return {
                kind: "error",
                error: updatePasswordError
            }
        }

        return {
            kind: "success",
        }
    }

    const updateProfile = async (form: UpdateProfileForm): Promise<AuthResult> => {
        const parsedData = UpdateProfileSchema.parse(form);
        const { fullName, avatarUrl } = parsedData;

        const { data: updateProfileResponse, error: updateProfileError } = await supabase.auth.updateUser({
            data: {
                full_name: fullName,
                avatar_url: avatarUrl,
            },
        });

        if (updateProfileError) {
            return {
                kind: "error",
                error: updateProfileError
            }
        }

        return { kind: "success", user: updateProfileResponse.user };
    }

    const getUser = async (): Promise<AuthResult> => {
        const { data: { user }, error: getUserError } = await supabase.auth.getUser();

        if (getUserError) {
            return {
                kind: "error",
                error: getUserError,
            }
        }

        if (!user) {
            return {
                kind: "error",
                error: "couldn't find user"
            };
        }

        return {
            kind: "success",
            user
        };
    }

    return {
        signUp,
        signIn,
        signOut,
        getUser,
        resetPassword,
        updatePassword,
        updateProfile
    }
}