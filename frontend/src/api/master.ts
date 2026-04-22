import api from './client';

// Get matches where the current user is a master
export const getMasterMatches = async () => {
    const response = await api.get('/master/matches');
    return response.data;
};

// Get match details
export const getMatchDetails = async (matchId: string) => {
    const response = await api.get(`/master/matches/${matchId}`);
    return response.data;
};

// Update match name
export const updateMatchName = async (matchId: string, name: string) => {
    const response = await api.put(`/master/matches/${matchId}/name`, { name });
    return response.data;
};

// Update match dates
export const updateMatchDates = async (matchId: string, startDate: string, endDate: string) => {
    const response = await api.put(`/master/matches/${matchId}/dates`, { startDate, endDate });
    return response.data;
};

// Get match events
export const getMatchEvents = async (matchId: string) => {
    const response = await api.get(`/master/matches/${matchId}/events`);
    return response.data;
};

// Create event
export const createEvent = async (matchId: string, event: { name: string; description?: string }) => {
    const response = await api.post(`/master/matches/${matchId}/events`, event);
    return response.data;
};

// Update event
export const updateEvent = async (matchId: string, eventId: string, event: { name: string; description?: string }) => {
    const response = await api.put(`/master/matches/${matchId}/events/${eventId}`, event);
    return response.data;
};

// Delete event
export const deleteEvent = async (matchId: string, eventId: string) => {
    const response = await api.delete(`/master/matches/${matchId}/events/${eventId}`);
    return response.data;
};

// Call event (assign random number in backend)
export const callEvent = async (matchId: string, eventId: string) => {
    const response = await api.post(`/master/matches/${matchId}/events/${eventId}/call`);
    return response.data;
};

// Recall event (remove number)
export const recallEvent = async (matchId: string, eventId: string) => {
    const response = await api.post(`/master/matches/${matchId}/events/${eventId}/recall`);
    return response.data;
};

// Get match participants
export const getMatchParticipants = async (matchId: string) => {
    const response = await api.get(`/master/matches/${matchId}/participants`);
    return response.data;
};

// Invite user
export const inviteUser = async (matchId: string, email: string) => {
    const response = await api.post(`/master/matches/${matchId}/invites`, { email });
    return response.data;
};

// Remove participant
export const removeParticipant = async (matchId: string, userId: string) => {
    const response = await api.delete(`/master/matches/${matchId}/participants/${userId}`);
    return response.data;
};

// Regenerate card for a user
export const regenerateUserCard = async (matchId: string, userId: string) => {
    const response = await api.post(`/master/matches/${matchId}/participants/${userId}/regenerate-card`);
    return response.data;
};

// Get match invites
export const getMatchInvites = async (matchId: string) => {
    const response = await api.get(`/master/matches/${matchId}/invites`);
    return response.data;
};

// Delete invite
export const deleteInvite = async (matchId: string, inviteId: string) => {
    const response = await api.delete(`/master/matches/${matchId}/invites/${inviteId}`);
    return response.data;
};


// Update invite
export const updateInvite = async (
    matchId: string,
    inviteId: string,
    data: Partial<{
        name: string;
        isActive: boolean;
        metadata: any;
    }>
) => {
    const response = await api.put(
        `/master/matches/${matchId}/invites/${inviteId}`,
        data
    );
    return response.data;
};