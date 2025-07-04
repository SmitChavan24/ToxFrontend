// src/context/AuthContext.js
import React, { createContext, useEffect, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [history, setHistory] = useState([])

    useEffect(() => {
        const storedUser = localStorage.getItem("UserInfo");
        if (storedUser) {
            setUserInfo(JSON.parse(storedUser));
        }
        const hUser = localStorage.getItem("Husers");
        if (hUser) {
            setHistory(JSON.parse(hUser));
        }
    }, []);

    return (
        <AuthContext.Provider value={{ userInfo, setUserInfo, history, setHistory }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
