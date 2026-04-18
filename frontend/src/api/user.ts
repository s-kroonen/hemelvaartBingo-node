import api from './client';
import type {User} from '../types';

// ===== User Profile =====
export const getProfile = async () => {
    const response = await api.get('/users/me');
    return response.data;
};

export const updateProfile = async (data: Partial<User>) => {
    const response = await api.put('/users/me', data);
    return response.data;
};

export const getMyAwards = async () => {
    const response = await api.get('/users/me/awards');
    return response.data;
};

export const getMyCard = async () => {
    const response = await api.get('/users/me/card');
    return response.data;
};
