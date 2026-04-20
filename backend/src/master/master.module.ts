import {Module} from "@nestjs/common";

import {UserModule} from '../users/user.module';
import {MatchModule} from "../matches/match.module";
import {MasterController} from "./master.controller";
import {CardModule} from "../cards/card.module";
import {EventModule} from "../events/event.module";

@Module({
    imports: [
        CardModule,
        UserModule,
        MatchModule,
        EventModule
    ],
    controllers: [MasterController],
})


export class MasterModule {
}