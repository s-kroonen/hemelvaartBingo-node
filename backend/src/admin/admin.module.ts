import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {Match, MatchSchema} from "../matches/match.schema";
import {AdminService} from "./admin.service";
import {MatchRepository} from "../matches/match.repository";
import {AdminController} from "./admin.controller";

import { UserModule } from '../users/user.module';
import {InviteModule} from "../invites/invite.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Match.name, schema: MatchSchema },
        ]),
        UserModule,
        InviteModule,
    ],
    controllers: [AdminController],
    providers: [AdminService, MatchRepository],
})


export class AdminModule {}