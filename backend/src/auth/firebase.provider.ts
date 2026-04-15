import * as admin from 'firebase-admin';
import { Provider } from '@nestjs/common';

export const FirebaseProvider: Provider = {
  provide: 'FIREBASE_ADMIN',
  useFactory: () => {
    if (admin.apps.length > 0) {
      return admin.app(); // reuse existing app
    }

    const decoded = Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_B64!,
        'base64',
    ).toString('utf8');

    const serviceAccount = JSON.parse(decoded);

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  },
};