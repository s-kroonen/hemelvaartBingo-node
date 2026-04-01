import api from "./client";

export const getUsers = async () => {
    const res = await api.get("/admin/users");
    return res.data;
};

export const getMatches = async () => {
    const res = await api.get("/admin/matches");
    return res.data;
};

export const getInvites = async () => {
    const res = await api.get("/admin/invites");
    return res.data;
};