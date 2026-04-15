import api from "./client";

export const getMyMatches = async () => {
    const res = await api.get("/matches/my");
    return res.data.matches;
};

export const setCurrentMatch = async (matchId: string) => {
    await api.patch("/users/me", { currentMatchId: matchId });
};