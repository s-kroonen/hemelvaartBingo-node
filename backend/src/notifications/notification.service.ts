import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService {
    async sendToUsers(tokens: string[], title: string, body: string, data?: any) {
        if (tokens.length === 0) return;

        const message: admin.messaging.MulticastMessage = {
            tokens: tokens,
            notification: { title, body },
            data: data || {},
            webpush: {
                notification: {
                    icon: '/icons/icon-192.png', // Path to your PWA icon
                    badge: '/icons/badge-72.png',
                },
            },
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        // Optional: Clean up "Expired" tokens if response.failures > 0
        if (response.failureCount > 0) {
            console.log(`${response.failureCount} tokens failed. Clean up required.`);
        }
        // return response;
    }
}