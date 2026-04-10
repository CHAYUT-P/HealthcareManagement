import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface User {
    id?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    status?: string;
    role: string | 'nurse' | 'doctor' | 'ADMIN' | 'PATIENT' | 'NURSE' | 'DOCTOR';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (tokenOrUser: string | User, role?: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(() => {
        const storedToken = localStorage.getItem('token');
        const storedRole = localStorage.getItem('role');
        
        if (storedRole) {
            if (!storedToken) {
                localStorage.removeItem('role');
            } else {
                return { username: 'user', role: storedRole };
            }
        }

        const storedSession = localStorage.getItem('healthcare_current_user');
        if (storedSession) {
            try { return JSON.parse(storedSession); } catch (e) { }
        }
        return null;
    });
    const navigate = useNavigate();



    const login = (tokenOrUser: string | User, roleParam?: string) => {
        if (typeof tokenOrUser === 'string') {
            const newToken = tokenOrUser;
            const newRole = roleParam || '';
            localStorage.setItem('token', newToken);
            localStorage.setItem('role', newRole);
            setToken(newToken);
            setUser({ username: 'user', role: newRole });

            setTimeout(() => {
                if (newRole === 'nurse') navigate('/nurse/dashboard');
                else if (newRole === 'doctor') navigate('/doctor');
                else if (newRole === 'PATIENT') navigate('/patient');
            }, 0);
        } else {
            setUser(tokenOrUser);
            localStorage.setItem('healthcare_current_user', JSON.stringify(tokenOrUser));
            navigate('/');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setToken(null);

        setUser(null);
        localStorage.removeItem('healthcare_current_user');

        navigate('/signin');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
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
