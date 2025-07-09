import { create } from 'zustand'

const useAuthStore = create((set) => ({
    userInfo: null,
    history: [],

    setUserInfo: (userInfo) => {
        localStorage.setItem("UserInfo", JSON.stringify(userInfo));
        set({ userInfo });
    },

    setHistory: (history) => {
        localStorage.setItem("Husers", JSON.stringify(history));
        set({ history });
    },

    loadFromLocalStorage: () => {
        const storedUser = localStorage.getItem("UserInfo");
        const storedHistory = localStorage.getItem("Husers");

        set({
            userInfo: storedUser ? JSON.parse(storedUser) : null,
            history: storedHistory ? JSON.parse(storedHistory) : [],
        });
    },
}));

export default useAuthStore;