import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {UserModule} from './users/user.module';
import {AdminModule} from "./admin/admin.module";
import {FirebaseModule} from "./auth/firebase.module";
import {MatchModule} from "./matches/match.module";
import config from "./config";
import {MasterModule} from "./master/master.module";
import { InviteModule } from './invites/invite.module';


@Module({
    imports: [
        FirebaseModule,
        MongooseModule.forRoot(config.mongoUri),
        UserModule,
        MatchModule,
        AdminModule,
        InviteModule,
        MasterModule,
    ],
})


export class AppModule {
}
