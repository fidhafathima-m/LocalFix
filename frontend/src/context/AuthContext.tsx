import React, { createContext, useContext, useEffect, useState } from "react";

type UserType = "user" | "serviceProvider" | "admin";

interface User {
    _id: string,
    fullName: string,
    phone: string,
    email: string,
    role: UserType
}

interface AuthContextProps {
    user: User | null,
    token: string | null,
    isLoggedIn: boolean,
    login: (user: User, token: string) => void,
    logout: () => void,
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeAuth = () => {
            const savedUser = localStorage.getItem("user");
            const savedToken = localStorage.getItem("token");
            if(savedUser && savedToken) {
                setUser(JSON.parse(savedUser))
                setToken(savedToken)
            }
            setIsInitialized(true);
        };

        initializeAuth();
    }, []);

    const login = (user: User, token: string) => {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        
        setUser(user);
        setToken(token);
    }

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        
        setUser(null)
        setToken(null)
        
    };

    if (!isInitialized) {
        return <div>Loading...</div>; 
    }

    return (
        <AuthContext.Provider value={{user, token, isLoggedIn: !!token, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};