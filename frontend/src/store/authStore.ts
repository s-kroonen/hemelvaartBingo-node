import {create} from 'zustand';

interface User {
    id: string;
    email: string;
    roles: string[];
    currentMatchId: string | null;
}

interface AuthStore {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
    hasRole: (role: string) => boolean;
    clearUser: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    isAuthenticated: false,
    setUser: (user) => {
        set({user, isAuthenticated: !!user})
    },
    logout: () => {
        localStorage.removeItem('authToken');
        set({user: null, isAuthenticated: false});
    },
    hasRole: (role) => {
        const {user} = get();
        return user?.roles?.includes(role) || false;
    },
    clearUser: () => {
        localStorage.removeItem('authToken');
        set({user: null, isAuthenticated: false});
    },
}));