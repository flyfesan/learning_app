import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

import type { Session, User } from '@supabase/supabase-js';

interface AuthContextProps {
    user: User | null;
    session: Session | null;
    setAuth: (authUser: User | null, session: Session | null) => void;
}

const AuthContext = createContext<AuthContextProps>({
    user: null,
    session: null,
    setAuth: () => { },
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthContextProps['user']>(null);
    const [session, setSession] = useState<AuthContextProps['session']>(null);

    function setAuth(authUser: User | null, session: Session | null) {
        setUser(authUser);
        setSession(session);
    }

    return (
        <AuthContext.Provider value={{ user, session, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

export default { AuthProvider, useAuth };