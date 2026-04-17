// auth/auth.module.ts
import {Global, Module} from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../users/user.module';
import { FirebaseStrategy } from './firebase.strategy';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseProvider } from './firebase.provider';

@Global()
@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'firebase' }),
        UserModule, // Needed for UserService
    ],
    providers: [FirebaseProvider, FirebaseStrategy, FirebaseAuthGuard],
    exports: [FirebaseAuthGuard], // Export the guard so controllers can use it
})
export class FirebaseModule {}