import type { SupabaseClient } from '@/lib/supabase';
import { createSupabaseClient } from '@/lib/supabase'
import type { CurrentUser, ResetPasswordEmail, SignIn, SignUp, UpdatePassword, UpdateProfile } from './types';
import { ResetPasswordSchema, SignInSchema, SignUpSchema, UpdatePasswordSchema, UpdateProfileSchema } from './types';
import type { Session, User } from '@supabase/supabase-js';

export class AuthError extends Error {
    constructor(func: string, message: string) {
        super(`${func}: ${message}`);
        this.name = 'AuthError';
    }
}

interface IUserService {
    signUp: (form: SignUp) => Promise<{ user: User | null; session: Session | null }>;
    signIn: (form: SignIn) => Promise<{ user: User; session: Session }>;
    signOut: () => Promise<void>;
    resetPassword: (form: ResetPasswordEmail) => Promise<void>;
    updatePassword: (form: UpdatePassword) => Promise<User>;
    updateProfile: (form: UpdateProfile) => Promise<User>;
    getUser: () => Promise<CurrentUser | null>;
};

export class UserService implements IUserService {
    constructor(private supabase: SupabaseClient = createSupabaseClient()) { }

    public signUp = async (form: SignUp) => {
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
            throw new AuthError('SignUp', signUpError.message);
        }

        return {
            user: signUpResponse.user,
            session: signUpResponse.session,
        };
    }

    public signIn = async (form: SignIn) => {
        const parsedData = SignInSchema.parse(form);
        const { email, password } = parsedData;

        const { data: signInResponse, error: signInError } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            throw new AuthError('SignIn', signInError.message);
        }

        return {
            user: signInResponse.user,
            session: signInResponse.session,
        };
    }

    public signOut = async () => {
        const { error: signOutError } = await this.supabase.auth.signOut();

        if (signOutError) {
            throw new AuthError('SignOut', signOutError.message);
        }
    }

    public resetPassword = async (form: ResetPasswordEmail) => {
        const parsedData = ResetPasswordSchema.parse(form);
        const { email } = parsedData;

        const { error: resetPasswordError } = await this.supabase.auth.resetPasswordForEmail(email);

        if (resetPasswordError) {
            throw new AuthError('ResetPassword', resetPasswordError.message);
        }
    }

    public updatePassword = async (form: UpdatePassword) => {
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

    public updateProfile = async (form: UpdateProfile) => {
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