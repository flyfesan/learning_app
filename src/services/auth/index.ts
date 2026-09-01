import type { SupabaseClient } from '@/lib/supabase';
import { createSupabaseClient } from '@/lib/supabase'
import type { CurrentUser, ResetPasswordForm, SignInForm, SignInResult, SignUpForm, SignUpResult, AuthResult, UpdatePasswordForm, UpdateProfileForm } from '@/services/auth/types';
import { ResetPasswordSchema, SignInSchema, SignUpSchema, UpdatePasswordSchema, UpdateProfileSchema } from '@/services/auth/types';
import type { AuthError, Session, User } from '@supabase/supabase-js';



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
}

    public resetPassword = async (form: ResetPasswordForm) => {
    const parsedData = ResetPasswordSchema.parse(form);
    const { email } = parsedData;

    const { error: resetPasswordError } = await this.supabase.auth.resetPasswordForEmail(email);

    if (resetPasswordError) {
        throw new AuthError('ResetPassword', resetPasswordError.message);
    }
}

    public updatePassword = async (form: UpdatePasswordForm) => {
    const parsedData = UpdatePasswordSchema.parse(form);
    const { password } = parsedData;

    const { data: updatePasswordResponse, error: updatePasswordError } = await this.supabase.auth.updateUser({
        password,
    });

    if (updatePasswordError) {
        throw new AuthError('UpdatePassword', updatePasswordError.message);
    }

    return updatePasswordResponse.user;
}

    public updateProfile = async (form: UpdateProfileForm) => {
    const parsedData = UpdateProfileSchema.parse(form);
    const { fullName, avatarUrl } = parsedData;

    const { data: updateProfileResponse, error: updateProfileError } = await this.supabase.auth.updateUser({
        data: {
            full_name: fullName,
            avatar_url: avatarUrl,
        },
    });

    if (updateProfileError) {
        throw new AuthError('UpdateProfile', updateProfileError.message);
    }

    return updateProfileResponse.user;
}

    public getUser = async () => {
    const { data: { user }, error } = await this.supabase.auth.getUser();

    if (error) {
        throw new AuthError('GetUser', error.message);
    }

    if (!user) {
        return null;
    }

    const currentUser: CurrentUser = {
        ...user,
        metadata: {
            email: user.email ?? '',
            fullName: user.user_metadata.full_name ?? '',
            avatarUrl: user.user_metadata.avatar_url ?? null,
        },
    };
    return currentUser;
}
}