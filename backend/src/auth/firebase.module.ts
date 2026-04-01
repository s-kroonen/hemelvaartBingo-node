import { Module, Global } from '@nestjs/common';
import { FirebaseProvider } from './firebase.provider';

@Global() // 👈 makes it available everywhere
@Module({
    providers: [FirebaseProvider],
    exports: [FirebaseProvider],
})
export class FirebaseModule {}