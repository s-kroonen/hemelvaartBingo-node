import {Injectable} from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService {
    async sendToUsers(tokens: string[], title: string, body: string, data?: any) {
        console.log(`Sending to tokens: ${JSON.stringify(tokens)}`);
        if (tokens.length === 0) return;

        const message: admin.messaging.MulticastMessage = {
            tokens: tokens,
            notification: {title, body},
            data: data && data.matchId ? {
                matchId: String(data.matchId),
                type: data.type ?? 'ADMIN_MESSAGE',
            } : {
                type: 'ADMIN_MESSAGE',
            },
            webpush: {
                notification: {
                    icon: 'icon-512-maskable.png', // Path to your PWA icon
                    badge: 'icon-512-maskable.png',
                },
            },
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        // Optional: Clean up "Expired" tokens if response.failures > 0
        if (response.failureCount > 0) {
            const tokensToRemove: string[] = [];
            response.responses.forEach((res, idx) => {
                if (!res.success) {
                    const error = res.error?.code;
                    // These codes mean the token is gone/invalid
                    if (error === 'messaging/registration-token-not-registered' ||
                        error === 'messaging/invalid-registration-token') {
                        tokensToRemove.push(tokens[idx]);
                    }
                }
            });

            // if (tokensToRemove.length > 0) {
            //     // Clean up the DB: Remove these specific invalid tokens from all users
            //     await this.userModel.updateMany(
            //         {fcmTokens: {$in: tokensToRemove}},
            //         {$pull: {fcmTokens: {$in: tokensToRemove}}}
            //     );
            // }
        }
        // return response;
    }
}