import * as admin from 'firebase-admin';
import { Provider } from '@nestjs/common';

export const FirebaseProvider: Provider = {
  provide: 'FIREBASE_ADMIN',
  useFactory: () => {
    return admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  },
};