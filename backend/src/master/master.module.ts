import {Module} from "@nestjs/common";

import {UserModule} from '../users/user.module';
import {InviteModule} from "../invites/invite.module";
import {MatchModule} from "../matches/match.module";
import {MasterController} from "./master.controller";
import {CardModule} from "../cards/card.module";

@Module({
    imports: [
        CardModule,
        UserModule,
        MatchModule,
    ],
    controllers: [MasterController],
})


export class MasterModule {
}