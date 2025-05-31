// src/providers/AuthProvider.tsx
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, verifyToken, AuthCredentials } from '../api/auth';
import { jwtDecode } from 'jwt-decode';

interface User {
    id: number;
    username: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (credentials: AuthCredentials) => Promise<void>;
    register: (credentials: AuthCredentials) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [isLoading, setIsLoading] = useState(true);

    const verifyAndSetUser = useCallback(async (token: string) => {
        try {
            const isValid = await verifyToken(token);
            if (!isValid) throw new Error("Invalid token");

            const decoded = jwtDecode<{ sub: number; username: string }>(token);
            setUser({ id: decoded.sub, username: decoded.username });
            setToken(token);
        } catch (error) {
            console.error("Token verification failed:", error);
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
        }
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) await verifyAndSetUser(storedToken);
            setIsLoading(false);
        };
        initAuth();
    }, [verifyAndSetUser]);

    const login = async (credentials: AuthCredentials) => {
        setIsLoading(true);
        try {
            const result = await apiLogin(credentials);
            if (!result?.token) throw new Error("No token received");

            localStorage.setItem('authToken', result.token);
            await verifyAndSetUser(result.token);
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (credentials: AuthCredentials) => {
        setIsLoading(true);
        try {
            await apiRegister(credentials);
            await login(credentials);
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await apiLogout();
        } finally {
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
            setIsLoading(false);
        }
    };

    const value = {
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !isLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};