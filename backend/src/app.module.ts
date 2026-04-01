import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {UserModule} from './users/user.module';
import {AdminModule} from "./admin/admin.module";
import {FirebaseModule} from "./auth/firebase.module";


@Module({
    imports: [
        FirebaseModule,
        MongooseModule.forRoot('mongodb://mongo:27017/bingo'),
        UserModule,
        AdminModule,
    ],
})


export class AppModule {
}
