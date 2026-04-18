import api from './client';

// ===== Invite Join =====
export const joinWithInvite = async (token: string) => {
    const response = await api.post(`/invites/join/${token}`);
    return response.data;
};

export const getInviteByToken = async (token: string) => {
    const response = await api.get(`/invites/token/${token}`);
    return response.data;
};
