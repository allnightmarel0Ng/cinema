// src/api/auth.ts
import axios from "axios";
import {API_URL} from "./config";
// Базовый URL API (можно вынести в .env)

// Типы для данных авторизации
export type AuthCredentials = {
    username: string;
    password: string;
};

// Регистрация нового пользователя
export const register = async (credentials: AuthCredentials) => {
    try {
        const response = await axios.post(`${API_URL}/register`, credentials);
        console.log("Успешная регистрация:", response.data);
        return response.data;
    } catch (error) {
        console.error("Ошибка регистрации:", error);
        // throw new Error(error.response?.data?.error || "Registration failed");
    }
};

// Вход пользователя
export const login = async (credentials: AuthCredentials) => {
    try {
        const response = await axios.post(`${API_URL}/login`, credentials);
        const { token } = response.data;

        if (!token)
            throw new Error("No token received");

        localStorage.setItem("authToken", token);
        console.log("Успешный вход, токен сохранён");
        return { token };
    } catch (error) {
        console.error("Ошибка входа:", error);
        // throw new Error(error.response?.data?.error || "Login failed");
    }
};

// Выход пользователя
export const logout = async () => {
    const token = localStorage.getItem("authToken");

    try {
        await axios.post(`${API_URL}/logout`, null, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        localStorage.removeItem("authToken");
        console.log("Успешный выход");
    } catch (error) {
        console.error("Ошибка выхода:", error);
        // В любом случае очищаем токен
        localStorage.removeItem("authToken");
        // throw new Error(error.response?.data?.error || "Logout failed");
    }
};

// Проверка валидности токена
export const verifyToken = async (token: string) => {
    try {
        const response = await axios.get(`${API_URL}/verify`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.isValid;
    } catch (error) {
        return false;
    }
};