import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {UserModule} from './users/user.module';
import {AdminModule} from "./admin/admin.module";
import {FirebaseModule} from "./auth/firebase.module";
import config from "./config";


@Module({
    imports: [
        FirebaseModule,
        MongooseModule.forRoot(config.mongoUri),
        UserModule,
        AdminModule,
    ],
})


export class AppModule {
}
