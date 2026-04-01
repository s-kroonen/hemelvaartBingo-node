import { create } from "zustand";

interface Match {
    id: string;
    name: string;
}

interface MatchState {
    matches: Match[];
    currentMatchId: string | null;

    setMatches: (matches: Match[]) => void;
    setMatch: (id: string) => void;
}

export const useMatchStore = create<MatchState>((set) => ({
    matches: [],
    currentMatchId: localStorage.getItem("matchId"),

    setMatches: (matches) => set({ matches }),

    setMatch: (id) => {
        localStorage.setItem("matchId", id);
        set({ currentMatchId: id });
    },
}));