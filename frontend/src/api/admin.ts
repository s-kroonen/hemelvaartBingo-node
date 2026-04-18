import api from './client';
import type {User, Match, Invite, Award} from '../types';

// ===== Users =====
export const getUsers = async () => {
    const response = await api.get('/admin/users');
    console.log(response);
    return response.data;
};

export const getUser = async (id: string) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
};

export const updateUser = async (id: string, data: Partial<User>) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
};

export const createUser = async (data: Partial<User>) => {
    const response = await api.post('/admin/users', data);
    return response.data;
};

export const deleteUser = async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
};

// ===== User Cards =====
export const getUserCard = async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}/card`);
    if (response.data === undefined || response.data == 0) return null;
    return response.data;
};

export const regenerateUserCard = async (userId: string) => {
    const response = await api.post(`/admin/users/${userId}/card/regenerate`);
    return response.data;
};

// ===== User Awards =====
export const getUserAwards = async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}/awards`);
    return response.data;
};

export const addUserAward = async (userId: string, award: Partial<Award>) => {
    const response = await api.post(`/admin/users/${userId}/awards`, award);
    return response.data;
};

export const removeUserAward = async (userId: string, awardId: string) => {
    const response = await api.delete(`/admin/users/${userId}/awards/${awardId}`);
    return response.data;
};

// ===== Matches =====
export const getMatches = async () => {
    const response = await api.get('/admin/matches');
    return response.data;
};

export const getMatch = async (id: string) => {
    const response = await api.get(`/admin/matches/${id}`);
    return response.data;
};

export const updateMatch = async (id: string, data: Partial<Match>) => {
    const response = await api.put(`/admin/matches/${id}`, data);
    return response.data;
};

export const createMatch = async (data: Partial<Match>) => {
    const response = await api.post('/admin/matches', data);
    return response.data;
};

export const deleteMatch = async (id: string) => {
    const response = await api.delete(`/admin/matches/${id}`);
    return response.data;
};

// ===== Match Invites =====
export const getMatchInvites = async (matchId: string) => {
    const response = await api.get(`/admin/matches/${matchId}/invites`);
    return response.data;
};

export const addMatchInvite = async (matchId: string, email: string) => {
    const response = await api.post(`/admin/matches/${matchId}/invites`, {email});
    return response.data;
};

export const removeMatchInvite = async (matchId: string, inviteId: string) => {
    const response = await api.delete(`/admin/matches/${matchId}/invites/${inviteId}`);
    return response.data;
};

// ===== Invites =====
export const getInvites = async () => {
    const response = await api.get('/admin/invites');
    return response.data;
};

export const getInvite = async (id: string) => {
    const response = await api.get(`/admin/invites/${id}`);
    return response.data;
};

export const updateInvite = async (id: string, data: Partial<Invite>) => {
    const response = await api.put(`/admin/invites/${id}`, data);
    return response.data;
};

export const createInvite = async (data: Partial<Invite>) => {
    const response = await api.post('/admin/invites', data);
    return response.data;
};

export const deleteInvite = async (id: string) => {
    const response = await api.delete(`/admin/invites/${id}`);
    return response.data;
};
