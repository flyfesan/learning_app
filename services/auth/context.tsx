import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

import type { User } from '@supabase/supabase-js';

interface AuthContextProps {
    user: User | null;
    setAuth: (authUser: User | null) => void;
}

const AuthContext = createContext<AuthContextProps>({
    user: null,
    setAuth: () => { },
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthContextProps['user']>(null);

    function setAuth(authUser: User | null) {
        setUser(authUser);
    }

    return (
        <AuthContext.Provider value={{ user, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

export default { AuthProvider, useAuth };