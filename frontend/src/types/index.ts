// User types
export interface User {
    id: string;
    email: string;
    username?: string;
    roles: string[];
    currentMatchId: string | null;
    cardId?: string;
    awards?: Award[];
}

// Card types - represents a bingo card assigned to a user
export interface BingoCard {
    id: string;
    userId: string;
    matchId: string;
    cells: BingoCell[];
    createdAt: string;
    updatedAt: string;
}

export interface BingoCell {
    id: string;
    value: string;
    isChecked: boolean;
    position: number; // 0-24 for a 5x5 grid
}

// Award types - achievements/prizes earned by users
export interface Award {
    id: string;
    userId: string;
    matchId: string;
    type: AwardType;
    title: string;
    description?: string;
    earnedAt: string;
    metadata?: Record<string, any>;
}

export const AwardType = {
    BINGO: "BINGO", // Standard bingo (row/column/diagonal)
    FULL_CARD: "FULL_CARD", // All cells marked
    FIRST_BINGO: "FIRST_BINGO", // First person to get bingo
    SPECIAL: "SPECIAL", // Custom award from master
}
export type AwardType = typeof AwardType[keyof typeof AwardType];

// Match types
export interface Match {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    masters: User[];
    players: User[];
    status: MatchStatus;
    cardSize: number; // Default 5 for 5x5 grid
    settings?: MatchSettings;
}

export const MatchStatus = {
    DRAFT: "DRAFT",
    ACTIVE: "ACTIVE",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
}
export type MatchStatus = typeof MatchStatus[keyof typeof MatchStatus];

export interface MatchSettings {
    maxParticipants?: number;
    allowMultipleBingos: boolean;
    autoCheckCells: boolean;
}

// Invite types
export interface Invite {
    id: string;
    name: string;
    matchId: string;
    token: string;
    isActive: boolean;
    expiresAt: string; // Match end date
    createdAt: string;
    metadata?: InviteMetadata;
}
export const InviteStatus = {
    PENDING: "PENDING",
    ACCEPTED: "ACCEPTED",
    EXPIRED: "EXPIRED",
}
export interface InviteMetadata {
    watchAdBeforeJoin?: boolean;
    joinAsRole?: "user" | "master" | "admin";
    description?: string;

    // allow future/unknown fields without breaking UI
    [key: string]: any;
}
export type InviteStatus = typeof InviteStatus[keyof typeof InviteStatus];
