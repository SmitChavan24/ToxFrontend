import { create } from 'zustand'

const useAuthStore = create((set, get) => {
    return {
        userInfo: null,
        history: [],

        setUser: (userInfo) => {
            // console.log(userInfo.user, "dada")
            sessionStorage.setItem("UserInfo", JSON.stringify(userInfo));
            set({ userInfo });
        },

        setHistory: (history) => {
            // localStorage.setItem("Husers", JSON.stringify(history));
            sessionStorage.setItem('Husers', JSON.stringify(history))
            set({ history });
        },

        removeUser: () => {
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