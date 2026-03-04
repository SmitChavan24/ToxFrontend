import { create } from 'zustand'

const useAuthStore = create((set, get) => {
    return {
        userInfo: null,
        history: [],

        setUser: (userInfo) => {
            sessionStorage.setItem("UserInfo", JSON.stringify(userInfo));
            set({ userInfo });
        },

        setHistory: (history) => {
            sessionStorage.setItem('Husers', JSON.stringify(history))
            set({ history });
        },

        removeUser: () => {
            sessionStorage.removeItem("UserInfo");
            sessionStorage.removeItem("Husers");
            set({ userInfo: null, history: [] });
        },

        loadFromLocalStorage: () => {
            const storedUser = sessionStorage.getItem("UserInfo");
            const storedHistory = sessionStorage.getItem("Husers");

            set({
                userInfo: storedUser ? JSON.parse(storedUser) : null,
                history: storedHistory ? JSON.parse(storedHistory) : [],
            });
        },
    }
});

export default useAuthStore;