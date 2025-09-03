import { create } from 'zustand'

const useAuthStore = create((set, get) => {
    return {
        userInfo: null,
        history: [],

        setUser: (userInfo) => {

            // localStorage.setItem("UserInfo", JSON.stringify(userInfo?.payload));
            set({ userInfo });
        },

        setHistory: (history) => {
            localStorage.setItem("Husers", JSON.stringify(history));
            set({ history });
        },

        removeUser: () => {
            set({ userInfo: null, history: [] });
        },

        loadFromLocalStorage: () => {
            const storedUser = localStorage.getItem("UserInfo");
            const storedHistory = localStorage.getItem("Husers");

            set({
                userInfo: storedUser ? JSON.parse(storedUser) : null,
                history: storedHistory ? JSON.parse(storedHistory) : [],
            });
        },
    }
});

export default useAuthStore;