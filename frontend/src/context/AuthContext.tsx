import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedSession = localStorage.getItem('healthcare_current_user');
        if (storedSession) {
            try {
                const parsedUser = JSON.parse(storedSession);
                setUser(parsedUser);
            } catch (e) {
                console.error("Failed to parse user session", e);
            }
        }
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('healthcare_current_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('healthcare_current_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
