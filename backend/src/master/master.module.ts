import {Module} from "@nestjs/common";

import {UserModule} from '../users/user.module';
import {MatchModule} from "../matches/match.module";
import {MasterController} from "./master.controller";
import {CardModule} from "../cards/card.module";
import {EventModule} from "../events/event.module";
import {InviteModule} from "../invites/invite.module";

@Module({
    imports: [
        CardModule,
        UserModule,
        MatchModule,
        EventModule,
        InviteModule,
    ],
    controllers: [MasterController],
})


export class MasterModule {
}