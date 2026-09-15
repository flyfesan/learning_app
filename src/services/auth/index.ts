import type { SupabaseClient } from '@/lib/supabase';
import { createSupabaseClient } from '@/lib/supabase'
import type { SignInForm, SignUpForm, AuthResult, UpdatePasswordForm, UpdateProfileForm, ResetPasswordForm } from '@/services/auth/types';
import { ResetPasswordSchema, SignInSchema, SignUpSchema, UpdatePasswordSchema, UpdateProfileSchema } from '@/services/auth/types';


interface IUserService {
    signUp: (form: SignUpForm) => Promise<AuthResult>;
    signIn: (form: SignInForm) => Promise<AuthResult>;
    signOut: () => Promise<AuthResult>;
    resetPassword: (form: ResetPasswordForm) => Promise<AuthResult>;
    updatePassword: (form: UpdatePasswordForm) => Promise<AuthResult>;
    updateProfile: (form: UpdateProfileForm) => Promise<AuthResult>;
    getUser: () => Promise<AuthResult>;
};

export class AuthService implements IUserService {
    constructor(private supabase: SupabaseClient = createSupabaseClient()) { }

    public signUp = async (form: SignUpForm): Promise<AuthResult> => {
        const parsedData = SignUpSchema.parse(form);
        const { email, password, fullName } = parsedData;

        const { data: signUpResponse, error: signUpError } = await this.supabase.auth.signUp({
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

        return {
            kind: "success",
            user: signUpResponse.user,
            session: signUpResponse.session,
        };
    }

    public signIn = async (form: SignInForm): Promise<AuthResult> => {
        const parsedData = SignInSchema.parse(form);
        const { email, password } = parsedData;

        const { data: signInResponse, error: signInError } = await this.supabase.auth.signInWithPassword({
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

    public signOut = async (): Promise<AuthResult> => {
        const { error: signOutError } = await this.supabase.auth.signOut();

        if (signOutError) {
            return { kind: "error", error: signOutError };
        }

        return {
            kind: "success"
        }
    }


    public resetPassword = async (form: ResetPasswordForm): Promise<AuthResult> => {
        const { email } = ResetPasswordSchema.parse(form);
        const { error: resetPasswordError } = await this.supabase.auth.resetPasswordForEmail(email);

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

    public updatePassword = async (form: UpdatePasswordForm): Promise<AuthResult> => {
        const parsedData = UpdatePasswordSchema.parse(form);
        const { password } = parsedData;

        const { error: updatePasswordError } = await this.supabase.auth.updateUser({
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

    public updateProfile = async (form: UpdateProfileForm): Promise<AuthResult> => {
        const parsedData = UpdateProfileSchema.parse(form);
        const { fullName, avatarUrl } = parsedData;

        const { data: updateProfileResponse, error: updateProfileError } = await this.supabase.auth.updateUser({
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

    public getUser = async (): Promise<AuthResult> => {
        const { data: { user }, error: getUserError } = await this.supabase.auth.getUser();

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
}