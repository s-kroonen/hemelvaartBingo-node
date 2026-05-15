import {Injectable} from '@nestjs/common';
import * as admin from 'firebase-admin';
import {UserService} from '../users/user.service';
import {MatchService} from '../matches/match.service';

export interface NotificationPayload {
    title: string;
    body: string;
    type: string;
    matchId?: string;
    userId?: string;
    [key: string]: string | undefined; // FCM data values must all be strings
}

@Injectable()
export class NotificationService {
    constructor(
        private readonly userService: UserService,
        private readonly matchService: MatchService,
    ) {}

    // ─── Low-level: send to an explicit list of tokens ────────────────────────

    async sendToTokens(tokens: string[], payload: NotificationPayload): Promise<void> {
        const unique = [...new Set(tokens.filter(Boolean))];
        if (unique.length === 0) return;

        // FCM data block only accepts string values
        const data: Record<string, string> = {type: payload.type};
        if (payload.matchId) data.matchId = payload.matchId;
        if (payload.userId) data.userId = payload.userId;

        const message: admin.messaging.MulticastMessage = {
            tokens: unique,
            notification: {title: payload.title, body: payload.body},
            data,
            webpush: {
                notification: {
                    icon: `${process.env.WEBAPP_URL}/icon-512-maskable.png`,
                    badge: `${process.env.WEBAPP_URL}/icon-512-maskable.png`,
                },
            },
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        if (response.failureCount > 0) {
            const invalid: string[] = [];
            response.responses.forEach((res, idx) => {
                const code = res.error?.code;
                if (
                    code === 'messaging/registration-token-not-registered' ||
                    code === 'messaging/invalid-registration-token'
                ) {
                    invalid.push(unique[idx]);
                }
            });
            if (invalid.length > 0) {
                console.warn(`[NotificationService] ${invalid.length} invalid token(s) — consider pruning.`, invalid);
                // TODO: prune invalid tokens from the DB here
            }
        }
    }

    // ─── Mid-level: send to all players (+ masters) in a match ───────────────

    async sendToMatch(
        matchId: string,
        payload: NotificationPayload,
        options: {includeMasters?: boolean} = {},
    ): Promise<void> {
        const match = await this.matchService.findById(matchId);
        if (!match) return;

        const targets = [...(match.players ?? [])];
        if (options.includeMasters) targets.push(...(match.masters ?? []));

        const tokens = targets.flatMap((p: any) => p.fcmTokens ?? []);
        await this.sendToTokens(tokens, payload);
    }

    // ─── Mid-level: send to a single user by ID ───────────────────────────────

    async sendToUser(userId: string, payload: NotificationPayload): Promise<void> {
        const user = await this.userService.getUser(userId);
        if (!user) return;
        await this.sendToTokens(user.fcmTokens ?? [], payload);
    }

    // ─── Mid-level: send to all users (admin broadcast) ───────────────────────

    async sendToAll(payload: NotificationPayload): Promise<{sent: number}> {
        const users = await this.userService.getUsers();
        const tokens = users.flatMap((u: any) => u.fcmTokens ?? []);
        const unique = [...new Set(tokens.filter(Boolean))];
        await this.sendToTokens(unique, payload);
        return {sent: unique.length};
    }

    // ─── Convenience: bingo-specific notifications ────────────────────────────

    async notifyBingo(
        matchId: string,
        callerUserId: string,
        isValid: boolean,
        isFullCard: boolean,
    ): Promise<void> {
        const user = await this.userService.getUser(callerUserId);
        const name = user?.username ?? user?.email ?? 'Someone';

        const title = isValid
            ? isFullCard ? '🎉 Full Card!' : '🎉 BINGO!'
            : '❌ False Bingo';

        const body = isValid
            ? isFullCard
                ? `${name} completed their entire card!`
                : `${name} called BINGO!`
            : `${name} called BINGO, but it was invalid.`;

        await this.sendToMatch(matchId, {
            title,
            body,
            type: isValid ? (isFullCard ? 'FULL_CARD' : 'BINGO') : 'FALSE_BINGO',
            matchId,
            userId: callerUserId,
        }, {includeMasters: true});
    }

    // ─── Convenience: new number called ───────────────────────────────────────

    async notifyNewNumber(matchId: string): Promise<void> {
        await this.sendToMatch(matchId, {
            title: 'New number called!',
            body: 'Check your bingo card.',
            type: 'NEW_NUMBER',
            matchId,
        });
    }
}