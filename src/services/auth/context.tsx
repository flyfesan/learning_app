import { createContext, useCallback, useContext } from 'react';
import { z } from 'zod';

import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { StorageKeySchema, StorageValueSchema, useStorageState, type StorageState } from '@/lib/storage';

export const AuthSessionStorageKeySchema = StorageKeySchema.brand("AuthSessionStorageKey").and(z.literal("userSession"));
export type AuthSessionStorageKey = z.infer<typeof AuthSessionStorageKeySchema>;

export const AuthSessionStorageValueSchema = StorageValueSchema.brand("AuthSessionStorageValue").nullable();
export type AuthSessionStorageValue = z.infer<typeof AuthSessionStorageValueSchema>;

export const useAuthSessionStorage = useStorageState<AuthSessionStorageKey, AuthSessionStorageValue>;
export type UserSession = StorageState<AuthSessionStorageValue>[1];

export function useSession() {
    const value = useContext(AuthContext);
    if (!value) {
        throw new Error('useSession must be wrapped in a <SessionProvider />');
    }

    return value;
}

interface AuthContextProps {
    session: UserSession;
    isLoading: boolean,
    logUserIn: (session: Session) => void;
    logUserOut: () => void;
}

const AuthContext = createContext<AuthContextProps>({
    session: null,
    isLoading: false,
    logUserIn: () => { },
    logUserOut: () => { },
});

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const storageKey = AuthSessionStorageKeySchema.parse('userSession');
    const [[isLoading, session], setSession] = useAuthSessionStorage(storageKey);

    const logUserIn = useCallback((session: Session) => {
        const storageValue = AuthSessionStorageValueSchema.parse(JSON.stringify(session));
        setSession(storageValue);
    }, [setSession]);

    const logUserOut = useCallback(() => {
        setSession(null);
    }, [setSession]);

    return (
        <AuthContext value={{ session, isLoading, logUserIn, logUserOut }}>
            {children}
        </AuthContext>
    );
};
